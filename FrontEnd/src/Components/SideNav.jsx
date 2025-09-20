import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import { FaLock, FaHome } from "react-icons/fa";
import { IoDocumentText } from "react-icons/io5";
import { HiDocumentText } from "react-icons/hi2";
import { FaSignOutAlt } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { AppContext } from "./Context";
import { FiMenu } from "react-icons/fi";
import { AiFillCaretUp } from "react-icons/ai";
import { AiFillCaretDown } from "react-icons/ai";
import { FaSignInAlt } from "react-icons/fa";
import scaffolding from "../assets/Images/scaffolding.png";
const SideNav = ({ isOpen, setIsMenuOpen, ref }) => {
  const { setStatusFilter, setMultiStatusFilter } = useContext(AppContext);
  const [submenuOpen, setSubmenuOpen] = useState(false);

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
      className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 shadow transition-all duration-300 
    ${isOpen ? "w-68" : "w-15"}`}
    >
      <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
        <button
          className="flex items-center gap-2 text-gray-700 cursor-pointer"
          onClick={() => setIsMenuOpen(true)}
        >
          <FiMenu className="h-6 w-6" />
          {isOpen && (
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white">
              Menu
            </h2>
          )}
        </button>

        {isOpen && (
          <button
            onClick={() => setIsMenuOpen(false)}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-300 dark:hover:text-white cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      <nav className={`p-4  ${!isOpen ? "space-y-7" : "space-y-4"}`}>
        <Link
          to="/"
          className="flex gap-2 items-center min-h-10 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
        >
          <FaHome />
          {isOpen && <span>Home</span>}
        </Link>
        <button
          onClick={() => setSubmenuOpen(!submenuOpen)}
          className="flex min-h-10 p-2  items-center gap-2  rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
        >
          <IoDocumentText />

          {isOpen && (
            <span className="flex flex-1 items-center gap-2 w-1xs">
              <span className=" break-words">Comparative Statements</span>
              <span className="ml-auto text-gray-500 dark:text-gray-300 cursor-pointer">
                {submenuOpen ? <AiFillCaretUp /> : <AiFillCaretDown />}
              </span>
            </span>
          )}
        </button>
        {submenuOpen && (
          <div className="ml-6 mt-2 space-y-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
              onClick={() => {
                setStatusFilter("All");
                setMultiStatusFilter([]);
              }}
            >
              <MdSpaceDashboard />
              {isOpen && <span>Dashboard</span>}
            </Link>

            <Link
              to="/particulars"
              className={`flex items-center gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
                !userInfo?.isAdmin
                  ? "pointer-events-none opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <HiDocumentText />
              {isOpen && (
                <>Particulars {!userInfo?.isAdmin ? <FaLock /> : ""}</>
              )}
            </Link>

            <Link
              to="/receipts"
              className="flex gap-2 p-2 items-center rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              <IoDocumentText />
              {isOpen && <span>Statements</span>}
            </Link>
          </div>
        )}
        <button className="flex items-center gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer">
          <img
            src={scaffolding}
            className="h-4 w-5 object-contain"
            alt="Scaffolding Icon"
          />
          {isOpen && <span className="whitespace-nowrap">Scaffolding</span>}
        </button>

        <button
          className="flex gap-2 p-2 rounded text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 cursor-pointer"
          onClick={handleLogout}
        >
          {userInfo ? <FaSignOutAlt /> : <FaSignInAlt />}
          {isOpen && (userInfo ? "Sign out" : "Sign In")}
        </button>
      </nav>
    </div>
  );
};

export default SideNav;
