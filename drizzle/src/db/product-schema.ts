import { pgTable, text, timestamp, real, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth-schema";

export const categoryEnum = pgEnum("category", ["VEG", "NON_VEG"]);

export const product = pgTable("product", {
    id: text("id").primaryKey(),
    productName: text("product_name").notNull(),
    imageUrl: text("imageUrl").notNull(),
    description: text("description").notNull(),
    category: categoryEnum("category").notNull(),
    price: real("price").default(10.1).notNull(),
    listerId: text("lister_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});

// --- Relations (optional but powerful) ---
export const productRelations = relations(product, ({ one }) => ({
    lister: one(user, {
        fields: [product.listerId],
        references: [user.id],
    }),
}));
