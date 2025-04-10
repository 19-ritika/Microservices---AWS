import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

// Main component for the home page, showing insurance purchase options
const Home = () => {
    const navigate = useNavigate();

// Renders two buttons to navigate to vehicle or travel insurance forms
    return (
        <div className="home-container">
            <button className="home-button" onClick={() => navigate('/vehicleform')}>
                Purchase Vehicle Insurance
            </button>
            <button className="home-button" onClick={() => navigate('/travelform')}>
                Purchase Travel Insurance
            </button>
        </div>
    );
};

export default Home;

