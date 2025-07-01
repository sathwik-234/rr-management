"use client";
import React, { useEffect, useState } from "react";
import "./page.css";
import { updatePassword } from "@/utils/actions";
import { useRouter } from "next/navigation";




const Page = () => {
    const [formData, setFormData] = useState({});
    const [passwordError, setPasswordError] = useState("");
    const [forgotPassword, setForgotPassword] = useState(false);
    const nav = useRouter();

    const handlePasswordChange = (e) => {
        const { id, value } = e.target;
        setFormData({ ...formData, [id]: value });

        if (id === "password" || id === "confirmPassword") {
            if (!/^\d{6}$/.test(value) && value !== "") {
                setPasswordError("Password must be 6 digits (only numbers).");
            } else {
                setPasswordError("");
            }
        }
    };

    

    const handleSubmit = async (e) => {
        // e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Password does not match");
            return;
        }
        else{
            const {error,succes} = await updatePassword(formData);
            if(error){
                alert("Error in updating password");
            }
            else{
                alert("Password updated successfully");
                nav.push("/ThankYou")
            }
        }
    }

    


    return (
        <>
            <div className="container">
                <div className="left-section">
                    <div className="image-logo">
                        <img src="/home-1.png" alt="logo" />
                    </div>
                    <div className="heading">
                        <h1>East Coast Railway</h1>
                    </div>
                    <div className="sub-heading">
                        <h2>Running Room Governance</h2>
                    </div>
                    <div className="sub-heading">
                        <h2>Waltair Division-VSKP</h2>
                    </div>
                    <div className="sub-heading">
                        <h2>Vizianagaram Jn.</h2>
                    </div>
                </div>

                <form action={handleSubmit} className="right-section">
                    <div className="form-group">
                        {forgotPassword && (
                            <p className="sub-heading">*Only enter the CMS ID*</p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="exampleInputPassword1">Password:</label>
                        <input
                            type="password"
                            className="form-control"
                            id="password"
                            placeholder="Enter your 6 digit Password"
                            pattern="\d{6}"
                            disabled={forgotPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="exampleInputPassword1">Confirm Password:</label>
                        <input
                            type="password"
                            className="form-control"
                            id="confirmPassword"
                            placeholder="Confirm your 6 digit Password"
                            pattern="\d{6}"
                            disabled={forgotPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Reset Password
                    </button>
                </form>
            </div>
        </>
    );
};

export default Page;
