import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

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
