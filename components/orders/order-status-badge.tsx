"use client";

import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Truck, XCircle } from "lucide-react";

type OrderStatus = "PENDING" | "PAID" | "DELIVERED" | "CANCELLED";

interface OrderStatusBadgeProps {
    status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    if (status === "PENDING") {
        return (
            <Badge variant="secondary" className="gap-1">
                <Clock className="size-3" /> Pending
            </Badge>
        );
    }

    if (status === "PAID") {
        return (
            <Badge className="gap-1">
                <CheckCircle2 className="size-3" /> Paid
            </Badge>
        );
    }

    if (status === "DELIVERED") {
        return (
            <Badge variant="outline" className="gap-1">
                <Truck className="size-3" /> Delivered
            </Badge>
        );
    }

    return (
        <Badge variant="destructive" className="gap-1">
            <XCircle className="size-3" /> Cancelled
        </Badge>
    );
}


