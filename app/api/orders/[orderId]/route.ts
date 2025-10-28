import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/drizzle/src";
import { order } from "@/drizzle/src/db/order-schema";
import { and, eq } from "drizzle-orm";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function DELETE(_req: Request, context: RouteContext) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { orderId } = await context.params;

    const deleted = await db
        .delete(order)
        .where(and(eq(order.id, orderId), eq(order.userId, session.user.id)))
        .returning();

    if (!deleted.length) {
        return new Response("Order not found", { status: 404 });
    }

    return NextResponse.json({ success: true, order: deleted[0] });
}

export async function PATCH(_req: Request, context: RouteContext) {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { orderId } = await context.params;

    const existing = await db
        .select()
        .from(order)
        .where(and(eq(order.id, orderId), eq(order.userId, session.user.id)));

    if (!existing.length) {
        return new Response("Order not found", { status: 404 });
    }

    const current = existing[0];
    if (current.status === "DELIVERED") {
        return new Response("Delivered orders cannot be cancelled", {
            status: 400,
        });
    }

    const updated = await db
        .update(order)
        .set({ status: "CANCELLED" })
        .where(and(eq(order.id, orderId), eq(order.userId, session.user.id)))
        .returning();

    return NextResponse.json({ success: true, order: updated[0] });
}
