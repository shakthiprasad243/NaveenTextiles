import { NextRequest, NextResponse } from 'next/server';
import { supabase, getProducts } from '@/lib/supabase';

// Get all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mainCategory = searchParams.get('main_category') || undefined;
    const category = searchParams.get('category') || undefined;
    const active = searchParams.get('active');

    const products = await getProducts({
      mainCategory,
      category,
      active: active === 'true' ? true : active === 'false' ? false : undefined
    });

    return NextResponse.json({ products });
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
    const body = await request.json();
    const { name, slug, description, base_price, main_category, category, active, variants } = body;

    if (!name || !base_price) {
      return NextResponse.json(
        { error: 'Name and base_price are required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Create product
    const { data: product, error: productError } = await supabase
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
        sku: v.sku || `${productSlug}-${index}`,
        size: v.size,
        color: v.color,
        price: v.price,
        stock_qty: v.stock_qty || 0,
        images: v.images || []
      }));

      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantData);

      if (variantError) {
        console.error('Variant creation error:', variantError);
      }
    }

    // Fetch complete product with variants
    const { data: completeProduct } = await supabase
      .from('products')
      .select('*, product_variants (*)')
      .eq('id', product.id)
      .single();

    return NextResponse.json({ 
      success: true, 
      product: completeProduct 
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
