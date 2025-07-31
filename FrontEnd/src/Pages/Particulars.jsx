import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";

const Particulars = () => {
  const values = {
    Sl: String,
    template: {
      name: String,
      date: Date,
      owner: String,
    },
  };

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("sl", {
      header: "Sl. No.",
      cell: (info) => info.getValue(),
    }),

    columnHelper.accessor((row) => row.template?.name, {
      id: "template.name",
      header: "Template Name",
      cell: (info) => info.getValue() || "-",
    }),
    columnHelper.accessor((row) => row.template?.name, {
      id: "template.date",
      header: "Create Date",
      cell: (info) => {
        const val = info.getValue();
        return val ? new Date(val).toLocaleDateString() : "-";
      },
    }),
    columnHelper.accessor((row) => row.template?.name, {
      id: "template.owner",
      header: "Created By",
      cell: (info) => info.getValue() || "-",
    }),
  ];
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  return (
    <div>
      <div className="p-5 m-5 min-h-screen bg-gray-100"></div>
    </div>
  );
};

export default Particulars;
