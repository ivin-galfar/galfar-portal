import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../Components/Context";
import fetchStatments from "../../APIs/StatementsApi";
import useUserInfo from "../CustomHooks/useUserInfo";

const Dashboard = () => {
  const { receipts, setReqMrno, setReceipts, setMrno } = useContext(AppContext);
  const userInfo = useUserInfo();
  const [statusFilter, setStatusFilter] = useState("All");
  const [multiStatusFilter, setMultiStatusFilter] = useState([]);
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
  console.log(multiStatusFilter);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const { reqMrValues, categorizedReceipts, mrValues } =
          await fetchStatments({
            expectedStatuses,
            userInfo,
          });

        setReqMrno(reqMrValues);
        setReceipts(categorizedReceipts);
        setMrno(mrValues);
      } catch (error) {
        const message = error?.response?.data?.message || error.message;
        console.error("Fetch receipts error:", message);
      }
    };

    fetchReceipts();
  }, []);

  const filteredReceipts = useMemo(() => {
    if (!Array.isArray(receipts)) return [];
    if (statusFilter === "All") return receipts;

    if (multiStatusFilter && multiStatusFilter.length > 0) {
      return receipts.filter((r) =>
        multiStatusFilter
          .filter((status) => status !== "Approved")
          .map((status) => status?.toLowerCase())

          .includes(r.formData?.status.toLowerCase())
      );
    }
    return receipts.filter(
      (r) =>
        (r.formData?.status || "").toLowerCase() ===
        (statusFilter || "").toLowerCase()
    );
  }, [receipts, statusFilter, multiStatusFilter]);

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("sl", {
      header: "Sl. No.",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor((row) => row?.formData.hiringName, {
      id: "hiring.name",
      header: "Hiring Name",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.formData.equipMrNoValue, {
      id: "mrno",
      header: "EQUIP MR NO",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.formData.qty, {
      id: "quantity",
      header: "Quantity",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row?.formData.status, {
      id: "status",
      header: "Status",
      cell: (info) => info.getValue() || "-",
    }),
  ];

  const table = useReactTable({
    data: filteredReceipts || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="w-full p-5">
      <div className="flex space-x-4 mb-4">
        <button
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 cursor-pointer"
          onClick={() => {
            setStatusFilter("All");
            setMultiStatusFilter([]);
          }}
        >
          All
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 cursor-pointer"
          onClick={() => setStatusFilter("Approved")}
        >
          Approved
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
          onClick={() => setStatusFilter("Rejected")}
        >
          Rejected
        </button>
        <button
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 cursor-pointer"
          onClick={() => {
            setStatusFilter("");
            setMultiStatusFilter(expectedStatuses);
          }}
        >
          Pending
        </button>
      </div>
      <div className="overflow-x-auto bg-white shadow rounded border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border-b border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700"
                  >
                    {header.isPlaceholder
                      ? null
                      : header.column.columnDef.header}
                  </th>
                ))}
                <th className="border-b border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 text-center">
                  Action
                </th>
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="text-center py-4 text-gray-500"
                >
                  No Statements found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="even:bg-white odd:bg-gray-50 hover:bg-blue-100 cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="border-b border-gray-300 px-4 py-2 text-sm text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                  <td className="border-b border-gray-300 px-4 py-2 text-sm text-gray-700 text-center">
                    <button className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
