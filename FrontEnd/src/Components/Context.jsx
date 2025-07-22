import { createContext, useState } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [newuser, setNewuser] = useState(false);
  const [sharedTableData, setSharedTableData] = useState(null);

  return (
    <AppContext.Provider
      value={{ setNewuser, newuser, sharedTableData, setSharedTableData }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
