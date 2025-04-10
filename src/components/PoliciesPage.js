import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./PoliciesPage.css";

// Component displays and manages user's vehicle insurance policies
const PoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState("");

  // Fetches policies from API when component loads, using user ID
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");

    if (!storedUserId) {
      setError("User not logged in. Please log in first.");
      setLoading(false);
      return;
    }

    setUserId(storedUserId);

    // Calls API to get vehicle policies for the user
    const fetchPolicies = async () => {
      try {
        const response = await fetch(
          `https://jw6w6mqhob.execute-api.us-east-1.amazonaws.com/prod/vehicle?userId=${encodeURIComponent(
            storedUserId
          )}`
        );

        if (response.status === 404) {
          setPolicies([]);
          setLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch policies");
        }

        const data = await response.json();
        setPolicies(data);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  // Creates and downloads a PDF with policy details
  const handleDownloadPDF = (policy) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Insurance Policy Details", 20, 20);

    autoTable(doc, {
      startY: 30,
      head: [["Field", "Value"]],
      body: [
        ["User ID", userId],
        ["Insurance ID", policy.insuranceId],
        ["Registration Number", policy.registrationNumber],
        ["Make", policy.make],
        ["Model", policy.model],
        ["Insurance Type", policy.insuranceType],
        ["Price", policy.price],
        ["Expiry Date", policy.expiryDate],
      ],
    });

    doc.save(`Policy_${policy.insuranceId}.pdf`);
  };

  // Cancels a policy via API call and updates the list
  const handleCancelPolicy = async (insuranceId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to cancel this policy? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `https://9bhvx8qj55.execute-api.us-east-1.amazonaws.com/prod/delete-car-insurance?userId=${encodeURIComponent(
          userId
        )}&insuranceId=${encodeURIComponent(insuranceId)}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to cancel the insurance policy");
      }

      setPolicies((prevPolicies) =>
        prevPolicies.filter((policy) => policy.insuranceId !== insuranceId)
      );
    } catch (error) {
      setError(error.message || "Something went wrong");
    }
  };

  // Shows loading message while fetching data
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Builds table to show policies with download and cancel options
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Insurance ID</th>
            <th>Registration Number</th>
            <th>Make</th>
            <th>Model</th>
            <th>Insurance Type</th>
            <th>Price</th>
            <th>Expiry Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {policies.length > 0 ? (
            policies.map((policy, index) => (
              <tr key={index}>
                <td>{policy.insuranceId.substring(0, 6)}</td>
                <td>{policy.registrationNumber}</td>
                <td>{policy.make}</td>
                <td>{policy.model}</td>
                <td>{policy.insuranceType}</td>
                <td>{policy.price}</td>
                <td>{policy.expiryDate}</td>
                <td>
                  <button className="download-btn" onClick={() => handleDownloadPDF(policy)}>
                    📥 Download
                  </button>
                  <span style={{ margin: "0 8px" }}></span>
                  <button className="cancel-btn" onClick={() => handleCancelPolicy(policy.insuranceId)}>
                    ❌ Cancel
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8">No policies found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PoliciesPage;
