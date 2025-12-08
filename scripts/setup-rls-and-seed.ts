import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vobyofrvnrzcadgocicy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if we have the service role key
if (!supabaseServiceKey) {
  console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY not set. Using anon key (may fail due to RLS).');
}

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_zFEeqj8XkhjP0sVj4A1niA_bmpWmch9';
const key = supabaseServiceKey || supabaseAnonKey;

const supabase = createClient(supabaseUrl, key, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function seedTestData() {
  console.log('🌱 Seeding test data...\n');

  // Check existing products
  const { data: existingProducts, error: checkError } = await supabase
    .from('products')
    .select('id, name, slug, active')
    .eq('active', true);

  if (checkError) {
    console.error('❌ Error checking products:', checkError.message);
    return;
  }

  console.log(`📦 Found ${existingProducts?.length || 0} active products\n`);

  if (existingProducts && existingProducts.length > 0) {
    console.log('Existing products:');
    existingProducts.forEach(p => console.log(`  - ${p.name} (${p.slug})`));
    
    // Check for variants
    const { data: variants } = await supabase
      .from('product_variants')
      .select('id, product_id, sku, size, color, stock_qty')
      .in('product_id', existingProducts.map(p => p.id));
    
    console.log(`\n📋 Found ${variants?.length || 0} product variants\n`);
    
    if (variants && variants.length > 0) {
      console.log('✅ Database already has test data. Ready for testing!\n');
      return;
    }
  }

  // Try to insert test products
  console.log('Attempting to insert test products...\n');

  const testProducts = [
    {
      name: 'Test Linen Shirt',
      slug: `test-linen-shirt-${Date.now()}`,
      description: 'Premium linen shirt for testing.',
      base_price: 1299,
      main_category: 'Men',
      category: 'Shirts',
      active: true
    },
    {
      name: 'Test Silk Saree',
      slug: `test-silk-saree-${Date.now()}`,
      description: 'Elegant silk saree for testing.',
      base_price: 4500,
      main_category: 'Women',
      category: 'Sarees',
      active: true
    }
  ];

  for (const product of testProducts) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to insert ${product.name}:`, error.message);
      if (error.message.includes('row-level security')) {
        console.log('\n⚠️  RLS is blocking inserts. You need to either:');
        console.log('   1. Set SUPABASE_SERVICE_ROLE_KEY in .env.local');
        console.log('   2. Or run the SQL in scripts/update-rls-policies.sql in Supabase Dashboard\n');
      }
    } else {
      console.log(`✅ Created product: ${data.name} (${data.id})`);
      
      // Add variant
      const { error: variantError } = await supabase
        .from('product_variants')
        .insert({
          product_id: data.id,
          sku: `${data.slug}-variant`,
          size: 'M',
          color: 'Blue',
          stock_qty: 50,
          reserved_qty: 0,
          images: []
        });

      if (variantError) {
        console.error(`  ❌ Failed to add variant:`, variantError.message);
      } else {
        console.log(`  ✅ Added variant for ${data.name}`);
      }
    }
  }

  console.log('\n🎉 Seeding complete!\n');
}

async function main() {
  console.log('='.repeat(50));
  console.log('Supabase Test Data Setup');
  console.log('='.repeat(50));
  console.log(`URL: ${supabaseUrl}`);
  console.log(`Using: ${supabaseServiceKey ? 'Service Role Key' : 'Anon Key'}\n`);

  await seedTestData();
}

main().catch(console.error);
