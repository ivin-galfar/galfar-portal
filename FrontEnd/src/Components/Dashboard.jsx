import React from "react";
import galfarlogo from "../assets/Images/banner_2.jpg";

const Dashboard = () => {
  return (
    <div className="w-full h-screen">
      <img
        src={galfarlogo}
        alt="Galfar Logo"
        className="w-full  object-cover"
      />
    </div>
  );
};

export default Dashboard;
