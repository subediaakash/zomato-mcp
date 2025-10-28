import { db } from "."; // fix: import from current src index
import { user } from "./db/auth-schema"; // fix: avoid path alias
import { product } from "./db/product-schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function main() {
    console.log("🌱 Starting database seed...");

    // 1️⃣ Ensure a demo user exists
    const demoEmail = "demo@foodapp.com";
    const [existingUser] = await db.select().from(user).where(eq(user.email, demoEmail));

    let listerId: string;

    if (!existingUser) {
        listerId = randomUUID();
        await db.insert(user).values({
            id: listerId,
            name: "Demo Lister",
            email: demoEmail,
            emailVerified: false,
            image: "https://source.unsplash.com/80x80/?avatar,person",
        });
        console.log("✅ Created new demo user:", listerId);
    } else {
        listerId = existingUser.id;
        console.log("✅ Using existing demo user:", listerId);
    }

    // 2️⃣ Define products (now include imageUrl)
    type CategoryType = "VEG" | "NON_VEG";

    const products: {
        id: string;
        productName: string;
        imageUrl: string;
        description: string;
        category: CategoryType;
        price: number;
        listerId: string;
    }[] = [
            {
                id: randomUUID(),
                productName: "Margherita Pizza",
                imageUrl: "https://source.unsplash.com/800x600/?pizza,margherita",
                description: "Classic pizza with mozzarella cheese and tomato sauce.",
                category: "VEG",
                price: 299.0,
                listerId,
            },
            {
                id: randomUUID(),
                productName: "Pepperoni Pizza",
                imageUrl: "https://source.unsplash.com/800x600/?pizza,pepperoni",
                description: "Topped with spicy pepperoni and melted cheese.",
                category: "NON_VEG",
                price: 349.0,
                listerId,
            },
            {
                id: randomUUID(),
                productName: "Paneer Tikka",
                imageUrl: "https://source.unsplash.com/800x600/?paneer,tikka",
                description: "Grilled cottage cheese cubes marinated with Indian spices.",
                category: "VEG",
                price: 199.0,
                listerId,
            },
            {
                id: randomUUID(),
                productName: "Chicken Biryani",
                imageUrl: "https://source.unsplash.com/800x600/?chicken,biryani",
                description: "Aromatic basmati rice with tender chicken pieces.",
                category: "NON_VEG",
                price: 399.0,
                listerId,
            },
            {
                id: randomUUID(),
                productName: "Veg Burger",
                imageUrl: "https://source.unsplash.com/800x600/?veg,burger",
                description: "Crispy veggie patty with lettuce, cheese, and sauces.",
                category: "VEG",
                price: 149.0,
                listerId,
            },
            {
                id: randomUUID(),
                productName: "Grilled Chicken Sandwich",
                imageUrl: "https://source.unsplash.com/800x600/?grilled,chicken,sandwich",
                description: "Juicy grilled chicken breast with fresh veggies and mayo.",
                category: "NON_VEG",
                price: 179.0,
                listerId,
            },
        ];

    // 3️⃣ Insert only if none exist
    const existingProducts = await db.select().from(product);
    if (existingProducts.length === 0) {
        await db.insert(product).values(products);
        console.log(`✅ Inserted ${products.length} products.`);
    } else {
        console.log(`ℹ️ ${existingProducts.length} products already exist, skipping insert.`);
    }

    console.log("🌿 Seeding completed successfully.");
}

main()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    });
