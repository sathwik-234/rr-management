import { supabase } from "@/app/supabaseSetup";
import { NextResponse } from "next/server";

export const POST = async (req) => {
    try {
        const formData = await req.json();

        
        const { data, error } = await supabase.from("CheckIn").insert([
            {
                cms_id: formData.cmsid,
                ic_train_no: formData.icTrainNo,
                ic_time: formData.icTime,
                bedsheets: formData.bedSheets,
                pillowcovers: formData.pillowCover,
                blankets: formData.blanket,
                allotted_bed: formData.allottedBed,
                vzm_arrival_time:formData.arrTime
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


