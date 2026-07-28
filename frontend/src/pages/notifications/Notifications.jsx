import React, { useState } from "react";
import AdminNotifications from "./Adminnotifications";
import BusinessNotifications from "./Businessnotifications";
import Button from "../../components/common/Button";

const Notification = () => {
  // State to track which notification panel is active
  const [activeTab, setActiveTab] = useState("admin");

  return (
    <div className="notification-container">
      {/* Switch Buttons */}
     

      {/* Conditionally Rendered Component */}
      <div className="notification-content">
        {activeTab === "admin" ? (
          <AdminNotifications />
        ) : (
          <BusinessNotifications />
        )}
      </div>

       <div className="notification-switch gap-5 ">
        <Button 
          className={activeTab === "admin" ? "active" : ""} 
          onClick={() => setActiveTab("admin")}
        >
          Admin Notifications
        </Button>
        <Button 
          className={activeTab === "business" ? "active " : ""} 
          onClick={() => setActiveTab("business")}
        >
          Business Notifications
        </Button>
      </div>
    </div>
  );
};

export default Notification;
