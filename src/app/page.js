"use client";
import React, { Suspense } from "react";
import { useRouter } from "next/navigation";
import "./home.css";
import { IoHome } from "react-icons/io5";

const Page = () => {
    const nav = useRouter();


    return (
        <div className="mini-container">
            <div className="container">
            
            <div className="left-section">
                <div className="image-logo">
                    <img src="/home-1.png" alt="logo" />
                </div>
                <div className="heading">
                    <h1>AR Royal Fort</h1>
                </div>
                <div className="sub-heading">
                    <h2>Running Room Governance</h2>
                </div>
                <div className="sub-heading">
                    <h2>Vizianagaram.</h2>
                </div>
            </div>

            <div className="right-section">
                <div className="welcome-content">
                    <h2>Welcome to AR Royal Fort</h2>
                    <p>Click below to access the home page</p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick= {() => nav.push("/home")}
                >
                    <IoHome style={{ marginRight: '8px' }} />
                    Go to Home
                </button>
            </div>
        </div>
        </div>
    );
};



export default Page;