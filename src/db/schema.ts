import { pgTable, uuid, text, timestamp, boolean, integer, uniqueIndex, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const spinEntries = pgTable("spin_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: text("session_id").notNull(),
  instagramHandle: text("instagram_handle"),
  referredByUserId: uuid("referred_by_user_id"),
  prizeId: text("prize_id").notNull(),
  prizeName: text("prize_name").notNull(),
  prizeType: text("prize_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  index("spin_session_idx").on(t.sessionId),
  index("spin_instagram_idx").on(t.instagramHandle),
  index("spin_referred_idx").on(t.referredByUserId),
  index("spin_prize_idx").on(t.prizeId),
]);

export const users = pgTable("user_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  instagramHandle: text("instagram_handle").notNull(),
  spinEntryId: uuid("spin_entry_id").references(() => spinEntries.id, { onDelete: "set null" }),
  referralCode: text("referral_code").notNull(),
  shareCount: integer("share_count").default(0).notNull(),
  orderConfirmed: boolean("order_confirmed").default(false).notNull(),
  orderStatus: text("order_status").default("PENDING_SHARE").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [
  uniqueIndex("user_email_unique").on(t.email),
  index("user_instagram_idx").on(t.instagramHandle),
  uniqueIndex("user_referral_unique").on(t.referralCode),
]);

export const shippingAddresses = pgTable("shipping_addresses", {
  id: uuid("id").defaultRandom().primaryKey(),
  spinEntryId: uuid("spin_entry_id").notNull().references(() => spinEntries.id, { onDelete: "cascade" }),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull().default("India"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [uniqueIndex("shipping_spin_unique").on(t.spinEntryId)]);

export const shareEvents = pgTable("share_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channel: text("channel").notNull().default("whatsapp"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => [index("share_user_idx").on(t.userId)]);

export const spinRelations = relations(spinEntries, ({ one, many }) => ({
  shipping: one(shippingAddresses, { fields: [spinEntries.id], references: [shippingAddresses.spinEntryId] }),
  user: one(users, { fields: [spinEntries.id], references: [users.spinEntryId] }),
}));
