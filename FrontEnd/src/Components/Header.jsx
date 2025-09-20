import { Link, NavLink } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import galfarlogo from "../assets/Images/logo-new.png";
import SideNav from "./SideNav";
import { useContext, useEffect, useRef, useState } from "react";
import UserDropdown from "./UserDropdown";
import { AppContext } from "./Context";

const Header = () => {
  const userInfo = useUserInfo();
  const { setStatusFilter, setMultiStatusFilter } = useContext(AppContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (canvasRef.current && !canvasRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const navLinkClasses = ({ isActive }) =>
    `text-gray-700 hover:text-blue-600 ${isActive ? "border-b-2 border-blue-500 text-blue-600" : ""}`;
  return (
    <div>
      <header className="bg-white shadow-md">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex  items-center h-16">
            <div className="flex space-x-6">
              <div className="flex justify-center items-center p-6">
                <NavLink to="/">
                  <img
                    src={galfarlogo}
                    alt="Galfar Logo"
                    className="h-10 w-auto"
                  />
                </NavLink>
              </div>
            </div>
            <div className="ml-auto mr-45">
              <nav className="flex space-x-8 ">
                <NavLink to="/" className={navLinkClasses}>
                  Home
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={navLinkClasses}
                  onClick={() => {
                    setStatusFilter("All");
                    setMultiStatusFilter([]);
                  }}
                >
                  Dashboard
                </NavLink>
                <NavLink to="/receipts" className={navLinkClasses}>
                  Statements
                </NavLink>
                <NavLink to="/contact" className={navLinkClasses}>
                  Contact
                </NavLink>
                {userInfo?.email && <UserDropdown />}
              </nav>
            </div>
          </div>{" "}
        </div>
      </header>

      <SideNav
        isOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        ref={canvasRef}
      />
    </div>
  );
};

export default Header;
