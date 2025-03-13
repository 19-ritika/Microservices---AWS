import React, { useState } from "react";
import "./ResetPassword.css";

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [otpSent, setOtpSent] = useState(false);

    // API Gateway Base URL (Verify if /auth is correct)
    const baseUrl = "https://oqlkiz04je.execute-api.us-east-1.amazonaws.com/prod";

    // Function to send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setMessage("");

        // Validate email before sending request
        if (!email.trim()) {
            setMessage("Please enter a valid email.");
            return;
        }

        try {
            const requestBody = JSON.stringify({
                action: "forgot_password",
                email,
            });

            console.log("Sending OTP Request:", requestBody);

            const response = await fetch(`${baseUrl}/auth`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: requestBody,
            });

            const data = await response.json();
            console.log("OTP Response:", data);

            if (response.ok) {
                setOtpSent(true);
                setMessage("OTP sent to your email. Enter it below to reset your password.");
            } else {
                setMessage(data.message || data.error || "Failed to send OTP.");
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
            setMessage("Error: " + error.message);
        }
    };

    // Function to reset password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setMessage("");

        // Validate input fields before sending request
        if (!otp.trim() || !newPassword.trim()) {
            setMessage("Please fill in all fields.");
            return;
        }

        try {
            const requestBody = JSON.stringify({
                action: "reset_password",
                email,
                otp,
                new_password: newPassword,
            });

            console.log("Sending Reset Password Request:", requestBody);

            const response = await fetch(`${baseUrl}/auth`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: requestBody,
            });

            const data = await response.json();
            console.log("Reset Password Response:", data);

            if (response.ok) {
                setMessage("Password reset successfully. You can now log in with your new password.");
            } else {
                setMessage(data.message || data.error || "Failed to reset password.");
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            setMessage("Error: " + error.message);
        }
    };

    return (
        <div className="reset-password">
            <h2>Reset Password</h2>

            {!otpSent ? (
                // Form to request OTP
                <form onSubmit={handleSendOtp}>
                    <div>
                        <label>Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Send OTP</button>
                </form>
            ) : (
                // Form to reset password
                <form onSubmit={handleResetPassword}>
                    <div>
                        <label>OTP Code:</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label>New Password:</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Reset Password</button>
                    <p><a href='/login'>Login</a></p>
                </form>
            )}

            {message && <p>{message}</p>}
        </div>
    );
};

export default ResetPassword;