import { useContext, useState } from "react";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";
import { AppContext } from "./Context";

const ApproveModal = ({ setShowmodal, mrno }) => {
  const [comments, setComments] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const { setSharedTableData, sharedTableData } = useContext(AppContext);
  const submitApproval = async (mrno, status) => {
    try {
      const config = {
        "Content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
      };
      const response = await axios.put(
        `${REACT_SERVER_URL}/receipts/approver/${mrno}`,
        {
          status: status,
          approverComments: comments,
        },
        config
      );
      setSharedTableData((prev) => ({
        ...prev,
        formData: {
          ...prev.formData,
          status: status,
          approverComments: comments,
        },
      }));
      setErrormessage("");
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
      setTimeout(() => {
        setShowmodal(false);
      }, 1500);
    } catch (error) {
      let message = error?.response?.data?.message;
      setErrormessage(message ? message : error.message);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 1500);
    }
  };

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 ">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 relative">
          <button
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
            onClick={() => setShowmodal(false)}
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            Approve/Reject
          </h2>
          <div className="flex w-full">
            <textarea
              rows={3}
              placeholder="Enter your comments here..."
              className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
          <div className="mt-6 flex justify-end space-x-2">
            <button
              className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-300 transition cursor-pointer"
              onClick={() => submitApproval(mrno, "rejected")}
            >
              Reject
            </button>
            <button
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition cursor-pointer"
              onClick={() => submitApproval(mrno, "approved")}
            >
              Approve
            </button>
          </div>
          {showToast &&
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
            )}
        </div>
      </div>
    </div>
  );
};

export default ApproveModal;
