import React, { useState, useMemo, useContext, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { AppContext } from "./Context";

const rawData = [
  { id: 1, name: "Ivin", company: "Techzpark LLC" },
  { id: 2, name: "Mary", company: "DevHouse Ltd" },
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

// Create rows with stable IDs for React key and React Table row id
const createData = () =>
  descriptionRows.map((descRow, idx) => {
    const row = {
      id: `row_${idx}`, // unique id important for React & table stability
      sl: descRow.sl,
      particulars: descRow.particulars,
      qty: descRow.qty,
    };

    rawData.forEach((vendor, vIdx) => {
      row[`vendor_${vIdx}`] = ""; // empty string initially for all vendor prices
    });

    return row;
  });

const columnHelper = createColumnHelper();

export default function VerticalTable() {
  const [tableData, setTableData] = useState(createData());
  const { sharedTableData, setSharedTableData } = useContext(AppContext);
  useEffect(() => {
    setSharedTableData((prev) => ({
      ...prev,
      tableData,
    }));
  }, [tableData, setSharedTableData]);

  const columns = useMemo(
    () => [
      {
        header: "Description",
        columns: [
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
        ],
      },
      ...rawData.map((vendor, index) =>
        columnHelper.accessor(`vendor_${index}`, {
          header: () => null,
          cell: (info) => {
            const rowIndex = info.row.index;
            return (
              <input
                type="text"
                value={info.getValue() || ""}
                onChange={(e) =>
                  handleInputChange(rowIndex, `vendor_${index}`, e.target.value)
                }
                className="w-full px-2 py-1 border rounded"
              />
            );
          },
        })
      ),
    ],
    [rawData]
  );

  const handleInputChange = (rowIndex, key, value) => {
    setTableData((prev) =>
      prev.map((row, i) => (i === rowIndex ? { ...row, [key]: value } : row))
    );
  };

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto w-full">
      <table className="table border-collapse border border-gray-300  w-4xl text-sm">
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
