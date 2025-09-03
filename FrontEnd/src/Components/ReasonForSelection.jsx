import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import { AppContext } from "./Context";
import { useContext } from "react";
import useUserInfo from "../CustomHooks/useUserInfo";

const ReasonForSelection = ({
  setShowmodal,
  reqApprovalMR,
  setShowToast,
  setErrormessage,
  setreqApprovalstatus,
  selectedVendorIndex,
}) => {
  const { setSharedTableData, selectedVendorReason, sharedTableData } =
    useContext(AppContext);
  const userInfo = useUserInfo();

  const statusMap = {
    Initiator: "Pending For HOD",
    HOD: "Pending for GM",
    GM: "Pending for CEO",
    CEO: "Approved",
  };

  const reqApproval = async (mrno) => {
    const recommendationRow = sharedTableData.tableData.find(
      (row) => row.particulars === "Recommendation (If Any)"
    );
    let selectedRecommendation = "";

    if (recommendationRow && recommendationRow.vendors) {
      selectedRecommendation =
        Object.values(recommendationRow.vendors).find(
          (val) => val && val.trim() !== ""
        ) || "";
    }
    try {
      const response = await axios.put(`${REACT_SERVER_URL}/receipts/${mrno}`, {
        selectedVendorIndex: selectedVendorIndex,
        selectedVendorReason: selectedRecommendation,
        status: statusMap[userInfo.role] || "",
      });
      setreqApprovalstatus(response.data.formData.sentForApproval);
      setErrormessage("");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
        setShowmodal(false);
      }, 1500);
      setSharedTableData((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          sentForApproval: "yes",
          status: response.data.formData.status,
          selectedVendorReason: selectedRecommendation,
        },
      }));
    } catch (error) {
      let message;
      if (error?.response?.status === 404) {
        message = "Please create the statement before requesting for approval!";
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else {
        message = error.message || "An unknown error occurred";
      }

      setErrormessage(message);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 2000);
    }
  };

  return (
    <div>
      <div>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 relative">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
              onClick={() => setShowmodal(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Are you sure want to send this statement to Approval?
            </h2>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-300 transition cursor-pointer"
                onClick={() => setShowmodal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
                onClick={() => reqApproval(reqApprovalMR)}
              >
                Confirm
              </button>
            </div>
            {/* {showToast &&
              sharedTableData.formData.status == "approved" &&
              !errormessage && (
                <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
                  ✅ You have Approved this MR!
                </div>
              )}{" "}
            {showToast &&
              sharedTableData.formData.status == "rejected" &&
              !errormessage && (
                <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
                  ❌ You have Rejected this MR!
                </div>
              )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReasonForSelection;
