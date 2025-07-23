import {supabase} from "@/app/supabaseSetup"
import { NextResponse } from "next/server"

// For Pages Router (pages/api/checkDuplicate.js)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { cms_id, date, meal } = req.body;

  if (!cms_id || !date || !meal) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const exists = await checkTokenExists(cms_id, date, meal);
    return res.status(200).json({ exists: exists });

  } catch (error) {
    console.error('Error checking duplicate token:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

// Supabase database check function
async function checkTokenExists(cmsId, date, meal) {
  try {
    // Query Supabase to check for existing token
    // Replace 'tokens' with your actual table name
    const { data, error } = await supabase
      .from('Tokens') // Replace with your actual table name
      .select('id')
      .eq('cms_id', cmsId)
      .eq('date', date) // Make sure date format matches your database
      .eq('meal_type', meal)
      .limit(1);

    if (error) {
      console.error('Supabase query error:', error);
      return false; // Return false on error to allow submission
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error in checkTokenExists:', error);
    return false;
  }
}

// For App Router (app/api/checkDuplicate/route.js)
export async function POST(request) {
  const { cms_id, date, meal } = await request.json();

  if (!cms_id || !date || !meal) {
    return Response.json({ message: 'Missing required fields' }, { status: 400 });
  }

  try {
    const exists = await checkTokenExists(cms_id, date, meal);
    return Response.json({ exists: exists });
  } catch (error) {
    console.error('Error checking duplicate token:', error);
    return Response.json({ message: 'Internal server error' }, { status: 500 });
  }
}