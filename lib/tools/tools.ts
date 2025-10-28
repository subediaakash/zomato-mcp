import { z } from "zod";
import { db } from "@/drizzle/src";
import { product as productTable } from "@/drizzle/src/db/product-schema";
import { ilike, or } from "drizzle-orm";
import { order as orderTable, orderItem as orderItemTable } from "@/drizzle/src/db/order-schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { randomUUID } from "crypto";

// Tool: checkProductAvailability
export const checkProductAvailabilityTool = {
  name: "checkProductAvailability",
  description:
    "Check if one or more products are available by name (case-insensitive). Returns availability and matched product details per requested name.",
  inputSchema: z.object({
    productNames: z.array(z.string().min(1)).min(1),
  }),
  execute: async ({ productNames }: { productNames: string[] }): Promise<{ totalRequested: number; totalAvailable: number; results: { name: string; available: boolean; matches: { id: string; productName: string; price: number; category: "VEG" | "NON_VEG"; }[]; }[]; }> => {
    const names = productNames;
    const queryNames = Array.from(new Set(names.map((n) => n.trim()).filter(Boolean)));

    if (queryNames.length === 0) {
      return { totalRequested: 0, totalAvailable: 0, results: [] };
    }

    const conditions = queryNames.map((n) => ilike(productTable.productName, n));
    const where = conditions.length === 1 ? conditions[0] : or(...conditions);

    const rows = await db
      .select({
        id: productTable.id,
        productName: productTable.productName,
        price: productTable.price,
        category: productTable.category,
      })
      .from(productTable)
      .where(where);

    const results = queryNames.map((name) => {
      const matches = rows.filter((r) => r.productName.toLowerCase() === name.toLowerCase());
      return {
        name,
        available: matches.length > 0,
        matches,
      };
    });

    return {
      totalRequested: queryNames.length,
      totalAvailable: results.filter((r) => r.available).length,
      results,
    };
  },
} as const;

// Backwards-friendly named export
export { checkProductAvailabilityTool as checkProductAvailability };

// Tool: createOrder
export const createOrderTool = {
  name: "createOrder",
  description: "Create an order for a user with one or more items by product name.",
  inputSchema: z.object({
    userId: z.string().min(1),
    items: z.array(
      z.object({
        productName: z.string().min(1),
        quantity: z.number().int().positive().default(1),
      })
    ).min(1),
  }),
  execute: async ({ userId, items }: { userId: string; items: { productName: string; quantity: number }[] }) => {
    // Load all requested products
    const uniqueNames = Array.from(new Set(items.map((i) => i.productName.trim()).filter(Boolean)));
    const conditions = uniqueNames.map((n) => ilike(productTable.productName, n));
    const where = conditions.length === 1 ? conditions[0] : or(...conditions);
    const products = await db.select().from(productTable).where(where);

    const nameToProduct = new Map(products.map((p) => [p.productName.toLowerCase(), p] as const));

    const missing = items.filter((i) => !nameToProduct.get(i.productName.toLowerCase()));
    if (missing.length > 0) {
      return { ok: false, error: `Missing products: ${missing.map((m) => m.productName).join(", ")}` };
    }

    const orderId = randomUUID();
    await db.insert(orderTable).values({ id: orderId, userId });

    const orderItems = items.map((i) => {
      const p = nameToProduct.get(i.productName.toLowerCase())!;
      return {
        id: randomUUID(),
        orderId,
        productId: p.id,
        quantity: i.quantity,
        priceAtPurchase: p.price,
      };
    });
    await db.insert(orderItemTable).values(orderItems);

    const totalAmount = orderItems.reduce((sum, it) => sum + it.priceAtPurchase * it.quantity, 0);
    return { ok: true, orderId, totalAmount, itemCount: orderItems.length };
  },
} as const;

// Tool: listOrdersByTimeWindow
export const listOrdersTool = {
  name: "listOrders",
  description: "List a user's orders within a recent time window like past N hours/days.",
  inputSchema: z.object({
    userId: z.string().min(1),
    amount: z.number().int().positive(),
    unit: z.enum(["minutes", "hours", "days", "weeks"]).default("hours"),
  }),
  execute: async ({ userId, amount, unit }: { userId: string; amount: number; unit: "minutes" | "hours" | "days" | "weeks" }) => {
    const multipliers: Record<typeof unit, number> = {
      minutes: 60 * 1000,
      hours: 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      weeks: 7 * 24 * 60 * 60 * 1000,
    } as const;

    const ms = amount * multipliers[unit];
    const since = new Date(Date.now() - ms);

    const orders = await db
      .select({ id: orderTable.id, createdAt: orderTable.createdAt, status: orderTable.status })
      .from(orderTable)
      .where(and(eq(orderTable.userId, userId), gte(orderTable.createdAt, since)))
      .orderBy(desc(orderTable.createdAt));

    // Count items per order
    const orderIds = orders.map((o) => o.id);
    const itemsByOrder = new Map<string, number>();
    if (orderIds.length > 0) {
      const itemRows = await db
        .select({ orderId: orderItemTable.orderId })
        .from(orderItemTable)
        .where(or(...orderIds.map((id) => eq(orderItemTable.orderId, id))));
      for (const r of itemRows) {
        itemsByOrder.set(r.orderId, (itemsByOrder.get(r.orderId) ?? 0) + 1);
      }
    }

    return orders.map((o) => ({ ...o, itemCount: itemsByOrder.get(o.id) ?? 0 }));
  },
} as const;