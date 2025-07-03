import { NextResponse } from 'next/server';
import { supabase } from '@/app/supabaseSetup';

export async function GET(request, { params }) {
  try {
    const { cmsid } = await params;

    // Validate CMS ID format
    if (!cmsid || cmsid.length !== 8) {
      return NextResponse.json(
        { error: 'Invalid CMS ID format' },
        { status: 400 }
      );
    }

    // Check if CMS ID exists in database
    const { data, error } = await supabase
      .from('Crew')
      .select('cms_id')
      .eq('cms_id', cmsid)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    // Return whether CMS ID exists
    return NextResponse.json({
      exists: !!data,
      cmsid: cmsid
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}