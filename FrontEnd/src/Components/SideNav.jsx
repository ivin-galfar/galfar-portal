import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";

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
        <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
          Menu
        </h2>
        <button
          onClick={() => setIsMenuOpen(false)}
          className="text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white cursor-pointer"
        >
          ✕
        </button>
      </div>

      <nav className="p-4 space-y-2">
        <a
          href="#"
          className="block p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        >
          Dashboard
        </a>
        <Link
          to="/particulars"
          href="#"
          className="block p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        >
          Particulars
        </Link>
        <Link
          to="/receipts"
          className="block p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        >
          Receipts
        </Link>
        <button
          className="block p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          onClick={handleLogout}
        >
          {userInfo ? "Sign out" : "Sign In"}
        </button>
      </nav>
    </div>
  );
};

export default SideNav;
