import { supabase } from "@/app/supabaseSetup";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        const formData = await req.json();

        
        const { data, error } = await supabase.from("Complaints").insert([
            {
                cms_id: formData.cmsid,
                room_no: formData.roomno,
                complaint_type: formData.complaintType,
                description : formData.description
            },
        ]);

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        return NextResponse.json({ data }, { status: 200 });
    } catch (err) {
        console.error("Error submitting form data:", err);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};
