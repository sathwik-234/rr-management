'use server'

import { createClientForServer } from "./supabase/server"
import { redirect} from "next/navigation"

const signupWithEmailPassword = async ({ email, password }) => {
    const supabase = await createClientForServer();

    try {
        console.log("Attempting to sign up with:", { email, password });

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            console.error("Sign Up Error:", error);
            return {
                error: error.message,
                success: null,
            };
        }

        console.log("Sign Up Success:", data);
        return {
            error: null,
            success: "User created successfully - Please check your email for verification.",
        };
    } catch (err) {
        console.error("Unexpected Error in signupWithEmailPassword:", err);
        return {
            error: "An unexpected error occurred.",
            success: null,
        };
    }
};


const signinWithEmailPassword = async ({ email, password }) => {
    const supabase = await createClientForServer();

    try {
        console.log("Attempting to sign in with:", { email, password });

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error("Sign In Error:", error);
            return {
                error: error.message,
                success: null,
            };
        }

        console.log("Sign In Success:", data);
        return {
            error: null,
            success: "User signed in successfully.",
        };
    } catch (err) {
        console.error("Unexpected Error in signinWithEmailPassword:", err);
        return {
            error: "An unexpected error occurred.",
            success: null,
        };
    }
}

const signout = async () => {
    const supabase = await createClientForServer();
    // console.log("Attempting to sign out.");
    const user = supabase.auth.getUser();
    // console.log("User:", user);
    await supabase.auth.signOut();

};

const sendResetPasswordEmail = async ({ email }) => {
    const supabase = await createClientForServer();

    try {
        console.log("Attempting to send reset password email to:", { email });

        const { data, error } = await supabase.auth.resetPasswordForEmail(
            email
        );

        if (error) {
            console.error("Reset Password Error:", error);
            return {
                error: error.message,
                success: null,
            };
        }

        console.log("Reset Password Success:", data);
        return {
            error: null,
            success: "Reset password email sent successfully.",
        };
    } catch (err) {
        console.error("Unexpected Error in sendResetPasswordEmail:", err);
        return {
            error: "An unexpected error occurred.",
            success: null,
        };
    }
};

const updatePassword = async ({ password }) => {
    const supabase = await createClientForServer();

    try {
        const { data, error } = await supabase.auth.updateUser( {
            password,
        });

        if (error) {
            console.error("Update Password Error:", error);
            return {
                error: error.message,
                success: null,
            };
        }

        console.log("Update Password Success:", data);
        return {
            error: null,
            success: "Password updated successfully.",
        };
    } catch (err) {
        console.error("Unexpected Error in updatePassword:", err);
        return {
            error: "An unexpected error occurred.",
            success: null,
        };
    }
}


export { signupWithEmailPassword , signinWithEmailPassword,signout,sendResetPasswordEmail,updatePassword};
