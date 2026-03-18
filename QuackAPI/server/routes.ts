import type { Express } from "express";
import type { Server } from "http";
import path from "path";
import fs from "fs/promises";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import crypto from "crypto";
import { setupBaileys, sendMessage, disconnectDevice, reconnectExistingDevices } from "./baileys";
import { db } from "./db";
import { users, contactMessages, insertContactMessageSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { getStripe, isStripeConfigured, STRIPE_PRICE_MAP } from "./stripe";
import { sendWelcomeEmail, sendEmailVerificationOTP, sendPasswordResetOTP, sendAdminRegistrationNotification } from "./email";
import { notificationConfig, smtpConfig, paypalConfig } from "./config";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

  app.get("/api/config", (_req, res) => {
    res.json({ appUrl: process.env.APP_URL || "https://quackapi.com" });
  });

  app.use((req, res, next) => {
    if (req.hostname === "www.quackapi.com") {
      return res.redirect(301, `https://quackapi.com${req.originalUrl}`);
    }
    next();
  });

  // Pending registrations: stored in memory until OTP is verified.
  // User is NOT written to the database until verification succeeds.
  interface PendingReg {
    name: string;
    email: string;
    password: string;
    otp: string;
    otpExpiresAt: Date;
    otpSentAt: Date;
  }
  const pendingRegistrations = new Map<string, PendingReg>();

  // Clean up expired pending registrations every 15 minutes
  setInterval(() => {
    const now = new Date();
    for (const [id, reg] of pendingRegistrations) {
      if (reg.otpExpiresAt < now) pendingRegistrations.delete(id);
    }
  }, 15 * 60 * 1000);

  // Auth routes
  app.post(api.auth.register.path, async (req, res) => {
    try {
      const input = api.auth.register.input.parse(req.body);

      const existing = await storage.getUserByEmail(input.email);
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Check if OTP is required from admin settings
      const adminConfig = await storage.getAdminSettings();

      if (!adminConfig.requireEmailOtp) {
        // Skip OTP — create user immediately
        const user = await storage.createUser({ name: input.name, email: input.email, password: input.password });
        await storage.markEmailVerified(user.id);
        await sendWelcomeEmail(user.email, user.name, user.apiKey);
        if (notificationConfig.email) {
          sendAdminRegistrationNotification(notificationConfig.email, { name: user.name, email: user.email }).catch(() => {});
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        const { password, ...userResponse } = user;
        return res.status(201).json({ user: { ...userResponse, emailVerified: true }, token });
      }

      // Clean up any expired pending registrations first
      const now2 = new Date();
      for (const [id, reg] of pendingRegistrations.entries()) {
        if (now2 > reg.otpExpiresAt) {
          pendingRegistrations.delete(id);
        }
      }

      // Reject if there is still an active (non-expired) pending entry for this email
      for (const reg of pendingRegistrations.values()) {
        if (reg.email === input.email) {
          return res.status(400).json({ message: "A verification code was already sent to this email. Please check your inbox." });
        }
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const now = new Date();
      const pendingId = crypto.randomUUID();

      pendingRegistrations.set(pendingId, {
        name: input.name,
        email: input.email,
        password: input.password,
        otp,
        otpExpiresAt: new Date(now.getTime() + 10 * 60 * 1000),
        otpSentAt: now,
      });

      await sendEmailVerificationOTP(input.email, input.name, otp);

      res.status(201).json({ requiresVerification: true, pendingId });
    } catch (err) {
      console.error("Registration error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/verify-email", async (req, res) => {
    try {
      const { pendingId, otp } = req.body;
      if (!pendingId || !otp) return res.status(400).json({ message: "Pending ID and OTP are required" });

      const pending = pendingRegistrations.get(pendingId);
      if (!pending) return res.status(400).json({ message: "Verification session expired. Please register again." });
      if (new Date() > pending.otpExpiresAt) {
        pendingRegistrations.delete(pendingId);
        return res.status(400).json({ message: "Verification code expired. Please register again." });
      }
      if (pending.otp !== otp) return res.status(400).json({ message: "Invalid verification code" });

      // OTP is correct — now create the user in the database
      const user = await storage.createUser({
        name: pending.name,
        email: pending.email,
        password: pending.password,
      });
      await storage.markEmailVerified(user.id);
      pendingRegistrations.delete(pendingId);

      await sendWelcomeEmail(user.email, user.name, user.apiKey);
      if (notificationConfig.email) {
        sendAdminRegistrationNotification(notificationConfig.email, { name: user.name, email: user.email }).catch(() => {});
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      const { password, ...userResponse } = user;
      res.json({ user: { ...userResponse, emailVerified: true }, token });
    } catch (err) {
      console.error("Verify email error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/resend-otp", async (req, res) => {
    try {
      const { pendingId } = req.body;
      if (!pendingId) return res.status(400).json({ message: "Pending ID is required" });

      const pending = pendingRegistrations.get(pendingId);
      if (!pending) return res.status(400).json({ message: "Verification session not found. Please register again." });

      const secondsSinceSent = (Date.now() - pending.otpSentAt.getTime()) / 1000;
      if (secondsSinceSent < 60) {
        return res.status(429).json({ message: "Please wait 60 seconds before requesting a new code" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const now = new Date();
      pending.otp = otp;
      pending.otpExpiresAt = new Date(now.getTime() + 10 * 60 * 1000);
      pending.otpSentAt = now;

      await sendEmailVerificationOTP(pending.email, pending.name, otp);
      res.json({ success: true, message: "Verification code resent" });
    } catch (err) {
      console.error("Resend OTP error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      const { password: _, ...userResponse } = user;
      
      res.status(200).json({ user: userResponse, token });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Auth Middleware
  const requireAuth = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      const user = await storage.getUser(decoded.id);
      if (!user) throw new Error("User not found");
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

  app.get(api.auth.me.path, requireAuth, async (req: any, res) => {
    const { password, ...userResponse } = req.user;
    res.json({ user: userResponse });
  });

  // Profile routes
  app.put("/api/profile", requireAuth, async (req: any, res) => {
    try {
      const { name, email } = req.body;
      if (email && email !== req.user.email) {
        const existing = await storage.getUserByEmail(email);
        if (existing) return res.status(400).json({ message: "Email already in use" });
      }
      const updates: any = {};
      if (name) updates.name = name;
      if (email) updates.email = email;
      const updated = await storage.updateUserProfile(req.user.id, updates);
      const { password, ...userResponse } = updated;
      res.json({ user: userResponse });
    } catch (err) {
      console.error("Profile update error:", err);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  app.post("/api/profile/change-password", requireAuth, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current and new password required" });
      }
      if (req.user.password !== currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters" });
      }
      await storage.updateUserPassword(req.user.id, newPassword);
      res.json({ success: true, message: "Password updated successfully" });
    } catch (err) {
      console.error("Password change error:", err);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.post("/api/profile/regenerate-api-key", requireAuth, async (req: any, res) => {
    try {
      const updated = await storage.regenerateApiKey(req.user.id);
      res.json({ apiKey: updated.apiKey });
    } catch (err) {
      console.error("API key regeneration error:", err);
      res.status(500).json({ message: "Failed to regenerate API key" });
    }
  });

  // Forgot password routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ success: true, message: "If an account with that email exists, a reset code has been sent." });
      }
      const otp = await storage.createPasswordResetOTP(user.id);
      await sendPasswordResetOTP(user.email, user.name, otp);
      console.log(`[Password Reset] OTP sent for ${email}`);
      res.json({ success: true, message: "A 6-digit reset code has been sent to your email." });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: "Email, OTP, and new password are required" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid code or email" });
      }
      const resetData = await storage.getPasswordResetOTPForUser(user.id);
      if (!resetData || resetData.otp !== otp) {
        return res.status(400).json({ message: "Invalid or expired reset code" });
      }
      if (resetData.used) {
        return res.status(400).json({ message: "This reset code has already been used" });
      }
      if (new Date() > resetData.expiresAt) {
        return res.status(400).json({ message: "Reset code has expired. Please request a new one." });
      }
      await storage.updateUserPassword(user.id, newPassword);
      await storage.markPasswordResetTokenUsed(resetData.dbToken);
      res.json({ success: true, message: "Password has been reset successfully" });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  // Invoice generation
  app.get("/api/invoices/:paymentId", requireAuth, async (req: any, res) => {
    try {
      const paymentId = parseInt(req.params.paymentId);
      const userPayments = await storage.getPayments(req.user.id);
      const payment = userPayments.find(p => p.id === paymentId);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }
      const invoiceData = {
        invoiceNumber: `INV-${String(payment.id).padStart(6, "0")}`,
        date: payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "N/A",
        customerName: req.user.name,
        customerEmail: req.user.email,
        amount: payment.amount,
        currency: payment.currency,
        gateway: payment.gateway,
        transactionId: payment.transactionId || "N/A",
        status: payment.status,
        plan: req.user.plan,
      };
      res.json(invoiceData);
    } catch (err) {
      console.error("Invoice error:", err);
      res.status(500).json({ message: "Failed to generate invoice" });
    }
  });

  // Devices routes
  app.get(api.devices.list.path, requireAuth, async (req: any, res) => {
    const devices = await storage.getDevices(req.user.id);
    const safeDevices = devices.map(({ sessionData, ...rest }) => rest);
    res.json(safeDevices);
  });

  app.post(api.devices.create.path, requireAuth, async (req: any, res) => {
    const { deviceName } = req.body;
    const device = await storage.createDevice({
      userId: req.user.id,
      deviceName,
    });
    
    setupBaileys(device.id);

    const { sessionData, ...safeDevice } = device;
    res.status(201).json(safeDevice);
  });

  app.get(api.devices.get.path, requireAuth, async (req: any, res) => {
    const device = await storage.getDevice(Number(req.params.id));
    if (!device || device.userId !== req.user.id) {
      return res.status(404).json({ message: "Device not found" });
    }
    const { sessionData, ...safeDevice } = device;
    res.json(safeDevice);
  });
  
  app.get(api.devices.qr.path, requireAuth, async (req: any, res) => {
    const device = await storage.getDevice(Number(req.params.id));
    if (!device || device.userId !== req.user.id) {
      return res.status(404).json({ message: "Device not found" });
    }
    res.json({ qrCode: device.qrCode, status: device.status });
  });

  app.patch(api.devices.update.path, requireAuth, async (req: any, res) => {
    const deviceId = Number(req.params.id);
    const device = await storage.getDevice(deviceId);
    if (!device || device.userId !== req.user.id) return res.status(404).json({ message: "Not found" });
    
    const updated = await storage.updateDevice(deviceId, req.body);
    const { sessionData, ...safeDevice } = updated;
    res.json(safeDevice);
  });

  app.delete(api.devices.delete.path, requireAuth, async (req: any, res) => {
    try {
      const deviceId = Number(req.params.id);
      const device = await storage.getDevice(deviceId);
      if (!device || device.userId !== req.user.id) return res.status(404).json({ message: "Not found" });
      
      await disconnectDevice(deviceId, false);
      await storage.deleteDevice(deviceId);
      
      const sessionDir = path.join(process.cwd(), "baileys_sessions", `device_${deviceId}`);
      fs.rm(sessionDir, { recursive: true, force: true }).catch(() => {});
      
      res.status(204).send();
    } catch (error: any) {
      console.error("Delete device error:", error);
      res.status(500).json({ message: "Failed to delete device" });
    }
  });

  app.post("/api/devices/:id/disconnect", requireAuth, async (req: any, res) => {
    const deviceId = Number(req.params.id);
    const device = await storage.getDevice(deviceId);
    if (!device || device.userId !== req.user.id) return res.status(404).json({ message: "Not found" });
    
    await disconnectDevice(deviceId, false);
    res.json({ message: "Device disconnected" });
  });

  app.post("/api/devices/:id/reconnect", requireAuth, async (req: any, res) => {
    const deviceId = Number(req.params.id);
    const device = await storage.getDevice(deviceId);
    if (!device || device.userId !== req.user.id) return res.status(404).json({ message: "Not found" });

    await disconnectDevice(deviceId, false);
    await storage.updateDeviceStatusAndQR(deviceId, "pending", null);
    setupBaileys(deviceId);
    res.json({ message: "Reconnecting device..." });
  });

  // Payments routes
  app.get(api.payments.list.path, requireAuth, async (req: any, res) => {
    const payments = await storage.getPayments(req.user.id);
    res.json(payments);
  });

  app.post(api.payments.create.path, requireAuth, async (req: any, res) => {
    const { gateway, plan: billingCycle, selectedPlan } = req.body;
    
    const planPricing: Record<string, { monthly: number; yearly: number }> = {
      starter: { monthly: 0, yearly: 0 },
      professional: { monthly: 2900, yearly: 29000 },
      enterprise: { monthly: 9900, yearly: 99000 },
    };
    
    const planKey = selectedPlan || "professional";
    const pricing = planPricing[planKey] || planPricing.professional;
    const amount = billingCycle === 'yearly' ? pricing.yearly : pricing.monthly;
    
    const payment = await storage.createPayment({
      userId: req.user.id,
      amount,
      currency: "PKR",
      gateway,
    });
    
    res.status(201).json({ paymentUrl: `/pay/${payment.id}`, paymentId: payment.id, selectedPlan: planKey });
  });

  app.post("/api/payments/:id/activate", requireAuth, async (req: any, res) => {
    try {
      const paymentId = Number(req.params.id);
      const { plan: selectedPlan, billingCycle } = req.body;
      const userPayments = await storage.getPayments(req.user.id);
      const payment = userPayments.find(p => p.id === paymentId);
      if (!payment) return res.status(404).json({ message: "Payment not found" });

      await storage.updatePaymentStatus(paymentId, "completed", `txn_${Date.now()}`);
      await storage.updateUserSubscription(req.user.id, "active");
      
      const plan = selectedPlan || "professional";
      const cycle = billingCycle || "monthly";
      const now = new Date();
      const expiresAt = new Date(now);
      if (cycle === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }
      
      await storage.updateUserPlanDetails(req.user.id, plan, cycle, expiresAt);

      res.json({ message: "Subscription activated", status: "active", plan, billingCycle: cycle, expiresAt: expiresAt.toISOString() });
    } catch (err: any) {
      console.error("Activate subscription error:", err);
      res.status(500).json({ message: "Failed to activate subscription" });
    }
  });

  app.post("/api/subscription/change-plan", requireAuth, async (req: any, res) => {
    try {
      const { plan, billingCycle } = req.body;
      if (!["starter", "professional", "enterprise"].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan. Must be starter, professional, or enterprise." });
      }
      
      if (plan === "starter") {
        await storage.updateUserSubscription(req.user.id, "inactive");
        await storage.updateUserPlanDetails(req.user.id, "starter", "monthly", null);
        return res.json({ message: "Downgraded to Starter (free) plan", plan: "starter", status: "inactive" });
      }
      
      const cycle = billingCycle || "monthly";
      const now = new Date();
      const expiresAt = new Date(now);
      if (cycle === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }
      
      await storage.updateUserPlanDetails(req.user.id, plan, cycle, expiresAt);
      await storage.updateUserSubscription(req.user.id, "active");
      res.json({ message: `Plan changed to ${plan}`, plan, status: "active", billingCycle: cycle, expiresAt: expiresAt.toISOString() });
    } catch (err: any) {
      console.error("Change plan error:", err);
      res.status(500).json({ message: "Failed to change plan" });
    }
  });

  app.post("/api/subscription/cancel", requireAuth, async (req: any, res) => {
    try {
      await storage.updateUserSubscription(req.user.id, "inactive");
      await storage.updateUserPlanDetails(req.user.id, "starter", "monthly", null);
      res.json({ message: "Subscription cancelled", status: "inactive" });
    } catch (err: any) {
      console.error("Cancel subscription error:", err);
      res.status(500).json({ message: "Failed to cancel subscription" });
    }
  });

  // Plans: public endpoint for billing page
  app.get("/api/plans", async (_req, res) => {
    try {
      const dbPlans = await storage.getPlans();
      res.json(dbPlans);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  // PayPal: create order and return approval URL
  app.get("/api/paypal/client-id", async (_req: any, res) => {
    try {
      const settings = await storage.getAdminSettings();
      const { mode, clientId } = resolvePayPalCredentials(settings);
      if (!clientId) {
        return res.status(503).json({ message: `PayPal ${mode} credentials are not configured` });
      }
      res.json({ clientId, mode });
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch PayPal config" });
    }
  });

  app.post("/api/paypal/create-order", requireAuth, async (req: any, res) => {
    try {
      const { plan, billingCycle } = req.body;
      if (!plan || !["professional", "enterprise"].includes(plan)) {
        return res.status(400).json({ message: "Invalid plan" });
      }

      const settings = await storage.getAdminSettings();
      const { mode, clientId, clientSecret } = resolvePayPalCredentials(settings);
      if (!clientId || !clientSecret) {
        return res.status(400).json({ message: `PayPal ${mode} credentials are not configured. Please contact support.` });
      }

      const dbPlan = await storage.getPlan(plan);
      const fallbackPricing: Record<string, { monthly: number; yearly: number }> = {
        professional: { monthly: 2900, yearly: 29000 },
        enterprise: { monthly: 9900, yearly: 99000 },
      };
      const monthly = dbPlan ? dbPlan.monthlyPrice : (fallbackPricing[plan]?.monthly ?? 2900);
      const yearly = dbPlan ? dbPlan.yearlyPrice : (fallbackPricing[plan]?.yearly ?? 29000);
      const amountCents = billingCycle === "yearly" ? yearly : monthly;
      if (amountCents < 100) {
        return res.status(400).json({ message: "Plan price must be at least $1.00 to process a PayPal payment. Please update the plan price in the admin settings." });
      }
      const amountUSD = (amountCents / 100).toFixed(2);
      const cycle = billingCycle === "yearly" ? "yearly" : "monthly";

      const { createPayPalOrder } = await import("./paypal");
      const returnUrl = "https://quackapi.com/paypal/success";
      const cancelUrl = "https://quackapi.com/paypal/cancel";
      const description = `QuackAPI ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan (${cycle})`;

      const { orderId, approvalUrl } = await createPayPalOrder(
        clientId,
        clientSecret,
        mode,
        amountUSD,
        description,
        returnUrl,
        cancelUrl
      );

      const payment = await storage.createPayment({
        userId: req.user.id,
        amount: amountCents,
        currency: "USD",
        gateway: "paypal",
      });

      res.json({ approvalUrl, paymentId: payment.id, orderId });
    } catch (err: any) {
      console.error("PayPal create order error:", err);
      res.status(500).json({ message: err.message || "Failed to create PayPal order" });
    }
  });

  // PayPal: capture order after user approves and activate subscription
  app.post("/api/paypal/capture", requireAuth, async (req: any, res) => {
    try {
      const { orderId, paymentId, plan, billingCycle } = req.body;
      if (!orderId) return res.status(400).json({ message: "orderId is required" });

      const settings = await storage.getAdminSettings();
      const { mode, clientId, clientSecret } = resolvePayPalCredentials(settings);
      if (!clientId || !clientSecret) {
        return res.status(400).json({ message: `PayPal ${mode} credentials are not configured` });
      }

      const { capturePayPalOrder } = await import("./paypal");
      const { status, transactionId } = await capturePayPalOrder(
        clientId,
        clientSecret,
        mode,
        orderId
      );

      if (status !== "COMPLETED") {
        return res.status(400).json({ message: `Payment not completed. Status: ${status}` });
      }

      if (paymentId) {
        await storage.updatePaymentStatus(paymentId, "completed", transactionId);
      }

      const resolvedPlan = plan || "professional";
      const cycle = billingCycle === "yearly" ? "yearly" : "monthly";
      const now = new Date();
      const expiresAt = new Date(now);
      if (cycle === "yearly") {
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      } else {
        expiresAt.setMonth(expiresAt.getMonth() + 1);
      }

      await storage.updateUserSubscription(req.user.id, "active");
      await storage.updateUserPlanDetails(req.user.id, resolvedPlan, cycle, expiresAt);

      res.json({ success: true, plan: resolvedPlan, billingCycle: cycle, expiresAt: expiresAt.toISOString() });
    } catch (err: any) {
      console.error("PayPal capture error:", err);
      res.status(500).json({ message: err.message || "Failed to capture payment" });
    }
  });

  app.post("/api/stripe/charge", requireAuth, async (_req: any, res) => {
    res.status(410).json({ message: "Stripe payments are no longer supported. Please use PayPal." });
  });

  // Messages routes
  app.get(api.messages.list.path, requireAuth, async (req: any, res) => {
    const deviceId = req.query.deviceId ? Number(req.query.deviceId) : undefined;
    
    if (deviceId) {
      const device = await storage.getDevice(deviceId);
      if (!device || device.userId !== req.user.id) return res.status(404).json({ message: "Device not found" });
    }
    
    const messages = await storage.getMessages(deviceId);
    const userDeviceIds = (await storage.getDevices(req.user.id)).map(d => d.id);
    const userMessages = messages.filter(m => userDeviceIds.includes(m.deviceId));
    
    res.json(userMessages);
  });

  app.get("/api/devices/:id/stats", requireAuth, async (req: any, res) => {
    const deviceId = Number(req.params.id);
    const device = await storage.getDevice(deviceId);
    if (!device || device.userId !== req.user.id) return res.status(404).json({ message: "Not found" });
    
    const messages = await storage.getMessages(deviceId);
    const stats = {
      sent: messages.filter(m => m.status === 'sent').length,
      pending: messages.filter(m => m.status === 'pending').length,
      failed: messages.filter(m => m.status === 'failed').length,
      total: messages.length,
    };
    res.json(stats);
  });

  app.post("/api/devices/:id/send", requireAuth, async (req: any, res) => {
    try {
      const deviceId = Number(req.params.id);
      const device = await storage.getDevice(deviceId);
      if (!device || device.userId !== req.user.id) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      if (device.status !== 'connected') {
        return res.status(400).json({ message: "Device is not connected to WhatsApp" });
      }
      
      const { toNumber, content, type = "text", mediaUrl, caption, filename, lat, lng, address, contactName, contactPhone } = req.body;
      if (!toNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      
      const mediaTypes = ["image", "video", "audio", "document"];
      const effectiveMediaUrl = mediaUrl || (mediaTypes.includes(type) ? content : undefined);
      const displayContent = content || type;
      
      const message = await storage.createMessage({
        deviceId: device.id,
        toNumber,
        content: displayContent,
        type,
      });
      
      sendMessage(device.id, toNumber, displayContent, message.id, type, effectiveMediaUrl, { caption, filename, lat, lng, address, contactName, contactPhone });
      
      res.json({ success: true, messageId: message.id, status: "queued" });
    } catch (err: any) {
      console.error("Send test message error:", err);
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  // Message traffic endpoint (real data for dashboard chart)
  app.get("/api/messages/traffic", requireAuth, async (req: any, res) => {
    try {
      const days = req.query.days ? Number(req.query.days) : 7;
      const traffic = await storage.getMessageTraffic(req.user.id, days);
      res.json(traffic);
    } catch (err) {
      console.error("Message traffic error:", err);
      res.status(500).json({ message: "Failed to fetch traffic data" });
    }
  });

  // Admin password login (standalone)
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "1234";

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid admin password" });
    }
    const adminToken = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token: adminToken });
  });

  // Admin Middleware - accepts either admin token or user with isAdmin flag
  const requireAdmin = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded.admin === true) {
        return next();
      }
      if (decoded.id) {
        const user = await storage.getUser(decoded.id);
        if (user?.isAdmin) {
          req.user = user;
          return next();
        }
      }
      return res.status(403).json({ message: "Admin access required" });
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

  // Admin Routes
  app.get("/api/admin/stats", requireAdmin, async (req: any, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (err) {
      console.error("Admin stats error:", err);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/users", requireAdmin, async (req: any, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const safeUsers = allUsers.map(({ password, ...rest }) => rest);
      res.json(safeUsers);
    } catch (err) {
      console.error("Admin users error:", err);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/devices", requireAdmin, async (req: any, res) => {
    try {
      const allDevices = await storage.getAllDevices();
      const safeDevices = allDevices.map(({ sessionData, ...rest }) => rest);
      res.json(safeDevices);
    } catch (err) {
      console.error("Admin devices error:", err);
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.get("/api/admin/messages", requireAdmin, async (req: any, res) => {
    try {
      const allMessages = await storage.getAllMessages();
      res.json(allMessages);
    } catch (err) {
      console.error("Admin messages error:", err);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.get("/api/admin/payments", requireAdmin, async (req: any, res) => {
    try {
      const allPayments = await storage.getAllPayments();
      res.json(allPayments);
    } catch (err) {
      console.error("Admin payments error:", err);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.patch("/api/admin/users/:id/subscription", requireAdmin, async (req: any, res) => {
    try {
      const userId = Number(req.params.id);
      const { status } = req.body;
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updated = await storage.updateUserSubscription(userId, status);
      const { password, ...safeUser } = updated;
      res.json(safeUser);
    } catch (err) {
      console.error("Admin update subscription error:", err);
      res.status(500).json({ message: "Failed to update subscription" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req: any, res) => {
    try {
      const userId = Number(req.params.id);
      if (req.user && userId === req.user.id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }
      await storage.deleteUser(userId);
      res.json({ success: true });
    } catch (err) {
      console.error("Admin delete user error:", err);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.delete("/api/admin/devices/:id", requireAdmin, async (req: any, res) => {
    try {
      const deviceId = Number(req.params.id);
      await storage.deleteDevice(deviceId);
      res.json({ success: true });
    } catch (err) {
      console.error("Admin delete device error:", err);
      res.status(500).json({ message: "Failed to delete device" });
    }
  });

  app.patch("/api/admin/devices/:id/status", requireAdmin, async (req: any, res) => {
    try {
      const deviceId = Number(req.params.id);
      const { status } = req.body;
      if (!["connected", "disconnected", "pending"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updated = await storage.updateDeviceStatus(deviceId, status);
      const { sessionData, ...safeDevice } = updated;
      res.json(safeDevice);
    } catch (err) {
      console.error("Admin update device status error:", err);
      res.status(500).json({ message: "Failed to update device status" });
    }
  });

  function resolvePayPalCredentials(settings: any) {
    const mode = (settings.paypalMode || paypalConfig.mode) as "sandbox" | "live";
    const sandboxClientId = settings.paypalSandboxClientId || paypalConfig.sandboxClientId || "";
    const sandboxClientSecret = settings.paypalSandboxClientSecret || paypalConfig.sandboxClientSecret || "";
    const liveClientId = settings.paypalLiveClientId || paypalConfig.liveClientId || "";
    const liveClientSecret = settings.paypalLiveClientSecret || paypalConfig.liveClientSecret || "";
    const clientId = mode === "live" ? liveClientId : sandboxClientId;
    const clientSecret = mode === "live" ? liveClientSecret : sandboxClientSecret;
    return { mode, clientId, clientSecret, sandboxClientId, sandboxClientSecret, liveClientId, liveClientSecret };
  }

  function buildSettingsResponse(settings: any) {
    const pp = resolvePayPalCredentials(settings);
    return {
      id: settings.id,
      requireEmailOtp: settings.requireEmailOtp,
      smtpHost: settings.smtpHost || smtpConfig.host,
      smtpPort: settings.smtpPort || String(smtpConfig.port),
      smtpUser: settings.smtpUser || smtpConfig.user,
      smtpPassSet: !!(settings.smtpPass || smtpConfig.pass),
      notificationEmail: settings.notificationEmail || notificationConfig.email || null,
      paypalMode: pp.mode,
      paypalSandboxClientId: pp.sandboxClientId || null,
      paypalSandboxSecretSet: !!pp.sandboxClientSecret,
      paypalLiveClientId: pp.liveClientId || null,
      paypalLiveSecretSet: !!pp.liveClientSecret,
      paypalClientId: null,
      paypalSecretSet: false,
    };
  }

  app.get("/api/admin/settings", requireAdmin, async (req: any, res) => {
    try {
      const settings = await storage.getAdminSettings();
      res.json(buildSettingsResponse(settings));
    } catch (err) {
      console.error("Admin get settings error:", err);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/admin/settings", requireAdmin, async (req: any, res) => {
    try {
      const {
        requireEmailOtp, smtpHost, smtpPort, smtpUser, smtpPass, notificationEmail,
        paypalMode, paypalSandboxClientId, paypalSandboxClientSecret, paypalLiveClientId, paypalLiveClientSecret,
      } = req.body;
      const updates: Record<string, any> = {};
      if (typeof requireEmailOtp === "boolean") updates.requireEmailOtp = requireEmailOtp;
      if (typeof smtpHost === "string") updates.smtpHost = smtpHost;
      if (typeof smtpPort === "string") updates.smtpPort = smtpPort;
      if (typeof smtpUser === "string") updates.smtpUser = smtpUser;
      if (typeof smtpPass === "string" && smtpPass) updates.smtpPass = smtpPass;
      if (typeof notificationEmail === "string") updates.notificationEmail = notificationEmail;
      if (typeof paypalMode === "string") updates.paypalMode = paypalMode;
      if (typeof paypalSandboxClientId === "string" && paypalSandboxClientId) updates.paypalSandboxClientId = paypalSandboxClientId;
      if (typeof paypalSandboxClientSecret === "string" && paypalSandboxClientSecret) updates.paypalSandboxClientSecret = paypalSandboxClientSecret;
      if (typeof paypalLiveClientId === "string" && paypalLiveClientId) updates.paypalLiveClientId = paypalLiveClientId;
      if (typeof paypalLiveClientSecret === "string" && paypalLiveClientSecret) updates.paypalLiveClientSecret = paypalLiveClientSecret;

      const updated = Object.keys(updates).length > 0
        ? await storage.updateAdminSettings(updates)
        : await storage.getAdminSettings();

      const { invalidateSmtpCache } = await import("./email");
      invalidateSmtpCache();

      res.json(buildSettingsResponse(updated));
    } catch (err) {
      console.error("Admin update settings error:", err);
      res.status(500).json({ message: "Failed to update settings" });
    }
  });

  app.post("/api/admin/paypal/test", requireAdmin, async (_req: any, res) => {
    try {
      const settings = await storage.getAdminSettings();
      const { mode, clientId, clientSecret } = resolvePayPalCredentials(settings);
      if (!clientId || !clientSecret) {
        return res.status(400).json({ success: false, error: `PayPal ${mode} credentials are not configured` });
      }
      const { getPayPalAccessToken } = await import("./paypal");
      await getPayPalAccessToken(clientId, clientSecret, mode);
      res.json({ success: true, mode });
    } catch (err: any) {
      res.json({ success: false, error: err.message || "Connection failed" });
    }
  });

  app.get("/api/admin/plans", requireAdmin, async (_req: any, res) => {
    try {
      const dbPlans = await storage.getPlans();
      res.json(dbPlans);
    } catch (err) {
      res.status(500).json({ message: "Failed to fetch plans" });
    }
  });

  app.patch("/api/admin/plans/:key", requireAdmin, async (req: any, res) => {
    try {
      const { key } = req.params;
      if (!["starter", "professional", "enterprise"].includes(key)) {
        return res.status(400).json({ message: "Invalid plan key" });
      }
      const { name, description, monthlyPrice, yearlyPrice, devicesLimit, messagesLimit, features, isPopular } = req.body;
      const updates: Record<string, any> = {};
      if (name !== undefined) updates.name = String(name).trim();
      if (description !== undefined) updates.description = String(description).trim();
      if (monthlyPrice !== undefined) updates.monthlyPrice = Math.round(Number(monthlyPrice));
      if (yearlyPrice !== undefined) updates.yearlyPrice = Math.round(Number(yearlyPrice));
      if (devicesLimit !== undefined) updates.devicesLimit = Number(devicesLimit);
      if (messagesLimit !== undefined) updates.messagesLimit = Number(messagesLimit);
      if (Array.isArray(features)) updates.features = features.map(String);
      if (isPopular !== undefined) updates.isPopular = Boolean(isPopular);
      const updated = await storage.upsertPlan(key, updates);
      res.json(updated);
    } catch (err: any) {
      console.error("Admin update plan error:", err);
      res.status(500).json({ message: err.message || "Failed to update plan" });
    }
  });

  app.post("/api/admin/fix-email-verified", requireAdmin, async (req: any, res) => {
    try {
      const count = await storage.fixAllEmailVerified();
      res.json({ success: true, count });
    } catch (err) {
      console.error("Fix email verified error:", err);
      res.status(500).json({ message: "Failed to fix email verification" });
    }
  });

  app.get("/api/devices/:id/webhook-logs", requireAuth, async (req: any, res) => {
    const deviceId = Number(req.params.id);
    const device = await storage.getDevice(deviceId);
    if (!device || device.userId !== req.user.id) return res.status(404).json({ message: "Not found" });
    const limit = Number(req.query.limit) || 50;
    const logs = await storage.getWebhookLogs(deviceId, limit);
    res.json(logs);
  });

  app.get("/api/usage", requireAuth, async (req: any, res) => {
    try {
      const user = req.user;
      const planKey = user.plan || "starter";
      const dbPlan = await storage.getPlan(planKey);
      const devicesLimit = dbPlan ? dbPlan.devicesLimit : (planKey === "starter" ? 1 : planKey === "professional" ? 5 : -1);
      const messagesLimit = dbPlan ? dbPlan.messagesLimit : (planKey === "starter" ? 100 : -1);
      const userDevices = await storage.getDevices(user.id);
      const messagesToday = await storage.getMessagesToday(user.id);
      res.json({
        plan: planKey,
        devices: { used: userDevices.length, limit: devicesLimit },
        messages: { today: messagesToday, limit: messagesLimit },
      });
    } catch (err) {
      console.error("Usage fetch error:", err);
      res.status(500).json({ message: "Failed to fetch usage" });
    }
  });

  // API Key Middleware
  const requireApiKey = async (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ message: "API key required" });
    
    const user = await storage.getUserByApiKey(apiKey);
    if (!user) return res.status(401).json({ message: "Invalid API key" });
    
    if (user.subscriptionStatus !== 'active') {
      return res.status(403).json({ message: "Active subscription required to use API" });
    }
    
    req.user = user;
    next();
  };

  const validateDeviceAndSend = async (req: any, res: any, msgType: string, to: string, content: string, mediaUrl: string | undefined, extra?: Record<string, any>) => {
    try {
      const deviceId = req.body.deviceId;
      const device = await storage.getDevice(deviceId);
      if (!device || device.userId !== req.user.id) {
        return res.status(404).json({ message: "Device not found" });
      }
      if (device.status !== 'connected') {
        return res.status(400).json({ message: "Device is not connected" });
      }

      const message = await storage.createMessage({
        deviceId: device.id,
        toNumber: to,
        content: content || msgType,
        type: msgType,
      });

      sendMessage(device.id, to, content, message.id, msgType, mediaUrl, extra);
      res.json({ success: true, messageId: message.id });
    } catch (err) {
      console.error("Send message error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  };

  app.post(api.external.sendMessage.path, requireApiKey, async (req: any, res) => {
    try {
      const input = api.external.sendMessage.input.parse(req.body);
      const mediaTypes = ["image", "video", "audio", "document"];
      const effectiveMediaUrl = input.mediaUrl || (mediaTypes.includes(input.type) ? input.content : undefined);

      const device = await storage.getDevice(input.deviceId);
      if (!device || device.userId !== req.user.id) {
        return res.status(404).json({ message: "Device not found" });
      }
      if (device.status !== 'connected') {
        return res.status(400).json({ message: "Device is not connected" });
      }

      const message = await storage.createMessage({
        deviceId: device.id,
        toNumber: input.toNumber,
        content: input.content,
        type: input.type,
      });

      sendMessage(device.id, input.toNumber, input.content, message.id, input.type, effectiveMediaUrl, {
        caption: input.caption,
        filename: input.filename,
        lat: input.lat,
        lng: input.lng,
        address: input.address,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
      });

      res.json({ success: true, messageId: message.id });
    } catch (err) {
      console.error("Send message error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/v1/messages/chat", requireApiKey, async (req: any, res) => {
    const p = api.external.chat.input.parse(req.body);
    await validateDeviceAndSend(req, res, "text", p.to, p.body, undefined);
  });

  app.post("/v1/messages/image", requireApiKey, async (req: any, res) => {
    const p = api.external.image.input.parse(req.body);
    await validateDeviceAndSend(req, res, "image", p.to, p.caption || p.image, p.image, { caption: p.caption });
  });

  app.post("/v1/messages/video", requireApiKey, async (req: any, res) => {
    const p = api.external.video.input.parse(req.body);
    await validateDeviceAndSend(req, res, "video", p.to, p.caption || p.video, p.video, { caption: p.caption });
  });

  app.post("/v1/messages/audio", requireApiKey, async (req: any, res) => {
    const p = api.external.audio.input.parse(req.body);
    await validateDeviceAndSend(req, res, "audio", p.to, p.audio, p.audio);
  });

  app.post("/v1/messages/document", requireApiKey, async (req: any, res) => {
    const p = api.external.document.input.parse(req.body);
    await validateDeviceAndSend(req, res, "document", p.to, p.filename || p.document, p.document, { filename: p.filename });
  });

  app.post("/v1/messages/link", requireApiKey, async (req: any, res) => {
    const p = api.external.link.input.parse(req.body);
    await validateDeviceAndSend(req, res, "link", p.to, p.link, undefined);
  });

  app.post("/v1/messages/contact", requireApiKey, async (req: any, res) => {
    const p = api.external.contact.input.parse(req.body);
    await validateDeviceAndSend(req, res, "contact", p.to, p.contact, undefined, { contactPhone: p.contact });
  });

  app.post("/v1/messages/location", requireApiKey, async (req: any, res) => {
    const p = api.external.location.input.parse(req.body);
    await validateDeviceAndSend(req, res, "location", p.to, p.address || "Location", undefined, { lat: p.lat, lng: p.lng, address: p.address });
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const input = insertContactMessageSchema.parse(req.body);
      const [contactMsg] = await db.insert(contactMessages).values(input).returning();
      console.log(`[Contact] New message from ${input.name} (${input.email}) - Subject: ${input.subject}`);
      res.json({ success: true, id: contactMsg.id });
    } catch (err) {
      console.error("Contact form error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(
`User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /devices
Disallow: /messages
Disallow: /billing
Disallow: /profile
Disallow: /admin
Disallow: /api/

Sitemap: https://quackapi.com/sitemap.xml`
    );
  });

  app.get("/sitemap.xml", (_req, res) => {
    const host = "https://quackapi.com";
    const pages = [
      { loc: "/", priority: "1.0", changefreq: "weekly", lastmod: "2026-03-03" },
      { loc: "/pricing", priority: "0.9", changefreq: "weekly", lastmod: "2026-03-03" },
      { loc: "/docs", priority: "0.9", changefreq: "weekly", lastmod: "2026-03-01" },
      { loc: "/blog", priority: "0.8", changefreq: "weekly", lastmod: "2026-03-01" },
      { loc: "/blog/send-whatsapp-messages-python", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-15" },
      { loc: "/blog/whatsapp-api-vs-sms", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-16" },
      { loc: "/blog/whatsapp-webhook-setup-guide", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-17" },
      { loc: "/blog/whatsapp-otp-verification-nodejs", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-18" },
      { loc: "/blog/send-whatsapp-messages-php", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-19" },
      { loc: "/blog/send-whatsapp-messages-nodejs", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-20" },
      { loc: "/blog/build-whatsapp-chatbot-python", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/blog/avoid-whatsapp-number-ban", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-22" },
      { loc: "/blog/connect-whatsapp-api-crm-integration", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-23" },
      { loc: "/blog/whatsapp-api-messaging-best-practices", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-24" },
      { loc: "/blog/whatsapp-api-without-meta-approval", priority: "0.8", changefreq: "monthly", lastmod: "2026-02-25" },
      { loc: "/blog/whatsapp-api-free-alternatives", priority: "0.8", changefreq: "monthly", lastmod: "2026-02-26" },
      { loc: "/blog/whatsapp-abandoned-cart-recovery", priority: "0.8", changefreq: "monthly", lastmod: "2026-02-27" },
      { loc: "/use-cases", priority: "0.8", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/use-cases/notifications", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/use-cases/otp", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/use-cases/customer-support", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/use-cases/automation", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/use-cases/ecommerce", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/use-cases/healthcare", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/compare", priority: "0.8", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/compare/ultramsg", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/compare/twilio", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/compare/wati", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/compare/aisensy", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/compare/evolution-api", priority: "0.7", changefreq: "monthly", lastmod: "2026-02-21" },
      { loc: "/terms", priority: "0.5", changefreq: "yearly", lastmod: "2026-02-21" },
      { loc: "/privacy", priority: "0.5", changefreq: "yearly", lastmod: "2026-02-21" },
      { loc: "/contact", priority: "0.6", changefreq: "monthly", lastmod: "2026-02-21" },
    ];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${host}${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
    res.type("application/xml").send(xml);
  });

  return httpServer;
}
