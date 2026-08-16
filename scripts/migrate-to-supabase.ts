import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
  console.log("Starting migration to Supabase...");

  // 1. Read store.json
  const storePath = path.join(process.cwd(), "data", "store.json");
  if (!fs.existsSync(storePath)) {
    console.error(`store.json not found at ${storePath}`);
    process.exit(1);
  }
  
  let storeDataString = fs.readFileSync(storePath, "utf8");
  
  // Clean up git merge conflict markers if any exist
  storeDataString = storeDataString
    .replace(/<<<<<<< HEAD[\s\S]*?=======\n/g, "")
    .replace(/>>>>>>> [a-z0-9]+\n/g, "");

  const storeData = JSON.parse(storeDataString);
  
  console.log(`Found ${storeData.products?.length || 0} products and ${storeData.collections?.length || 0} collections.`);

  // 2. Upload Images to Storage
  const imagesDir = path.join(process.cwd(), "public", "images", "products");
  if (fs.existsSync(imagesDir)) {
    const files = fs.readdirSync(imagesDir);
    console.log(`Found ${files.length} images to upload...`);
    
    for (const file of files) {
      if (file.startsWith(".")) continue;
      
      const filePath = path.join(imagesDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      
      console.log(`Uploading ${file}...`);
      const { data, error } = await supabase.storage
        .from("products")
        .upload(file, fileBuffer, {
          contentType: file.endsWith(".png") ? "image/png" : "image/jpeg",
          upsert: true
        });
        
      if (error) {
        console.error(`Failed to upload ${file}:`, error);
      }
    }
  }

  // Get the base public URL for the storage bucket
  const { data: publicUrlData } = supabase.storage.from("products").getPublicUrl("");
  const publicUrlBase = publicUrlData.publicUrl; // e.g. https://.../storage/v1/object/public/products/

  // Replace all image paths in the JSON
  storeDataString = storeDataString.replace(/\/images\/products\//g, publicUrlBase);
  const updatedStoreData = JSON.parse(storeDataString);

  // 3. Migrate Collections
  console.log("Migrating collections...");
  const collectionIdMap = new Map(); // handle -> uuid
  
  if (updatedStoreData.collections) {
    for (const collection of updatedStoreData.collections) {
      console.log(`Inserting collection: ${collection.handle}`);
      const { data, error } = await supabase.from("collections").upsert({
        handle: collection.handle,
        title: collection.title,
        description: collection.description || "",
        seo: collection.seo || {},
        updated_at: collection.updatedAt || new Date().toISOString()
      }, { onConflict: "handle" }).select().single();
      
      if (error) {
        console.error(`Error inserting collection ${collection.handle}:`, error);
      } else if (data) {
        collectionIdMap.set(data.handle, data.id);
      }
    }
  }

  // 4. Migrate Products
  console.log("Migrating products...");
  if (updatedStoreData.products) {
    for (const product of updatedStoreData.products) {
      console.log(`Inserting product: ${product.handle}`);
      
      // Remove local-only fields
      const { collections, id: oldId, ...productDataToInsert } = product;
      
      const { data, error } = await supabase.from("products").upsert({
        handle: product.handle,
        title: product.title,
        description: product.description,
        description_html: product.descriptionHtml,
        available_for_sale: product.availableForSale,
        price_range: product.priceRange,
        featured_image: product.featuredImage,
        images: product.images,
        options: product.options,
        variants: product.variants,
        seo: product.seo,
        tags: product.tags || [],
        updated_at: product.updatedAt || new Date().toISOString()
      }, { onConflict: "handle" }).select().single();
      
      if (error) {
        console.error(`Error inserting product ${product.handle}:`, error);
      } else if (data && collections && Array.isArray(collections)) {
        // Migrate product_collections
        for (const collectionHandle of collections) {
          const collectionId = collectionIdMap.get(collectionHandle);
          if (collectionId) {
            await supabase.from("product_collections").upsert({
              product_id: data.id,
              collection_id: collectionId
            }, { onConflict: "product_id,collection_id" });
          }
        }
      }
    }
  }

  console.log("Migration completed successfully!");
}

migrate().catch(console.error);
