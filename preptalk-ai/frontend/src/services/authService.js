import { supabase } from "./supabaseClient";

export const signupUser = async ({ fullName, email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) throw error;

  return data;
};

export const loginUser = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  return data;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
};
