import { pgTable, text, timestamp, boolean, integer, real, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";
import { product } from "./product-schema";

// --- Order Status Enum ---
export const orderStatusEnum = pgEnum("order_status", [
    "PENDING",
    "PAID",
    "DELIVERED",
    "CANCELLED",
]);

// --- Orders Table ---
export const order = pgTable("order", {
    id: text("id").primaryKey(),
    status: orderStatusEnum("status").default("PENDING").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    delivered: boolean("delivered").default(false).notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

// --- Order Items Table (join table) ---
export const orderItem = pgTable("order_item", {
    id: text("id").primaryKey(),
    orderId: text("order_id")
        .notNull()
        .references(() => order.id, { onDelete: "cascade" }),
    productId: text("product_id")
        .notNull()
        .references(() => product.id, { onDelete: "cascade" }),
    quantity: integer("quantity").default(1).notNull(),
    priceAtPurchase: real("price_at_purchase").notNull(),
});

// --- Relations ---
export const orderRelations = relations(order, ({ many, one }) => ({
    user: one(user, {
        fields: [order.userId],
        references: [user.id],
    }),
    items: many(orderItem),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
    order: one(order, {
        fields: [orderItem.orderId],
        references: [order.id],
    }),
    product: one(product, {
        fields: [orderItem.productId],
        references: [product.id],
    }),
}));
