"use client"
import React, { useEffect, useState, useMemo } from 'react'
import "./form3.css"
import { useRouter } from 'next/navigation'
import { CircularProgress, Box } from '@mui/material';

function page() {
    const nav = useRouter();

    const [formData, setFormData] = useState({
        cmsid: '',
        name: '',
        design: '',
        hq: '',
        roomno: '',
        complaintType: '',
        description: ''
    });

    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [roomidOptions, setRoomidOptions] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);
    
    useEffect(() => {
        fetch("/api/rooms")
            .then((response) => response.json())
            .then((data) => {
                const options = data.data.map((item) => ({
                    id: item.id,
                    value: item.room_no,
                    label: item.room_no,
                }));
                setRoomidOptions([{ value: '', label: 'Select Room', id: '' }, ...options]);
            })
            .catch((err) => {
                console.error("Error fetching Room options:", err);
            });
    }, [refreshKey]);

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
                    hq: ""
                }));
                setError(null);
            }
        } else {
            setFormData((prevData) => ({ ...prevData, [name]: value }));
        }
    };

    // Fetch crew details when CMS ID is entered and is 8 characters long
    useEffect(() => {
        if (formData.cmsid && formData.cmsid.length === 8) {
            const fetchCrewDetails = async () => {
                setFetchingDetails(true);
                setError(null);
                try {
                    const res = await fetch(`/api/getCrewDetails/${formData.cmsid}`);
                    if (!res.ok) throw new Error(`Error fetching crew details: ${res.statusText}`);
                    const data = await res.json();

                    if (data?.data?.cms_id) {
                        setFormData((prevData) => ({
                            ...prevData,
                            name: data.data.crewname || '',
                            design: data.data.designation || '',
                            hq: data.data.hq || '',
                        }));
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
                        hq: ""
                    }));
                } finally {
                    setFetchingDetails(false);
                }
            };

            fetchCrewDetails();
        } else if (formData.cmsid && formData.cmsid.length < 8) {
            // Clear fields if CMS ID is less than 8 characters
            setFormData((prevData) => ({
                ...prevData,
                name: "",
                design: "",
                hq: ""
            }));
        }
    }, [formData.cmsid]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate CMS ID length
        if (formData.cmsid.length !== 8) {
            alert("CMS ID must be exactly 8 characters long.");
            return;
        }

        // Validate that all required details are loaded
        if (!formData.name || !formData.design || !formData.hq) {
            alert("Please ensure CMS ID is valid and crew details are loaded.");
            return;
        }

        setButtonDisabled(true);
        try {
            const response = await fetch('/api/complaint', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const result1 = await response.json();

            if (response.ok) {
                console.log('Form submitted successfully:', result1);
                alert('Complaint submitted successfully!');
                setRefreshKey((prev) => prev + 1);
            } else {
                console.error('Error submitting form:', result1);
                alert(`Error: ${result1.message || 'Unexpected error'}`);
            }
        } catch (err) {
            console.error('Error during form submission:', err);
            alert('An unexpected error occurred.');
        } finally {
            setFormData({
                cmsid: '',
                name: '',
                design: '',
                hq: '',
                roomno: '',
                complaintType: '',
                description: ''
            });
            setButtonDisabled(false);
            nav.push("/home");
        }
    };

    if (loading) {
        return (
            <div className="home-loading">
                <Box sx={{ display: "flex" }}>
                    <CircularProgress size="50px" sx={{ color: "#54473F" }} />
                </Box>
            </div>
        );
    }

    return (
        <>
            <h1 className="form-title">Complaint Form</h1>
            <div className="form-container">
                {error && (
                    <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px' }}>
                        <div className="error">{error}</div>
                    </div>
                )}
                <form className="form-element" onSubmit={handleSubmit}>
                    <div className="form-column-right">
                        <div className="input-group">
                            <label className='help-form-label'>CMS Id:</label>
                            <input 
                                type="text" 
                                name="cmsid" 
                                value={formData.cmsid} 
                                onChange={handleChange} 
                                className='help-form-input'
                                placeholder="Enter 8-character CMS ID"
                                maxLength={8}
                                required
                                style={{ textTransform: 'uppercase' }}
                            />
                            {fetchingDetails && (
                                <CircularProgress size="20px" sx={{ color: "#54473F", marginLeft: "10px" }} />
                            )}
                        </div>

                        <div className="input-group">
                            <label className='help-form-label'>Name:</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className='help-form-input'
                                readOnly
                                placeholder="Auto-filled from CMS ID"
                            />
                        </div>

                        <div className="input-group">
                            <label className='help-form-label'>Designation:</label>
                            <input 
                                type="text" 
                                name="design" 
                                value={formData.design} 
                                onChange={handleChange} 
                                className='help-form-input'
                                readOnly
                                placeholder="Auto-filled from CMS ID"
                            />
                        </div>

                        <div className="input-group">
                            <label className='help-form-label'>HeadQuarters:</label>
                            <input 
                                type="text" 
                                name="hq" 
                                value={formData.hq} 
                                onChange={handleChange} 
                                className='help-form-input'
                                readOnly
                                placeholder="Auto-filled from CMS ID"
                            />
                        </div>
                    </div>

                    <div className="form-column-left">
                        <div className="input-group">
                            <label className='help-form-label'>Room No.:</label>
                            <input 
                                type="text" 
                                name="roomno" 
                                value={formData.roomno} 
                                onChange={handleChange} 
                                className='help-form-room' 
                                required
                                placeholder="Enter room number"
                            />
                        </div>
                        
                        <div className="input-group">
                            <label className='help-form-label'>Nature Of Complaint:</label>
                            <select 
                                name="complaintType" 
                                value={formData.complaintType} 
                                onChange={handleChange} 
                                className="special-input" 
                                required
                            >
                                <option value="" disabled>Select a complaint type</option>
                                <option value="room not cleaned">Room Not Cleaned</option>
                                <option value="stale food served">Stale Food Served</option>
                                <option value="poor food quality in parcel">Poor Food quality in parcel</option>
                                <option value="uncomfortable in bedding">Uncomfortable in Bedding</option>
                                <option value="unclean toilets">Unclean Toilets</option>
                                <option value="no proper hospitality">No Proper Hospitality</option>
                                <option value="others">Others</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className='help-form-label'>Description:</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                maxLength={200} 
                                placeholder="Up to 200 words" 
                                className="textarea-resizable" 
                            />
                        </div>
                    </div>

                    <div className="form-button-container">
                        <button 
                            className="submit-button" 
                            type="submit"
                            disabled={buttonDisabled || !formData.name || !formData.design || !formData.hq}
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
    )
}

export default page