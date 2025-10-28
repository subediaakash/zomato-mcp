import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/drizzle/src";
import { order } from "@/drizzle/src/db/order-schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    // ✅ You don’t need to check content-type for GET
    const orders = await db
        .select()
        .from(order)
        .where(eq(order.userId, session.user.id));



    return NextResponse.json({ orders });
}
