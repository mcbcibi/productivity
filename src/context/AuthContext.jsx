import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

const LOCAL_USER = {
  id: 'local-user',
  email: 'local@device',
  user_metadata: {
    full_name: 'My Workspace',
  },
  isLocal: true,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(LOCAL_USER);

  const signOut = () => {
    // With local storage, resetting or clearing session
    setUser(LOCAL_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading: false,
        isConfigured: false,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
