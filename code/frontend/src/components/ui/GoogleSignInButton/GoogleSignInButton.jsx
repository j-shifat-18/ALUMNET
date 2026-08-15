import { useState } from "react";
import Button from "../button";
import { GoogleIcon } from "../icons";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import Notification from "../toast";

const GoogleSignInButton = ({ disabled = false }) => {
  const { signInGoogle, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInGoogle();

      if (!user.email || !user.email.endsWith("@iut-dhaka.edu")) {
        try {
          await user.delete();
        } catch (deleteError) {
          console.error("Failed to delete unauthorized Firebase user:", deleteError);
          await logout();
        }
        throw new Error("Please Login with your IUT E-mail!");
      }

      let userExists = false;
      try {
        const res = await axiosInstance.get("/api/v1/users");
        const users = res.data.data || [];
        userExists = users.some(
          (u) => u.email === user.email || u.uid === user.uid
        );
      } catch (dbError) {
        console.error("Failed to check existing users:", dbError);
      }

      if (!userExists) {
        await axiosInstance.post("/api/v1/users", {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          profileImage: user.photoURL
        });

        setNotification({
          type: "success",
          title: "Registration Successful!",
          message: "Complete your profile to continue.",
          duration: 3000,
        });

        setTimeout(() => {
          router.push("/profile-setup");
        }, 1500);
      } else {
        setNotification({
          type: "success",
          title: "Successfully Logged In!",
          message: "Welcome back!",
          duration: 2000,
        });

        setTimeout(() => {
          router.push("/");
        }, 1000);
      }
    } catch (err) {
      setNotification({
        type: "error",
        title: "Sign-in failed!",
        message: err.message || String(err),
        duration: 5000,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <Notification
            type={notification.type}
            title={notification.title}
            message={notification.message}
            showIcon={true}
            duration={notification.duration}
            onClose={() => setNotification(null)}
          />
        </div>
      )}
      <Button
        variant="outline"
        iconLeft={<GoogleIcon />}
        className="w-full"
        onClick={handleGoogleSignIn}
        loading={isLoading}
        disabled={isLoading || disabled}
      >
        {isLoading ? "Signing in..." : "Continue with Google"}
      </Button>
    </div>
  );
};

export default GoogleSignInButton;