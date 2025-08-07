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
  } = useContext(AppContext);
  const [particular, setParticular] = useState([]);
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
  ];
  const createData = () =>
    particular.map((descRow, idx) => {
      const row = {
        id: `row_${idx}`,
        sl: 1,
        particulars: descRow,
        qty: 1,
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

  useEffect(() => {
    setSharedTableData((prev) => ({ ...prev, tableData }));
  }, [tableData, setSharedTableData]);

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

    if (sortVendors || !userInfo?.isAdmin || sharedTableData.formData?.status) {
      return vendors.slice().sort((a, b) => a.total - b.total);
    } else {
      return vendors;
    }
  }, [tableData, sortVendors]);

  const vatRowIndex = tableData.findIndex(
    (row) => row.particulars.trim().toUpperCase() === "VAT @5%"
  );

  const vendorTotals = vendorInfoWithTotal.map((vendor) => {
    return tableData.reduce((sum, row, idx) => {
      if (shouldSkipRow(row.particulars)) return sum;
      if (idx >= vatRowIndex && vatRowIndex !== -1) return sum;
      if (row.isRating) return sum;
      const value = parseFloat(row.vendors?.[`vendor_${vendor.index}`] || 0);
      return sum + (isNaN(value) ? 0 : value);
    }, 0);
  });

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
      columnHelper.accessor("qty", {
        header: "Qty",
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
                value={value}
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
                  onChange={(e) =>
                    handleInputChange(row.index, vendorKey, e.target.value)
                  }
                  className={`w-full px-2 py-1 text-center text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all placeholder:text-gray-400`}
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
    ...(userInfo?.isAdmin ? [] : [vendorInfoWithTotal]),
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
      const vat = (total * vatRate) / 100;
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
            <th colSpan={3} className="border px-4 py-2 align-bottom w-64">
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

            <th className="border px-4 py-2 whitespace-nowrap">Qty</th>
            {vendorInfoWithTotal.map((vendor) => (
              <th
                key={vendor.id}
                className="border px-4 py-2 text-xs text-gray-600 whitespace-nowrap w-40"
              >
                UNIT PRICE
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
              colSpan={3}
              className="border px-4 py-2 font-semibold bg-yellow-50 text-yellow-800 text-center"
            >
              Total Price (Excl. VAT)
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
              colSpan={3}
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
              colSpan={3}
              className="border px-4 py-2 font-semibold  text-center"
            >
              Net Price (Incl. VAT)
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
          {(sharedTableData.formData.sentForApproval == "yes" ||
            !userInfo?.isAdmin ||
            sortVendors) &&
            vendorTotals.some((val) => val > 0) && (
              <tr>
                <td
                  colSpan={3}
                  className="border px-4 py-2 font-semibold bg-green-50 text-green-800 text-center"
                >
                  Selected Vendor
                </td>
                {vendorTotals.map((_, index) => (
                  <td
                    key={index}
                    className={`border px-4 py-2 text-center font-semibold ${
                      index === 0
                        ? "bg-green-100 text-green-700"
                        : "text-gray-400"
                    }`}
                  >
                    {index === 0 ? (
                      <div className="relative group inline-block">
                        <span className="inline-block bg-green-500 text-white px-2 py-0.5 rounded text-xs">
                          ✅ Selected
                        </span>
                        <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          Primary selected vendor
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">–</span>
                    )}
                  </td>
                ))}
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );
}
