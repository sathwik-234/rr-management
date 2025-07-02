"use client";
import React, { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import "./toform.css"; // Import the TO Form specific CSS
import { signout } from "@/utils/actions";

function TOForm() {
  const nav = useRouter();

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const localDate = new Date(d);
    return localDate.toISOString().slice(0, 16);
  };

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false); // Track if we're editing existing TO time
  const [detailsLoaded, setDetailsLoaded] = useState(false); // Track if crew details are loaded

  const [formData, setFormData] = useState({
    cmsid: "",
    checkinId: "",
    name: "",
    design: "",
    hq: "",
    allottedBed: "",
    toTime: formatDate(new Date()),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle CMS ID input
    if (name === "cmsid") {
      const upperCaseValue = value.toUpperCase();
      setFormData((prevData) => ({ ...prevData, [name]: upperCaseValue }));
      
      // Clear other fields when CMS ID changes
      if (upperCaseValue !== formData.cmsid) {
        setFormData((prevData) => ({
          ...prevData,
          cmsid: upperCaseValue,
          name: "",
          design: "",
          hq: "",
          allottedBed: "",
          checkinId: ""
        }));
        setCheckInTime(null);
        setError(null);
        setIsEditMode(false);
        setDetailsLoaded(false);
      }
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  // Fetch crew details function
  const fetchCrewDetails = async (cmsId = formData.cmsid) => {
    if (!cmsId || cmsId.length === 0) {
      setError("Please enter a CMS ID");
      return;
    }

    setFetchingDetails(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/getCrewDetails/${cmsId}`);
      if (!res.ok) throw new Error(`Error fetching crew details: ${res.statusText}`);
      const data = await res.json();
      console.log("Crew Details Data:", data);
      
      if (data?.data?.cms_id) {
        setFormData((prevData) => ({
          ...prevData,
          name: data.data.crewname,
          design: data.data.designation,
          hq: data.data.hq,
        }));
        setDetailsLoaded(true);
        
        // After crew details are loaded, fetch check-in data
        await fetchCheckInData(cmsId, data.data.crewname);
      } else {
        throw new Error("Invalid CMS ID or no crew details found.");
      }
    } catch (err) {
      setError(err.message);
      // Clear the fields if there's an error
      setFormData((prevData) => ({
        ...prevData,
        name: "",
        design: "",
        hq: "",
        allottedBed: "",
        checkinId: ""
      }));
      setDetailsLoaded(false);
    } finally {
      setFetchingDetails(false);
    }
  };

  // Fetch check-in data function
  const fetchCheckInData = async (cmsId, crewName) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/CheckInSubmit/${cmsId}`);
      if (!res.ok) throw new Error(`Error fetching check-in data: ${res.statusText}`);
      const data = await res.json();
      console.log("Check-In Data:", data);
      
      if (data?.data && data.data.length > 0) {
        // Get the last entry (most recent check-in)
        const lastEntry = data.data[0];
        
        setCheckInTime(new Date(lastEntry.ic_time));
        setFormData((prevData) => ({
          ...prevData,
          checkinId: lastEntry.id,
          allottedBed: lastEntry.allotted_bed,
          // If TO time exists, use it; otherwise use current time
          toTime: lastEntry.to_time ? formatDate(new Date(lastEntry.to_time)) : formatDate(new Date()),
        }));
        
        // Set edit mode if TO time already exists
        setIsEditMode(!!lastEntry.to_time);
      } else {
        throw new Error("No check-in data found for this CMS ID.");
      }
    } catch (err) {
      setError(err.message);
      setFormData((prevData) => ({
        ...prevData,
        allottedBed: "",
        checkinId: "",
        toTime: formatDate(new Date())
      }));
      setIsEditMode(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchButtonClick = () => {
    fetchCrewDetails();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that all required details are loaded
    if (!formData.name || !formData.design || !formData.hq) {
      alert("Please ensure CMS ID is valid and crew details are loaded.");
      return;
    }

    if (!formData.allottedBed || !formData.checkinId) {
      alert("No check-in data found. Please ensure you have checked in first.");
      return;
    }

    // Validate TO Time
    if (!formData.toTime) {
      alert("Please select a TO Time.");
      return;
    }

    const toTime = new Date(formData.toTime);
    if (checkInTime && toTime <= checkInTime) {
      document.getElementById("toTime").value = "";
      setFormData((prevData) => ({
        ...prevData,
        toTime: ""
      }));
      alert("TO time must be later than the check-in time.");
      return;
    }

    setButtonDisabled(true);
    
    try {
      if (!checkInTime) {
        throw new Error("Check-in time is unavailable.");
      }
      
      // Submit TO Time to the check-in table (this will update if it already exists)
      const response = await fetch(`/api/ToTimeSubmit/${formData.checkinId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to_time: formData.toTime,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error during TO time submission: ${response.statusText}`);
      }

      // Reset form after successful submission
      setFormData({
        cmsid: "",
        checkinId: "",
        name: "",
        design: "",
        hq: "",
        allottedBed: "",
        toTime: formatDate(new Date()),
      });
      
      setCheckInTime(null);
      setIsEditMode(false);
      setDetailsLoaded(false);
      alert(isEditMode ? "TO Time updated successfully!" : "TO Time submitted successfully!");
      nav.push("/home");
      
    } catch (err) {
      setError(err.message);
    } finally {
      setButtonDisabled(false);
    }
  };

  if (loading)
    return (
      <div className="home-loading">
        <Box sx={{ display: "flex" }}>
          <CircularProgress size="50px" sx={{ color: "#54473F" }} />
        </Box>
      </div>
    );

  return (
    <>
      <h1 className="to-form-name">TO Time Form</h1>
      <div className="error-container" style={{ display: 'flex', width: '100%', marginBottom: '20px' }}>
            {error && (
          <div className="error" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
            <Typography color="error">{error}</Typography>
          </div>
        )}
        {isEditMode && (
          <div style={{display: 'flex', height : '20px', marginBottom: '0px', padding: '10px', backgroundColor: '#e8f5e8', color: '#2e7d32', borderRadius: '4px' }}>
            <Typography>
              Editing existing TO Time. You can modify the time below.
            </Typography>
          </div>
        )}
        </div>
      <div className="to-form-block">
        <form onSubmit={handleSubmit} className="to-form">
          <div className="right-block">
            <div className="form-field">
              <label className="field-label">CMS Id:</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <input
                  type="text"
                  name="cmsid"
                  value={formData.cmsid}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter CMS ID"
                  required
                  style={{ textTransform: 'uppercase', flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleFetchButtonClick}
                  disabled={!formData.cmsid || fetchingDetails}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: formData.cmsid && !fetchingDetails ? '#4CAF50' : '#cccccc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: formData.cmsid && !fetchingDetails ? 'pointer' : 'not-allowed',
                    fontSize: '14px',
                    minWidth: '80px',
                    height: '40px'
                  }}
                >
                  {fetchingDetails ? 'Loading...' : 'Fetch'}
                </button>
              </div>
            </div>
            <div className="form-field">
              <label className="field-label">Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="form-input bead"
                readOnly
                placeholder="Auto-filled from CMS ID"
              />
            </div>
            <div className="form-field">
              <label className="field-label">Designation:</label>
              <input
                type="text"
                name="design"
                value={formData.design}
                onChange={handleChange}
                className="form-input"
                readOnly
                placeholder="Auto-filled from CMS ID"
              />
            </div>
            <div className="form-field">
              <label className="field-label">HeadQuarters:</label>
              <input
                type="text"
                name="hq"
                value={formData.hq}
                onChange={handleChange}
                className="form-input"
                readOnly
                placeholder="Auto-filled from CMS ID"
              />
            </div>
            <div className="form-field">
              <label className="field-label">Allotted Bed:</label>
              <input 
                type="text" 
                name="allottedBed" 
                value={formData.allottedBed} 
                onChange={handleChange} 
                className="form-input" 
                readOnly 
                placeholder="Auto-filled from check-in data"
              />
            </div>
          </div>
          <div className="left-block">
            <div className="form-field">
              <label className="field-label">TO Time:</label>
              <input
                type="datetime-local"
                name="toTime"
                value={formData.toTime}
                onChange={handleChange}
                className="form-input"
                id="toTime"
                required
              />
            </div>
            <div className="form-field">
              <label className="field-label">Check-in Time:</label>
              <input
                type="text"
                value={checkInTime ? checkInTime : "Not available"}
                className="form-input"
                readOnly
                placeholder="Auto-filled from check-in data"
              />
            </div>
          </div>
          <div className="button-div">
            <button 
              className="submitButton" 
              type="submit"
              disabled={buttonDisabled || !formData.name || !formData.allottedBed}
            >
              {buttonDisabled ? (
                <Box sx={{ display: 'flex' }}>
                  <CircularProgress size="20px" sx={{ color: '#f2b157' }} />
                </Box>
              ) : (isEditMode ? "Update" : "Submit")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default TOForm;