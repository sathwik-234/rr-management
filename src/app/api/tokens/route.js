import {supabase} from "@/app/supabaseSetup"
import { NextResponse } from "next/server"


export const GET = async(req,res)=>{
    
    const {data,error} = await supabase.from('Tokens').select('*')
    
    if(error){
        return NextResponse.json({error},{status:500})
    }
    else{
        return NextResponse.json({data},{status:200})
    }
}

