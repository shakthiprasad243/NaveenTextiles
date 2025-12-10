import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin, isAdminClientConfigured } from '@/lib/supabase-admin';
import { validateProduct } from '@/lib/validators';

// Disable caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Get all products (supports both active-only and all products with pagination)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mainCategory = searchParams.get('main_category') || undefined;
    const category = searchParams.get('category') || undefined;
    const active = searchParams.get('active');
    const includeInactive = searchParams.get('include_inactive') === 'true';
    
    // Pagination parameters with validation
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    
    // Prevent excessive pagination that could cause performance issues
    if (page > 1000) {
      return NextResponse.json(
        { 
          error: 'Page number exceeds maximum limit of 1000',
          products: [],
          pagination: { page: 1, limit, total: 0, totalPages: 0 }
        },
        { status: 400 }
      );
    }
    
    const offset = (page - 1) * limit;

    // Use admin client if we need to include inactive products
    const client = includeInactive && isAdminClientConfigured() ? supabaseAdmin : supabase;

    let query = client.from('products').select(`
      *,
      product_variants (*)
    `, { count: 'exact' });

    if (mainCategory) query = query.eq('main_category', mainCategory);
    if (category) query = query.eq('category', category);
    if (active === 'true') query = query.eq('active', true);
    else if (active === 'false') query = query.eq('active', false);
    else if (!includeInactive) query = query.eq('active', true);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) throw error;

    // Transform products to include variants with product_variant_id
    const transformedProducts = (data || []).map((product: any) => ({
      ...product,
      variants: (product.product_variants || []).map((v: any) => ({
        ...v,
        product_variant_id: v.id // Add product_variant_id alias for compatibility
      }))
    }));

    return NextResponse.json({ 
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error: any) {
    console.error('Products API error:', error);
    const errorMessage = typeof error === 'string' ? error : 
                        error?.message || 'Failed to fetch products';
    return NextResponse.json(
      { error: errorMessage, products: [], pagination: { page: 1, limit, total: 0, totalPages: 0 } },
      { status: 500 }
    );
  }
}

// Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    // Add timeout handling
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Product creation timeout after 25 seconds')), 25000)
    );
    
    const createProductPromise = async () => {
      // Use admin client if available, otherwise try with regular client
      const client = isAdminClientConfigured() ? supabaseAdmin : supabase;

    const body = await request.json();
    
    // Validate input
    const validation = validateProduct(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }
    
    const { name, slug, description, base_price, main_category, category, active } = body;
    // Support both 'variants' and 'product_variants' keys for flexibility
    const variants = body.variants || body.product_variants;

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
        price: v.price || base_price,
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
      }, { status: 201 });
    };

    // Race between the operation and timeout
    const result = await Promise.race([createProductPromise(), timeoutPromise]);
    return result;
  } catch (error: any) {
    console.error('Product creation error:', error);
    
    // Return appropriate error response
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Product creation timeout', success: false }, 
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
