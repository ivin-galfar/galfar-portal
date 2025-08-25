import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../Components/Context";
import fetchStatments from "../APIs/StatementsApi";
import useUserInfo from "../CustomHooks/useUserInfo";
import { Link } from "react-router-dom";
import { FaArrowAltCircleRight, FaTrash } from "react-icons/fa";
import Alerts from "../Components/Alerts";
import { REACT_SERVER_URL } from "../../config/ENV";
import axios from "axios";
import { IoPrint } from "react-icons/io5";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

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
    selectedmr,
    deleted,
    setDeleted,
    sharedTableData,
  } = useContext(AppContext);

  const userInfo = useUserInfo();
  const statusProgress = {
    "Pending For HOM": 20,
    "Pending for GM": 40,
    "Pending for CEO": 60,
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

  const [triggerdelete, setTriggerdelete] = useState(false);
  const [errormessage, setErrormessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [deleteMr, setdeleteMr] = useState("");
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
  }, [deleted]);
  const handleDelete = async (mr) => {
    try {
      const config = {
        "Content-type": "application/json",
        "Access-Control-Allow-Origin": "*",
      };
      const response = await axios.delete(
        `${REACT_SERVER_URL}/receipts/${mr}`,
        config
      );
      setShowToast(true);
      setErrormessage("");
      setDeleted(true);
      setTriggerdelete(false);
      setTimeout(() => {
        setShowToast(false);
        setDeleted(false);
      }, 1500);
    } catch (error) {
      setDeleted(false);
      let message = error?.response?.data?.message;
      setErrormessage(message ? message : error.message);
    }
  };
  const calculateTotals = (tableData, qty) => {
    if (!tableData || tableData.length === 0)
      return { totals: [], vats: [], netPrices: [] };

    const vendorCount = Object.keys(tableData[0].vendors || {}).length;
    const totals = new Array(vendorCount).fill(0);

    tableData.forEach((row, index) => {
      if (index === 0) return;
      if (row.particulars?.trim().toUpperCase() === "RATING") return;

      Object.entries(row.vendors).forEach(([_, val], vIdx) => {
        const value = parseFloat(val) || 0;
        totals[vIdx] += qty > 0 ? value * qty : value;
      });
    });

    const vatRate = sharedTableData.formData.vatRate ?? 0.05;
    const vats = totals.map((t) => parseFloat((t * vatRate).toFixed(2)));
    const netPrices = totals.map((t, idx) =>
      parseFloat((t + vats[idx]).toFixed(2))
    );

    return { totals, vats, netPrices };
  };

  const handlePrint = (printcontents, totals, vats, netPrices, currency) => {
    const doc = new jsPDF();
    const { formData, tableData } = printcontents;

    doc.setFontSize(14);
    doc.text("GALFAR ENGINEERING & CONTRACTING WLL EMIRATES", 105, 15, {
      align: "center",
    });

    doc.setFontSize(12);
    doc.text(
      `COMPARATIVE STATEMENT - ${formData.hiringName} (Hiring)`,
      105,
      25,
      {
        align: "center",
      }
    );

    doc.setFontSize(10);
    doc.text(`Project: ${formData.projectValue}`, 14, 40);
    doc.text(`Location: ${formData.locationValue}`, 14, 46);
    doc.text(`Quantity: ${formData.qty}`, 14, 52);

    doc.text(`EQUIP MR NO: ${formData.equipMrNoValue}`, 105, 40, {
      align: "center",
    });
    doc.text(`EM REG NO: ${formData.emRegNoValue}`, 105, 46, {
      align: "center",
    });

    doc.text(
      `REQUIRED DATE: ${new Date(formData.requiredDateValue).toLocaleDateString()}`,
      200,
      40,
      { align: "right" }
    );
    doc.text(
      `REQUIRED DURATION: ${formData.requirementDurationValue}`,
      200,
      46,
      { align: "right" }
    );

    const activeVendorIndexes = totals
      .map((t, idx) => (t > 0 ? idx : -1))
      .filter((idx) => idx !== -1);
    const vendorNames = Object.values(tableData[0].vendors);
    const vendorHeaders = activeVendorIndexes.map((i) => vendorNames[i]);

    const tableHead = [["Particulars", ...vendorHeaders]];

    const tableBody = tableData
      .filter((row, idx) => idx !== 0)
      .map((row) => {
        const vendors = Object.values(row.vendors || {});
        const rowValues = activeVendorIndexes.map((i) => vendors[i] || 0);
        return [row.particulars, ...rowValues];
      });

    tableBody.push(
      [
        `Total (Excl. VAT) ${currency}`,
        ...activeVendorIndexes.map((i) => totals[i].toFixed(2)),
      ],
      [
        `VAT @5% ${currency}`,
        ...activeVendorIndexes.map((i) => vats[i].toFixed(2)),
      ],
      [
        `Net Price (Incl. VAT) ${currency}`,
        ...activeVendorIndexes.map((i) => netPrices[i].toFixed(2)),
      ]
    );
    autoTable(doc, {
      startY: 65,
      head: tableHead,
      body: tableBody,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [0, 0, 0], textColor: 255 },
      didParseCell: (data) => {
        const text = data.cell.text[0];
        if (
          text.includes("Total (Excl. VAT)") ||
          text.includes("Net Price (Incl. VAT)")
        ) {
          data.cell.styles.textColor = [0, 0, 0];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.halign = "center";
        }
        if (text.includes("VAT @5%")) {
          data.cell.styles.halign = "center";
          data.cell.styles.fontStyle = "bold";
        }
      },
    });

    if (formData.status === "Approved") {
      const approvedText = "APPROVED";
      const lastTableFinalY =
        doc.previousAutoTable?.finalY || doc.lastAutoTable?.finalY || 65;

      const centerX = doc.internal.pageSize.width / 2;
      const centerY = lastTableFinalY + 25;

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 128, 0);

      const textWidth = doc.getTextWidth(approvedText);
      const paddingX = 4;
      const paddingY = 2;
      const rectWidth = textWidth + paddingX * 2;
      const rectHeight = 14 + paddingY * 2;

      doc.setFillColor(220, 255, 220);
      doc.rect(
        centerX - rectWidth / 2,
        centerY - rectHeight / 2,
        rectWidth,
        rectHeight,
        "F"
      );

      doc.text(approvedText, centerX, centerY, {
        align: "center",
        baseline: "middle",
      });
    }
    doc.setTextColor(0, 0, 0);
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        14,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: "right" }
      );
    }

    doc.save("Comparative_Statement.pdf");
  };

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
                : status === "Pending for GM"
                  ? "bg-yellow-500"
                  : status === "Pending for CEO"
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
                  <td className="border-gray-300 px-4 py-2 text-sm text-gray-700 text-center">
                    <div className="flex items-center justify-center gap-4">
                      <Link
                        className="px-2 py-1 bg-blue-500 text-white rounded inline-flex justify-center items-center gap-2 hover:bg-blue-600 cursor-pointer"
                        to={`/receipts/${row.original.formData.equipMrNoValue}`}
                      >
                        View <FaArrowAltCircleRight />
                      </Link>
                      <FaTrash
                        className={`mr-1 text-red-500 ${!userInfo.isAdmin ? "hidden" : "cursor-pointer"}`}
                        size={14}
                        onClick={() => {
                          setdeleteMr(row.original.formData.equipMrNoValue);
                          setTriggerdelete(true);
                        }}
                      />
                      <IoPrint
                        className={`cursor-pointer ${!userInfo.isAdmin || row.original.formData.status !== "Approved" ? "invisible" : ""}`}
                        size={25}
                        onClick={() => {
                          const { totals, vats, netPrices } = calculateTotals(
                            row.original.tableData,
                            row.original.formData.qty
                          );
                          handlePrint(
                            row.original,
                            totals,
                            vats,
                            netPrices,
                            row.original.formData.currency
                          );
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {triggerdelete && (
        <Alerts
          message="Are you sure you want to Delete the Selected statement?"
          onCancel={() => setTriggerdelete(false)}
          onConfirm={() => handleDelete(deleteMr)}
        />
      )}
      {showToast && !errormessage && deleted && (
        <div className="z-[9999] fixed top-5 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded shadow-lg transition-all duration-300 animate-slide-in">
          ✅ Statement successfully Deleted!!
        </div>
      )}
    </div>
  );
};

export default Dashboard;
