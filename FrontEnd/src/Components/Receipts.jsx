import { useContext } from "react";
import useUserInfo from "../CustomHooks/useUserInfo";
import TableHeader from "./ReceiptsHeader";
import ReceiptsHeader from "./ReceiptsHeader";
import MyTable from "./Table";
import { AppContext } from "./Context";

const Receipts = () => {
  const userInfo = useUserInfo();
  const { sharedTableData } = useContext(AppContext);

  return (
    <div className="p-10">
      <h1 className="font-bold mb-4">
        <TableHeader isAdmin={userInfo?.isAdmin} />
      </h1>
      <MyTable />
      <div className="pt-3 flex justify-end gap-3.5">
        <button className="bg-blue-500 text-white rounded-2xl px-4 py-2">
          Reset
        </button>
        <button className="bg-blue-500 text-white rounded-2xl px-2 py-2">
          click me
        </button>
      </div>
    </div>
  );
};

export default Receipts;
