import { NextResponse } from 'next/server';
import { supabase } from '@/app/supabaseSetup';

// GET - Fetch crew details by CMS ID
export async function GET(request, { params }) {
  try {
    const { cmsid } = await params;

    // Validate CMS ID
    if (!cmsid || !cmsid.trim()) {
      return NextResponse.json(
        { error: 'CMS ID is required' },
        { status: 400 }
      );
    }

    const trimmedCmsId = cmsid.trim().toUpperCase();

    // Fetch crew details from database
    const { data, error } = await supabase
      .from('Crew')
      .select('*')
      .eq('cms_id', trimmedCmsId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No crew found with this CMS ID
        return NextResponse.json(
          { error: 'Crew not found' },
          { status: 404 }
        );
      }
      
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    // Return crew details with consistent field names
    return NextResponse.json({
      cmsid: data.cms_id,
      name: data.crewname,
      design: data.design || data.designation, // Handle both possible column names
      hq: data.hq || data.headquarters, // Handle both possible column names
      // Include any other fields you might have
      created_at: data.created_at,
      updated_at: data.updated_at
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update crew details by CMS ID
export async function PUT(request, { params }) {
  try {
    const { cmsid } = await params;
    const body = await request.json();

    // Validate CMS ID
    if (!cmsid || !cmsid.trim()) {
      return NextResponse.json(
        { error: 'CMS ID is required' },
        { status: 400 }
      );
    }

    const trimmedCmsId = cmsid.trim().toUpperCase();

    // Validate required fields
    const { name, design, hq } = body;
    if (!name || !design || !hq) {
      return NextResponse.json(
        { error: 'Name, designation, and headquarters are required' },
        { status: 400 }
      );
    }

    // Check if crew exists before updating
    const { data: existingCrew, error: checkError } = await supabase
      .from('Crew')
      .select('cms_id')
      .eq('cms_id', trimmedCmsId)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Crew not found' },
        { status: 404 }
      );
    }

    if (checkError) {
      console.error('Database check error:', checkError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    // Update crew details
    const { data, error } = await supabase
      .from('Crew')
      .update({
        crewname: name.trim(),
        designation: design, // or designation depending on your column name
        hq: hq, // or headquarters depending on your column name
        updated_at: new Date().toISOString()
      })
      .eq('cms_id', trimmedCmsId)
      .select()
      .single();

    if (error) {
      console.error('Database update error:', error);
      return NextResponse.json(
        { error: 'Failed to update crew details' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Crew details updated successfully',
      crew: {
        cmsid: data.cms_id,
        name: data.name,
        design: data.design || data.designation,
        hq: data.hq || data.headquarters
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

// DELETE - Delete crew by CMS ID (optional)
export async function DELETE(request, { params }) {
  try {
    const { cmsid } = await params;

    // Validate CMS ID
    if (!cmsid || !cmsid.trim()) {
      return NextResponse.json(
        { error: 'CMS ID is required' },
        { status: 400 }
      );
    }

    const trimmedCmsId = cmsid.trim().toUpperCase();

    // Check if crew exists before deleting
    const { data: existingCrew, error: checkError } = await supabase
      .from('Crew')
      .select('cms_id')
      .eq('cms_id', trimmedCmsId)
      .single();

    if (checkError && checkError.code === 'PGRST116') {
      return NextResponse.json(
        { error: 'Crew not found' },
        { status: 404 }
      );
    }

    if (checkError) {
      console.error('Database check error:', checkError);
      return NextResponse.json(
        { error: 'Database error occurred' },
        { status: 500 }
      );
    }

    // Delete crew
    const { error } = await supabase
      .from('Crew')
      .delete()
      .eq('cms_id', trimmedCmsId);

    if (error) {
      console.error('Database delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete crew' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Crew deleted successfully',
      cmsid: trimmedCmsId
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}