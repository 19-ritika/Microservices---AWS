import React, { useState, useEffect } from 'react';
import './VehicleForm.css';

const VehicleForm = () => {
    const [registrationNumber, setRegistrationNumber] = useState('');
    const [vehicleDetails, setVehicleDetails] = useState(null);
    const [insuranceType, setInsuranceType] = useState('Standard');
    const [price, setPrice] = useState(100);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [convertedPrice, setConvertedPrice] = useState(price);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [currencyRates, setCurrencyRates] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [messageType, setMessageType] = useState('');

    useEffect(() => {
        fetch('https://api.exchangerate-api.com/v4/latest/USD')
            .then(response => response.json())
            .then(data => setCurrencyRates(data.rates))
            .catch(() => setError('Failed to fetch currency rates'));
    }, []);

    const handleInputChange = (event) => {
        setRegistrationNumber(event.target.value);
    };

    const handleInsuranceChange = (event) => {
        const selectedInsurance = event.target.value;
        setInsuranceType(selectedInsurance);
        setPrice(selectedInsurance === 'Premium' ? 200 : 100);
    };

    const handleCurrencyChange = (event) => {
        setSelectedCurrency(event.target.value);
    };

    const convertPrice = (price, currency) => {
        const rate = currencyRates[currency];
        return rate ? (price * rate).toFixed(2) : price;
    };

    useEffect(() => {
        if (currencyRates[selectedCurrency]) {
            setConvertedPrice(convertPrice(price, selectedCurrency));
        }
    }, [price, selectedCurrency, currencyRates]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitted) return;
        setError('');
        setVehicleDetails(null);
        setMessage('');
        setMessageType('');
    
        try {
            const vehicleApi = fetch(`https://djl0ckzei0.execute-api.us-east-1.amazonaws.com/prod1/vehicle?registration_number=${registrationNumber}`)
                .then(response => response.json());
            const serviceApi = fetch(`https://74k7bhila7.execute-api.us-east-1.amazonaws.com/prod/service?registration_number=${registrationNumber}`)
                .then(response => response.json());
    
            const [vehicleData, serviceData] = await Promise.all([vehicleApi, serviceApi]);
    
            // Ensure service data fields are correctly set
            const updatedServiceData = {
                service_date: serviceData.service_date && serviceData.service_date !== "no_data_available" ? serviceData.service_date : "Not Available",
                service_type: serviceData.service_type && serviceData.service_type !== "no_data_available" ? serviceData.service_type : "Not Available",
            };
    
            setVehicleDetails({ ...vehicleData, ...updatedServiceData });
            setIsSubmitted(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFinalSubmit = async () => {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            setMessage("User is not logged in. Please log in first.");
            setMessageType('error');
            return;
        }

        const vehicleData = {
            userId,
            registrationNumber,
            make: vehicleDetails?.make,
            model: vehicleDetails?.model,
            serviceDate: vehicleDetails?.service_date,
            insuranceType,
            price: convertedPrice
        };

        try {
            const response = await fetch("https://jw6w6mqhob.execute-api.us-east-1.amazonaws.com/prod/vehicle", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body: JSON.stringify(vehicleData) })
            });

            const result = await response.json();
            const responseBody = JSON.parse(result.body);

            setMessage(responseBody.message || "Unexpected response from server");
            setMessageType(responseBody.statusCode === 200 ? 'success' : 'error');

            if (responseBody.message === "Insurance data saved successfully! Redirecting to Policies in 3 seconds ...") {
                setTimeout(() => {
                    window.location.href = '/policies';
                }, 3000);
            }
        } catch (err) {
            setMessage(`Error: ${err.message}`);
            setMessageType('error');
        }
    };

    return (
        <div className="container">
            <div className="form-section">
                <h2>Enter Vehicle Registration Number</h2>
                <form onSubmit={handleSubmit}>
                    <div className="registration-container">
                        <input
                            type="text"
                            placeholder="Registration Number"
                            value={registrationNumber}
                            onChange={handleInputChange}
                            required
                        />
                        <button type="submit" disabled={isSubmitted}>Get</button>
                    </div>
                </form>
                {error && <p className="error-message">{error}</p>}
                {vehicleDetails && (
                    <form className="expanded-form">
                        <div>
                            <label>Make</label>
                            <input 
                                type="text" 
                                value={vehicleDetails.make || ''} 
                                onChange={(e) => setVehicleDetails({...vehicleDetails, make: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label>Model</label>
                            <input 
                                type="text" 
                                value={vehicleDetails.model || ''} 
                                onChange={(e) => setVehicleDetails({...vehicleDetails, model: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label>Registration Date</label>
                            <input 
                                type="text" 
                                value={vehicleDetails.registration_date || ''} 
                                placeholder="YYYY-MM-DD"
                                onChange={(e) => setVehicleDetails({...vehicleDetails, registration_date: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label>Registration Number</label>
                            <input 
                                type="text" 
                                value={vehicleDetails.registration_number || ''} 
                                onChange={(e) => setVehicleDetails({...vehicleDetails, registration_number: e.target.value})} 
                            />
                        </div>
                        <div>
                            <label>Service Date</label>
                            <input 
                                type="text" 
                                value={vehicleDetails.service_date === "no_data_available" ? "Not Available" : vehicleDetails.service_date} 
                                disabled 
                            />
                        </div>
                        <div>
                            <label>Service Type</label>
                            <input 
                                type="text" 
                                value={vehicleDetails.service_type || "Not Available"} 
                                disabled 
                            />
                        </div>
                        <div>
                            <label style={{ color: 'red' }}>Select Insurance:</label>
                            <select value={insuranceType} onChange={handleInsuranceChange}>
                                <option value="Standard">Standard</option>
                                <option value="Premium">Premium</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ color: 'red' }}>Price:</label>
                            <p>{`${convertedPrice} ${selectedCurrency}`}</p>
                        </div>
                        <div>
                            <label>Select Currency:</label>
                            <select value={selectedCurrency} onChange={handleCurrencyChange}>
                                {Object.keys(currencyRates).map(currency => (
                                    <option key={currency} value={currency}>{currency}</option>
                                ))}
                            </select>
                        </div>
                        <button type="button" onClick={handleFinalSubmit}>Submit</button>
                        {message && (
                            <p className={`response-message ${messageType === 'error' ? 'error' : 'success'}`}>
                                {message}
                            </p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};

export default VehicleForm;
