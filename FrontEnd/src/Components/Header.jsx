import { Link } from "react-router-dom";
import useUserInfo from "../CustomHooks/useUserInfo";
import galfarlogo from "../assets/Images/logo-new.png";
import { FiMenu } from "react-icons/fi";
import SideNav from "./SideNav";
import { useState } from "react";
import UserDropdown from "./UserDropdown";

const Header = () => {
  const userInfo = useUserInfo();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div>
      <header className="bg-white shadow-md">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex  items-center h-16">
            <div className="flex space-x-6">
              <button
                className="text-gray-700 cursor-pointer"
                onClick={() => setIsMenuOpen(true)}
              >
                <FiMenu className="h-6 w-6" />
              </button>
              <Link to="/">
                <img
                  src={galfarlogo}
                  alt="Galfar Logo"
                  className="h-10 w-auto m-50"
                />
              </Link>
            </div>
            <div className="ml-auto mr-45">
              <nav className="flex space-x-8 ">
                <Link to="/" className="text-gray-700 hover:text-blue-600">
                  Home
                </Link>
                <Link to="/about" className="text-gray-700 hover:text-blue-600">
                  About
                </Link>
                <Link
                  to="/services"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Services
                </Link>
                <Link
                  to="/contact"
                  className="text-gray-700 hover:text-blue-600"
                >
                  Contact
                </Link>
                {userInfo?.email && <UserDropdown />}
              </nav>
            </div>
          </div>{" "}
        </div>
      </header>

      <SideNav isOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
    </div>
  );
};

export default Header;
