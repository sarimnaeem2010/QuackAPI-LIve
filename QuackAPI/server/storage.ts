import { db } from "./db";
import { users, devices, messages, payments, paymentMethods, passwordResetTokens, adminSettings, webhookLogs, plans, type User, type InsertUser, type Device, type InsertDevice, type UpdateDeviceRequest, type Message, type InsertMessage, type Payment, type InsertPayment, type PaymentMethod, type InsertPaymentMethod, type AdminSettings, type InsertAdminSettings, type WebhookLog, type InsertWebhookLog, type Plan } from "@shared/schema";
import { eq, and, desc, sql, gte, inArray } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByApiKey(apiKey: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserProfile(id: number, updates: { name?: string; email?: string }): Promise<User>;
  updateUserPassword(id: number, password: string): Promise<User>;
  regenerateApiKey(id: number): Promise<User>;
  updateUserSubscription(id: number, status: string): Promise<User>;
  updateUserAdmin(id: number, isAdmin: boolean): Promise<User>;
  updateUserPlan(id: number, plan: string): Promise<User>;
  updateUserPlanDetails(id: number, plan: string, billingCycle: string, expiresAt: Date | null): Promise<User>;

  createPasswordResetToken(userId: number): Promise<string>;
  createPasswordResetOTP(userId: number): Promise<string>;
  getPasswordResetToken(token: string): Promise<{ userId: number; expiresAt: Date; used: boolean } | undefined>;
  getPasswordResetOTPForUser(userId: number): Promise<{ otp: string; dbToken: string; expiresAt: Date; used: boolean } | undefined>;
  markPasswordResetTokenUsed(token: string): Promise<void>;

  setEmailOtp(userId: number, otp: string, expiresAt: Date): Promise<void>;
  verifyEmailOtp(userId: number, otp: string): Promise<boolean>;
  markEmailVerified(userId: number): Promise<void>;

  getDevices(userId: number): Promise<Device[]>;
  getDevice(id: number): Promise<Device | undefined>;
  getConnectedAndPendingDevices(): Promise<Device[]>;
  getDevicesWithSession(): Promise<Device[]>;
  createDevice(device: InsertDevice): Promise<Device>;
  updateDevice(id: number, updates: UpdateDeviceRequest): Promise<Device>;
  updateDeviceSession(id: number, sessionData: any, status: string, qrCode: string | null): Promise<Device>;
  updateDeviceStatusAndQR(id: number, status: string, qrCode: string | null): Promise<Device>;
  updateDeviceSessionData(id: number, data: any): Promise<void>;
  updateDevicePhone(id: number, phoneNumber: string): Promise<Device>;
  deleteDevice(id: number): Promise<void>;

  getMessages(deviceId?: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  updateMessageStatus(id: number, status: string, errorReason?: string): Promise<Message>;

  getPayments(userId: number): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: number, status: string, transactionId?: string): Promise<Payment>;

  getPaymentMethods(userId: number): Promise<PaymentMethod[]>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;
  setDefaultPaymentMethod(userId: number, methodId: number): Promise<void>;
  deletePaymentMethod(id: number): Promise<void>;
  updateStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;

  getMessageTraffic(userId: number, days?: number): Promise<{ date: string; sent: number; failed: number; pending: number }[]>;
  deleteUser(id: number): Promise<void>;
  updateDeviceStatus(id: number, status: string): Promise<Device>;

  getAdminSettings(): Promise<AdminSettings>;
  updateAdminSettings(data: Partial<InsertAdminSettings>): Promise<AdminSettings>;
  fixAllEmailVerified(): Promise<number>;

  createWebhookLog(data: InsertWebhookLog): Promise<WebhookLog>;
  getWebhookLogs(deviceId: number, limit?: number): Promise<WebhookLog[]>;

  getMessagesToday(userId: number): Promise<number>;

  getPlans(): Promise<Plan[]>;
  getPlan(key: string): Promise<Plan | undefined>;
  upsertPlan(key: string, data: Partial<Plan>): Promise<Plan>;

  getAllUsers(): Promise<User[]>;
  getAllDevices(): Promise<Device[]>;
  getAllMessages(): Promise<Message[]>;
  getAllPayments(): Promise<Payment[]>;
  getAdminStats(): Promise<{
    totalUsers: number;
    totalDevices: number;
    totalMessages: number;
    totalPayments: number;
    activeSubscriptions: number;
    connectedDevices: number;
    totalRevenue: number;
    sentMessages: number;
    failedMessages: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  async getUserByApiKey(apiKey: string) {
    const [user] = await db.select().from(users).where(eq(users.apiKey, apiKey));
    return user;
  }
  async createUser(user: InsertUser) {
    const apiKey = "wa_" + crypto.randomBytes(24).toString("hex");
    const [newUser] = await db.insert(users).values({ ...user, apiKey }).returning();
    return newUser;
  }
  async updateUserProfile(id: number, updates: { name?: string; email?: string }) {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }
  async updateUserPassword(id: number, password: string) {
    const [updated] = await db.update(users).set({ password }).where(eq(users.id, id)).returning();
    return updated;
  }
  async regenerateApiKey(id: number) {
    const newApiKey = "wa_" + crypto.randomBytes(24).toString("hex");
    const [updated] = await db.update(users).set({ apiKey: newApiKey }).where(eq(users.id, id)).returning();
    return updated;
  }
  async createPasswordResetToken(userId: number) {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await db.insert(passwordResetTokens).values({ userId, token, expiresAt });
    return token;
  }
  async getPasswordResetToken(token: string) {
    const [result] = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.token, token));
    if (!result) return undefined;
    return { userId: result.userId, expiresAt: result.expiresAt, used: result.used };
  }
  async markPasswordResetTokenUsed(token: string) {
    await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.token, token));
  }
  async createPasswordResetOTP(userId: number) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const uniqueToken = `uid${userId}_${crypto.randomBytes(6).toString("hex")}_${otp}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await db.insert(passwordResetTokens).values({ userId, token: uniqueToken, expiresAt });
    return otp;
  }
  async getPasswordResetOTPForUser(userId: number) {
    const results = await db.select().from(passwordResetTokens)
      .where(and(eq(passwordResetTokens.userId, userId), eq(passwordResetTokens.used, false)))
      .orderBy(desc(passwordResetTokens.createdAt))
      .limit(1);
    if (!results[0]) return undefined;
    const parts = results[0].token.split("_");
    const otp = parts[parts.length - 1];
    return { otp, dbToken: results[0].token, expiresAt: results[0].expiresAt, used: results[0].used };
  }
  async setEmailOtp(userId: number, otp: string, expiresAt: Date) {
    await db.update(users).set({ emailOtp: otp, emailOtpExpiresAt: expiresAt }).where(eq(users.id, userId));
  }
  async verifyEmailOtp(userId: number, otp: string) {
    const user = await this.getUser(userId);
    if (!user || !user.emailOtp || !user.emailOtpExpiresAt) return false;
    if (user.emailOtp !== otp) return false;
    if (new Date() > user.emailOtpExpiresAt) return false;
    await db.update(users).set({ emailOtp: null, emailOtpExpiresAt: null }).where(eq(users.id, userId));
    return true;
  }
  async markEmailVerified(userId: number) {
    await db.update(users).set({ emailVerified: true }).where(eq(users.id, userId));
  }
  async updateUserSubscription(id: number, status: string) {
    const [updated] = await db.update(users).set({ subscriptionStatus: status }).where(eq(users.id, id)).returning();
    return updated;
  }
  
  async getDevices(userId: number) {
    return await db.select().from(devices).where(eq(devices.userId, userId));
  }
  async getDevice(id: number) {
    const [device] = await db.select().from(devices).where(eq(devices.id, id));
    return device;
  }
  async createDevice(device: InsertDevice) {
    const [newDevice] = await db.insert(devices).values(device).returning();
    return newDevice;
  }
  async updateDevice(id: number, updates: UpdateDeviceRequest) {
    const [updated] = await db.update(devices).set(updates).where(eq(devices.id, id)).returning();
    return updated;
  }
  async getConnectedAndPendingDevices() {
    return await db.select().from(devices).where(inArray(devices.status, ["connected", "pending"]));
  }
  async getDevicesWithSession() {
    const allDevices = await db.select().from(devices);
    return allDevices.filter(
      (d) => d.sessionData && typeof d.sessionData === "object" && Object.keys(d.sessionData as object).length > 0
    );
  }
  async updateDeviceSession(id: number, sessionData: any, status: string, qrCode: string | null) {
    const [updated] = await db.update(devices).set({ sessionData, status, qrCode }).where(eq(devices.id, id)).returning();
    return updated;
  }
  async updateDeviceStatusAndQR(id: number, status: string, qrCode: string | null) {
    const [updated] = await db.update(devices).set({ status, qrCode }).where(eq(devices.id, id)).returning();
    return updated;
  }
  async updateDeviceSessionData(id: number, data: any) {
    await db.update(devices).set({ sessionData: data }).where(eq(devices.id, id));
  }
  async updateDevicePhone(id: number, phoneNumber: string) {
    const [updated] = await db.update(devices).set({ phoneNumber }).where(eq(devices.id, id)).returning();
    return updated;
  }
  async deleteDevice(id: number) {
    await db.delete(messages).where(eq(messages.deviceId, id));
    await db.delete(devices).where(eq(devices.id, id));
  }

  async deleteUser(id: number) {
    const userDevices = await db.select().from(devices).where(eq(devices.userId, id));
    for (const device of userDevices) {
      await db.delete(messages).where(eq(messages.deviceId, device.id));
    }
    await db.delete(devices).where(eq(devices.userId, id));
    await db.delete(payments).where(eq(payments.userId, id));
    await db.delete(paymentMethods).where(eq(paymentMethods.userId, id));
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async updateDeviceStatus(id: number, status: string) {
    const [updated] = await db.update(devices).set({ status }).where(eq(devices.id, id)).returning();
    return updated;
  }

  async getAdminSettings(): Promise<AdminSettings> {
    const [settings] = await db.select().from(adminSettings).limit(1);
    if (settings) return settings;
    const [created] = await db.insert(adminSettings).values({ requireEmailOtp: true }).returning();
    return created;
  }

  async updateAdminSettings(data: Partial<InsertAdminSettings>): Promise<AdminSettings> {
    const existing = await this.getAdminSettings();
    const [updated] = await db.update(adminSettings).set(data).where(eq(adminSettings.id, existing.id)).returning();
    return updated;
  }

  async fixAllEmailVerified(): Promise<number> {
    const result = await db.update(users).set({ emailVerified: true }).where(eq(users.emailVerified, false)).returning({ id: users.id });
    return result.length;
  }

  async createWebhookLog(data: InsertWebhookLog): Promise<WebhookLog> {
    const [log] = await db.insert(webhookLogs).values(data).returning();
    return log;
  }

  async getWebhookLogs(deviceId: number, limit = 50): Promise<WebhookLog[]> {
    return await db.select().from(webhookLogs).where(eq(webhookLogs.deviceId, deviceId)).orderBy(desc(webhookLogs.createdAt)).limit(limit);
  }

  async getMessagesToday(userId: number): Promise<number> {
    const userDevices = await this.getDevices(userId);
    if (userDevices.length === 0) return 0;
    const deviceIds = userDevices.map(d => d.id);
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const result = await db.select({ count: sql<number>`count(*)::int` }).from(messages)
      .where(and(
        sql`${messages.deviceId} IN (${sql.join(deviceIds.map(id => sql`${id}`), sql`,`)})`,
        gte(messages.createdAt, startOfDay)
      ));
    return result[0]?.count || 0;
  }

  async getMessages(deviceId?: number) {
    if (deviceId) {
      return await db.select().from(messages).where(eq(messages.deviceId, deviceId)).orderBy(messages.createdAt);
    }
    return await db.select().from(messages).orderBy(messages.createdAt);
  }
  async createMessage(message: InsertMessage) {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }
  async updateMessageStatus(id: number, status: string, errorReason?: string) {
    const [updated] = await db.update(messages).set({ status, errorReason }).where(eq(messages.id, id)).returning();
    return updated;
  }

  async getPayments(userId: number) {
    return await db.select().from(payments).where(eq(payments.userId, userId));
  }
  async createPayment(payment: InsertPayment) {
    const [newPayment] = await db.insert(payments).values(payment).returning();
    return newPayment;
  }
  async updatePaymentStatus(id: number, status: string, transactionId?: string) {
    const [updated] = await db.update(payments).set({ status, transactionId }).where(eq(payments.id, id)).returning();
    return updated;
  }

  async getMessageTraffic(userId: number, days = 7) {
    const userDevices = await this.getDevices(userId);
    if (userDevices.length === 0) {
      return this.generateEmptyDays(days);
    }
    const deviceIds = userDevices.map(d => d.id);
    const allMessages = await db.select().from(messages)
      .where(sql`${messages.deviceId} IN (${sql.join(deviceIds.map(id => sql`${id}`), sql`,`)})`)
      .orderBy(desc(messages.createdAt));

    const now = new Date();
    const result: { date: string; sent: number; failed: number; pending: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });
      const dayMessages = allMessages.filter(m => {
        if (!m.createdAt) return false;
        return new Date(m.createdAt).toISOString().slice(0, 10) === dateStr;
      });
      result.push({
        date: dayLabel,
        sent: dayMessages.filter(m => m.status === "sent").length,
        failed: dayMessages.filter(m => m.status === "failed").length,
        pending: dayMessages.filter(m => m.status === "pending").length,
      });
    }
    return result;
  }

  private generateEmptyDays(days: number) {
    const now = new Date();
    const result: { date: string; sent: number; failed: number; pending: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      result.push({ date: d.toLocaleDateString("en-US", { weekday: "short" }), sent: 0, failed: 0, pending: 0 });
    }
    return result;
  }

  async updateUserAdmin(id: number, isAdmin: boolean) {
    const [updated] = await db.update(users).set({ isAdmin }).where(eq(users.id, id)).returning();
    return updated;
  }

  async updateUserPlan(id: number, plan: string) {
    const [updated] = await db.update(users).set({ plan }).where(eq(users.id, id)).returning();
    return updated;
  }

  async updateUserPlanDetails(id: number, plan: string, billingCycle: string, expiresAt: Date | null) {
    const [updated] = await db.update(users).set({ plan, billingCycle, planExpiresAt: expiresAt }).where(eq(users.id, id)).returning();
    return updated;
  }

  async getAllUsers() {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }
  async getAllDevices() {
    return await db.select().from(devices).orderBy(desc(devices.createdAt));
  }
  async getAllMessages() {
    return await db.select().from(messages).orderBy(desc(messages.createdAt));
  }
  async getAllPayments() {
    return await db.select().from(payments).orderBy(desc(payments.createdAt));
  }
  async getPaymentMethods(userId: number) {
    return await db.select().from(paymentMethods).where(eq(paymentMethods.userId, userId)).orderBy(desc(paymentMethods.createdAt));
  }

  async createPaymentMethod(method: InsertPaymentMethod) {
    const [created] = await db.insert(paymentMethods).values(method).returning();
    return created;
  }

  async setDefaultPaymentMethod(userId: number, methodId: number) {
    await db.update(paymentMethods).set({ isDefault: false }).where(eq(paymentMethods.userId, userId));
    await db.update(paymentMethods).set({ isDefault: true }).where(and(eq(paymentMethods.id, methodId), eq(paymentMethods.userId, userId)));
  }

  async deletePaymentMethod(id: number) {
    await db.delete(paymentMethods).where(eq(paymentMethods.id, id));
  }

  async updateStripeCustomerId(userId: number, stripeCustomerId: string) {
    const [updated] = await db.update(users).set({ stripeCustomerId }).where(eq(users.id, userId)).returning();
    return updated;
  }

  async getAdminStats() {
    const [userStats] = await db.select({
      totalUsers: sql<number>`count(*)::int`,
      activeSubscriptions: sql<number>`count(*) filter (where ${users.subscriptionStatus} = 'active')::int`,
    }).from(users);

    const [deviceStats] = await db.select({
      totalDevices: sql<number>`count(*)::int`,
      connectedDevices: sql<number>`count(*) filter (where ${devices.status} = 'connected')::int`,
    }).from(devices);

    const [messageStats] = await db.select({
      totalMessages: sql<number>`count(*)::int`,
      sentMessages: sql<number>`count(*) filter (where ${messages.status} = 'sent')::int`,
      failedMessages: sql<number>`count(*) filter (where ${messages.status} = 'failed')::int`,
    }).from(messages);

    const [paymentStats] = await db.select({
      totalPayments: sql<number>`count(*)::int`,
      totalRevenue: sql<number>`coalesce(sum(${payments.amount}) filter (where ${payments.status} = 'completed'), 0)::int`,
    }).from(payments);

    return {
      totalUsers: userStats.totalUsers,
      activeSubscriptions: userStats.activeSubscriptions,
      totalDevices: deviceStats.totalDevices,
      connectedDevices: deviceStats.connectedDevices,
      totalMessages: messageStats.totalMessages,
      sentMessages: messageStats.sentMessages,
      failedMessages: messageStats.failedMessages,
      totalPayments: paymentStats.totalPayments,
      totalRevenue: paymentStats.totalRevenue,
    };
  }

  async getPlans(): Promise<Plan[]> {
    const rows = await db.select().from(plans).orderBy(plans.sortOrder);
    return rows;
  }

  async getPlan(key: string): Promise<Plan | undefined> {
    const [row] = await db.select().from(plans).where(eq(plans.key, key)).limit(1);
    return row;
  }

  async upsertPlan(key: string, data: Partial<Plan>): Promise<Plan> {
    const existing = await this.getPlan(key);
    if (existing) {
      const [updated] = await db.update(plans).set(data).where(eq(plans.key, key)).returning();
      return updated;
    } else {
      const [created] = await db.insert(plans).values({ key, name: key, ...data } as any).returning();
      return created;
    }
  }

  async ensureDefaultPlans(): Promise<void> {
    const existing = await this.getPlans();
    if (existing.length > 0) return;
    const defaults = [
      {
        key: "starter", name: "Starter",
        description: "Perfect for individuals and small projects",
        monthlyPrice: 0, yearlyPrice: 0,
        devicesLimit: 1, messagesLimit: 100,
        features: ["1 WhatsApp device", "100 messages/day", "REST API access", "Basic webhook support", "Email support"],
        isPopular: false, sortOrder: 0,
      },
      {
        key: "professional", name: "Professional",
        description: "For growing businesses and developers",
        monthlyPrice: 2900, yearlyPrice: 29000,
        devicesLimit: 5, messagesLimit: 1000,
        features: ["5 WhatsApp devices", "1,000 messages/day", "REST API access", "Advanced webhooks", "Priority support", "Analytics dashboard"],
        isPopular: true, sortOrder: 1,
      },
      {
        key: "enterprise", name: "Enterprise",
        description: "Unlimited scale for large businesses",
        monthlyPrice: 9900, yearlyPrice: 99000,
        devicesLimit: -1, messagesLimit: -1,
        features: ["Unlimited devices", "Unlimited messages/day", "REST API access", "Advanced webhooks", "Dedicated support", "Custom integrations", "SLA guarantee"],
        isPopular: false, sortOrder: 2,
      },
    ];
    for (const p of defaults) {
      await db.insert(plans).values(p as any).onConflictDoNothing();
    }
  }
}

export const storage = new DatabaseStorage();
