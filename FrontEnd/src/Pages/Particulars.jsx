import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import React from "react";
import { useEffect } from "react";
import fetchParticulars from "../../Helpers/ParticularsApi";
import { useContext } from "react";
import { AppContext } from "../Components/Context";

const Particulars = () => {
  const values = {
    Sl: String,
    template: {
      name: String,
      date: Date,
      owner: String,
    },
  };

  const { particulars, setParticulars } = useContext(AppContext);

  useEffect(() => {
    const loadParticulars = async () => {
      try {
        const particulars = await fetchParticulars();
        setParticulars(particulars);
      } catch (error) {}
    };
    loadParticulars();
  }, []);

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
    // data,
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
