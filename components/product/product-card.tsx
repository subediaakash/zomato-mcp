"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

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
                    <Button className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-medium">
                        Order Now
                    </Button>
                </CardFooter>
            </Card>
        </motion.div>
    );
}
