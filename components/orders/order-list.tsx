"use client";

import { useCallback, useEffect, useState } from "react";
import OrderCard, { OrderSummary } from "@/components/orders/order-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Loader2, RefreshCw } from "lucide-react";

export default function OrderList() {
    const [orders, setOrders] = useState<OrderSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const hasOrders = orders.length > 0;

    type OrderStatus = "PENDING" | "PAID" | "DELIVERED" | "CANCELLED";
    type ApiOrder = {
        id: string;
        status: OrderStatus;
        createdAt: string;
        delivered: boolean;
    };

    const fetchOrders = useCallback(async () => {
        try {
            setErrorMessage(null);
            setIsLoading(true);
            const res = await fetch("/api/orders", { cache: "no-store" });
            if (!res.ok) {
                throw new Error(`Failed to load orders (${res.status})`);
            }
            const data = (await res.json()) as { orders: ApiOrder[] };
            const list: OrderSummary[] = data.orders.map((o) => ({
                id: o.id,
                status: o.status,
                createdAt: o.createdAt,
                delivered: o.delivered,
            }));
            setOrders(list);
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    async function refresh() {
        try {
            setIsRefreshing(true);
            await fetchOrders();
        } finally {
            setIsRefreshing(false);
        }
    }

    const handleCancel = useCallback(async (orderId: string) => {
        // optimistic update
        setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o))
        );
        const res = await fetch(`/api/orders/${orderId}`, { method: "PATCH" });
        if (!res.ok) {
            // revert on failure
            await fetchOrders();
            const text = await res.text();
            throw new Error(text || "Failed to cancel order");
        }
    }, [fetchOrders]);

    const handleDelete = useCallback(async (orderId: string) => {
        // optimistic remove
        const prev = orders;
        setOrders((curr) => curr.filter((o) => o.id !== orderId));
        const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
        if (!res.ok) {
            // revert on failure
            setOrders(prev);
            const text = await res.text();
            throw new Error(text || "Failed to delete order");
        }
    }, [orders]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-14 text-muted-foreground">
                <Loader2 className="size-6 animate-spin" />
                <p>Loading your orders…</p>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <Card className="border-destructive/30">
                <CardContent className="py-8 flex flex-col items-center gap-3 text-center">
                    <AlertTriangle className="size-6 text-destructive" />
                    <p className="text-sm text-muted-foreground">{errorMessage}</p>
                    <Button onClick={refresh} size="sm" className="mt-2">
                        <RefreshCw className="size-4" /> Try again
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!hasOrders) {
        return (
            <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                    You have no orders yet.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Your Orders</h2>
                <Button onClick={refresh} variant="outline" size="sm" disabled={isRefreshing}>
                    {isRefreshing ? (
                        <>
                            <Loader2 className="size-4 animate-spin" /> Refreshing
                        </>
                    ) : (
                        <>
                            <RefreshCw className="size-4" /> Refresh
                        </>
                    )}
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {orders.map((o) => (
                    <OrderCard key={o.id} order={o} onCancel={handleCancel} onDelete={handleDelete} />
                ))}
            </div>
        </div>
    );
}


