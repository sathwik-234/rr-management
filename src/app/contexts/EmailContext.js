
'use client';
import { createContext, useContext } from 'react';

const EmailContext = createContext();

export const EmailProvider = ({ email, children }) => (
  <EmailContext.Provider value={email}>{children}</EmailContext.Provider>
);

export const useEmail = () => useContext(EmailContext);
