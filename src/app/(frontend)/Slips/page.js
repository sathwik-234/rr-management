"use client";
import React, { useEffect, useState, useRef } from "react";
import { CircularProgress, Box } from "@mui/material";
import { useReactToPrint } from "react-to-print";
import './main.css';

const Page = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [userDetailsLoaded, setUserDetailsLoaded] = useState(false);
  const [cmsIdError, setCmsIdError] = useState('');
  const [duplicateError, setDuplicateError] = useState(''); // New state for duplicate error
  const [formData, setFormData] = useState({
    crewname: "",
    cms_id: "",
    email: "",
    date: "",
    meal: "Breakfast",
  });
  const [tokenNumber, setTokenNumber] = useState(""); 

  const contentRef = useRef(null); // Ref for the hidden receipt content

  const printfn = useReactToPrint({ contentRef});

  // Function to check for duplicate tokens
  const checkDuplicateToken = async (cmsId, date, meal) => {
    try {
      const response = await fetch('/api/checkDuplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cms_id: cmsId,
          date: date.slice(0, 10), // Only date part, not time
          meal: meal
        }),
      });
      
      const result = await response.json();
      return result.exists; // Assuming the API returns { exists: true/false }
    } catch (error) {
      console.error('Error checking duplicate:', error);
      return false; // If there's an error, allow submission
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous duplicate error
    setDuplicateError('');
    
    // Validate CMS ID
    if (formData.cms_id.length !== 8) {
      alert('CMS ID must be exactly 8 characters');
      return;
    }
    
    // Validate user details are loaded
    if (!userDetailsLoaded) {
      alert('Please enter a valid CMS ID to load user details');
      return;
    }
    
    // Check for duplicate token
    setLoading(true);
    const isDuplicate = await checkDuplicateToken(formData.cms_id, formData.date, formData.meal);
    
    if (isDuplicate) {
      setDuplicateError(`A ${formData.meal} token for ${formData.cms_id} already exists for ${formData.date.slice(0, 10)}`);
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/TokenSubmission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      console.log(result.tokenNumber);
      if (res.ok) {
        setTokenNumber(result.tokenNumber);
        setTimeout(() => {
          printfn();
        }, 100); 
      }
      else {
        console.error("Error:", result.message);
        alert(`Error: ${result.message || 'Something went wrong'}`);
      }
    } catch (err) {
      console.error("Error submitting form data:", err);
      alert('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (cmsId = formData.cms_id) => {
    
    setLoading(true);
    setCmsIdError('');
    
    try {
      const response = await fetch(`/api/users/${cmsId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setCmsIdError('CMS ID not found');
        } else {
          setCmsIdError('Error fetching user details');
        }
        setUserDetailsLoaded(false);
        return;
      }
      
      const result = await response.json();
      setData(result);
      setFormData((prev) => ({
        ...prev,
        crewname: result.data.crewname || "",
        cms_id: cmsId,
        email: result.data.email || "",
        date: currentDateTime,
      }));
      setUserDetailsLoaded(true);
      
    } catch (error) {
      console.error('Error fetching user details:', error);
      setCmsIdError('Error fetching user details');
      setUserDetailsLoaded(false);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchButtonClick = () => {
    fetchUserDetails();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear duplicate error when form fields change
    if (duplicateError && (name === 'cms_id' || name === 'date' || name === 'meal')) {
      setDuplicateError('');
    }
    
    if (name === 'cms_id') {
      const uppercaseValue = value.toUpperCase();
      setFormData((prev) => ({ ...prev, [name]: uppercaseValue }));
      
      // Clear previous user details when CMS ID changes
      if (uppercaseValue !== formData.cms_id) {
        setFormData((prev) => ({
          ...prev,
          cms_id: uppercaseValue,
          crewname: '',
          email: ''
        }));
        setUserDetailsLoaded(false);
        setCmsIdError('');
        setData(null);
      }
      
      // Only validate length, don't auto-fetch
      if (uppercaseValue.length > 8) {
        setCmsIdError('CMS ID must be exactly 8 characters');
      } else {
        setCmsIdError('');
      }
      return;
    }

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  useEffect(() => {
    const now = new Date();
    const istOffset = 5.5 * 60;
    const istTime = new Date(now.getTime() + istOffset * 60000);
    const formattedIST = istTime.toISOString().slice(0, 16);
    setCurrentDateTime(formattedIST);
    setFormData(prev => ({
      ...prev,
      date: formattedIST
    }));
  }, []);

  if (error && !cmsIdError) {
    return (
      <div className="slips-loading">
        <div className="main-container">
          <div className="slips-container">
            <h1 className="slips-title">Error</h1>
            <div className="slips-content">
              <p>Something went wrong. Please try again later.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <div className="slips-container">
        <h1 className="slips-title">Meal Tokens</h1>
        <div className="slips-content">
          <form className="slips-form">
            <div className="slip-form-field">
              <label>CMS ID:</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <input
                  className="slips-input"
                  type="text"
                  name="cms_id"
                  value={formData.cms_id}
                  onChange={handleChange}
                  placeholder="Enter 8-character CMS ID"
                  maxLength="8"
                  required
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleFetchButtonClick}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: !loading ? '#4CAF50' : '#cccccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor:  !loading ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    minWidth: '80px'
                  }}
                >
                  {loading ? 'Loading...' : 'Fetch'}
                </button>
              </div>
              {cmsIdError && <span className="error-message" style={{color: 'red', fontSize: '12px', display: 'block'}}>{cmsIdError}</span>}
            </div>

            <div className="slip-form-field">
              <label>Name:</label>
              <input
                className="slips-input"
                type="text"
                name="crewname"
                value={formData.crewname}
                onChange={handleChange}
                placeholder="Name will auto-fill"
                readOnly
              />
            </div>

            <div className="slip-form-field">
              <label>Date:</label>
              <input
                className="slips-input"
                type="datetime-local"
                name="date"
                value={formData.date || currentDateTime}
                onChange={handleChange}
              />
            </div>

            <div className="slip-form-field">
              <label>Meal:</label>
              <select
                className="slips-input"
                name="meal"
                value={formData.meal}
                onChange={handleChange}
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Parcel">Parcel</option>
              </select>
            </div>

            {/* Display duplicate error message */}
            {duplicateError && (
              <div className="slip-form-field">
                <span className="error-message" style={{color: 'red', fontSize: '14px', display: 'block', textAlign: 'center', fontWeight: 'bold'}}>
                  {duplicateError}
                </span>
              </div>
            )}
          </form>
        </div>

        <button
          onClick={handleSubmit}
          className="slips-button"
          disabled={!userDetailsLoaded || formData.cms_id.length !== 8 || loading}
        >
          {loading ? (
            <Box sx={{ display: 'flex' }}>
              <CircularProgress size="20px" sx={{ color: '#ffffff' }} />
            </Box>
          ) : (
            'Print'
          )}
        </button>

        <div ref={contentRef} className="hidden-for-print" >
          <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
            <h1 style={{ textAlign: "center" }}>AR Royal Fort</h1>
            <h2>Beside of VZM fort</h2>
            <h2>Vizianagaram-535004-Andhra Pradesh</h2>
            <h2>Meal Token</h2>
            <p>
              <strong>Token Number:</strong> {tokenNumber}
            </p>
            <p>
              <strong>Name:</strong> {formData.crewname}
            </p>
            <p>
              <strong>CMS ID:</strong> {formData.cms_id}
            </p>
            <p>
              <strong>Date:</strong> {formData.date.slice(0,10) || currentDateTime.slice(0, 10)}
            </p>
            <p>
              <strong>Meal:</strong> {formData.meal}
            </p>
            <hr />
            <p style={{ textAlign: "center" }}>Thank you for choosing our service!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;