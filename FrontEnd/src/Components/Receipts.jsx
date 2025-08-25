import { useContext, useEffect } from "react";
import useUserInfo from "../CustomHooks/useUserInfo";
import TableHeader from "./ReceiptsHeader";
import MyTable from "./Table";
import { AppContext } from "./Context";
import { useState } from "react";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import ApproveModal from "./ApproveModal";
import ReasonForSelection from "./ReasonForSelection";
import fetchStatments from "../APIs/StatementsApi";

const Receipts = () => {
  const userInfo = useUserInfo();
  const [showToast, setShowToast] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const [showcalc, setShowcalc] = useState(false);
  const [showmodal, setShowmodal] = useState(false);

  const {
    sharedTableData,
    setSharedTableData,
    setNewMr,
    setMrno,
    selectedmr,
    setSortVendors,
    hasInputActivity,
    isMRSelected,
    reqApprovalstatus,
    setreqApprovalstatus,
    setReqMrno,
    setIsMRSelected,
    selectedVendorIndex,
    setParticularName,
    setfreezeQuantity,
    setReceipts,
    selectedVendorReason,
  } = useContext(AppContext);

  const handleSubmit = async () => {
    const {
      equipMrNoValue,
      emRegNoValue,
      hiringName,
      locationValue,
      projectValue,
      requiredDateValue,
      requirementDurationValue,
    } = sharedTableData.formData;

    if (
      !equipMrNoValue ||
      !emRegNoValue ||
      !hiringName ||
      !locationValue ||
      !projectValue ||
      !requiredDateValue ||
      !requirementDurationValue
    ) {
      setShowToast(true);
      setErrormessage("Please fill all required fields!!");
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
      return;
    }

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
      setSortVendors(true);
      setIsMRSelected(true);
      setParticularName([]);
      setfreezeQuantity(false);
      setNewMr(false);
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
  const statusMapping = {
    Initiator: [],
    Manager: ["Pending For HOM", "Approved", "Rejected"],
    GM: ["Pending for GM", "Approved", "Rejected"],
    CEO: ["Pending for CEO", "Approved", "Rejected"],
  };

  const expectedStatuses =
    statusMapping[userInfo?.role]?.map((s) => s.toLowerCase()) || [];

  useEffect(() => {
    const fetchMR = async () => {
      try {
        const { reqMrValues, mrValues } = await fetchStatments({
          expectedStatuses,
          userInfo,
        });

        setReqMrno(reqMrValues);
        setMrno(mrValues);
      } catch (error) {
        let message = error?.response?.data?.message;
        setErrormessage(message ? message : error.message);
      }
    };
    fetchMR();
  }, [sharedTableData, isMRSelected]);

  const isSentForApproval = sharedTableData.formData.sentForApproval === "yes";

  const isStatusSet = sharedTableData.formData.status;

  let statusclass = "";
  if (
    (isStatusSet == "Pending for CEO" && userInfo.role != "CEO") ||
    (isStatusSet == "Pending for GM" && userInfo.role != "GM") ||
    (isStatusSet == "Pending For HOM" && userInfo.role != "Manager") ||
    (isStatusSet == "Pending For HOM" && userInfo.role == "Initiator") ||
    isStatusSet == "Approved" ||
    isStatusSet == "Rejected"
  ) {
    statusclass = "bg-gray-400 cursor-not-allowed";
  }

  const buttonClass = isSentForApproval
    ? statusclass || "bg-blue-600  cursor-pointer"
    : sharedTableData.formData?.equipMrNoValue != undefined
      ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
      : "";

  const buttonText = isSentForApproval
    ? isStatusSet
      ? sharedTableData.formData.status === "approved"
        ? "Approved"
        : sharedTableData.formData.status
      : "Already Requested"
    : "Request Approval";

  return (
    <div className="pt-1 pl-10 pr-5 pb-28 relative">
      <h1 className="font-bold mb-4">
        <TableHeader isAdmin={userInfo?.isAdmin} />
      </h1>
      <MyTable showcalc={showcalc} />
      <div
        className={` z-50 flex justify-between items-center gap-3.5 pt-3 flex-wrap`}
      >
        {userInfo?.isAdmin ? (
          <div className="flex gap-3.5 min-w-[280px]">
            {sharedTableData.formData.selectedVendorReason ? (
              <>
                <div className="w-100 p-2 inline-block bg-gray-100 text-gray-800 font-medium rounded-md shadow-sm ">
                  <h1 className="text-black">Recommendation points:</h1>
                  {sharedTableData.formData.selectedVendorReason
                    ? sharedTableData.formData.selectedVendorReason
                    : ""}
                </div>
              </>
            ) : (
              <div className="w-100 inline-block px-3 py-1 bg-gray-100 text-gray-800 font-medium rounded-md shadow-sm invisible"></div>
            )}
            {hasInputActivity || isMRSelected ? (
              <>
                {selectedmr != "default" ? (
                  <button
                    onClick={() => {
                      setShowmodal(true);
                    }}
                    disabled={statusclass != ""}
                    className={`px-4 py-2 ${buttonText == "Approved" || buttonText == "Rejected" ? "ml-96" : "ml-80"} max-h-10 text-white font-semibold rounded shadow ${
                      buttonClass
                    } ${buttonText == "Already Requested" ? "cursor-not-allowed" : ""} focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75  transition duration-300 ease-in-out"
                  `}
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
          <>
            <div className="flex gap-3.5 min-w-[280px]">
              {sharedTableData.formData.selectedVendorReason ? (
                <>
                  <div className="w-100 p-2 inline-block bg-gray-100 text-gray-800 font-medium rounded-md shadow-sm ">
                    <h1 className="text-black">Recommendation points:</h1>
                    {sharedTableData.formData.selectedVendorReason
                      ? sharedTableData.formData.selectedVendorReason
                      : ""}
                  </div>
                </>
              ) : (
                <div className="w-100 inline-block px-3 py-1 bg-gray-100 text-gray-800 font-medium rounded-md shadow-sm invisible"></div>
              )}

              {sharedTableData.formData.status != "" ? (
                <div className="justify-end flex ">
                  <button
                    disabled={statusclass != ""}
                    className={`px-10 py-2  text-white font-semibold rounded max-h-10 ${buttonText === "Approved" || buttonText === "Rejected" ? "ml-96" : "ml-70"}  ${buttonClass}`}
                    onClick={() => setShowmodal(true)}
                  >
                    {sharedTableData.formData.status}
                  </button>
                </div>
              ) : (
                sharedTableData.formData.equipMrNoValue && (
                  <div className="justify-end flex ml-68 ">
                    <button
                      className="px-10 py-2 bg-blue-600 text-white font-semibold rounded ml-110 shadow cursor-pointer"
                      onClick={() => setShowmodal(true)}
                    >
                      Approve/Reject
                    </button>
                  </div>
                )
              )}
            </div>
          </>
        )}
        {userInfo?.isAdmin ? (
          <div className="justify-end  flex gap-3.5">
            <button
              onClick={handleSubmit}
              className={` ${isMRSelected || !hasInputActivity ? "hidden" : ""} px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 cursor-pointer ${sharedTableData.tableData?.sentForApproval == "yes" ? "hidden" : ""}`}
            >
              Create
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 cursor-pointer"
            >
              Reset
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
      {showToast && isMRSelected && !errormessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ Receipt details added successfully!
        </div>
      )}{" "}
      {showToast && reqApprovalstatus && !errormessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ You have succesfully requested for Approval!
        </div>
      )}
      {showmodal && !userInfo?.isAdmin && (
        <ApproveModal
          setShowmodal={setShowmodal}
          mrno={sharedTableData?.formData?.equipMrNoValue}
        />
      )}
      {showmodal && userInfo?.isAdmin && (
        <ReasonForSelection
          setShowmodal={setShowmodal}
          reqApprovalMR={sharedTableData.formData.equipMrNoValue}
          setShowToast={setShowToast}
          setErrormessage={setErrormessage}
          setreqApprovalstatus={setreqApprovalstatus}
          selectedVendorIndex={selectedVendorIndex}
        />
      )}
    </div>
  );
};

export default Receipts;
