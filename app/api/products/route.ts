import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/drizzle/src";
import { product } from "@/drizzle/src/db/product-schema";
export async function GET(req: NextRequest) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const products = await db
        .select()
        .from(product)
    return NextResponse.json({ products });

}