"use client";

import { useState } from "react";
import Image from "next/image";
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
import { CalendarDays, Loader2, Trash2, XOctagon, Package } from "lucide-react";
import { toast } from "sonner";

type OrderStatus = "PENDING" | "PAID" | "DELIVERED" | "CANCELLED";

export interface OrderSummary {
    id: string;
    status: OrderStatus;
    createdAt: string | Date;
    delivered?: boolean;
    items?: Array<{
        id: string;
        quantity: number;
        productName: string;
        imageUrl: string;
    }>;
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

	function getStatusAccent(status: OrderStatus) {
		switch (status) {
			case "DELIVERED":
				return "from-emerald-500 to-green-500";
			case "PAID":
				return "from-sky-500 to-blue-500";
			case "CANCELLED":
				return "from-rose-500 to-red-500";
			default:
				return "from-amber-500 to-yellow-500";
		}
	}

    async function handleCancel() {
        if (!canCancel) return;
		toast.warning("Cancel this order?", {
            action: {
                label: "Confirm",
                onClick: async () => {
                    try {
                        setIsCancelling(true);
                        await onCancel(order.id);
                    } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Failed to cancel");
                    } finally {
                        setIsCancelling(false);
                    }
                },
            },
        });
    }

    async function handleDelete() {
		toast.warning("Delete this order? This cannot be undone.", {
            action: {
                label: "Confirm",
                onClick: async () => {
                    try {
                        setIsDeleting(true);
                        await onDelete(order.id);
                    } catch (e) {
                        toast.error(e instanceof Error ? e.message : "Failed to delete");
                    } finally {
                        setIsDeleting(false);
                    }
                },
            },
        });
    }

	const totalQuantity = order.items?.reduce((sum, it) => sum + (it.quantity || 0), 0) ?? 0;

	return (
		<Card className="relative overflow-hidden border-gray-100 shadow-sm transition-shadow hover:shadow-md">
			<div className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${getStatusAccent(order.status)}`} />
            <CardHeader className="flex flex-row items-start justify-between gap-4">
				<div>
					<CardTitle className="text-sm sm:text-base">Order #{order.id.slice(0, 8)}</CardTitle>
					<CardDescription className="mt-1 flex items-center gap-2 text-xs sm:text-sm">
                        <CalendarDays className="size-3.5" />
                        <span>{created.toLocaleString()}</span>
                    </CardDescription>
                </div>
                <CardAction>
                    <OrderStatusBadge status={order.status} />
                </CardAction>
            </CardHeader>

			<CardContent className="text-sm text-muted-foreground">
                {order.items && order.items.length > 0 ? (
					<div className="flex items-center gap-4">
						<div className="flex -space-x-3">
							{order.items.slice(0, 3).map((it) => (
								<div
									key={it.id}
									className="relative h-11 w-11 overflow-hidden rounded-lg ring-2 ring-background shadow-sm"
								>
									<Image src={it.imageUrl} alt={it.productName} fill className="object-cover" />
									<span className="absolute -bottom-1 -right-1 rounded-full bg-background/90 px-1.5 py-0.5 text-[10px] font-medium text-foreground ring-1 ring-border">x{it.quantity}</span>
								</div>
							))}
							{order.items.length > 3 ? (
								<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground ring-2 ring-background">
									+{order.items.length - 3}
								</div>
							) : null}
						</div>
						<div className="min-w-0 truncate" title={order.items.map((it) => `${it.productName} x${it.quantity}`).join(", ")}>
							<span className="text-foreground">
								{order.items.slice(0, 2).map((it) => it.productName).join(", ")}
							</span>
							{order.items.length > 2 ? <span> and others</span> : null}
						</div>
					</div>
                ) : (
                    <p>{order.delivered ? "Marked delivered" : "Awaiting fulfillment"}</p>
                )}
            </CardContent>

			<CardFooter className="flex items-center justify-between gap-2">
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Package className="size-4" />
					<span>
						{totalQuantity} item{totalQuantity !== 1 ? "s" : ""}
					</span>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={handleCancel}
						disabled={!canCancel || isCancelling || isDeleting}
						aria-label="Cancel order"
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
						aria-label="Delete order"
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
				</div>
			</CardFooter>
        </Card>
    );
}


