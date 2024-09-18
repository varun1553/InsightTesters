import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
const apiUrl = process.env.REACT_APP_URL;

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const { userObj } = useSelector((state) => state.user); // Access userObj from Redux
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const username = userObj.username;
                const response = await axios.get(apiUrl+`/notification-api/get-notifications/${username}`);
                setNotifications(response.data.payload.your_notifications);
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    const handleCardClick = (notification) => {
        // Check the notification type and navigate accordingly
        if (notification.m_p_type === "message") {
            navigate("/messages");
        } else if (notification.m_p_type === "post") {
            navigate("/posts");
        }
    };

    return (
        <div className="notifications-container" style={{ padding: "20px" }}>
            <h2 style={{ fontWeight: "bold", color: "blue", marginBottom: "20px" }}>Notifications</h2>
            <div className="notification-cards">
                {notifications.map((notification, index) => (
                    <div
                        className="notification-card"
                        key={index}
                        onClick={() => handleCardClick(notification)}
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                            padding: "10px",
                            marginBottom: "10px",
                            backgroundColor: notification.m_p_type === "message" ? "#fdd" : "#dfd"
                        }}
                    >
                        <p style={{ fontWeight: "bold", marginBottom: "5px" }}>{notification.message_notify}</p>
                        
                        <p style={{ fontStyle: "italic" }}>{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                ))}
            </div>
        </div>

    );
}

export default Notifications;
