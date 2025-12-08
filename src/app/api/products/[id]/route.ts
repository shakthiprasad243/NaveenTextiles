import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase-admin';

// Get single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Use admin client to get any product (including inactive)
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;
    
    const { data, error } = await client
      .from('products')
      .select(`*, product_variants (*)`)
      .eq('id', params.id)
      .single();
      
    if (error) throw error;
    return NextResponse.json({ 
      product: data,
      // Include key fields at root level for easier access
      id: data?.id,
      name: data?.name,
      slug: data?.slug,
      base_price: data?.base_price
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
  { params }: { params: { id: string } }
) {
  try {
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
      .eq('id', params.id)
      .select()
      .single();

    if (productError) throw productError;

    // Update variants if provided
    if (variants && variants.length > 0) {
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
              product_id: params.id,
              sku: variant.sku || `${product.slug}-${Date.now()}`,
              size: variant.size,
              color: variant.color,
              price: variant.price,
              stock_qty: variant.stock_qty || 0,
              images: variant.images || []
            });
        }
      }
    }

    // Fetch updated product with variants
    const { data: updatedProduct } = await client
      .from('products')
      .select('*, product_variants (*)')
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    // Use admin client if available, otherwise try with regular client
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

    // Variants will be deleted automatically due to CASCADE
    const { error } = await client
      .from('products')
      .delete()
      .eq('id', params.id);

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
