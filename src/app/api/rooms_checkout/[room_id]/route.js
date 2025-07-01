import {supabase} from "@/app/supabaseSetup"
import { NextResponse } from "next/server"

export const GET = async (req,{params},res) => {

    const room_id = await params.room_id

    const {data,error} = await supabase.from('Rooms').select(`*,Crew(*)`).eq("id",room_id)

    if(error){
        return NextResponse.json({error},{status : 500})
    }

    return NextResponse.json({data},{status:200})
}