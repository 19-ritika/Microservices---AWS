import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

// Component manages user registration process
const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    // Use API Gateway URL for registration of new users
    const baseUrl = "https://oqlkiz04je.execute-api.us-east-1.amazonaws.com/prod/auth";

    // Handles form submission and sends registration data
    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage(""); // Clear previous messages

        try {
            const response = await fetch(baseUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    action: "register",
                    username,
                    email,
                    password,
                }),
            });

            const data = await response.json();
            setMessage(data.message || data.error);

            // If registration is successful, navigate to login page after 2 sec
            if (response.ok) {
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (error) {
            setMessage("Registration failed: " + error.message);
        }
    };

    // Shows registration form with fields and feedback
    return (
        <div className="register">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Register</button>
            </form>
            {message && <p>{message}</p>}
            <p>
                Already a user? <a href="/login">Login</a>
            </p>
        </div>
    );
};

export default Register;