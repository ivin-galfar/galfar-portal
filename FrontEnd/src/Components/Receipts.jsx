import { useContext, useEffect } from "react";
import useUserInfo from "../CustomHooks/useUserInfo";
import TableHeader from "./ReceiptsHeader";
import MyTable from "./Table";
import { AppContext } from "./Context";
import { useState } from "react";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import ApproveModal from "./ApproveModal";

const Receipts = () => {
  const userInfo = useUserInfo();
  const [showToast, setShowToast] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const [showcalc, setShowcalc] = useState(false);
  const [showmodal, setShowmodal] = useState(false);

  const {
    sharedTableData,
    setSharedTableData,
    setMrno,
    selectedmr,
    setSortVendors,
    hasInputActivity,
    isMRSelected,
    reqApprovalstatus,
    setreqApprovalstatus,
    setReqMrno,
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
        const reqMrValues = receipts
          .filter((receipt) => receipt.formData?.sentForApproval === "yes")
          .map((receipt) => receipt.formData?.equipMrNoValue)
          .filter(Boolean);
        setReqMrno(reqMrValues);
        setMrno(mrValues);
      } catch (error) {
        console.log(error);
      }
    };
    fetchMR();
  }, [sharedTableData]);

  const reqApproval = async (mrno) => {
    try {
      const response = await axios.put(`${REACT_SERVER_URL}/receipts/${mrno}`);
      setreqApprovalstatus(response.data.formData.sentForApproval);
      setErrormessage("");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
      setSharedTableData((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          sentForApproval: "yes",
        },
      }));
    } catch (error) {
      let message = error?.response?.data?.message;
      setErrormessage(message ? message : error.message);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
    }
  };

  const isSentForApproval = sharedTableData.formData.sentForApproval === "yes";
  console.log(sharedTableData.formData);

  const isStatusSet = !!sharedTableData.formData.status;
  const buttonClass = isSentForApproval
    ? isStatusSet
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-green-600 opacity-60 cursor-not-allowed"
    : "bg-blue-600 hover:bg-blue-700 cursor-pointer";

  const buttonText = isSentForApproval
    ? isStatusSet
      ? "Approval Completed"
      : "Already Requested"
    : "Request Approval";
  return (
    <div className="p-10  pb-28 relative">
      <h1 className="font-bold mb-4">
        <TableHeader isAdmin={userInfo?.isAdmin} />
      </h1>
      <MyTable showcalc={showcalc} />
      <div
        className={` z-50 flex justify-between items-center gap-3.5 pt-3 flex-wrap`}
      >
        {userInfo?.isAdmin ? (
          <div className="flex gap-3.5 min-w-[280px]">
            {hasInputActivity || isMRSelected ? (
              <>
                <button
                  onClick={() => {
                    setSortVendors(true);
                    setShowcalc(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 cursor-pointer"
                >
                  Calculate
                </button>
                <button
                  onClick={() => {
                    setSortVendors(false);
                    setShowcalc(false);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 cursor-pointer"
                >
                  Reset Calculation
                </button>
                {selectedmr != "default" ? (
                  <button
                    onClick={() =>
                      reqApproval(sharedTableData.formData.equipMrNoValue)
                    }
                    className={`px-4 py-2 ml-110 text-white font-semibold rounded shadow ${
                      buttonClass
                    }focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 cursor-pointer transition duration-300 ease-in-out"
                  }`}
                  >
                    {buttonText}
                  </button>
                ) : (
                  ""
                )}
              </>
            ) : (
              <>
                <button className="px-4 py-2 invisible">calculate</button>
                <button className="px-4 py-2 invisible">
                  Reset Calculation
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="justify-end flex ml-68 ">
            <button
              className="px-10 py-2 bg-blue-600 text-white font-semibold rounded ml-110 shadow cursor-pointer"
              onClick={() => setShowmodal(true)}
            >
              Approve/Reject
            </button>
          </div>
        )}
        {userInfo?.isAdmin ? (
          <div className="justify-end  flex gap-3.5">
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
        ) : (
          ""
        )}
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
      )}{" "}
      {showToast && reqApprovalstatus && !errormessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ You have succesfully requested for Approval!
        </div>
      )}
      {showmodal && (
        <ApproveModal
          setShowmodal={setShowmodal}
          mrno={sharedTableData?.formData?.equipMrNoValue}
        />
      )}
    </div>
  );
};

export default Receipts;
