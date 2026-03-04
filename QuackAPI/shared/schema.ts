import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  apiKey: text("api_key").notNull().unique(),
  subscriptionStatus: text("subscription_status").notNull().default("inactive"), // active, inactive
  plan: text("plan").notNull().default("starter"), // starter, professional, enterprise
  billingCycle: text("billing_cycle").default("monthly"), // monthly, yearly
  planExpiresAt: timestamp("plan_expires_at"),
  stripeCustomerId: text("stripe_customer_id"),
  isAdmin: boolean("is_admin").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  emailOtp: text("email_otp"),
  emailOtpExpiresAt: timestamp("email_otp_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const devices = pgTable("devices", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  deviceName: text("device_name").notNull(),
  phoneNumber: text("phone_number"),
  sessionData: jsonb("session_data"),
  status: text("status").notNull().default("disconnected"), // disconnected, pending, connected
  qrCode: text("qr_code"),
  webhookUrl: text("webhook_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => devices.id),
  toNumber: text("to_number").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("text"), // text, image, video, audio, document, link, contact, location
  status: text("status").notNull().default("pending"), // pending, sent, failed
  errorReason: text("error_reason"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  stripePaymentMethodId: text("stripe_payment_method_id").notNull(),
  brand: text("brand").notNull(), // visa, mastercard, etc.
  last4: text("last4").notNull(),
  expMonth: integer("exp_month").notNull(),
  expYear: integer("exp_year").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in cents/lowest denomination
  currency: text("currency").notNull().default("PKR"),
  gateway: text("gateway").notNull(), // jazzcash, easypaisa, stripe
  transactionId: text("transaction_id"),
  status: text("status").notNull().default("pending"), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  used: boolean("used").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSettings = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  requireEmailOtp: boolean("require_email_otp").notNull().default(true),
  smtpHost: text("smtp_host"),
  smtpPort: text("smtp_port"),
  smtpUser: text("smtp_user"),
  smtpPass: text("smtp_pass"),
  notificationEmail: text("notification_email"),
  paypalClientId: text("paypal_client_id"),
  paypalClientSecret: text("paypal_client_secret"),
  paypalMode: text("paypal_mode").default("sandbox"),
  paypalSandboxClientId: text("paypal_sandbox_client_id"),
  paypalSandboxClientSecret: text("paypal_sandbox_client_secret"),
  paypalLiveClientId: text("paypal_live_client_id"),
  paypalLiveClientSecret: text("paypal_live_client_secret"),
});

export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  monthlyPrice: integer("monthly_price").notNull().default(0),
  yearlyPrice: integer("yearly_price").notNull().default(0),
  devicesLimit: integer("devices_limit").notNull().default(1),
  messagesLimit: integer("messages_limit").notNull().default(100),
  features: jsonb("features").$type<string[]>().notNull().default([]),
  isPopular: boolean("is_popular").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const webhookLogs = pgTable("webhook_logs", {
  id: serial("id").primaryKey(),
  deviceId: integer("device_id").notNull().references(() => devices.id),
  event: text("event").notNull(),
  url: text("url").notNull(),
  payload: jsonb("payload"),
  success: boolean("success").notNull(),
  statusCode: integer("status_code"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const usersRelations = relations(users, ({ many }) => ({
  devices: many(devices),
  payments: many(payments),
  paymentMethods: many(paymentMethods),
}));

export const devicesRelations = relations(devices, ({ one, many }) => ({
  user: one(users, {
    fields: [devices.userId],
    references: [users.id],
  }),
  messages: many(messages),
}));

// === BASE SCHEMAS ===
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, apiKey: true, subscriptionStatus: true, plan: true, isAdmin: true });
export const insertDeviceSchema = createInsertSchema(devices).omit({ id: true, createdAt: true, sessionData: true, status: true, phoneNumber: true, qrCode: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, status: true, errorReason: true });
export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true, status: true });
export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({ id: true, createdAt: true });
export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true, status: true });
export const insertAdminSettingsSchema = createInsertSchema(adminSettings).omit({ id: true });
export const insertWebhookLogSchema = createInsertSchema(webhookLogs).omit({ id: true, createdAt: true });
export const insertPlanSchema = createInsertSchema(plans).omit({ id: true });

// === EXPLICIT API CONTRACT TYPES ===

// Users
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserResponse = Omit<User, 'password'>; // Don't expose password

// Devices
export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type UpdateDeviceRequest = Partial<InsertDevice> & { webhookUrl?: string };
export type DeviceResponse = Omit<Device, 'sessionData'>; // Don't expose sensitive session data

// Messages
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type MessageResponse = Message;

// Payments
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type PaymentResponse = Payment;

// Payment Methods
export type PaymentMethod = typeof paymentMethods.$inferSelect;
export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethodResponse = PaymentMethod;

// Contact Messages
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

// Admin Settings
export type AdminSettings = typeof adminSettings.$inferSelect;
export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;

// Plans
export type Plan = typeof plans.$inferSelect;
export type InsertPlan = z.infer<typeof insertPlanSchema>;

// Webhook Logs
export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;

// API Auth
export type LoginRequest = { email: string; password: string };
export type AuthResponse = { user: UserResponse; token: string };

// External API sending message
export const MESSAGE_TYPES = ["text", "image", "video", "audio", "document", "link", "contact", "location"] as const;
export type MessageType = typeof MESSAGE_TYPES[number];

export type ApiSendMessageRequest = {
  toNumber: string;
  content: string;
  type?: MessageType;
  mediaUrl?: string;
  caption?: string;
  filename?: string;
  lat?: string;
  lng?: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
};