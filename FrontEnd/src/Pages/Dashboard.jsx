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
import { Link } from "react-router-dom";
import { FaArrowAltCircleRight } from "react-icons/fa";

const Dashboard = () => {
  const {
    receipts,
    setReqMrno,
    setReceipts,
    setMrno,
    setAllReceipts,
    allreceipts,
    statusFilter,
    setStatusFilter,
    multiStatusFilter,
    setMultiStatusFilter,
  } = useContext(AppContext);

  const userInfo = useUserInfo();
  const statusProgress = {
    "Pending For HOM": 20,
    "Pending For GM": 40,
    "Pending For CEO": 60,
    Approved: 100,
    Rejected: 100,
    "": 0,
  };

  const statusMapping = {
    Initiator: [
      "Pending For HOM",
      "Pending For GM",
      "Pending For CEO",
      "Approved",
      "Rejected",
      "",
    ],
    Manager: [
      "Pending For HOM",
      "Pending For GM",
      "Pending For CEO",
      "Rejected",
      "Approved",
    ],
    GM: ["Pending for GM", "Pending for CEO", "Approved", "Rejected"],
    CEO: ["Pending for CEO", "Approved", "Rejected"],
  };
  const expectedStatuses = (statusMapping[userInfo?.role] || []).map((s) =>
    s.toLowerCase()
  );
  const pendingStatuses = expectedStatuses.filter((s) =>
    s.startsWith("pending")
  );
  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const { filteredReceipts, reqMrValues, categorizedReceipts, mrValues } =
          await fetchStatments({
            expectedStatuses,
            userInfo,
          });
        setAllReceipts(filteredReceipts);
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

  const filteredReceiptsOnstatus = useMemo(() => {
    if (!Array.isArray(allreceipts)) return [];
    if (statusFilter === "All") return receipts;

    if (multiStatusFilter && multiStatusFilter.length > 0) {
      return allreceipts.filter((r) =>
        multiStatusFilter
          .filter((status) => status !== "Approved" && status !== "Rejected")
          .map((status) => status?.toLowerCase())

          .includes(r.formData?.status.toLowerCase())
      );
    }
    return allreceipts.filter(
      (r) => (r.formData?.status).toLowerCase() === statusFilter.toLowerCase()
    );
  }, [allreceipts, statusFilter, multiStatusFilter]);

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("sl", {
      header: "Sl. No.",
      cell: ({ row }) => row.index + 1,
    }),
    columnHelper.accessor((row) => row?.formData.dateValue, {
      id: "date",
      header: "Created Date",
      cell: (info) => {
        const value = info.getValue();
        if (!value) return "-";

        const d = new Date(value);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        return `${day}-${month}-${year}`;
      },
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
      cell: (info) => {
        const status = info.getValue() || "";
        const progress = statusProgress[status] || 0;

        const progressColor =
          status === "Rejected"
            ? "bg-red-500"
            : status === "Approved"
              ? "bg-green-500"
              : status === "Pending For HOM"
                ? "bg-yellow-400"
                : status === "Pending For GM"
                  ? "bg-yellow-500"
                  : status === "Pending For CEO"
                    ? "bg-yellow-600"
                    : "bg-gray-300";

        return (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700">
              {status || "Not Sent For Approval"}
            </span>

            <div className="relative max-w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div
                className={`h-2 ${progressColor} rounded-full transition-all duration-500`}
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor(
      (row) => {
        const commentsArray = row?.formData?.approverdetails
          ?.filter((item) => item.comments && item.comments.trim() !== "")
          .map((item) => `${item.role}: ${item.comments}`);

        return commentsArray?.length ? commentsArray.join("\n") : "-";
      },
      {
        id: "comments",
        header: "Comments",
        cell: (info) => (
          <span className="whitespace-pre-wrap">{info.getValue() || "-"}</span>
        ),
      }
    ),
  ];

  const table = useReactTable({
    data: filteredReceiptsOnstatus || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="w-full p-5">
      <div className="flex border-b border-gray-300 mb-4">
        {["All", "Approved", "Rejected", "Pending"].map((tab) => {
          const isActive =
            (tab === "All" && statusFilter === "All") ||
            (tab === "Approved" && statusFilter === "Approved") ||
            (tab === "Rejected" && statusFilter === "Rejected") ||
            (tab === "Pending" && multiStatusFilter.length > 0);

          let activeColor = "border-blue-500 text-blue-600";
          let inactiveColor =
            "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300";

          if (tab === "Approved") {
            activeColor = "border-green-500 text-green-600";
            inactiveColor =
              "border-transparent text-gray-500 hover:text-green-500";
          } else if (tab === "Rejected") {
            activeColor = "border-red-500 text-red-600";
            inactiveColor =
              "border-transparent text-gray-500 hover:text-red-500";
          } else if (tab === "Pending") {
            activeColor = "border-yellow-500 text-yellow-600";
            inactiveColor =
              "border-transparent text-gray-500 hover:text-yellow-500";
          }

          return (
            <button
              key={tab}
              onClick={() => {
                switch (tab) {
                  case "All":
                    setStatusFilter("All");
                    setMultiStatusFilter([]);
                    break;
                  case "Approved":
                    setStatusFilter("Approved");
                    setMultiStatusFilter([]);
                    break;
                  case "Rejected":
                    setStatusFilter("Rejected");
                    setMultiStatusFilter([]);
                    break;
                  case "Pending":
                    setStatusFilter("");
                    setMultiStatusFilter(pendingStatuses);
                    break;
                }
              }}
              className={`px-4 py-2 -mb-px border-b-2 font-medium cursor-pointer transition-colors ${
                isActive ? activeColor : inactiveColor
              }`}
            >
              {tab}
            </button>
          );
        })}
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
                    <Link
                      className="px-2 py-1 bg-blue-500 text-white rounded inline-flex justify-center items-center gap-2 hover:bg-blue-600 cursor-pointer"
                      to={`/receipts/${row.original.formData.equipMrNoValue}`}
                    >
                      View <FaArrowAltCircleRight />
                    </Link>
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
