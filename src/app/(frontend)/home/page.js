"use client";
import React, { useState, useEffect } from "react";
import './main.css';
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";
import { signout } from "@/utils/actions";
import { PiSignOutBold } from "react-icons/pi";
import { FaPersonWalkingLuggage } from "react-icons/fa6";
import { MdLocalHotel } from "react-icons/md";
import { IoFastFoodSharp } from "react-icons/io5";
import { FaBusinessTime } from "react-icons/fa";



const Page = () => {
  const nav = useRouter();
  const [error, setError] = useState(false);
  const [fetching, setFetching] = useState(false);


  const handleSignOut = () => {
    nav.push("/");
  }

  if (error) return <div className="error">An error occurred. Please try again later.</div>;

  return (
    <div className="home-mini-container">
      <div className="home-container">
        <div className="home-left-section">
          <div className="image-logo">
            <img src="/home-1.png" alt="Simhachalam North Logo" />
          </div>
          <div className="home-heading">
            <h1>AR Royal Fort</h1>
          </div>
          <div className="home-heading">
            <h1>Vizianagaram.</h1>
          </div>
        </div>
        <div className="home-text-container">
          <div className="home-buttons-container">
            <button
              className="home-button check-in"
              onClick={() => nav.push("/CheckIn")}
            >
             <MdLocalHotel style={{ marginRight: '8px' }} /> {/* Icon */}
              CheckIn
            </button>
            <button
              className="home-button meal-token"
              onClick={() => nav.push("/Slips")}
            >
               <IoFastFoodSharp style={{ marginRight: '8px' }} /> {/* Icon */}
             Meal Token 
            </button>
            <button
              className="home-button check-out"
              onClick={() => nav.push("/CheckOut")}
            >
               <FaPersonWalkingLuggage style={{ marginRight: '8px' }} /> {/* Icon */}
              CheckOut
            </button>
            
          </div>
          <div className="home-buttons-container">
            <button
              onClick={() => nav.push("/TOForm")}
              disabled={fetching}
              className="home-button sign-out"
            >
              {fetching ? (
                <Box sx={{ display: 'flex' }}>
                  <CircularProgress size="20px" sx={{ color: '#f2b157' }} />
                </Box>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <FaBusinessTime style={{ marginRight: '8px' }} /> {/* Icon */}
                  <span>TO Form</span> {/* Text */}
                </div>
              )}
            </button>
            <button
              onClick={handleSignOut}
              disabled={fetching}
              className="home-button sign-out"
            >
              {fetching ? (
                <Box sx={{ display: 'flex' }}>
                  <CircularProgress size="20px" sx={{ color: '#f2b157' }} />
                </Box>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <PiSignOutBold style={{ marginRight: '8px' }} /> {/* Icon */}
                  <span>Sign Out</span> {/* Text */}
                </div>
              )}
            </button>
          </div>
          <div className="signature-footer">
            <p>
              - Designed & Developed by{" "}
              <span className="author">G.Pradeep Kumar & G.Sai Sathwik</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
