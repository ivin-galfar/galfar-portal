import { useContext, useEffect, useRef, useState } from "react";
import useUserInfo from "../CustomHooks/useUserInfo";
import { AppContext } from "./Context";
import axios from "axios";
import { REACT_SERVER_URL } from "../../config/ENV";

const TableHeader = ({ isAdmin, mrValues }) => {
  const inputRef = useRef(null);
  const { setSharedTableData, sharedTableData, setCleartable } =
    useContext(AppContext);
  const formData = sharedTableData?.formData;
  const userInfo = useUserInfo();
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (userInfo?.isAdmin) {
      setEditing(true);
    }
  }, [userInfo]);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setSharedTableData((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
    }));
  };

  const fetchReceipt = async (id) => {
    if (id) {
      try {
        const config = {
          "Content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        };
        const response = await axios.get(
          `${REACT_SERVER_URL}/receipts/${id}`,
          config
        );
        const receipt = response.data;
        setSharedTableData((prev) => ({
          ...prev,
          formData: {
            ...prev.formData,
            ...(receipt.formData || {}),
          },
          tableData: receipt.tableData || [], // This should now work
        }));
      } catch (error) {
        console.log(error);
      }
    } else {
      setCleartable(true);
      setSharedTableData({
        formData: {},
        tableData: [],
      });
    }
  };

  return (
    <div className="text-center mb-6 space-y-2">
      <h2 className="text-2xl font-semibold uppercase">
        GALFAR ENGINEERING & CONTRACTING WLL EMIRATES
      </h2>
      <div className="flex justify-between items-center w-full relative">
        <div className="w-1/3" />

        <h3 className="text-md font-medium text-center absolute left-1/2 transform -translate-x-1/2 italic">
          COMPARATIVE STATEMENT
        </h3>

        <div className="w-1/3 flex justify-end">
          <h4 className="text-sm font-normal flex justify-center items-center gap-5">
            Date:{" "}
            {isAdmin ? (
              <input
                type="date"
                value={formData?.dateValue ?? ""}
                onChange={handleChange("dateValue")}
                className="w-full max-w-xs border border-gray-300 rounded-xl px-4 py-2 shadow-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            ) : (
              <span>
                <p>
                  {new Date(formData?.dateValue).getDate()}.
                  {new Date(formData?.dateValue).getMonth() + 1}.
                  {new Date(formData?.dateValue).getFullYear()}
                </p>
              </span>
            )}
          </h4>
        </div>
      </div>

      <div className="flex items-center w-full">
        <div className="flex items-center text-sm font-medium w-1/3">
          <label htmlFor="mrNo" className="text-gray-700 mr-2">
            Choose MR No.
          </label>
          <select
            id="mrNo"
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={formData?.equipMrNoValue}
            onChange={(e) => {
              handleChange("equipMrNoValue")(e);
              fetchReceipt(e.target.value); // fetch/reset based on selection
            }}
          >
            <option value="">Select an option</option>
            {mrValues.map((value, index) => (
              <option key={index} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-center text-sm font-medium w-1/3">
          {isAdmin ? (
            <>
              <span className="mr-2">HIRING -</span>
              <input
                type="text"
                value={formData?.hiringName ?? ""}
                ref={inputRef}
                onChange={handleChange("hiringName")}
                className="border-b border-gray-500 outline-none text-sm font-semibold text-center px-2 py-1"
              />
            </>
          ) : (
            <p className="text-sm font-medium">
              HIRING -{" "}
              <span className="font-semibold">
                {formData?.hiringName ?? ""}
              </span>
            </p>
          )}
        </div>

        <div className="w-1/3" />
      </div>
      <div className="flex justify-between mt-4 px-4">
        <div className="flex flex-col space-y-1 text-left w-1/3">
          <p>
            <span className="font-semibold">PROJECT:</span>{" "}
            {isAdmin ? (
              <input
                type="text"
                value={formData?.projectValue ?? ""}
                onChange={handleChange("projectValue")}
                className="border-b border-gray-400 outline-none px-1 text-sm"
              />
            ) : (
              formData?.projectValue
            )}
          </p>
          <p>
            <span className="font-semibold">Location:</span>{" "}
            {isAdmin ? (
              <input
                type="text"
                value={formData?.locationValue ?? ""}
                onChange={handleChange("locationValue")}
                className="border-b border-gray-400 outline-none px-1 text-sm"
              />
            ) : (
              formData?.locationValue
            )}
          </p>
        </div>

        <div className="flex flex-col space-y-1 text-center w-1/3">
          <p>
            <span className="font-semibold">EQUIP MR NO:</span>{" "}
            {isAdmin ? (
              <input
                type="text"
                value={formData?.equipMrNoValue ?? ""}
                onChange={handleChange("equipMrNoValue")}
                className="border-b border-gray-400 outline-none px-1 text-sm"
              />
            ) : (
              formData?.equipMrNoValue
            )}
          </p>
          <p>
            <span className="font-semibold">EM REG NO:</span>{" "}
            {isAdmin ? (
              <input
                type="text"
                value={formData?.emRegNoValue ?? ""}
                onChange={handleChange("emRegNoValue")}
                className="border-b border-gray-400 outline-none px-1 text-sm"
              />
            ) : (
              formData?.emRegNoValue
            )}
          </p>
        </div>

        <div className="flex flex-col space-y-1 text-right w-1/3">
          <p>
            <span className="font-semibold m-15">REQUIRED DATE:</span>{" "}
            {isAdmin ? (
              <input
                type="date"
                value={
                  formData?.requiredDateValue
                    ? new Date(formData.requiredDateValue)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={handleChange("requiredDateValue")}
                className="border-b border-gray-400 outline-none px-1 text-sm"
              />
            ) : (
              formData?.requiredDateValue
            )}
          </p>
          <p>
            <span className="font-medium">REQUIREMENT DURATIONS:</span>{" "}
            {isAdmin ? (
              <input
                type="text"
                value={formData?.requirementDurationValue ?? ""}
                onChange={handleChange("requirementDurationValue")}
                className="border-b border-gray-400 outline-none px-1 text-sm"
              />
            ) : (
              (formData?.requirementDurationValue ?? "")
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TableHeader;
