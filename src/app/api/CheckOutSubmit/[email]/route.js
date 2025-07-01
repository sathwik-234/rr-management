import { supabase } from "@/app/supabaseSetup";
import { NextResponse } from "next/server";

export const GET = async (request, { params }) => {
    try {
        // Safely destructure email from params
        const { email } = await params;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Query the database
        const { data, error } = await supabase
            .from("CheckIn")
            .select("*, Crew(*)")
            .eq("Crew.email", email)
            .order("created_at", { ascending: false });

        if (error) {
            throw error; // This will be caught by the catch block
        }

        // Return the data
        return NextResponse.json({ data }, { status: 200 });
    } catch (error) {
        console.error("Error fetching data:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
};
