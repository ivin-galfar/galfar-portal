import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { AppContext } from "./Context";
import useUserInfo from "../CustomHooks/useUserInfo";

const rawData = [
  { id: 1, company: "Techzpark LLC" },
  { id: 2, company: "DevHouse Ltd" },
  { id: 3, company: "Devtech Ltd" },
];

const descriptionRows = [
  { sl: "1", particulars: "UNIT PRICES", qty: "1" },
  { sl: "1", particulars: "MOBILIZATION CHARGE", qty: "1" },
  { sl: "1", particulars: "DEMOBILIZATION Charge", qty: "1" },
  { sl: "1", particulars: "Zone II CHarges", qty: "1" },
  { sl: "1", particulars: "CICPA/AL DHAFRA CHARGES", qty: "1" },
  { sl: "1", particulars: "OTHER (TOLL CHARGES0", qty: "1" },
  { sl: "1", particulars: "ACCESSORIES (IF ANY)", qty: "1" },
  { sl: "1", particulars: "TPI CHARGES (IF ANY)", qty: "1" },
  { sl: "1", particulars: "INSURANCE (IF ANY)", qty: "1" },
  { sl: "1", particulars: "VAT @5%", qty: "1" },
  { sl: "1", particulars: "AVAILABILITY", qty: "1" },
  { sl: "1", particulars: "NOTE", qty: "1" },
  { sl: "1", particulars: "RATING", qty: "1" },
];

const createData = () =>
  descriptionRows.map((descRow, idx) => {
    const row = {
      id: `row_${idx}`,
      sl: descRow.sl,
      particulars: descRow.particulars,
      qty: descRow.qty,
      vendors: {},
    };
    rawData.forEach((_, vIdx) => {
      row.vendors[`vendor_${vIdx}`] = "";
    });
    return row;
  });

const columnHelper = createColumnHelper();

export default function VerticalTable({ showcalc }) {
  const {
    sharedTableData,
    setSharedTableData,
    cleartable,
    setCleartable,
    sortVendors,
    setSortVendors,
    setHasInputActivity,
    reqApprovalstatus,
  } = useContext(AppContext);
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
        const value = parseFloat(row.vendors?.[`vendor_${vIdx}`] || 0);
        return sum + (isNaN(value) ? 0 : value);
      }, 0),
      index: vIdx,
    }));
    if (sortVendors || !userInfo?.isAdmin) {
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
      if (idx >= vatRowIndex && vatRowIndex !== -1) return sum;
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
          const isReadOnly = !userInfo?.isAdmin;
          const isVAT =
            row.original.particulars.trim().toUpperCase() === "VAT @5%";
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
          if (isVAT) {
            return (
              <div className="text-center font-semibold text-gray-700">
                {vendorVATs[index]?.toFixed(2)}
              </div>
            );
          }

          return (
            <input
              key={`${row.id}_${vendorKey}`}
              type="text"
              value={value}
              onChange={(e) =>
                handleInputChange(row.index, vendorKey, e.target.value)
              }
              className={`w-full px-2 py-1 text-center ${
                !userInfo?.isAdmin
                  ? "cursor-not-allowed"
                  : "border rounded bg-gray-100"
              }`}
              readOnly={isReadOnly}
            />
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
    !userInfo?.isAdmin ? vendorInfoWithTotal : "",
  ]);
  const vendorVATs = useMemo(() => {
    if (!Array.isArray(vendorInfoWithTotal) || vendorInfoWithTotal.length === 0)
      return [];

    const vatRowExists = tableData.some(
      (row) => row.particulars?.trim().toUpperCase() === "VAT @5%"
    );
    if (!vatRowExists) return [];

    return vendorInfoWithTotal.map((vendor) => {
      const total = parseFloat(vendor.total || 0);
      const vat = (total * vatRate) / 100;
      return isNaN(vat) ? 0 : vat;
    });
  }, [tableData, vendorInfoWithTotal, vatRate]);

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
                  <span className="text-xs">{vendor.company}</span>
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
                        className={`border px-4 py-2 align-top whitespace-nowrap font-semibold ${
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
                {val.toFixed(2)}
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
                {val.toFixed(2)}
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
                {val.toFixed(2)}
              </td>
            ))}
          </tr>
          {(sharedTableData.formData.sentForApproval == "yes" ||
            showcalc ||
            !userInfo?.isAdmin) &&
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
                    {index === 0 ? "✅ Selected" : "-"}
                  </td>
                ))}
              </tr>
            )}
        </tbody>
      </table>
    </div>
  );
}
