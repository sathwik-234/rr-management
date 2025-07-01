'use client';
import React, { useState, useEffect } from 'react';
import { Download, Calendar, FileText, Users, Clock } from 'lucide-react';

const MealReportsPage = () => {
  const [crew, setCrew] = useState([]);
  const [tokensData, setTokensData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportStats, setReportStats] = useState({
    totalTokens: 0,
    breakfast: 0,
    lunch: 0,
    dinner: 0,
    parcel: 0
  });

  // API Configuration - Update these URLs to match your API endpoints

  const API_ENDPOINTS = {
    crew: `/api/user`,
    tokens: `/api/tokens`
  };

  // Fetch data from API endpoints
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch crew data from API
      const crewResponse = await fetch(API_ENDPOINTS.crew, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${your_token_here}`
        }
      });

      if (!crewResponse.ok) {
        throw new Error(`Failed to fetch crew data: ${crewResponse.status} ${crewResponse.statusText}`);
      }

      const crewData = await crewResponse.json();

      // Fetch tokens data from API
      const tokensResponse = await fetch(API_ENDPOINTS.tokens, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${your_token_here}`
        }
      });

      if (!tokensResponse.ok) {
        throw new Error(`Failed to fetch tokens data: ${tokensResponse.status} ${tokensResponse.statusText}`);
      }

      const tokensData = await tokensResponse.json();

      // Sort tokens data by date (descending) - equivalent to Supabase .order('date', { ascending: false })
      const sortedTokensData = tokensData.data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setCrew(crewData || []);
      setTokensData(sortedTokensData || []);
      setFilteredData(sortedTokensData || []);
      calculateStats(sortedTokensData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Alternative API call with query parameters for filtered data
  const fetchFilteredTokens = async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.mealType && filters.mealType !== 'all') queryParams.append('mealType', filters.mealType);
      
      const url = `${API_ENDPOINTS.tokens}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${your_token_here}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch filtered tokens: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.data.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (err) {
      console.error('Error fetching filtered data:', err);
      throw err;
    }
  };

  const calculateStats = (data) => {
    const stats = {
      totalTokens: data.length,
      breakfast: data.filter(item => item.meal_type === 'Breakfast').length,
      lunch: data.filter(item => item.meal_type === 'Lunch').length,
      dinner: data.filter(item => item.meal_type === 'Dinner').length,
      parcel: data.filter(item => item.meal_type === 'Parcel').length
    };
    setReportStats(stats);
  };

  const filterData = async () => {
    try {
      setLoading(true);
      
      // Option 1: Use server-side filtering with API parameters
      const filters = {
        startDate,
        endDate,
        mealType: selectedMealType
      };
      
      const filteredTokens = await fetchFilteredTokens(filters);
      setFilteredData(filteredTokens);
      calculateStats(filteredTokens);
      
      // Option 2: Client-side filtering (uncomment if you prefer this approach)
      
      let filtered = tokensData;

      // Filter by date range
      if (startDate) {
        filtered = filtered.filter(item => item.date >= startDate);
      }
      if (endDate) {
        filtered = filtered.filter(item => item.date <= endDate);
      }

      // Filter by meal type
      if (selectedMealType !== 'all') {
        filtered = filtered.filter(item => item.meal_type === selectedMealType);
      }

      setFilteredData(filtered);
      calculateStats(filtered);
      
    } catch (err) {
      console.error('Error filtering data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedMealType('all');
    setFilteredData(tokensData);
    calculateStats(tokensData);
  };

  const getCrewMember = (cmsId) => {
    const member = crew.data.find(c => c.cms_id === cmsId);
    return member || { name: 'Unknown Driver', hq: 'N/A', designation: 'N/A' };
  };

  const generateCSV = () => {
    const headers = ['Token ID', 'CMS ID', 'Driver Name', 'HQ', 'Designation', 'Meal Type', 'Date', 'Time'];
    const csvData = filteredData.map(item => {
      const crewMember = getCrewMember(item.cms_id);
      return [
        item.token_no || item.id,
        item.cms_id,
        crewMember.name,
        crewMember.hq,
        crewMember.designation,
        item.meal_type,
        item.created_at.split('T')[0],
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `meal_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generatePDF = () => {
    const printWindow = window.open('', '_blank');
    const dateRange = startDate && endDate ? `${startDate} to ${endDate}` : 'All Dates';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Meal Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat-box { text-align: center; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .summary { margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Meal Report</h1>
          <p>Report Period: ${dateRange}</p>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="stats">
          <div class="stat-box">
            <h3>${reportStats.totalTokens}</h3>
            <p>Total Tokens</p>
          </div>
          <div class="stat-box">
            <h3>${reportStats.breakfast}</h3>
            <p>Breakfast</p>
          </div>
          <div class="stat-box">
            <h3>${reportStats.lunch}</h3>
            <p>Lunch</p>
          </div>
          <div class="stat-box">
            <h3>${reportStats.dinner}</h3>
            <p>Dinner</p>
          </div>
          <div class="stat-box">
            <h3>${reportStats.parcel}</h3>
            <p>Parcel</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Token ID</th>
              <th>CMS ID</th>
              <th>Driver Name</th>
              <th>HQ</th>
              <th>Designation</th>
              <th>Meal Type</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(item => {
              const crewMember = getCrewMember(item.cms_id);
              return `
                <tr>
                  <td>${item.token_no || item.id}</td>
                  <td>${item.cms_id}</td>
                  <td>${crewMember.name}</td>
                  <td>${crewMember.hq}</td>
                  <td>${crewMember.designation}</td>
                  <td>${item.meal_type}</td>
                  <td>${item.created_at.split('T')[0]}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem 0'
    },
    wrapper: {
      maxWidth: '80rem',
      margin: '0 auto',
      padding: '0 1rem'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    },
    header: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    headerContent: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    title: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0
    },
    subtitle: {
      color: '#6b7280',
      marginTop: '0.25rem'
    },
    filtersSection: {
      padding: '1.5rem',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
      alignItems: 'end'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      color: '#374151',
      marginBottom: '0.5rem'
    },
    input: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '0.875rem',
      outline: 'none',
      transition: 'border-color 0.2s',
      boxSizing: 'border-box'
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'end'
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    primaryButton: {
      backgroundColor: '#2563eb',
      color: 'white'
    },
    secondaryButton: {
      backgroundColor: '#4b5563',
      color: 'white'
    },
    statsSection: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    statsTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '1rem'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem'
    },
    statCard: {
      padding: '1rem',
      borderRadius: '8px',
      textAlign: 'center'
    },
    statNumber: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.25rem'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    downloadSection: {
      padding: '1.5rem',
      borderBottom: '1px solid #e5e7eb'
    },
    downloadHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    },
    downloadButtons: {
      display: 'flex',
      gap: '0.75rem'
    },
    downloadButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'background-color 0.2s'
    },
    csvButton: {
      backgroundColor: '#059669',
      color: 'white'
    },
    pdfButton: {
      backgroundColor: '#dc2626',
      color: 'white'
    },
    tableSection: {
      padding: '1.5rem'
    },
    tableHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '1rem'
    },
    tableTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      color: '#111827'
    },
    recordCount: {
      fontSize: '0.875rem',
      color: '#6b7280'
    },
    tableWrapper: {
      overflowX: 'auto'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.875rem'
    },
    th: {
      backgroundColor: '#f9fafb',
      padding: '0.75rem 1.5rem',
      textAlign: 'left',
      fontSize: '0.75rem',
      fontWeight: '500',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      borderBottom: '1px solid #e5e7eb'
    },
    td: {
      padding: '1rem 1.5rem',
      borderBottom: '1px solid #e5e7eb',
      color: '#111827'
    },
    tr: {
      transition: 'background-color 0.2s'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.5rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      borderRadius: '9999px'
    },
    iconText: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    emptyState: {
      textAlign: 'center',
      padding: '3rem',
      color: '#6b7280'
    }
  };

  const getBadgeStyle = (mealType) => {
    const baseStyle = { ...styles.badge };
    switch (mealType) {
      case 'Breakfast':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#166534' };
      case 'Lunch':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#92400e' };
      case 'Dinner':
        return { ...baseStyle, backgroundColor: '#fed7aa', color: '#9a3412' };
      default:
        return { ...baseStyle, backgroundColor: '#e9d5ff', color: '#7c3aed' };
    }
  };

  const getStatCardStyle = (type) => {
    const baseStyle = { ...styles.statCard };
    switch (type) {
      case 'total':
        return { ...baseStyle, backgroundColor: '#dbeafe', color: '#2563eb' };
      case 'breakfast':
        return { ...baseStyle, backgroundColor: '#dcfce7', color: '#059669' };
      case 'lunch':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#d97706' };
      case 'dinner':
        return { ...baseStyle, backgroundColor: '#fed7aa', color: '#ea580c' };
      case 'parcel':
        return { ...baseStyle, backgroundColor: '#e9d5ff', color: '#7c3aed' };
      default:
        return baseStyle;
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.wrapper}>
          <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.headerContent}>
              <div>
                <h1 style={styles.title}>
                  <FileText size={24} color="#2563eb" />
                  Meal Reports Generator
                </h1>
                <p style={styles.subtitle}>Generate comprehensive meal reports with date filtering</p>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div style={styles.filtersSection}>
            <div style={styles.filtersGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <Calendar size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Meal Type</label>
                <select
                  value={selectedMealType}
                  onChange={(e) => setSelectedMealType(e.target.value)}
                  style={styles.input}
                >
                  <option value="all">All Meals</option>
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Parcel">Parcel</option>
                </select>
              </div>

              <div style={styles.buttonGroup}>
                <button
                  onClick={filterData}
                  style={{ ...styles.button, ...styles.primaryButton }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Apply Filters
                </button>
                <button
                  onClick={resetFilters}
                  style={{ ...styles.button, ...styles.secondaryButton }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#374151'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#4b5563'}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div style={styles.statsSection}>
            <h2 style={styles.statsTitle}>Report Statistics</h2>
            <div style={styles.statsGrid}>
              <div style={getStatCardStyle('total')}>
                <div style={styles.statNumber}>{reportStats.totalTokens}</div>
                <div style={styles.statLabel}>Total Tokens</div>
              </div>
              <div style={getStatCardStyle('breakfast')}>
                <div style={styles.statNumber}>{reportStats.breakfast}</div>
                <div style={styles.statLabel}>Breakfast</div>
              </div>
              <div style={getStatCardStyle('lunch')}>
                <div style={styles.statNumber}>{reportStats.lunch}</div>
                <div style={styles.statLabel}>Lunch</div>
              </div>
              <div style={getStatCardStyle('dinner')}>
                <div style={styles.statNumber}>{reportStats.dinner}</div>
                <div style={styles.statLabel}>Dinner</div>
              </div>
              <div style={getStatCardStyle('parcel')}>
                <div style={styles.statNumber}>{reportStats.parcel}</div>
                <div style={styles.statLabel}>Parcel</div>
              </div>
            </div>
          </div>

          {/* Download Section */}
          <div style={styles.downloadSection}>
            <div style={styles.downloadHeader}>
              <h2 style={styles.statsTitle}>Download Report</h2>
              <div style={styles.downloadButtons}>
                <button
                  onClick={generateCSV}
                  style={{ ...styles.downloadButton, ...styles.csvButton }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#047857'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#059669'}
                >
                  <Download size={16} />
                  Download CSV
                </button>
                <button
                  onClick={generatePDF}
                  style={{ ...styles.downloadButton, ...styles.pdfButton }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                >
                  <Download size={16} />
                  Print PDF
                </button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div style={styles.tableSection}>
            <div style={styles.tableHeader}>
              <h2 style={styles.tableTitle}>Meal Records</h2>
              <div style={styles.recordCount}>
                Showing {filteredData.length} of {tokensData.length} records
              </div>
            </div>
            
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Token ID</th>
                    <th style={styles.th}>CMS ID</th>
                    <th style={styles.th}>Driver Name</th>
                    <th style={styles.th}>HQ</th>
                    <th style={styles.th}>Designation</th>
                    <th style={styles.th}>Meal Type</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => {
                    const crewMember = getCrewMember(item.cms_id);
                    return (
                      <tr 
                        key={index} 
                        style={styles.tr}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={styles.td}>
                          {item.token_no || item.id}
                        </td>
                        <td style={styles.td}>
                          {item.cms_id}
                        </td>
                        <td style={styles.td}>
                          <div style={styles.iconText}>
                            <Users size={16} color="#9ca3af" />
                            {crewMember.name}
                          </div>
                        </td>
                        <td style={styles.td}>
                          {crewMember.hq}
                        </td>
                        <td style={styles.td}>
                          {crewMember.designation}
                        </td>
                        <td style={styles.td}>
                          <span style={getBadgeStyle(item.meal_type)}>
                            {item.meal_type}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {item.created_at.split('T')[0]}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredData.length === 0 && (
              <div style={styles.emptyState}>
                <FileText size={48} color="#9ca3af" style={{ marginBottom: '1rem' }} />
                <p>No meal records found for the selected criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealReportsPage;