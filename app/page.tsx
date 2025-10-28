"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/product/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search, SlidersHorizontal } from "lucide-react";

type Product = {
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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [category, setCategory] = useState<"ALL" | "VEG" | "NON_VEG">("ALL");
  const [sort, setSort] = useState<"RELEVANCE" | "PRICE_ASC" | "PRICE_DESC">("RELEVANCE");

  useEffect(() => {
    let isActive = true;
    async function loadProducts() {
      try {
        const response = await fetch("/api/products", { cache: "no-store" });
        if (!response.ok) {
          const message = response.status === 401 ? "Please sign in to view products." : "Failed to load products.";
          throw new Error(message);
        }
        const data: { products: Product[] } = await response.json();
        if (isActive) setProducts(data.products ?? []);
      } catch (err) {
        if (isActive) setError((err as Error).message);
      } finally {
        if (isActive) setIsLoading(false);
      }
    }
    loadProducts();
    return () => {
      isActive = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-gray-500">Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero / Heading */}
      <section className="mb-6">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Discover great food near you</h1>
          <p className="text-sm text-muted-foreground">Search and filter to find exactly what you crave.</p>
        </div>

        {/* Search and quick actions */}
        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative w-full md:max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search for dishes, cuisines or restaurants"
              aria-label="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-11 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 md:ml-auto">
            <Button
              variant={category === "ALL" ? "default" : "outline"}
              className={category === "ALL" ? "bg-red-500 hover:bg-red-600" : ""}
              onClick={() => setCategory("ALL")}
            >
              All
            </Button>
            <Button
              variant={category === "VEG" ? "default" : "outline"}
              className={category === "VEG" ? "bg-red-500 hover:bg-red-600" : ""}
              onClick={() => setCategory("VEG")}
            >
              Veg
            </Button>
            <Button
              variant={category === "NON_VEG" ? "default" : "outline"}
              className={category === "NON_VEG" ? "bg-red-500 hover:bg-red-600" : ""}
              onClick={() => setCategory("NON_VEG")}
            >
              Non‑Veg
            </Button>

            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="size-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {products.length} items
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-muted-foreground">
              Sort by
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="h-9 rounded-md border bg-transparent px-3 text-sm shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              aria-label="Sort products"
            >
              <option value="RELEVANCE">Relevance</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>
        </div>
      </section>

      <Separator className="my-6" />

      {/* Products grid */}
      {products.length === 0 ? (
        <p className="text-sm text-gray-500">No products available.</p>
      ) : (
        <ProductsGrid
          products={products}
          query={query}
          category={category}
          sort={sort}
        />
      )}
    </main>
  );
}

type GridProps = {
  products: Product[];
  query: string;
  category: "ALL" | "VEG" | "NON_VEG";
  sort: "RELEVANCE" | "PRICE_ASC" | "PRICE_DESC";
};

function ProductsGrid({ products, query, category, sort }: GridProps) {
  const normalizedQuery = query.trim().toLowerCase();
  const visibleProducts = products
    .filter((p) => (category === "ALL" ? true : p.category === category))
    .filter((p) => {
      if (!normalizedQuery) return true;
      const haystack = `${p.productName} ${p.description} ${p.lister?.name ?? ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    })
    .sort((a, b) => {
      if (sort === "PRICE_ASC") return a.price - b.price;
      if (sort === "PRICE_DESC") return b.price - a.price;
      return 0;
    });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {visibleProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
