import OrderList from "@/components/orders/order-list";

export default function OrdersPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
                <p className="text-sm text-muted-foreground">Manage and track your recent orders.</p>
            </div>
            <OrderList />
        </div>
    );
}