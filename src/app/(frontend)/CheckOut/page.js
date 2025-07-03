"use client";
import React, { useEffect, useState } from "react";
import { Rating, Typography, Box, Grid } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { useRouter } from "next/navigation";
import "./form2.css";
import { signout } from "@/utils/actions";

function CheckOut() {
  const nav = useRouter();

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const offset = d.getTimezoneOffset() * 60000;
    const localDate = new Date(d - offset);
    return localDate.toISOString().slice(0, 16);
  };

  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [checkInTime, setCheckInTime] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [fetchButtonLoading, setFetchButtonLoading] = useState(false);
  const [crewDetailsLoaded, setCrewDetailsLoaded] = useState(false);
  const [cmsIdError, setCmsIdError] = useState('');

  const [formData, setFormData] = useState({
    cmsid: "",
    checkinId: "",
    name: "",
    design: "",
    hq: "",
    outTrainNo: "",
    outTime: formatDate(new Date()),
    allottedBed: "",
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    parcel: 0,
    cleanliness: 0,
    food: 0,
    service: 0,
    comfort: 0,
    overall: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["bedSheets", "pillowCover", "blanket"].includes(name) && value < 0) {
      alert("Value cannot be negative");
      return;
    }
    
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
        setVerified(false);
        setError(null);
        setCrewDetailsLoaded(false);
        setCmsIdError('');
      }

      // Validate CMS ID length
      if (upperCaseValue.length > 8) {
        setCmsIdError('CMS ID must be exactly 8 characters');
      } else {
        setCmsIdError('');
      }
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleRatingChange = (name, value) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const fetchCrewDetails = async (cmsId = formData.cmsid) => {
    if (!cmsId || cmsId.length === 0) {
      setCmsIdError('Please enter a CMS ID');
      return;
    }
    

    setFetchButtonLoading(true);
    setError(null);
    setCmsIdError('');
    
    try {
      const res = await fetch(`/api/getCrewDetails/${cmsId}`);
      if (!res.ok) {
        if (res.status === 404) {
          setCmsIdError('CMS ID not found');
        } else {
          setCmsIdError('Error fetching crew details');
        }
        setCrewDetailsLoaded(false);
        return;
      }
      
      const data = await res.json();

      if (data?.data?.cms_id) {
        setFormData((prevData) => ({
          ...prevData,
          name: data.data.crewname,
          design: data.data.designation,
          hq: data.data.hq,
        }));
        setCrewDetailsLoaded(true);
      } else {
        setCmsIdError("Invalid CMS ID or no crew details found.");
        setCrewDetailsLoaded(false);
      }
    } catch (err) {
      setCmsIdError(err.message);
      setCrewDetailsLoaded(false);
      // Clear the fields if there's an error
      setFormData((prevData) => ({
        ...prevData,
        name: "",
        design: "",
        hq: "",
        allottedBed: "",
        checkinId: ""
      }));
    } finally {
      setFetchButtonLoading(false);
    }
  };

  const handleFetchButtonClick = () => {
    fetchCrewDetails();
  };

  // Fetch check-in data when CMS ID and crew details are available
  useEffect(() => {
    if (formData.cmsid && formData.name && crewDetailsLoaded) {
      const fetchCheckInData = async () => {
        setLoading(true);
        try {
          const res = await fetch(`/api/CheckInSubmit/${formData.cmsid}`);
          if (!res.ok) throw new Error(`Error fetching check-in data: ${res.statusText}`);
          const data = await res.json();

          if (data?.data?.[0]?.allotted_bed) {
            setCheckInTime(new Date(data.data[0].ic_time));
            setFormData((prevData) => ({
              ...prevData,
              checkinId: data.data[0].id,
              allottedBed: data.data[0].allotted_bed,
            }));
          } else {
            throw new Error("No check-in data found for this CMS ID.");
          }
        } catch (err) {
          setError(err.message);
          setFormData((prevData) => ({
            ...prevData,
            allottedBed: "",
            checkinId: ""
          }));
        } finally {
          setLoading(false);
        }
      };

      fetchCheckInData();
    }
  }, [formData.cmsid, formData.name, crewDetailsLoaded]);

  // Fetch room verification status
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!formData.allottedBed) return; 
  
      try {
        const response = await fetch(`/api/rooms/${formData.allottedBed}`);
        if (!response.ok) {
          throw new Error(`Error fetching room data: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data.data[0])
        if (data.data[0].status === false) {
          console.log("Room is not verified");
          setVerified(false);
        } else if (data.data[0].status === true) {
          console.log("Room is verified");
          setVerified(true);
        } else {
          alert("You have not checked In")
          throw new Error("No CheckIn Data Received.");
        }
      } catch (err) {
        console.error(err.message);
        setError(err.message);
      }
    };
  
    fetchRoomData();
  }, [formData.allottedBed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate CMS ID length
    

    // Validate that all required details are loaded
    if (!formData.name || !formData.design || !formData.hq) {
      alert("Please ensure CMS ID is valid and crew details are loaded.");
      return;
    }

    if (!formData.allottedBed || !formData.checkinId) {
      alert("No check-in data found. Please ensure you have checked in first.");
      return;
    }

    setButtonDisabled(true);
    const checkoutTime = new Date(formData.outTime);
    if (checkoutTime <= checkInTime) {
      document.getElementById("outTime").value = ""
      setFormData((prevdata)=>({
        ...prevdata,
        outTime : ""
      }))
      alert("Checkout time must be later than the check-in time.");
      setButtonDisabled(false);
      return;
    }
    
    try {
      if (!checkInTime) {
        throw new Error("Check-in time is unavailable.");
      }
      
      if(verified){
        const response = await fetch("/api/CheckOutSubmit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const resp = await fetch(`/api/rooms/${formData.allottedBed}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "FALSE", allotted_to: null }),
        });

        if (!response.ok || !resp.ok) {
          throw new Error(`Error during submission: ${response.ok ? resp.statusText : response.statusText}`);
        }

        setFormData({
          cmsid: "",
          checkinId: "",
          name: "",
          design: "",
          hq: "",
          outTrainNo: "",
          outTime: "",
          allottedBed: "",
          breakfast: 0,
          lunch: 0,
          dinner: 0,
          parcel: 0,
          cleanliness: 0,
          food: 0,
          service: 0,
          comfort: 0,
          overall: 0,
        });
        setCrewDetailsLoaded(false);
        setCmsIdError('');
        alert("Checkout submitted successfully!");
        nav.push("/home");
      } else {
        alert("Room is not verified. Please contact administration.");
        setButtonDisabled(false);
      }
    } catch (err) {
      setError(err.message);
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
      <h1 className="checkout-form-name">CheckOut Form</h1>
      <div className="checkout-form-block">
        {error && (
          <div className="error" style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
            <Typography color="error">{error}</Typography>
          </div>
        )}
        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="right-block">
            <div className="form-field">
              <label className="field-label">CMS Id:</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="text"
                    name="cmsid"
                    value={formData.cmsid}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter 8-character CMS ID"
                    maxLength={8}
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                  {cmsIdError && <span className="error-message" style={{color: 'red', fontSize: '12px', display: 'block', marginTop: '4px'}}>{cmsIdError}</span>}
                </div>
                <button
                  type="button"
                  onClick={handleFetchButtonClick}
                  disabled={fetchButtonLoading || !formData.cmsid}
                  style={{
                    padding: '8px 8px',
                    marginLeft: '9px',
                    backgroundColor: '#f0910c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: fetchButtonLoading || !formData.cmsid ? 'not-allowed' : 'pointer',
                    opacity: fetchButtonLoading || !formData.cmsid ? 0.6 : 1,
                    minWidth: '40px',
                    height: 'fit-content'
                  }}
                >
                  {fetchButtonLoading ? (
                    <CircularProgress size="16px" sx={{ color: 'white' }} />
                  ) : (
                    'Fetch'
                  )}
                </button>
              </div>
              {fetchButtonLoading && <span style={{color: '#f0910c', fontSize: '12px'}}>Loading crew details...</span>}
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
              <label className="field-label">Running Room CheckOut Time:</label>
              <input
                type="datetime-local"
                name="outTime"
                value={formatDate(formData.outTime)}
                onChange={handleChange}
                className="form-input"
                id="outTime"
                required
              />
            </div>
            <div className="form-field">
              <label className="field-label">Outgoing Train No.:</label>
              <input
                type="text"
                name="outTrainNo"
                value={formData.outTrainNo}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>
          </div>
          <div className="feedback-block">
            <Grid item xs={12}>
              {["Cleanliness", "Food", "Service", "Comfort", "Overall"].map((field) => (
                <Box key={field} sx={{ marginBottom: "15px" }}>
                  <Typography className="field-label">{field}</Typography>
                  <Rating
                    name={field.toLowerCase()}
                    value={formData[field.toLowerCase()]}
                    onChange={(event, value) => handleRatingChange(field.toLowerCase(), value)}
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#f0910c', 
                        textShadow: '0 0 10px rgba(236, 253, 2, 0.8)', 
                      },
                      '& .MuiRating-iconHover': {
                        color: '#f0910c', 
                        textShadow: '0 0 10px rgba(236, 253, 2, 0.8)', 
                      }
                    }}
                  />
                </Box>
              ))}
            </Grid>
          </div>
          <div className="button-div">
            <button 
              className="submitButton" 
              type="submit"
              disabled={buttonDisabled || !crewDetailsLoaded || !formData.allottedBed}
            >
              {buttonDisabled ? (
                <Box sx={{ display: 'flex' }}>
                  <CircularProgress size="20px" sx={{ color: '#f2b157' }} />
                </Box>
              ) : ("Submit")}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CheckOut;