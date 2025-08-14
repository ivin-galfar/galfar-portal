import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import { FaLock, FaHome } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { HiDocumentText } from "react-icons/hi2";
import { FaSignOutAlt } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";

const SideNav = ({ isOpen, setIsMenuOpen, ref }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };
  const userInfo = useUserInfo();
  return (
    <div
      ref={ref}
      onMouseLeave={() => setIsMenuOpen(false)}
      className={`fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-gray-800 shadow transition-transform transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="flex items-center space-x-2 text-lg font-semibold text-gray-700 dark:text-white">
          <span>Menu</span>
        </h2>
        <button
          onClick={() => setIsMenuOpen(false)}
          className="text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white cursor-pointer"
        >
          ✕
        </button>
      </div>

      <nav className="p-4 space-y-2">
        <Link
          to="/"
          className=" flex gap-2 items-center p-2   rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        >
          <FaHome />
          <span>Home</span>
        </Link>
        <Link
          to="/dashboard"
          className={`flex items-center gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 `}
        >
          <MdSpaceDashboard />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/particulars"
          className={`flex items-center gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${!userInfo?.isAdmin ? "pointer-events-none opacity-50 cursor-not-allowed" : ""}`}
        >
          <HiDocumentText />
          Particulars {!userInfo?.isAdmin ? <FaLock /> : ""}
        </Link>
        <Link
          to="/receipts"
          className=" flex gap-2  p-2  items-center  rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        >
          <IoDocumentText />
          Statements
        </Link>
        <button
          className="flex gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
          onClick={handleLogout}
        >
          <FaSignOutAlt />
          {userInfo ? "Sign out" : "Sign In"}
        </button>
      </nav>
    </div>
  );
};

export default SideNav;
