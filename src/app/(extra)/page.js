"use client"
import React, { useState } from "react";
import "./thanku.css";

function ThankYouPage() {
  const [isHindi, setIsHindi] = useState(false); // State to toggle between English and Hindi

  const toggleLanguage = () => {
    setIsHindi((prev) => !prev);
  };

  return (
    <div className="container">
      {isHindi ? (
        <div className="hindi-card">
          <h1 className="heading">धन्यवाद!🙏</h1>
          <p className="message">
            आप अभी प्रमाणित हैं🧑‍✈️। कृपया आरंभ करने के लिए अपने वर्तमान डिवाइस से लॉग इन करना सुनिश्चित करें।
          </p>
        </div>
      ) : (
        <div className="english-card">
          <h1 className="heading">Thank You!🙏</h1>
          <p className="message">
            You are currently now authenticated🧑‍✈️. Please make sure to log in from your current device to get started.
          </p>
        </div>
      )}
      <button className="button" onClick={toggleLanguage}>
        {isHindi ? "Switch to English" : "हिंदी में बदलें"}
      </button>
    </div>
  );
}

export default ThankYouPage;

