"use client";

import { useState } from "react";
import {
    Card,
    CardAction,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "@/components/orders/order-status-badge";
import { CalendarDays, Loader2, Trash2, XOctagon } from "lucide-react";

type OrderStatus = "PENDING" | "PAID" | "DELIVERED" | "CANCELLED";

export interface OrderSummary {
    id: string;
    status: OrderStatus;
    createdAt: string | Date;
    delivered?: boolean;
}

interface OrderCardProps {
    order: OrderSummary;
    onCancel: (orderId: string) => Promise<void>;
    onDelete: (orderId: string) => Promise<void>;
}

export default function OrderCard({ order, onCancel, onDelete }: OrderCardProps) {
    const [isCancelling, setIsCancelling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const created = new Date(order.createdAt);
    const canCancel = order.status !== "DELIVERED" && order.status !== "CANCELLED";

    async function handleCancel() {
        if (!canCancel) return;
        const confirm = window.confirm("Cancel this order?");
        if (!confirm) return;
        try {
            setIsCancelling(true);
            await onCancel(order.id);
        } finally {
            setIsCancelling(false);
        }
    }

    async function handleDelete() {
        const confirm = window.confirm("Delete this order? This cannot be undone.");
        if (!confirm) return;
        try {
            setIsDeleting(true);
            await onDelete(order.id);
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <Card className="border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                    <CardTitle className="text-base">Order #{order.id.slice(0, 8)}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1 text-sm">
                        <CalendarDays className="size-3.5" />
                        <span>{created.toLocaleString()}</span>
                    </CardDescription>
                </div>
                <CardAction>
                    <OrderStatusBadge status={order.status} />
                </CardAction>
            </CardHeader>

            <CardContent className="text-sm text-muted-foreground">
                {order.delivered ? (
                    <p>Marked delivered</p>
                ) : (
                    <p>Awaiting fulfillment</p>
                )}
            </CardContent>

            <CardFooter className="flex items-center justify-end gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={!canCancel || isCancelling || isDeleting}
                >
                    {isCancelling ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Cancelling
                        </>
                    ) : (
                        <>
                            <XOctagon className="size-4" />
                            Cancel
                        </>
                    )}
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isDeleting || isCancelling}
                >
                    {isDeleting ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Deleting
                        </>
                    ) : (
                        <>
                            <Trash2 className="size-4" />
                            Delete
                        </>
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}


