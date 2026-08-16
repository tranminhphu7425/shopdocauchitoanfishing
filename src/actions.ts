import { supabase } from "lib/supabase/client";
import { Product } from "lib/local/types";

export async function createProductAction(
  product: Product & { collections?: string[] },
): Promise<{ success: boolean; error?: string }> {
  try {
    // Insert product
    const { collections, id, ...productData } = product;
    
    let calculatedPriceRange = product.priceRange;
    if (product.variants && product.variants.length > 0) {
      let cheapestVar = product.variants[0];
      product.variants.forEach((v) => {
        if (parseFloat(v.price.amount) < parseFloat(cheapestVar.price.amount)) {
          cheapestVar = v;
        }
      });
      calculatedPriceRange = {
        minVariantPrice: { amount: cheapestVar.price.amount, currencyCode: "VND" },
        maxVariantPrice: { amount: cheapestVar.compareAtPrice?.amount || cheapestVar.price.amount, currencyCode: "VND" },
      };
    }

    const { data: insertedProduct, error: insertError } = await supabase
      .from("products")
      .insert({
        handle: product.handle,
        title: product.title,
        description: product.description,
        description_html: product.descriptionHtml,
        available_for_sale: product.availableForSale,
        price_range: calculatedPriceRange,
        featured_image: product.featuredImage,
        images: product.images,
        options: product.options,
        variants: product.variants,
        seo: product.seo,
        tags: product.tags,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError || !insertedProduct) {
      console.error(insertError);
      return { success: false, error: insertError?.message || "Failed to create product" };
    }

    // Insert collections
    if (collections && collections.length > 0) {
      const { data: colData } = await supabase.from("collections").select("id, handle").in("handle", collections);
      
      if (colData && colData.length > 0) {
        const productCollections = colData.map((c: any) => ({
          product_id: insertedProduct.id,
          collection_id: c.id
        }));
        
        await supabase.from("product_collections").insert(productCollections);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function updateProductAction(
  handle: string,
  updates: Partial<Product & { collections?: string[] }>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { collections, id, ...updateData } = updates;
    
    const mappedUpdates: any = { updated_at: new Date().toISOString() };
    if (updateData.title !== undefined) mappedUpdates.title = updateData.title;
    if (updateData.handle !== undefined) mappedUpdates.handle = updateData.handle;
    if (updateData.description !== undefined) mappedUpdates.description = updateData.description;
    if (updateData.descriptionHtml !== undefined) mappedUpdates.description_html = updateData.descriptionHtml;
    if (updateData.availableForSale !== undefined) mappedUpdates.available_for_sale = updateData.availableForSale;
    if (updateData.priceRange !== undefined) mappedUpdates.price_range = updateData.priceRange;
    if (updateData.variants !== undefined) {
      mappedUpdates.variants = updateData.variants;
      if (updateData.variants.length > 0) {
        let cheapestVar = updateData.variants[0];
        updateData.variants.forEach((v) => {
          if (parseFloat(v.price.amount) < parseFloat(cheapestVar.price.amount)) {
            cheapestVar = v;
          }
        });
        mappedUpdates.price_range = {
          minVariantPrice: { amount: cheapestVar.price.amount, currencyCode: "VND" },
          maxVariantPrice: { amount: cheapestVar.compareAtPrice?.amount || cheapestVar.price.amount, currencyCode: "VND" },
        };
      }
    }
    if (updateData.featuredImage !== undefined) mappedUpdates.featured_image = updateData.featuredImage;
    if (updateData.images !== undefined) mappedUpdates.images = updateData.images;
    if (updateData.options !== undefined) mappedUpdates.options = updateData.options;
    // Removed old variants line as it is handled above
    if (updateData.seo !== undefined) mappedUpdates.seo = updateData.seo;
    if (updateData.tags !== undefined) mappedUpdates.tags = updateData.tags;

    const { data: updatedProduct, error: updateError } = await supabase
      .from("products")
      .update(mappedUpdates)
      .eq("handle", handle)
      .select()
      .single();

    if (updateError || !updatedProduct) {
      return { success: false, error: updateError?.message || "Failed to update product" };
    }

    if (collections !== undefined) {
      // Clear existing collections
      await supabase.from("product_collections").delete().eq("product_id", updatedProduct.id);
      
      // Insert new collections
      if (collections.length > 0) {
        const { data: colData } = await supabase.from("collections").select("id, handle").in("handle", collections);
        
        if (colData && colData.length > 0) {
          const productCollections = colData.map((c: any) => ({
            product_id: updatedProduct.id,
            collection_id: c.id
          }));
          
          await supabase.from("product_collections").insert(productCollections);
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function deleteProductAction(
  handle: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("products").delete().eq("handle", handle);
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function createCollectionAction(
  title: string,
  handle?: string,
  description?: string,
): Promise<{ success: boolean; collection?: any; error?: string }> {
  try {
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      return { success: false, error: "Tên danh mục không được để trống" };
    }

    const slug =
      handle?.trim() ||
      cleanTitle
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const { data: inserted, error } = await supabase
      .from("collections")
      .insert({
        title: cleanTitle,
        handle: slug,
        description: description || "",
        path: `/search/${slug}`,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !inserted) {
      return { success: false, error: error?.message || "Failed to create collection" };
    }

    return {
      success: true,
      collection: {
        id: inserted.id,
        handle: inserted.handle,
        title: inserted.title,
        description: inserted.description || "",
        path: inserted.path || `/search/${inserted.handle}`,
        updatedAt: inserted.updated_at,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}
