import { supabase } from "@/app/supabaseSetup";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

// Helper function to generate a unique token number
async function generateUniqueToken() {
  let isUnique = false;
  let tokenNumber;

  while (!isUnique) {
    tokenNumber = `TKN-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Check if the token number already exists
    const { data, error } = await supabase
      .from("Tokens")
      .select("token_no")
      .eq("token_no", tokenNumber);

    if (error) {
      console.error("Error checking token uniqueness:", error);
      throw new Error("Database error during token check.");
    }

    if (!data || data.length === 0) {
      isUnique = true; 
    }
  }

  return tokenNumber;
}

export const POST = async (req) => {
  try {
    const formData = await req.json();
    const { meal, cms_id, date } = formData;

    if (!meal || !cms_id || !date) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate a unique token number
    const tokenNumber = await generateUniqueToken();

    // Insert into Supabase
    const { data, error } = await supabase.from("Tokens").insert([
      {
        cms_id: cms_id,
        meal_type: meal,
        token_no: tokenNumber,
        date: date,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Data inserted successfully:", tokenNumber);
    return NextResponse.json({ tokenNumber }, { status: 200 });

  } catch (err) {
    console.error("Error submitting form data:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
