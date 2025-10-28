import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/drizzle/src";
import { order, orderItem } from "@/drizzle/src/db/order-schema";
import { product } from "@/drizzle/src/db/product-schema";
import { eq } from "drizzle-orm";

type CreatedOrderItem = {
    id: string;
    quantity: number;
    priceAtPurchase: number;
    product: { id: string; productName: string; imageUrl: string };
};
export async function GET() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const rows = await db
        .select({
            orderId: order.id,
            status: order.status,
            createdAt: order.createdAt,
            delivered: order.delivered,
            itemId: orderItem.id,
            quantity: orderItem.quantity,
            priceAtPurchase: orderItem.priceAtPurchase,
            productId: product.id,
            productName: product.productName,
            imageUrl: product.imageUrl,
        })
        .from(order)
        .leftJoin(orderItem, eq(orderItem.orderId, order.id))
        .leftJoin(product, eq(orderItem.productId, product.id))
        .where(eq(order.userId, session.user.id));

    type ApiOrderItem = {
        id: string;
        quantity: number;
        priceAtPurchase: number;
        product: { id: string; productName: string; imageUrl: string };
    };
    type ApiOrder = {
        id: string;
        status: typeof order.$inferSelect.status;
        createdAt: Date;
        delivered: boolean;
        items: ApiOrderItem[];
    };

    const orderIdToOrder: Record<string, ApiOrder> = {};
    for (const r of rows) {
        if (!orderIdToOrder[r.orderId]) {
            orderIdToOrder[r.orderId] = {
                id: r.orderId,
                status: r.status,
                createdAt: r.createdAt,
                delivered: r.delivered,
                items: [],
            } as ApiOrder;
        }
        if (r.itemId && r.productId) {
            orderIdToOrder[r.orderId].items.push({
                id: r.itemId,
                quantity: r.quantity!,
                priceAtPurchase: r.priceAtPurchase!,
                product: {
                    id: r.productId,
                    productName: r.productName!,
                    imageUrl: r.imageUrl!,
                },
            });
        }
    }

    const grouped: ApiOrder[] = Object.values(orderIdToOrder);
    return NextResponse.json({ orders: grouped });
}

export async function POST(req: NextRequest) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    let body: { productId?: string; quantity?: number };
    try {
        body = await req.json();
    } catch {
        return new Response("Invalid JSON body", { status: 400 });
    }

    const productId = body.productId?.trim();
    const quantityRaw = body.quantity;
    const quantity = Number.isFinite(quantityRaw) && (quantityRaw as number) > 0
        ? Math.floor(quantityRaw as number)
        : 1;

    if (!productId) {
        return new Response("productId is required", { status: 400 });
    }

    // Fetch product to determine price at purchase
    const [prod] = await db.select().from(product).where(
        eq(product.id, productId),
    );
    if (!prod) {
        return new Response("Product not found", { status: 404 });
    }

    const orderId = globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    const orderItemId = globalThis.crypto?.randomUUID
        ? globalThis.crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    await db.transaction(async (tx) => {
        await tx.insert(order).values({
            id: orderId,
            userId: session.user.id,
            // status, createdAt, delivered use defaults
        });

        await tx.insert(orderItem).values({
            id: orderItemId,
            orderId: orderId,
            productId: prod.id,
            quantity: quantity,
            priceAtPurchase: prod.price,
        });
    });

    const created: {
        id: string;
        status: typeof order.$inferSelect.status;
        createdAt: Date;
        delivered: boolean;
        items: CreatedOrderItem[];
    } = {
        id: orderId,
        status: "PENDING",
        createdAt: new Date(),
        delivered: false,
        items: [
            {
                id: orderItemId,
                quantity,
                priceAtPurchase: prod.price,
                product: {
                    id: prod.id,
                    productName: prod.productName,
                    imageUrl: prod.imageUrl,
                },
            },
        ],
    };

    return NextResponse.json({ success: true, order: created }, {
        status: 201,
    });
}
