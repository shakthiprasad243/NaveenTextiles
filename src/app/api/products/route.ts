import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase-admin';

// Get all products (supports both active-only and all products)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mainCategory = searchParams.get('main_category') || undefined;
    const category = searchParams.get('category') || undefined;
    const active = searchParams.get('active');
    const includeInactive = searchParams.get('include_inactive') === 'true';

    // Use admin client if we need to include inactive products
    const client = includeInactive && isAdminClientConfigured() ? supabaseAdmin : supabase;

    let query = client.from('products').select(`
      *,
      product_variants (*)
    `);

    if (mainCategory) query = query.eq('main_category', mainCategory);
    if (category) query = query.eq('category', category);
    if (active === 'true') query = query.eq('active', true);
    else if (active === 'false') query = query.eq('active', false);
    else if (!includeInactive) query = query.eq('active', true);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;

    return NextResponse.json({ products: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // Use admin client if available, otherwise try with regular client
    const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

    const body = await request.json();
    const { name, slug, description, base_price, main_category, category, active, variants } = body;

    if (!name || base_price === undefined) {
      return NextResponse.json(
        { error: 'Name and base_price are required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided - add timestamp for uniqueness
    const baseSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const productSlug = `${baseSlug}-${Date.now()}`;

    // Create product
    const { data: product, error: productError } = await client
      .from('products')
      .insert({
        name,
        slug: productSlug,
        description,
        base_price,
        main_category,
        category,
        active: active ?? true
      })
      .select()
      .single();

    if (productError) throw productError;

    // Create variants if provided
    if (variants && variants.length > 0) {
      const variantData = variants.map((v: any, index: number) => ({
        product_id: product.id,
        sku: v.sku || `${productSlug}-${Date.now()}-${index}`,
        size: v.size,
        color: v.color,
        price: v.price,
        stock_qty: v.stock_qty || 0,
        images: v.images || []
      }));

      const { error: variantError } = await client
        .from('product_variants')
        .insert(variantData);

      if (variantError) {
        console.error('Variant creation error:', variantError);
      }
    }

    // Fetch complete product with variants
    const { data: completeProduct } = await client
      .from('products')
      .select('*, product_variants (*)')
      .eq('id', product.id)
      .single();

    return NextResponse.json({ 
      success: true, 
      product: completeProduct,
      // Also include at root level for easier access
      id: completeProduct?.id,
      product_id: completeProduct?.id,
      name: completeProduct?.name,
      slug: completeProduct?.slug,
      base_price: completeProduct?.base_price
    });
  } catch (error: any) {
    console.error('Product creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
