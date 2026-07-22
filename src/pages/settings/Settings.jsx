import React, { useState } from "react";
import AdminSettings from "./AdminSettings";
import BusinessSettings from "./BusinessSettings";
import Button from "../../components/common/Button";

const Setting = () => {
  // State to track which Setting panel is active
  const [activeTab, setActiveTab] = useState("admin");

  return (
    <div className="Setting-container">
      {/* Switch Buttons */}
     

      {/* Conditionally Rendered Component */}
      <div className="Setting-content">
        {activeTab === "admin" ? (
          <AdminSettings />
        ) : (
          <BusinessSettings />
        )}
      </div>

       <div className="Setting-switch gap-5 ">
        <Button 
          className={activeTab === "admin" ? "active" : ""} 
          onClick={() => setActiveTab("admin")}
        >
          Admin Settings
        </Button>
        <Button 
          className={activeTab === "business" ? "active " : ""} 
          onClick={() => setActiveTab("business")}
        >
          Business Settings
        </Button>
      </div>
    </div>
  );
};

export default Setting;
