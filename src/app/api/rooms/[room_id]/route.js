import {supabase} from "@/app/supabaseSetup"
import { NextResponse } from "next/server"

export const PATCH = async (req,{params},res) => {

    const {room_id} = await params

    const req_data = await req.json();

    const {data,error} = await supabase.from('Rooms').update(req_data).eq("room_no",room_id)

    if(error){
        return NextResponse.json({error},{status : 500})
    }

    return NextResponse.json({data},{status:200})
}


export const GET = async (req,{params},res) => {
    
    const {room_id}= await params

    const {data,error} = await supabase.from('Rooms').select('*').eq("room_no",room_id)
    console.log(data)

    if(error){
        return NextResponse.json({error},{status : 500})
    }

    return NextResponse.json({data},{status:200})
}