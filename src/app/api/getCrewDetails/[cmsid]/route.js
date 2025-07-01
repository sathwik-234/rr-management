import { supabase } from "@/app/supabaseSetup";
import { NextResponse } from "next/server";

export async function GET(request, {params}) {
    try {
        
        const {cmsid} = await params;

        if (!cmsid) {
            return NextResponse.json({ error: "CMS ID is required" }, { status: 400 });
        }

        const { data, error } = await supabase
            .from("Crew")
            .select("*")
            .eq("cms_id", cmsid)
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (err) {
        console.error("Error in API handler:", err);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
