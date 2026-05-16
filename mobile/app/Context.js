import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [sessionData, setSessionData] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  return (
    <AppContext.Provider
      value={{
        sessionData,
        setSessionData,
        analysisData,
        setAnalysisData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
