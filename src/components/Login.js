import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Use API Gateway URL for authentication
    const baseUrl = "https://oqlkiz04je.execute-api.us-east-1.amazonaws.com/prod/auth";

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage(""); // Clear previous messages

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
                localStorage.setItem("userId", username); // Cognito does not return the username

                // Update authentication state in App.js
                onLogin(data.AccessToken, data.IdToken, username);

                // Navigate to home after successful login
                navigate("/home");
            } else {
                setMessage(data.error || "Login failed");
            }
        } catch (error) {
            setMessage("Login failed: " + error.message);
        }
    };

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