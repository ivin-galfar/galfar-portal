import { useContext, useEffect } from "react";
import useUserInfo from "../CustomHooks/useUserInfo";
import TableHeader from "./ReceiptsHeader";
import MyTable from "./Table";
import { AppContext } from "./Context";
import { useState } from "react";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";

const Receipts = () => {
  const userInfo = useUserInfo();
  const [showToast, setShowToast] = useState(false);
  const [errormessage, setErrormessage] = useState("");

  const {
    sharedTableData,
    setSharedTableData,
    setMrno,
    sortVendors,
    setSortVendors,
  } = useContext(AppContext);

  const handleSubmit = async () => {
    try {
      const config = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      };
      const { data } = await axios.post(
        `${REACT_SERVER_URL}/receipts`,
        {
          formData: sharedTableData.formData,
          tableData: sharedTableData["tableData"],
        },
        config
      );
      setShowToast(true);
      setSharedTableData({
        formData: {
          equipMrNoValue: "",
          emRegNoValue: "",
          hiringName: "",
          locationValue: "",
          projectValue: "",
          requiredDateValue: new Date(),
          requirementDurationValue: "",
          dateValue: new Date(),
        },
      });

      setErrormessage("");
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
    } catch (error) {
      setShowToast(true);
      let message = error?.response?.data?.message;
      setErrormessage(message ? message : error.message);
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
    }
  };

  const handleReset = () => {
    window.location.reload();
  };
  useEffect(() => {
    const fetchMR = async () => {
      try {
        const config = {
          "Content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        const response = await axios.get(
          `${REACT_SERVER_URL}/receipts`,
          config
        );
        const receipts = response.data.receipts;
        const mrValues = receipts
          .map((receipt) => receipt.formData?.equipMrNoValue)
          .filter(Boolean);
        setMrno(mrValues);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMR();
  }, [sharedTableData]);

  return (
    <div className="p-10">
      <h1 className="font-bold mb-4">
        <TableHeader isAdmin={userInfo?.isAdmin} />
      </h1>
      <MyTable />
      <div className="flex justify-between items-center gap-3.5 pt-3 flex-wrap">
        <div className="flex gap-3.5">
          <button
            onClick={() => setSortVendors(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 cursor-pointer"
          >
            Recalculate
          </button>
          <button
            onClick={() => setSortVendors(false)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 cursor-pointer"
          >
            Reset Calculation
          </button>
        </div>

        <div className="flex gap-3.5">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 cursor-pointer"
          >
            Create
          </button>
        </div>
      </div>

      {showToast && errormessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          {errormessage}
        </div>
      )}
      {showToast && !errormessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ Receipt details added successfully!
        </div>
      )}
    </div>
  );
};

export default Receipts;
