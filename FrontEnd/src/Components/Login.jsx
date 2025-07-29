import { useContext, useState } from "react";
import galfarlogo from "../assets/Images/logo-new.png";
import { AppContext } from "./Context";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errormessage, setErrormessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const navigate = useNavigate();

  const { newuser, setNewuser } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newuser) {
      try {
        const config = {
          "Content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        const { data } = await axios.post(
          `${REACT_SERVER_URL}/users/login`,
          {
            email,
            password,
          },
          config
        );
        localStorage.setItem("userInfo", JSON.stringify(data));
        setErrormessage("");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
          navigate("/");
        }, 1500);
      } catch (error) {
        let message = error?.response?.data?.message;
        setErrormessage(message ? message : error.message);
      }
    } else {
      try {
        const config = {
          "Content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        const { data } = await axios.post(
          `${REACT_SERVER_URL}/users/register`,
          {
            email,
            password,
          },
          config
        );
        setErrormessage("");
        setShowToast(true);
      } catch (error) {
        let message = error?.response?.data?.message;
        setErrormessage(message ? message : error.message);
      }
    }
  };
  console.log(newuser);

  return (
    <div>
      {showToast && !errormessage && !newuser && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ Successfully logged in!
        </div>
      )}
      {!errormessage && showToast && newuser && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ Successfully created your account!
        </div>
      )}
      {errormessage && (
        <div className="fixed top-5 left-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg flex items-center gap-3 transition-all duration-300 animate-slide-in">
          ✖️
          {errormessage}
        </div>
      )}
      <div className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 h-auto">
        <div className="mb-10">
          <img src={galfarlogo} alt="Galfar Logo" className="h-20 w-auto" />
        </div>

        <div className="w-[400px] max-w-2xl bg-white p-10 rounded-2xl shadow-lg transition-all duration-300 ease-in-out">
          <h2
            className={`font-semibold text-gray-900 mb-8 text-left ${
              newuser ? "text-2xl" : "text-3xl"
            }`}
          >
            {newuser ? "Create Account" : "Sign in"}
          </h2>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Email address*"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={newuser ? "new-password" : "current-password"}
                required
                placeholder="Password*"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {newuser
                  ? "Already have an account?"
                  : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={() => setNewuser(!newuser)}
                className="text-indigo-600 hover:text-indigo-800 font-medium cursor-pointer"
              >
                {newuser ? "Login" : "Create your account"}
              </button>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent
                         rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
              >
                {newuser ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
