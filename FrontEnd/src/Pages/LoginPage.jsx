import loginimage from "../assets/Images/login-cover.jpg";
import Login from "../Components/Login";
import { useContext } from "react";
import { AppContext } from "../Components/Context";

const LoginPage = () => {
  const { newuser } = useContext(AppContext);

  return (
    <div className="flex h-screen text-2sm ">
      <div className="w-3/5 h-full relative">
        <img
          src={loginimage}
          alt="Login"
          className="hidden md:block object-none w-full h-full"
        />
      </div>
      <div className="w-2/5 flex items-center justify-center">
        <Login />
      </div>
    </div>
  );
};

export default LoginPage;
