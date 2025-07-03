"use client";
import React, { useState, useEffect } from "react";
import './newid.css';
import { useRouter } from "next/navigation";

const Page = () => {
  const nav = useRouter();
  const [error, setError] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  
  // Form data state
  const [formData, setFormData] = useState({
    cmsid: '',
    name: '',
    design: '',
    hq: ''
  });

  // Dropdown options
  const designationOptions = [
    { value: '', label: 'Select Designation' },
    { value: 'LPM', label: 'LPM' },
    { value: 'LPP', label: 'LPP' },
    { value: 'LPG', label: 'LPG' },
    { value: 'SALP', label: 'SALP' },
    { value: 'ALP', label: 'ALP' },
    { value: 'GTMR', label: 'GTMR' },
    { value: 'PTMR', label: 'PTMR' },
    { value: 'METMR', label: 'METMR' },
  ];

  const headquartersOptions = [
    { value: '', label: 'Select Headquarters' },
    { value: 'VSKP', label: 'VSKP' },
    { value: 'MIPM', label: 'MIPM' },
    { value: 'MGPV', label: 'MGPV' },
    { value: 'SCMN', label: 'SCMN' },
    { value: 'VZM', label: 'VZM' },
    { value: 'RGDA', label: 'RGDA' },
    { value: 'KUR', label: 'KUR' },
  ];

  // Handle input changes
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

        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

  // Function to check if CMS ID exists in database
  const checkCmsIdExists = async (cmsId) => {
    if (cmsId.length === 8) {
      try {
        setFetching(true);
        const response = await fetch(`/api/crew/check/${cmsId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            setError(true);
            setSubmitMessage('CMS ID already exists in database!');
            return true;
          } else {
            setError(false);
            setSubmitMessage('');
            return false;
          }
        }
      } catch (err) {
        console.error('Error checking CMS ID:', err);
      } finally {
        setFetching(false);
      }
    }
    return false;
  };

  // Handle CMS ID input change with existence check
  const handleCmsIdChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      cmsid: value
    }));
    
    // Check if CMS ID exists when it reaches 8 characters
    if (value.length <= 8) {
      checkCmsIdExists(value);
    } else {
      setError(false);
      setSubmitMessage('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    setSubmitMessage('');

    try {
      // Validate required fields
      if (!formData.cmsid || !formData.name || !formData.design || !formData.hq) {
        throw new Error('Please fill in all required fields');
      }

      // Check if CMS ID already exists before submitting
      const existsCheck = await checkCmsIdExists(formData.cmsid);
      if (existsCheck) {
        throw new Error('CMS ID already exists in database!');
      }

      const response = await fetch('/api/crew', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit crew data');
      }

      const result = await response.json();
      setSubmitMessage(result.message || 'Crew data submitted successfully!');

      // Reset form after successful submission
      setFormData({
        cmsid: '',
        name: '',
        design: '',
        hq: ''
      });

    } catch (err) {
      console.error('Error submitting form:', err);
      setError(true);
      setSubmitMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    // Initial loading simulation
    setFetching(true);
    setTimeout(() => {
      setFetching(false);
    }, 1000);
  }, []);

  if (fetching && !formData.cmsid) return <div className="loading">Loading...</div>;
  if (error && !submitMessage) return <div className="error">An error occurred. Please try again later.</div>;

  return (
    <div className='hifi'>
      <h1 className="checkin-form-name">Add Crew Form</h1>
      <div className="form-block">
        <form onSubmit={handleSubmit} className='check-form'>
          <div className="right-block">
            <div className="form-field">
              <label htmlFor="cmsid" className="label">CMS Id:</label>
                  <input 
                    type="text" 
                    name="cmsid" 
                    value={formData.cmsid} 
                    onChange={handleCmsIdChange} 
                    className="input-text"
                    placeholder="Enter 8-character CMS ID"
                    maxLength="8"
                    
                    required
                  />
            </div>

            <div className="form-field">
              <label htmlFor="name" className="label">Name:</label>
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                className="input-text bead" 
                placeholder="Enter crew name"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="design" className="label">Designation:</label>
              <select 
                name="design" 
                value={formData.design} 
                onChange={handleChange} 
                className="input-text" 
                required
              >
                {designationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="hq" className="label">HeadQuarters:</label>
              <select 
                name="hq" 
                value={formData.hq} 
                onChange={handleChange} 
                className="input-text" 
                required
              >
                {headquartersOptions.map(option => (
                  <option key={option.value} value={option.value}>
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
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>

        {submitMessage && (
          <div className={`message ${error ? 'error' : 'success'}`}>
            {submitMessage}
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;