import { supabase } from "@/app/supabaseSetup";
import { NextResponse } from "next/server";
import { comma } from "postcss/lib/list";

export const POST = async (req) => {
    try {
        const formData = await req.json();

        
        const { data, error } = await supabase.from("CheckOut").insert([
            {
                cms_id: formData.cmsid,
                check_in_id: formData.checkinId,
                out_train_no: formData.outTrainNo,
                out_time: formData.outTime,
                allotted_bed: formData.allottedBed,
                breakfast: formData.breakfast,
                lunch: formData.lunch,
                dinner : formData.dinner,
                parcel : formData.parcel,
                cleanliness : formData.cleanliness,
                food : formData.food,
                service : formData.service,
                comfort : formData.comfort,
                overall : formData.overall
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
