import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css'; 

// main nav bar function manages navigation links for logged-in users
const NavBar = () => {
    //check if user is logged in by checking access token in local storage
    const accessToken = localStorage.getItem('accessToken'); 
    // Builds navigation bar with links, shown only if user is logged in
    //<h1 className='h1' style={{color: 'red'}}>SafeInsure☂️</h1>
    return (
        //html component for nav bar
        <nav className="navbar">
            <h1 className='h1' >SafeInsure☂️</h1>
            <ul>
                {accessToken && (
                    <>
                        <li>
                            <Link to="/home" >Home</Link> 
                        </li>
                        <li>
                            <Link to="/policies">Vehicle Policies</Link> 
                        </li>
                        <li>
                            <Link to="/travel-policies">Travel Policies</Link> 
                        </li>
                        <li>
                            <Link to="/logout">Logout</Link> 
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default NavBar;