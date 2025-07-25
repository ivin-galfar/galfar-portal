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
  { sl: "1", particulars: "TOTAL PRICE", qty: "1" },
  { sl: "1", particulars: "VAT @5%", qty: "1" },
  { sl: "1", particulars: "AVAILABLLITY", qty: "1" },
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

export default function VerticalTable() {
  const { sharedTableData, setSharedTableData, cleartable } =
    useContext(AppContext);
  const [tableData, setTableData] = useState(() =>
    sharedTableData?.tableData?.length
      ? sharedTableData.tableData
      : createData()
  );

  const userInfo = useUserInfo();

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
    }
  }, [cleartable, tableData]);

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

    const vendorColumns = rawData.map((vendor, index) => ({
      id: `vendor_${index}`,
      header: () => null,
      accessorFn: (row) => row.vendors?.[`vendor_${index}`] || "",
      cell: ({ row, getValue }) => (
        <input
          type="text"
          value={getValue() || ""}
          onChange={(e) =>
            handleInputChange(row.index, `vendor_${index}`, e.target.value)
          }
          className={`w-full px-2 py-1 ${
            !userInfo?.isAdmin
              ? "cursor-not-allowed"
              : "border rounded bg-gray-100"
          }`}
          readOnly={!userInfo?.isAdmin}
        />
      ),
    }));

    return [
      {
        header: "Description",
        columns: descriptionColumns,
      },
      ...vendorColumns,
    ];
  }, [userInfo?.isAdmin]);

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
            {rawData.map((vendor) => (
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
            {rawData.map((vendor) => (
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
                  .map((cell) => (
                    <td
                      key={cell.id}
                      className="border px-4 py-2 align-top whitespace-nowrap"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
