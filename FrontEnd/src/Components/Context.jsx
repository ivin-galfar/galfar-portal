import { createContext, useState } from "react";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [newuser, setNewuser] = useState(false);
  return (
    <AppContext.Provider value={{ setNewuser, newuser }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
