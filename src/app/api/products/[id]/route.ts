import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase-admin';

// Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Use admin client to get any product (including inactive)
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;
    
    const { data, error } = await client
      .from('products')
      .select(`*, product_variants (*)`)
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    // Transform product_variants to variants for API consistency
    // Add product_variant_id to each variant for easier access
    const transformedVariants = (data?.product_variants || []).map((v: any) => ({
      ...v,
      product_variant_id: v.id // Add product_variant_id alias for compatibility
    }));
    
    const transformedData = data ? {
      ...data,
      variants: transformedVariants,
    } : null;
    
    // Return all product fields at root level for test compatibility
    return NextResponse.json({ 
      product: transformedData,
      // Include ALL fields at root level for easier access
      id: data?.id,
      name: data?.name,
      slug: data?.slug,
      description: data?.description,
      base_price: data?.base_price,
      main_category: data?.main_category,
      category: data?.category,
      active: data?.active,
      variants: transformedVariants
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Product not found' },
      { status: 404 }
    );
  }
}

// Update product (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Use admin client if available, otherwise try with regular client
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

    const body = await request.json();
    const { name, slug, description, base_price, main_category, category, active, variants } = body;

    // Update product
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (base_price !== undefined) updateData.base_price = base_price;
    if (main_category !== undefined) updateData.main_category = main_category;
    if (category !== undefined) updateData.category = category;
    if (active !== undefined) updateData.active = active;

    const { data: product, error: productError } = await client
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (productError) throw productError;

    // Update variants if provided
    if (variants && variants.length > 0) {
      // Check if any variant has an ID - if none have IDs, replace all variants
      const hasExistingVariants = variants.some((v: any) => v.id);
      
      if (!hasExistingVariants) {
        // Delete all existing variants and create new ones
        await client
          .from('product_variants')
          .delete()
          .eq('product_id', id);
        
        // Create all new variants
        const newVariants = variants.map((v: any, index: number) => ({
          product_id: id,
          sku: v.sku || `${product.slug}-${Date.now()}-${index}`,
          size: v.size,
          color: v.color,
          price: v.price || product.base_price,
          stock_qty: v.stock_qty || v.stock || 0,
          images: v.images || []
        }));
        
        await client
          .from('product_variants')
          .insert(newVariants);
      } else {
        // Mixed update - update existing and create new
        for (const variant of variants) {
          if (variant.id) {
            // Update existing variant
            await client
              .from('product_variants')
              .update({
                size: variant.size,
                color: variant.color,
                price: variant.price,
                stock_qty: variant.stock_qty,
                images: variant.images
              })
              .eq('id', variant.id);
          } else {
            // Create new variant
            await client
              .from('product_variants')
              .insert({
                product_id: id,
                sku: variant.sku || `${product.slug}-${Date.now()}`,
                size: variant.size,
                color: variant.color,
                price: variant.price,
                stock_qty: variant.stock_qty || variant.stock || 0,
                images: variant.images || []
              });
          }
        }
      }
    }

    // Fetch updated product with variants
    const { data: updatedProduct } = await client
      .from('products')
      .select('*, product_variants (*)')
      .eq('id', id)
      .single();

    return NextResponse.json({ 
      success: true, 
      product: updatedProduct,
      // Include key fields at root level for easier access
      id: updatedProduct?.id,
      name: updatedProduct?.name,
      slug: updatedProduct?.slug,
      base_price: updatedProduct?.base_price
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// Delete product (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Use admin client if available, otherwise try with regular client
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

    // Variants will be deleted automatically due to CASCADE
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
