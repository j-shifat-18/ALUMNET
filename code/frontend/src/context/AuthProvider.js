"use client";

import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import LoadingScreen from "@/components/layout/LoadingScreen";
import axiosInstance from "@/lib/axios";

const AuthContext = createContext();
const googleProvider = new GoogleAuthProvider();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const response = await axiosInstance.get(
            `/api/v1/profiles/${currentUser.uid}`
          );
          if (response.data?.data) {
            setDbUser(response.data.data);
          }
        } catch (err) {
          console.error("Error fetching user profile in AuthProvider:", err);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerUser = async (email, password) => {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // await sendEmailVerification(result.user);

    return result.user;
  };

  const signInUser = async (email, password) => {
    const result = await signInWithEmailAndPassword(auth, email, password);

    return result.user;
  };

  const signInGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);

    return result.user;
  };

  const logout = async () => {
    await signOut(auth);
    setDbUser(null);
  };

  const updateUserProfile = (profile) => {
    return updateProfile(auth.currentUser, profile);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        dbUser,
        setDbUser,
        loading,
        registerUser,
        signInUser,
        signInGoogle,
        logout,
        updateUserProfile,
        resetPassword,
      }}
    >
      {loading ? <LoadingScreen /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
