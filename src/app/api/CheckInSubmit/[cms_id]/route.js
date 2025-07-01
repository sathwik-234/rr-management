import { supabase } from "@/app/supabaseSetup";
import { NextResponse } from "next/server";

export const GET = async (req,{params},res) =>{

    const {cms_id} = await params;

    const {data,error} = await supabase.from('CheckIn').select('*').eq("cms_id",cms_id).order('created_at',{ascending:false});

    if(error){
        return NextResponse.json({error},{status:500})
    }

    return NextResponse.json({data},{status:200})

}