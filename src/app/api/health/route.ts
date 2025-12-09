import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connection
    const { error: dbError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    const dbStatus = dbError ? 'unhealthy' : 'healthy';
    const responseTime = Date.now() - startTime;

    const health = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: dbStatus,
          responseTime: `${responseTime}ms`,
          error: dbError?.message || null
        }
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message || 'Health check failed'
    }, { status: 503 });
  }
}
