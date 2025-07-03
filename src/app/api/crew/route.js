// File: /app/api/crew/route.js
import { NextResponse } from 'next/server';
import { supabase } from '@/app/supabaseSetup';

export async function POST(request) {
  try {
    const body = await request.json();
    const { cmsid, name, design, hq } = body;

    // Validate required fields
    if (!cmsid || !name || !design || !hq) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }


    // Validate name (no empty strings, reasonable length)
    if (name.trim().length < 2 || name.trim().length > 100) {
      return NextResponse.json(
        { error: 'Name must be between 2 and 100 characters' },
        { status: 400 }
      );
    }

    // Check if CMS ID already exists
    const { data: existingCrew, error: checkError } = await supabase
      .from('Crew')
      .select('cms_id')
      .eq('cms_id', cmsid)
      .single();

    if (existingCrew) {
      return NextResponse.json(
        { error: 'CMS ID already exists in database' },
        { status: 409 }
      );
    }

    // If checkError is not "not found", it's a real error
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Database check error:', checkError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    // Insert new crew member
    const { data, error } = await supabase
      .from('Crew')
      .insert([{
        cms_id: cmsid.trim(),
        crewname: name.trim(),
        designation: design,
        hq: hq,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json(
        { error: 'Failed to create crew member' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Crew member created successfully!',
      data: data[0]
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET method to fetch all crew members
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('crew')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch crew members' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}