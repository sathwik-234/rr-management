"use client";
import React, { useEffect, useMemo, useState } from 'react';
import "./form1.css"
import { useRouter } from 'next/navigation';
import { useEmail } from '@/app/contexts/EmailContext';
import { signout } from '@/utils/actions';
import { Box, CircularProgress } from '@mui/material';

function CheckIn() {
    const nav = useRouter();
    
    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const offset = d.getTimezoneOffset() * 60000; // Offset in milliseconds
        const localDate = new Date(d - offset); // Adjust to local timezone
        return localDate.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:mm
    };

    const [formData, setFormData] = useState({
        cmsid: '',
        name: '',
        design: '',
        hq: '',
        icTrainNo: '',
        icTime: formatDate(new Date()),
        bedSheets: 2,
        pillowCover: 1,
        blanket: 1,
        allottedBed: '',
        arrTime : ''
    });

    const [user,setUser] = useState(null);
    const [error,setError] = useState(null);
    const [loading,setLoading] = useState(false);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [verified,setVerified] = useState(false);
    const [userDetailsLoaded, setUserDetailsLoaded] = useState(false);
    const [cmsIdError, setCmsIdError] = useState('');
    const [fetchButtonLoading, setFetchButtonLoading] = useState(false);

    const [refreshKey, setRefreshKey] = useState(0);

    const [roomidOptions, setRoomidOptions] = useState([
        { value: '', label: 'Select Room', id: '' },
    ]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'cmsid') {
            const uppercaseValue = value.toUpperCase();
            setFormData((prevData) => ({ ...prevData, [name]: uppercaseValue }));
            
            // Clear previous user details when CMS ID changes
            if (uppercaseValue !== formData.cmsid) {
                setFormData((prevData) => ({
                    ...prevData,
                    cmsid: uppercaseValue,
                    name: '',
                    design: '',
                    hq: ''
                }));
                setUserDetailsLoaded(false);
                setCmsIdError('');
            }
            
            // Validate CMS ID length
            if (uppercaseValue.length > 8) {
                setCmsIdError('CMS ID must be exactly 8 characters');
            } else {
                setCmsIdError('');
            }
            return;
        }

        if (['bedSheets', 'pillowCover', 'blanket'].includes(name) && value < 0) {
            alert('Value cannot be negative');
            return;
        }
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const fetchUserDetails = async (cmsId = formData.cmsid) => {
        if (!cmsId || cmsId.length === 0) {
            setCmsIdError('Please enter a CMS ID');
            return;
        }
        
        setFetchButtonLoading(true);
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
            
            const data = await response.json();
            setFormData((prevData) => ({
                ...prevData,
                name: data.data.crewname || '',
                design: data.data.designation || '',
                hq: data.data.hq || '',
            }));
            setUserDetailsLoaded(true);
            
        } catch (error) {
            console.error('Error fetching user details:', error);
            setCmsIdError('Error fetching user details');
            setUserDetailsLoaded(false);
        } finally {
            setFetchButtonLoading(false);
        }
    };

    const handleFetchButtonClick = () => {
        fetchUserDetails();
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!formData.cmsid) return;
            
            try {
                const response = await fetch(`api/CheckInSubmit/${formData.cmsid}`);
                if (!response.ok) throw new Error(`Error fetching cms data: ${response.statusText}`);
    
                const check_in_data = await response.json();
                
                if (!check_in_data.data || check_in_data.data.length === 0) {
                    // If no check-in data, treat the user as new
                    console.log("New User (No check-in data)");
                    setVerified(true);
                    return;
                }
    
                const res = await fetch(`api/rooms/${check_in_data.data[0].allotted_bed}`);
                if (!res.ok) throw new Error(`Error fetching room data: ${res.statusText}`);
    
                const roomData = await res.json();
                if (roomData.data[0].allotted_to === formData.cmsid) {
                    console.log("Already checked in");
                    setVerified(false);
                    alert("Already checked in");
                    nav.push("/");
                } else if (roomData.data[0].allotted_bed !== formData.cmsid) {
                    console.log("New User");
                    setVerified(true);
                } else {
                    setVerified(true);
                }
                console.log(verified);
            } catch (error) {
                console.error(error.message);
            }
        };
    
        if (formData.cmsid && userDetailsLoaded) {
            fetchData();
        }
    }, [formData.cmsid, userDetailsLoaded]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        
        // Validate user details are loaded
        if (!userDetailsLoaded) {
            alert('Please enter a valid CMS ID to load user details');
            return;
        }
        
        setButtonDisabled(true);
        console.log(verified)
        
        if(new Date(formData.arrTime) > new Date(formData.icTime)){
            alert("VZM arrival time is greater than Running Room Arrival Time")
            document.getElementById("arrTime").value = ""
            setFormData((prevdata)=>(
                {
                    ...prevdata,
                    arrTime : ""
                }
            ))
            setButtonDisabled(false)
            return
        }
        
        try {
            if (verified) {
                // First request to submit the form data
                const response = await fetch('/api/CheckInSubmit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });
    
                // Second request to update room status
                const resp = await fetch(`/api/rooms/${formData.allottedBed}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: 'TRUE', allotted_to: formData.cmsid }),
                });
    
                // Awaiting both responses
                const result1 = await response.json();
                const result2 = await resp.json();
    
                if (response.ok && resp.ok) {
                    console.log('Form submitted successfully:', result1);
                    setRefreshKey((prev) => prev + 1);
                    alert('Check-in successful!');
                } else {
                    const errorMessage = response.ok ? result2.error.message : result1.error.message;
                    console.error('Error submitting form:', errorMessage);
                    alert(`Error: ${errorMessage || 'Unexpected error'}`);
                }
            }
        } catch (err) {
            console.error('Error during form submission:', err);
            alert('An unexpected error occurred.');
        } finally {
            // Reset form data and re-enable button
            setFormData({
                cmsid: '',
                name: '',
                design: '',
                hq: '',
                icTrainNo: '',
                icTime: formatDate(new Date()),
                bedSheets: 2,
                pillowCover: 1,
                blanket: 1,
                allottedBed: '',
                arrTime: ''
            });
            setUserDetailsLoaded(false);
            setCmsIdError('');
            setButtonDisabled(false);
            nav.push('/');
        }
    };

    useEffect(() => {
        setLoading(true);  
        
        fetch("/api/rooms")
            .then((response) => response.json())
            .then((data) => {
                const options = data.data.map((item) => ({
                    id: item.id,
                    value: item.room_no,
                    label: item.room_no,
                }));
                setRoomidOptions([{ value: '', label: 'Select Room', id: '' }, ...options]);
                setLoading(false);  
            })
            .catch((err) => {
                console.error("Error fetching Room options:", err);
                setLoading(false);
            });
    }, [refreshKey]);

    if (error) return <div className="error">An error occurred. Please try again later.</div>;

    return (
        <div className='hifi'>
            <h1 className="checkin-form-name">Check In Form</h1>
            <div className="form-block">
                <form onSubmit={handleSubmit} className='check-form'>
                    <div className="right-block">
                        <div className="form-field">
                            <label htmlFor="cmsid" className="label">CMS Id:</label>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <input 
                                        type="text" 
                                        name="cmsid" 
                                        value={formData.cmsid} 
                                        onChange={handleChange} 
                                        className="input-text"
                                        placeholder="Enter 8-character CMS ID"
                                        maxLength="8"
                                        required
                                    />
                                    {cmsIdError && <span className="error-message" style={{color: 'red', fontSize: '12px', display: 'block', marginTop: '4px'}}>{cmsIdError}</span>}
                                </div>
                                <button
                                    type="button"
                                    onClick={handleFetchButtonClick}
                                    disabled={fetchButtonLoading || !formData.cmsid}
                                    style={{
                                        padding: '8px 12px',
                                        marginLeft : '25px',
                                        backgroundColor: '#f2b157',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: fetchButtonLoading || !formData.cmsid ? 'not-allowed' : 'pointer',
                                        opacity: fetchButtonLoading || !formData.cmsid ? 0.6 : 1,
                                        minWidth: '80px',
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
                            {fetchButtonLoading && <span style={{color: '#f2b157', fontSize: '12px'}}>Loading user details...</span>}
                        </div>

                        <div className="form-field">
                            <label htmlFor="name" className="label">Name:</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="input-text bead" 
                                readOnly
                                placeholder="Name will auto-fill"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="design" className="label">Designation:</label>
                            <input 
                                type="text" 
                                name="design" 
                                value={formData.design} 
                                onChange={handleChange} 
                                className="input-text" 
                                readOnly
                                placeholder="Designation will auto-fill"
                            />
                        </div>

                        <div className="form-field">
                            <label htmlFor="hq" className="label">HeadQuarters:</label>
                            <input 
                                type="text" 
                                name="hq" 
                                value={formData.hq} 
                                onChange={handleChange} 
                                className="input-text" 
                                readOnly
                                placeholder="HQ will auto-fill"
                            />
                        </div>
                    </div>

                    <div className="left-block">
                        <div className="form-field">
                            <label htmlFor="vzm_arr_time" className="label">VZM. Arrival Time</label>
                            <input type="datetime-local" name="arrTime" value={formData.arrTime} onChange={handleChange} className="input-datetime" id='arrTime' required/>
                        </div>
                        <div className="form-field">
                            <label htmlFor="icTrainNo" className="label">Incoming Train No:</label>
                            <input type="text" name="icTrainNo" value={formData.icTrainNo} onChange={handleChange} className="input-text" required/>
                        </div>

                        <div className="form-field">
                            <label htmlFor="icTime" className="label">RuningRoom Arrival Time:</label>
                            <input type="datetime-local" name="icTime" value={formData.icTime} onChange={handleChange} className="input-datetime" required/>
                        </div>

                        <div className="form-field">
                            <label htmlFor="allottedBed" className="label">Allotted Bed:</label>
                            <select name="allottedBed" value={formData.allottedBed} onChange={handleChange} className="input-select" required>
                                {roomidOptions.map((option) => (
                                    <option key={`${option.id}-${option.value}`} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="button-div">
                        <button 
                            className="submitButton" 
                            type="submit"
                            disabled={buttonDisabled || !userDetailsLoaded }
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
        </div>
    );
}

export default CheckIn;