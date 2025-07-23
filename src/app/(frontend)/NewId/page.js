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
  const [isEditMode, setIsEditMode] = useState(false);
  const [userDetailsLoaded, setUserDetailsLoaded] = useState(false);
  const [cmsIdError, setCmsIdError] = useState('');
  
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
    {value:'CLI',label:'CLI'},
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
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Function to check if CMS ID exists and fetch existing data
  const checkAndFetchCrewData = async (cmsId) => {
    if (cmsId.trim()) {
      try {
        setFetching(true);
        const response = await fetch(`/api/crew/check/${cmsId}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.exists) {
            // If crew exists, fetch their details for editing
            const detailsResponse = await fetch(`/api/crew/${cmsId}`);
            if (detailsResponse.ok) {
              const crewDetails = await detailsResponse.json();
              console.log('Crew details:', crewDetails);
              setFormData({
                cmsid: cmsId,
                name: crewDetails.name || '',
                design: crewDetails.design || '',
                hq: crewDetails.hq || ''
              });
              setIsEditMode(true);
              setUserDetailsLoaded(true);
              setSubmitMessage('Crew found! You can now update their details.');
              setError(false);
            }
          } else {
            // New crew member
            setIsEditMode(false);
            setUserDetailsLoaded(false);
            setSubmitMessage('New crew member - fill in the details below.');
            setError(false);
          }
        }
      } catch (err) {
        console.error('Error checking CMS ID:', err);
        setError(true);
        setSubmitMessage('Error checking CMS ID. Please try again.');
      } finally {
        setFetching(false);
      }
    } else {
      // Reset form if CMS ID is empty
      setIsEditMode(false);
      setUserDetailsLoaded(false);
      setSubmitMessage('');
      setError(false);
    }
  };

  // Handle CMS ID input change (without auto-search)
  const handleCmsIdChange = (e) => {
    const { value } = e.target;
    const uppercaseValue = value.toUpperCase();
    
    setFormData(prev => ({
      ...prev,
      cmsid: uppercaseValue
    }));
    
    // If CMS ID changes, reset other fields and states
    if (uppercaseValue !== formData.cmsid) {
      setFormData(prev => ({
        cmsid: uppercaseValue,
        name: '',
        design: '',
        hq: ''
      }));
      setUserDetailsLoaded(false);
      setIsEditMode(false);
      setSubmitMessage('');
      setError(false);
    }
  };

  // Handle search button click
  const handleSearchClick = () => {
    if (formData.cmsid.trim()) {
      checkAndFetchCrewData(formData.cmsid.trim());
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

      const url = isEditMode ? `/api/crew/${formData.cmsid}` : '/api/crew';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'add'} crew data`);
      }

      const result = await response.json();
      setSubmitMessage(result.message || `Crew data ${isEditMode ? 'updated' : 'added'} successfully!`);
      setError(false);

      // Don't reset form after successful update, only after new addition
      if (!isEditMode) {
        setFormData({
          cmsid: '',
          name: '',
          design: '',
          hq: ''
        });
        setUserDetailsLoaded(false);
      }

    } catch (err) {
      console.error('Error submitting form:', err);
      setError(true);
      setSubmitMessage(`Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      cmsid: '',
      name: '',
      design: '',
      hq: ''
    });
    setIsEditMode(false);
    setUserDetailsLoaded(false);
    setSubmitMessage('');
    setError(false);
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
      <h1 className="checkin-form-name">
        {isEditMode ? 'Edit Crew Details' : 'Add Crew Form'}
      </h1>
      <div className="form-block">
        <form onSubmit={handleSubmit} className='check-form'>
          <div className="right-block">
            <div className="form-field">
              <label htmlFor="cmsid" className="label">CMS Id:</label>
              <div className="input-with-button">
                <input 
                  type="text" 
                  name="cmsid" 
                  value={formData.cmsid} 
                  onChange={handleCmsIdChange} 
                  className="input-text"
                  placeholder="Enter CMS ID"
                  required
                />
                <button 
                  type="button" 
                  onClick={handleSearchClick}
                  className="search-button"
                  disabled={!formData.cmsid.trim() || fetching}
                >
                  {fetching ? 'Searching...' : 'Search'}
                </button>
              </div>
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
              {submitting ? 'Submitting...' : (isEditMode ? 'Update Crew' : 'Add Crew')}
            </button>
            {(isEditMode || formData.cmsid) && (
              <button 
                type="button" 
                className="resetButton" 
                onClick={resetForm}
                style={{ marginLeft: '10px' }}
              >
                Reset Form
              </button>
            )}
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