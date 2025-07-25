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
  const [mrno, setMrno] = useState([]);

  const { sharedTableData, setSharedTableData } = useContext(AppContext);

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
  }, []);

  return (
    <div className="p-10">
      <h1 className="font-bold mb-4">
        <TableHeader isAdmin={userInfo?.isAdmin} mrValues={mrno} />
      </h1>
      <MyTable />
      <div className="pt-3 flex justify-end gap-3.5">
        <button
          className="bg-blue-500 text-white rounded-2xl px-4 py-2 cursor-pointer"
          onClick={handleReset}
        >
          Reset
        </button>
        <button
          className="bg-blue-500 text-white rounded-2xl px-2 py-2 cursor-pointer"
          onClick={handleSubmit}
        >
          click me
        </button>
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
