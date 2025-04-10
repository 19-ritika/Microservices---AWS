import React, { useState, useEffect } from 'react';
import './TravelForm.css';

// Component shows and manages user’s travel insurance policies
const TravelPolicies = () => {
    const [policies, setPolicies] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Fetches travel policies from API when component loads
    useEffect(() => {
        const userId = localStorage.getItem("userId");

        if (!userId) {
            setError('User is not logged in.');
            setLoading(false);
            return;
        }

        fetch(`https://po7t08ytm8.execute-api.us-east-1.amazonaws.com/prod/travel-policies?userId=${userId}`)
            .then(response => response.json())
            .then(data => {
                if (data.policies && data.policies.length > 0) {
                    setPolicies(data.policies);
                } else {
                    setError('No policies found.');
                }
                setLoading(false);
            })
            .catch(err => {
                setError('Failed to fetch policies.');
                setLoading(false);
            });
    }, []);

    // Deletes a policy via API and updates the list
    const handleDelete = async (insuranceId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to cancel this policy? This action cannot be undone."
        );
        
        const userId = localStorage.getItem("userId");
    
        if (!userId) {
            setError('User is not logged in.');
            return;
        }
    
        try {
            const response = await fetch(`https://446h09yp37.execute-api.us-east-1.amazonaws.com/prod/cancel-insurance-api?userId=${userId}&insuranceId=${insuranceId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            const result = await response.json();
    
            if (response.ok) {
                setPolicies(policies.filter(policy => policy.insuranceId !== insuranceId));
            } else {
                setError(result.error || 'Failed to delete policy.');
            }
        } catch (error) {
            setError('Error deleting policy.');
        }
    };

    // Function to generate CSV for a single policy and download
    const downloadCSV = (policy) => {
        const header = ["Policy ID", "Insurance Type", "Start Date", "End Date", "Price"];
        const row = [
            policy.insuranceId,
            policy.insuranceType,
            policy.startDate,
            policy.endDate,
            policy.price
        ];

        // Create CSV content
        const csvContent = [
            header.join(','), 
            row.join(',') 
        ].join('\n'); 


        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

        // Create a link for the download
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${policy.insuranceId}_policy.csv`); 
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Displays table of policies with download and cancel buttons
    return (
        <div className="container">
            {error && <p className="error-message">{error}</p>}
            {!error && policies.length > 0 && (
                <table className="policies-table">
                    <thead>
                        <tr>
                            <th>Policy ID</th>
                            <th>Insurance Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {policies.map((policy, index) => (
                            <tr key={index}>
                                <td>{policy.insuranceId}</td>
                                <td>{policy.insuranceType}</td>
                                <td>{policy.startDate}</td>
                                <td>{policy.endDate}</td>
                                <td>{policy.price}</td>
                                <td>
                                    {/* Download Button for each policy */}
                                    <button onClick={() => downloadCSV(policy)}>
                                    📥 Download
                                    </button>
                                    <span style={{ margin: "0 8px" }}></span>
                                    {/* Delete Button */}
                                    <button onClick={() => handleDelete(policy.insuranceId)}>
                                    ❌ Cancel
                                    </button>
                                    
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default TravelPolicies;
