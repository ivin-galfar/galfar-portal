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
      setfreezeQuantity(true);
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
    Manager: [
      "Pending for HOM",
      "Pending for GM",
      "Pending for CEO",
      "Approved",
    ],
    GM: ["Pending for GM", "Pending for CEO", "Approved"],
    CEO: ["Pending for CEO", "Approved"],
  };

  const expectedStatuses =
    statusMapping[userInfo?.role]?.map((s) => s.toLowerCase()) || [];

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
          .filter((receipt) => {
            const rejectedApprover = receipt.formData?.approverdetails?.find(
              (rej) => rej.rejectedby && rej.rejectedby.trim() !== ""
            );
            const rejectedRole = rejectedApprover
              ? rejectedApprover.rejectedby
              : null;
            const canSeeRejected =
              receipt.formData?.status?.toLowerCase() === "rejected" &&
              rejectedRole &&
              ((rejectedRole === "GM" &&
                ["GM", "Initiator", "Manager"].includes(userInfo?.role)) ||
                (rejectedRole === "Manager" &&
                  ["Manager", "Initiator"].includes(userInfo?.role)) ||
                (rejectedRole === "CEO" &&
                  ["CEO", "GM", "Manager", "Initiator"].includes(
                    userInfo?.role
                  )));

            return (
              (receipt.formData?.sentForApproval === "yes" &&
                expectedStatuses.includes(
                  receipt.formData?.status.toLowerCase()
                )) ||
              canSeeRejected
            );
          })
          .map((receipt) => receipt.formData?.equipMrNoValue)
          .filter(Boolean);
        setReqMrno(reqMrValues);
        setMrno(mrValues);
      } catch (error) {
        console.log(error);
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
      <span className="invisible h-20"></span>
      <div
        className={` z-50 flex justify-between items-center gap-3.5 pt-3 flex-wrap`}
      >
        {userInfo?.isAdmin ? (
          <div className="flex gap-3.5 min-w-[280px]">
            {hasInputActivity || isMRSelected ? (
              <>
                {selectedmr != "default" ? (
                  <button
                    onClick={() => {
                      setShowmodal(true);
                    }}
                    disabled={statusclass != ""}
                    className={`px-4 py-2 ${buttonText == "Approved" || buttonText == "Rejected" ? "ml-198" : "ml-185"} text-white font-semibold rounded shadow ${
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
            {" "}
            {sharedTableData.formData.status != "" ? (
              <div className="justify-end flex ml-68 ">
                <button
                  disabled={statusclass != ""}
                  className={`px-10 py-2  text-white font-semibold rounded ${buttonText === "Approved" || buttonText === "Rejected" ? "ml-120" : "ml-106"}  ${buttonClass}`}
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
          </>
        )}
        {userInfo?.isAdmin ? (
          <div className="justify-end  flex gap-3.5">
            <button
              onClick={handleSubmit}
              className={` ${isMRSelected || !hasInputActivity ? "hidden" : ""} px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 cursor-pointer ${sharedTableData.tableData.sentForApproval == "yes" ? "hidden" : ""}`}
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
