import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { AppContext } from "./Context";
import useUserInfo from "../CustomHooks/useUserInfo";
import { REACT_SERVER_URL } from "../../config/ENV";
import axios from "axios";
import { IoMdInformationCircleOutline } from "react-icons/io";
import VendorSelectionTooltip from "./VendorSelectionTooltip";
import Currency from "../Helpers/Currency";

export default function VerticalTable({ showcalc }) {
  const {
    sharedTableData,
    setSharedTableData,
    cleartable,
    setCleartable,
    sortVendors,
    setHasInputActivity,
    particularname,
    newMr,
    hasInputActivity,
    selectedVendorIndex,
    setSelectedVendorIndex,
    selectedmr,
    freezequantity,
    currency,
    isMRSelected,
  } = useContext(AppContext);
  const [particular, setParticular] = useState([]);

  useEffect(() => {
    setSelectedVendorIndex(sharedTableData.formData.selectedVendorIndex ?? 0);
  }, [sharedTableData.formData.selectedVendorIndex, selectedmr]);
  const currencysymbol = Currency(sharedTableData.formData.currency || "");

  const fetchParticular = async (particularname) => {
    try {
      const response = await axios.get(
        `${REACT_SERVER_URL}/particulars/${particularname}`
      );
      setParticular(response.data.particular.particulars);
    } catch (error) {
      setParticular([]);
    }
  };

  useEffect(() => {
    if (particularname.length === 0) {
      return;
    }
    fetchParticular(particularname);
  }, [particularname]);

  useEffect(() => {
    if (Array.isArray(particular) && particular.length > 0) {
      const newTableData = createData();
      setTableData(newTableData);
      setSharedTableData((prev) => ({ ...prev, tableData: newTableData }));
    } else {
      setTableData([]);
      setSharedTableData((prev) => ({ ...prev, formData: {}, tableData: [] }));
    }
  }, [particular]);

  const rawData = [
    { id: 1, company: "" },
    { id: 2, company: "" },
    { id: 3, company: "" },
    { id: 4, company: "" },
  ];
  const createData = () =>
    particular.map((descRow, idx) => {
      const row = {
        id: `row_${idx}`,
        sl: 1,
        particulars: descRow,
        vendors: {},
      };
      rawData.forEach((_, vIdx) => {
        row.vendors[`vendor_${vIdx}`] = "";
      });
      return row;
    });
  const shouldSkipRow = (particulars) => {
    const skipLabels = [
      "NET PRICE",
      "RATING",
      "REMARKS",
      "COMPANY NAME",
      "NOTE",
      "VENDOR NAME",
      "NAME",
    ];
    return skipLabels.includes(particulars?.trim().toUpperCase());
  };
  const columnHelper = createColumnHelper();
  const [tableData, setTableData] = useState(() =>
    sharedTableData?.tableData?.length
      ? sharedTableData.tableData
      : createData()
  );

  const userInfo = useUserInfo();
  const [vatRate, setVatRate] = useState(5);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setSharedTableData((prev) => ({ ...prev, tableData }));
  }, [hasInputActivity ? tableData : ""]);

  useEffect(() => {
    if (sharedTableData?.tableData?.length) {
      setTableData(sharedTableData.tableData);
    }
  }, [sharedTableData.tableData]);

  useEffect(() => {
    if (cleartable) {
      const clearedTableData = tableData.map((row) => ({
        ...row,
        vendors: Object.fromEntries(
          Object.keys(row.vendors).map((key) => [key, ""])
        ),
      }));
      setTableData(clearedTableData);
      setCleartable(false);
    }
  }, [cleartable, tableData]);

  const vendorInfoWithTotal = useMemo(() => {
    const vendors = rawData.map((vendor, vIdx) => ({
      ...vendor,
      total: tableData.reduce((sum, row) => {
        if (shouldSkipRow(row.particulars)) return sum;
        const value = parseFloat(row.vendors?.[`vendor_${vIdx}`] || 0);
        return sum + (isNaN(value) ? 0 : value);
      }, 0),
      index: vIdx,
    }));

    if (sortVendors || sharedTableData.formData?.status) {
      const positiveVendors = vendors.filter((v) => v.total > 0);

      const sortedPositive = positiveVendors
        .slice()
        .sort((a, b) => a.total - b.total);

      return [...sortedPositive];
    } else {
      return vendors;
    }
  }, [tableData, sortVendors, sharedTableData.formData.qty, selectedmr]);

  const vatRowIndex = tableData.findIndex(
    (row) => row.particulars.trim().toUpperCase() === "VAT @5%"
  );

  const vendorTotals = vendorInfoWithTotal.map((vendor) => {
    return (
      tableData.reduce((sum, row, idx) => {
        if (shouldSkipRow(row.particulars)) return sum;
        if (idx >= vatRowIndex && vatRowIndex !== -1) return sum;
        if (row.isRating) return sum;
        const value = parseFloat(row.vendors?.[`vendor_${vendor.index}`] || 0);
        return sum + (isNaN(value) ? 0 : value);
      }, 0) * Number(sharedTableData.formData.qty || 1)
    );
  });
  useEffect(() => {
    if (vendorTotals.some((val) => val > 0) && selectedVendorIndex === null) {
      setSelectedVendorIndex(0);
    }
  }, [vendorTotals]);
  const columns = useMemo(() => {
    const descriptionColumns = [
      columnHelper.accessor("sl", {
        header: "Sl. No.",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("particulars", {
        header: "Particulars",
        cell: (info) => info.getValue(),
      }),
    ];

    const vendorColumns = vendorInfoWithTotal.map((vendor, index) => {
      const vendorKey = `vendor_${vendor.index}`;
      return {
        id: vendorKey,
        header: () => null,
        accessorFn: (row) => row.vendors?.[vendorKey] || "",
        cell: ({ row, getValue }) => {
          const value = getValue() || "";
          const isAvailability =
            row.original.particulars.trim().toUpperCase() === "AVAILABILITY";
          const isCompanyname =
            row.original.particulars.trim().toUpperCase() === "VENDOR NAME";
          const isRemarks =
            row.original.particulars.trim().toUpperCase() === "REMARKS";
          const isReadOnly = !userInfo?.isAdmin;
          if (isAvailability) {
            if (!userInfo?.isAdmin) {
              return <div className="text-center">{value || "-"}</div>;
            }
            return (
              <select
                value={value || ""}
                onChange={(e) =>
                  handleInputChange(row.index, vendorKey, e.target.value)
                }
                disabled={isReadOnly}
                className={`w-full px-2 py-1 ${
                  isReadOnly
                    ? "cursor-not-allowed bg-gray-200"
                    : "border rounded bg-gray-100"
                }`}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            );
          }

          return (
            <>
              {isReadOnly ? (
                <div
                  className={`max-w-2xl px-2 py-1 text-center break-words whitespace-normal ${isCompanyname ? "font-bold" : ""}`}
                  style={{ maxWidth: "150px" }}
                >
                  {value}
                </div>
              ) : (
                <input
                  key={`${row.id}_${vendorKey}`}
                  type="text"
                  value={value}
                  placeholder={
                    isCompanyname
                      ? "Vendor name"
                      : isRemarks
                        ? "--Remarks--"
                        : ""
                  }
                  disabled={freezequantity}
                  onChange={(e) =>
                    handleInputChange(row.index, vendorKey, e.target.value)
                  }
                  className={`w-full px-2 py-1 text-center  font-semibold border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all placeholder:text-gray-400`}
                  aria-label={
                    isCompanyname
                      ? "Vendor name"
                      : isRemarks
                        ? "Remarks"
                        : "Input"
                  }
                />
              )}
            </>
          );
        },
      };
    });

    return [
      {
        header: "Description",
        columns: descriptionColumns,
      },
      ...vendorColumns,
    ];
  }, [
    userInfo?.isAdmin,
    sortVendors,
    selectedmr == "default" || selectedmr == "" || selectedmr === null
      ? ""
      : vendorInfoWithTotal,
  ]);
  const vendorVATs = useMemo(() => {
    if (
      !Array.isArray(vendorInfoWithTotal) ||
      vendorInfoWithTotal.length === 0 ||
      (newMr && !hasInputActivity)
    ) {
      return Array(vendorInfoWithTotal.length).fill(0);
    }

    return vendorInfoWithTotal.map((vendor) => {
      const total = parseFloat(vendor.total || 0);
      const vat = ((total * vatRate) / 100) * sharedTableData.formData.qty;
      return isNaN(vat) ? 0 : vat;
    });
  }, [vendorInfoWithTotal, vatRate, newMr, hasInputActivity]);

  const vendorNetPrices = vendorTotals.map(
    (total, idx) => total + vendorVATs[idx]
  );

  const handleInputChange = (rowIndex, vendorKey, newValue) => {
    setTableData((prevData) => {
      const updated = [...prevData];
      updated[rowIndex] = {
        ...updated[rowIndex],
        vendors: {
          ...updated[rowIndex].vendors,
          [vendorKey]: newValue,
        },
      };
      const hasInput = updated.some((row) =>
        Object.values(row.vendors).some((val) => val && val.trim() !== "")
      );
      setHasInputActivity(hasInput);

      return updated;
    });
  };

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto w-full">
      <table className="table border-collapse border border-gray-300 w-4xl text-sm">
        <thead className="text-center bg-gray-100">
          <tr>
            <th colSpan={2} className="border px-4 py-2 align-bottom w-64">
              Description
            </th>
            {vendorInfoWithTotal.map((vendor) => (
              <th key={vendor.id} className="border px-4 py-2 w-40">
                <div className="flex flex-col items-center">
                  <span className="font-medium">Vendor {vendor.id}</span>
                </div>
              </th>
            ))}
          </tr>
          <tr>
            <th className="border px-4 py-2 w-20 whitespace-nowrap">Sl. No.</th>
            <th className="border px-4 py-2 w-96 whitespace-nowrap">
              Particulars
            </th>

            {vendorInfoWithTotal.map((vendor) => (
              <th
                key={vendor.id}
                className="border px-4 py-2 text-xs text-gray-600 w-40"
              >
                <div className="flex justify-center gap-1">
                  <span>UNIT PRICE</span>
                  <span className="text-xs font-medium w-4 text-gray-500">
                    {currencysymbol}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => {
            const isTotalRow =
              row.original.particulars.trim().toUpperCase() === "NET PRICE";
            const cells = row.getVisibleCells();
            return (
              <tr key={row.id}>
                {rowIndex === 0 && (
                  <td
                    rowSpan={table.getRowModel().rows.length}
                    className="border px-4 py-2 align-top text-center font-semibold"
                  >
                    1
                  </td>
                )}

                {cells
                  .filter((cell) => cell.column.id !== "sl")
                  .map((cell, colIndex) => {
                    const isVendorColumn =
                      cell.column.id?.startsWith("vendor_");
                    const vendorIndex = vendorInfoWithTotal.findIndex(
                      (v) => `vendor_${v.index}` === cell.column.id
                    );

                    return (
                      <td
                        key={cell.id}
                        className={`border px-4 py-2 align-top whitespace-nowrap  ${
                          isTotalRow ? "bg-yellow-100" : ""
                        }`}
                      >
                        {isTotalRow && isVendorColumn
                          ? vendorTotals[vendorIndex]?.toFixed(2)
                          : flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                      </td>
                    );
                  })}
              </tr>
            );
          })}
          <tr>
            <td
              colSpan={2}
              className="border px-4 py-2 font-semibold bg-yellow-50  text-center gap-2"
            >
              Total Price (Excl. VAT)
              {sharedTableData.formData?.currency && (
                <span className="ml-2  text-xs tracking-wide font-medium text-gray-500 align-middle">
                  ({sharedTableData.formData.currency})
                </span>
              )}
            </td>
            {vendorTotals.map((val, idx) => (
              <td
                key={`total_${idx}`}
                className="border px-4 py-2 font-semibold text-center bg-yellow-100"
              >
                {val.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            ))}
          </tr>
          <tr>
            <td
              colSpan={2}
              className="border px-4 py-2 font-semibold text-center"
            >
              VAT @5%
            </td>
            {vendorVATs.map((val, idx) => (
              <td
                key={`vat_${idx}`}
                className="border px-4 py-2 font-semibold text-center"
              >
                {val.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            ))}
          </tr>

          <tr>
            <td
              colSpan={2}
              className="border px-4 py-2 font-semibold text-center"
            >
              Net Price (Incl. VAT)
              {sharedTableData.formData?.currency && (
                <span className="ml-2  text-xs tracking-wide font-medium text-gray-500 align-middle">
                  ({sharedTableData.formData.currency})
                </span>
              )}
            </td>
            {vendorNetPrices.map((val, idx) => (
              <td
                key={`net_${idx}`}
                className="border px-4 py-2 font-semibold text-center"
              >
                {val.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </td>
            ))}
          </tr>
          <tr>
            <td
              colSpan={2}
              className="border px-4 py-2 font-semibold text-center"
            >
              Rating
            </td>
            {vendorNetPrices.map((val, idx) => (
              <td
                key={`rating_${idx}`}
                className="border px-4 py-2 font-semibold text-center"
              >
                {isMRSelected ? `L${idx + 1}` : "-"}
              </td>
            ))}
          </tr>

          {(sharedTableData.formData.sentForApproval == "yes" ||
            !userInfo?.isAdmin ||
            sortVendors) &&
            vendorTotals.some((val) => val > 0) && (
              <tr>
                <td
                  colSpan={2}
                  className="border px-4 py-2 font-semibold bg-green-50 text-green-800 text-center"
                >
                  Selected Vendor
                </td>
                {vendorTotals.map((_, index) => (
                  <td
                    key={index}
                    className={`border px-4 py-2 text-center font-semibold ${
                      index === selectedVendorIndex
                        ? "bg-green-100 text-green-700"
                        : "text-gray-400"
                    }`}
                  >
                    <label
                      className={`relative group inline-block select-none ${
                        sharedTableData.formData.sentForApproval === "yes"
                          ? "cursor-auto"
                          : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="radio"
                        name="selectedVendor"
                        checked={selectedVendorIndex === index}
                        onChange={() => {
                          if (
                            sharedTableData.formData.sentForApproval !==
                              "yes" &&
                            selectedVendorIndex !== index
                          ) {
                            setSelectedVendorIndex(index);
                          }
                        }}
                        disabled={
                          sharedTableData.formData.sentForApproval === "yes" &&
                          selectedVendorIndex !== null &&
                          selectedVendorIndex !== index
                        }
                        className="sr-only "
                      />
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs ${
                          selectedVendorIndex === index
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700  hover:bg-gray-300"
                        } ${sharedTableData.formData.sentForApproval === "yes" ? "cursor-auto" : ""}`}
                      >
                        {selectedVendorIndex === index ? (
                          <span className="flex  items-center ">
                            <>Selected </>
                            {sharedTableData.formData.selectedVendorReason && (
                              <>
                                <IoMdInformationCircleOutline
                                  className="pl-2 "
                                  size={25}
                                  onClick={() => setShowTooltip(true)}
                                />
                                {showTooltip && (
                                  <VendorSelectionTooltip
                                    setShowTooltip={setShowTooltip}
                                    message={
                                      "The reason for choosing this vendor will be displayed below!!"
                                    }
                                  />
                                )}
                              </>
                            )}
                          </span>
                        ) : (
                          <span
                            className={`${sharedTableData.formData.sentForApproval === "yes" ? "cursor-not-allowed" : ""}`}
                          >
                            Select
                          </span>
                        )}
                      </span>
                    </label>
                  </td>
                ))}
              </tr>
            )}
          <tr>
            <td
              colSpan={2}
              className="border px-4 py-2 font-semibold text-center"
            >
              Recommendation (if any)
            </td>
            {vendorNetPrices.map((_, idx) => (
              <td
                key={`net_${idx}`}
                className="border px-4 py-2 font-semibold text-center"
              >
                {isMRSelected && idx === selectedVendorIndex
                  ? sharedTableData.formData.selectedVendorReason
                  : "--"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
