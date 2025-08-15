import { useContext, useEffect } from "react";
import galfarlogo from "../assets/Images/banner_2.jpg";
import { AppContext } from "./Context";
import fetchStatments from "../../APIs/StatementsApi";
import useUserInfo from "../CustomHooks/useUserInfo";
import { Link } from "react-router-dom";
import { MdOutlinePendingActions } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { ImCross } from "react-icons/im";
import { GrDocumentStore } from "react-icons/gr";

const Home = () => {
  const {
    setReceipts,
    receipts,
    setMrno,
    setAllReceipts,
    allreceipts,
    setStatusFilter,
    setMultiStatusFilter,
  } = useContext(AppContext);
  const userInfo = useUserInfo();
  const statusMapping = {
    Initiator: [
      "Pending for HOM",
      "Pending for GM",
      "Pending for CEO",
      "Approved",
      "",
    ],
    Manager: [
      "Pending for HOM",
      "Pending for GM",
      "Pending for CEO",
      "Approved",
    ],
    GM: ["Pending for GM", "Pending for CEO", "Approved"],
    CEO: ["Pending for CEO", "Approved"],
  };
  const expectedStatuses = statusMapping[userInfo?.role] || [];
  useEffect(() => {
    const fetchStatementsdetails = async () => {
      try {
        const { filterreceipts, categorizedReceipts, mrValues } =
          await fetchStatments({
            expectedStatuses,
            userInfo,
          });

        setAllReceipts(filterreceipts);
        setReceipts(categorizedReceipts);
        setMrno(mrValues);
      } catch (error) {
        const message = error?.response?.data?.message || error.message;
        console.error("Fetch receipts error:", message);
      }
    };
    fetchStatementsdetails();
  }, []);

  const approvedReceipts = allreceipts.filter(
    (r) => r.formData.status == "Approved"
  );
  const rejectedReceipts = allreceipts.filter(
    (r) => r.formData.status == "Rejected"
  );
  const pendingReceipts = allreceipts.filter((r) =>
    r.formData?.status?.toLowerCase().startsWith("pending")
  );

  return (
    <div className="w-full h-screen">
      <img
        src={galfarlogo}
        alt="Galfar Logo"
        className="w-full  object-cover"
      />
      <div className="max-w-2xl  ml-10 mt-10 p-4 bg-white rounded-lg shadow-md border border-gray-200">
        <h2 className="text-lg font-semibold mb-4 ">Quick Links</h2>
        <ul className="space-y-2">
          <li>
            <Link to="/dashboard">
              <button
                className="w-full flex text-left px-3 py-2 justify-between bg-blue-200 hover:bg-blue-300 rounded font-medium cursor-pointer"
                onClick={() => {
                  setStatusFilter("");
                  setMultiStatusFilter(expectedStatuses);
                }}
              >
                <div className="flex items-center gap-4">
                  <MdOutlinePendingActions />
                  <span>Pending Statements</span>
                </div>
                <p>{pendingReceipts.length}</p>
              </button>
            </Link>
          </li>
          <li>
            <Link to="/dashboard">
              <button
                className="w-full text-left px-3 py-2 justify-between flex bg-green-200 hover:bg-green-300 rounded font-medium cursor-pointer"
                onClick={() => {
                  setStatusFilter("Approved");
                  setMultiStatusFilter([]);
                }}
              >
                <div className="flex items-center gap-4">
                  <TiTick />
                  Approved Statements
                </div>
                <p>{approvedReceipts.length}</p>
              </button>
            </Link>
          </li>
          <li>
            <Link to="/dashboard">
              <button
                className="w-full text-left px-3 py-2 justify-between flex bg-red-200 hover:bg-red-300 rounded font-medium cursor-pointer"
                onClick={() => {
                  setStatusFilter("Rejected");
                  setMultiStatusFilter([]);
                }}
              >
                <div className="flex items-center gap-4">
                  <ImCross />
                  Rejected Statements
                </div>
                <p>{rejectedReceipts.length}</p>
              </button>
            </Link>
          </li>
          <li>
            <Link to="/dashboard">
              <button
                className="w-full text-left px-3 py-2 bg-gray-100 justify-between flex hover:bg-gray-200 rounded font-medium cursor-pointer"
                onClick={() => {
                  setStatusFilter("All");
                  setMultiStatusFilter([]);
                }}
              >
                <div className="flex items-center gap-4">
                  <GrDocumentStore />
                  All Statements
                </div>
                <p>{allreceipts.length}</p>
              </button>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Home;
