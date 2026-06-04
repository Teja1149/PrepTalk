import React, { createContext, useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user || null);
      setUserName(session?.user?.user_metadata?.full_name || null);
      setLoadingAuth(false);
    };

    loadSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      setUserName(session?.user?.user_metadata?.full_name || null);
      setLoadingAuth(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userName, session, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
