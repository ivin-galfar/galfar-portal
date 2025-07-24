import { createContext, useState } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [newuser, setNewuser] = useState(false);
  const initialTableData = []; // or import and call your createData() function here

  const [sharedTableData, setSharedTableData] = useState({
    formData: {
      hiringName: "",
      dateValue: new Date().toISOString().split("T")[0], // proper format for date input
      projectValue: "",
      locationValue: "",
      equipMrNoValue: "",
      emRegNoValue: "",
      requiredDateValue: new Date().toISOString().split("T")[0],
      requirementDurationValue: "",
    },
    tableData: initialTableData,
  });

  return (
    <AppContext.Provider
      value={{
        setNewuser,
        newuser,
        sharedTableData,
        setSharedTableData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
