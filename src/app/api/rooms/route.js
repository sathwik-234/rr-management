import {supabase} from "@/app/supabaseSetup"
import { NextResponse } from "next/server"

export const GET = async (req,{params},res) =>{

    // const id = params.room_id;

    const {data,error} = await supabase.from('Rooms').select('*').eq("status","FALSE");

    if(error){
        return NextResponse.json({error},{status:500})
    }

    return NextResponse.json({data},{status:200})

}