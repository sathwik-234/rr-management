import { supabase } from "@/app/supabaseSetup";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const formData = await req.json();
    const { cms_id, crewname, designation, hq,email } = formData;
    console.log(formData);
    if (!cms_id || !crewname || !designation || !hq) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    const { data: crewData, error: crewError } = await supabase
      .from("Crew")
      .select("*")
      .eq("cms_id", cms_id)
      .single(); 
    console.log(crewData);
    if (crewData) {
      return NextResponse.json(
        { message: "There is already a Crew member with that ID" },
        { status: 400 }
      );
    }
    console.log(crewData)
    // Insert the new crew member
    const { data, error } = await supabase.from("Crew").insert([
      {
        cms_id: cms_id,
        crewname: crewname,
        designation: designation,
        hq: hq,
        email: email,
      },
    ]);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (err) {
    console.error("Error submitting form data:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
