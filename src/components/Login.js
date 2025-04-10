import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

// Login component handles user authentication and navigation
const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // API Gateway endpoint for Cognito authentication
    const baseUrl = "https://oqlkiz04je.execute-api.us-east-1.amazonaws.com/prod/auth";

    // Handles form submission, sends login request, and manages auth state
    const handleLogin = async (e) => {
        e.preventDefault();
        // Clears any old error messages
        setMessage(""); 

        try {
            const response = await fetch(baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "login",
                    username,
                    password,
                }),
            });

            const data = await response.json();
            if (response.ok) {
                // Save tokens and username in local storage
                localStorage.setItem("accessToken", data.AccessToken);
                localStorage.setItem("idToken", data.IdToken);
                // Cognito does not return the username
                localStorage.setItem("userId", username); 

                // Updates parent component’s auth state via callback
                onLogin(data.AccessToken, data.IdToken, username);

                // Redirects to home page on successful login
                navigate("/home");
            } else {
                setMessage(data.error || "Login failed");
            }
        } catch (error) {
            setMessage("Login failed: " + error.message);
        }
    };
    // Renders the login form with input fields and error messaging
    return (
        <div className="login">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {message && <p className="error-message">{message}</p>}
            <p>
                <a href="/forgot-password">Forgot Password?</a>
            </p>
            <p>
                Don't have an account? <a href="/register">Register</a>
            </p>
        </div>
    );
};

export default Login;