import { createContext, useState } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [newuser, setNewuser] = useState(true);
  const initialTableData = [];
  const [sharedTableData, setSharedTableData] = useState({
    formData: {
      hiringName: "",
      dateValue: new Date().toISOString().split("T")[0],
      projectValue: "",
      locationValue: "",
      equipMrNoValue: "",
      emRegNoValue: "",
      requiredDateValue: new Date().toISOString().split("T")[0],
      requirementDurationValue: "",
    },
    tableData: initialTableData,
  });
  const [cleartable, setCleartable] = useState(false);
  const [mrno, setMrno] = useState([]);
  const [reqmrno, setReqMrno] = useState([]);
  const [sortVendors, setSortVendors] = useState(false);
  const [hasInputActivity, setHasInputActivity] = useState(false);
  const [isMRSelected, setIsMRSelected] = useState(false);
  const [reqApprovalstatus, setreqApprovalstatus] = useState("");
  const [selectedmr, setSelectedMr] = useState(null);

  return (
    <AppContext.Provider
      value={{
        setNewuser,
        newuser,
        sharedTableData,
        setSharedTableData,
        setCleartable,
        cleartable,
        mrno,
        setMrno,
        sortVendors,
        setSortVendors,
        hasInputActivity,
        setHasInputActivity,
        isMRSelected,
        setIsMRSelected,
        reqApprovalstatus,
        setreqApprovalstatus,
        reqmrno,
        setReqMrno,
        selectedmr,
        setSelectedMr,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
