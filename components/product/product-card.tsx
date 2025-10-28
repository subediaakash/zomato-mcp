"use client";

import Image from "next/image";
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { toast } from "sonner";

interface ProductCardProps {
    product: {
        id: string;
        productName: string;
        imageUrl: string;
        description: string;
        category: "VEG" | "NON_VEG";
        price: number;
        lister?: {
            name?: string;
        };
    };
}

export default function ProductCard({ product }: ProductCardProps) {
    const [isOrdering, setIsOrdering] = useState(false);
    const [quantity, setQuantity] = useState<number>(1);

    const total = Math.max(1, quantity || 1) * product.price;

    async function placeOrder() {
        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product.id, quantity: Math.max(1, quantity || 1) }),
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || "Failed to place order");
            }
            toast.success("Order placed");
            setIsOrdering(false);
            setQuantity(1);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to place order");
        }
    }

    return (
        <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-full max-w-sm"
        >
            <Card className="rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-lg transition-all bg-white">
                <CardHeader className="relative p-0">
                    <div className="relative w-full h-56">
                        <Image
                            src={product.imageUrl}
                            alt={product.productName}
                            fill
                            className="object-cover"
                        />
                        <Badge
                            className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold ${product.category === "VEG"
                                ? "bg-green-500/90 text-white"
                                : "bg-red-500/90 text-white"
                                }`}
                        >
                            {product.category}
                        </Badge>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 bg-white/80 hover:bg-red-100 text-red-500 rounded-full"
                        >
                            <Heart size={20} />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {product.productName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                        {product.description}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                        {product.lister?.name ? `Listed by ${product.lister.name}` : ""}
                    </p>
                </CardContent>

                <CardFooter className="flex items-center justify-between px-4 pb-4">
                    <span className="text-xl font-bold text-red-600">
                        ₹{product.price.toFixed(2)}
                    </span>
                    <Button
                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-medium"
                        onClick={() => setIsOrdering(true)}
                    >
                        Order Now
                    </Button>
                </CardFooter>
            </Card>

            {isOrdering && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4"
                    onClick={() => setIsOrdering(false)}
                    aria-label="Order overlay"
                >
                    <div
                        className="relative w-full max-w-md bg-white rounded-xl shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="relative w-14 h-14 rounded-md overflow-hidden">
                                    <Image src={product.imageUrl} alt={product.productName} fill className="object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-base font-semibold truncate">{product.productName}</h3>
                                    <p className="text-sm text-muted-foreground">₹{product.price.toFixed(2)} each</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                <label htmlFor={`qty-${product.id}`} className="text-sm text-muted-foreground">
                                    Quantity
                                </label>
                                <Input
                                    id={`qty-${product.id}`}
                                    type="number"
                                    min={1}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                                    className="h-10"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Total</span>
                                <span className="text-lg font-semibold">₹{total.toFixed(2)}</span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setIsOrdering(false)}>
                                    Cancel
                                </Button>
                                <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={placeOrder}>
                                    Confirm Order
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
