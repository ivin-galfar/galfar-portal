import { createContext, useState } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [newuser, setNewuser] = useState(false);
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
  const [pdfurl, setPdfurl] = useState("");
  const [particulars, setParticulars] = useState([]);
  const [particularname, setParticularName] = useState([]);
  const [newMr, setNewMr] = useState(false);
  const [showupdated, setShowUpdated] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [selectedVendorIndex, setSelectedVendorIndex] = useState(0);
  const [selectedVendorReason, setSelectedVendorReason] = useState(0);

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
        setPdfurl,
        pdfurl,
        particulars,
        setParticulars,
        particularname,
        setParticularName,
        newMr,
        setNewMr,
        setShowUpdated,
        showupdated,
        deleted,
        setDeleted,
        selectedVendorIndex,
        setSelectedVendorIndex,
        setSelectedVendorReason,
        selectedVendorReason,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
