import React, { useState, useEffect } from 'react';
import './TravelForm.css';

// Component manages travel insurance purchase process
const TravelForm = () => {
    const [username, setUsername] = useState('');
    const [tripTitle, setTripTitle] = useState('');
    const [insuranceType, setInsuranceType] = useState('Short Term');
    const [price, setPrice] = useState(100);
    const [selectedCurrency, setSelectedCurrency] = useState('USD');
    const [convertedPrice, setConvertedPrice] = useState(price);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [currencyRates, setCurrencyRates] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [messageType, setMessageType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Fetches currency rates when component loads
    useEffect(() => {
        fetch('https://api.exchangerate-api.com/v4/latest/USD')
            .then(response => response.json())
            .then(data => setCurrencyRates(data.rates))
            .catch(() => setError('Failed to fetch currency rates'));
    }, []);

    // Updates username or trip title based on input
    const handleInputChange = (event) => {
        if (event.target.name === 'username') {
            setUsername(event.target.value);
        } else {
            setTripTitle(event.target.value);
        }
    };

    // Adjusts price based on selected insurance type
    const handleInsuranceChange = (event) => {
        const selectedInsurance = event.target.value;
        setInsuranceType(selectedInsurance);
        setPrice(selectedInsurance === 'Long Term' ? 200 : 100);
    };

    // Updates selected currency for price conversion
    const handleCurrencyChange = (event) => {
        setSelectedCurrency(event.target.value);
    };

    // Converts base price to selected currency
    const convertPrice = (price, currency) => {
        const rate = currencyRates[currency];
        return rate ? (price * rate).toFixed(2) : price;
    };

    // Updates converted price when price or currency changes
    useEffect(() => {
        if (currencyRates[selectedCurrency]) {
            setConvertedPrice(convertPrice(price, selectedCurrency));
        }
    }, [price, selectedCurrency, currencyRates]);

    // Saves insurance data to API on final submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitted) return;
        setError('');
        setMessage('');
        setMessageType('');
    
        try {
            const tripData = { tripTitle, username };
    
            // Fetch trip data from the API with dynamic values from user input
            const response = await fetch(`https://1csykikez9.execute-api.us-east-1.amazonaws.com/prod/detail?userId=${username}&title=${tripTitle}`);
            const data = await response.json();
    
            if (response.ok) {
                if (data.trips && data.trips.length > 0) {
                    // Extract the first trip from the response
                    const trip = data.trips[0];
    
                    // Set the start and end dates from the API response
                    setStartDate(trip.startDate || 'Not available');
                    setEndDate(trip.endDate || 'Not available');
                    setMessage('Trip found!');
                    setIsSubmitted(true);
                } else {
                    setError('No matching trip found');
                }
            } else {
                setError(data.error || 'Failed to fetch trip details');
            }
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
    
        const tripData = {
            userId,
            username,
            tripTitle,
            insuranceType,
            price: convertedPrice,
            startDate,
            endDate
        };
    
        try {
            const response = await fetch('https://hn35z82zrb.execute-api.us-east-1.amazonaws.com/prod/travel', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(tripData)
            });
    
            const result = await response.json();
    
            if (response.ok) {
                setMessage(result.message || "Travel insurance data saved successfully! Redirecting to Policies in 3 seconds...");
                setMessageType('success');
    
                setTimeout(() => {
                    window.location.href = '/travel-policies';
                }, 3000);
            } else {
                setMessage(result.error || "Failed to save travel insurance data.");
                setMessageType('error');
            }
        } catch (err) {
            setMessage(`Error: ${err.message}`);
            setMessageType('error');
        }
    };
    
    // Displays trip form and insurance options
    return (
        <div className="container">
            <div className="form-section">
                <h2>Enter Trip Details</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-container">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={username}
                            onChange={handleInputChange}
                            required
                        />
                        <input
                            type="text"
                            name="tripTitle"
                            placeholder="Trip Title"
                            value={tripTitle}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <button type="submit" disabled={isSubmitted}>Get Trip Info</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                {message && <p className={`response-message ${messageType === 'error' ? 'error' : 'success'}`}>{message}</p>}
                {isSubmitted && (
                    <form className="expanded-form">
                        <div>
                            <label style={{ color: 'red' }}>Select Insurance Type:</label>
                            <select value={insuranceType} onChange={handleInsuranceChange}>
                                <option value="Short Term">Short Term (1 month)</option>
                                <option value="Long Term">Long Term (6 months)</option>
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

                        {/* Date Box Styling and Positioning - Separated by Line */}
                        <div className="date-box">
                            <div className="date-row">
                                <label>Start Date:</label>
                                <p>{startDate}</p>
                            </div>
                            <div className="date-row">
                                <label>End Date:</label>
                                <p>{endDate}</p>
                            </div>
                        </div>

                        <button type="button" onClick={handleFinalSubmit}>Submit</button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default TravelForm;
