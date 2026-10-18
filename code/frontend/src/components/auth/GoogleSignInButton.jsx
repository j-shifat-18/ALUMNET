import { useState } from "react";
import Button from "@/components/ui/Button";
import { GoogleIcon } from "@/components/ui/Icons";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";
import Notification from "@/components/ui/Toast";

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
      let existingProfile = null;
      try {
        const res = await axiosInstance.get(`/api/v1/profiles/${user.uid}`, {
          validateStatus: (s) => s < 500,
        });
        if (res.status === 200 && res.data?.data) {
          userExists = true;
          existingProfile = res.data.data;
        }
      } catch (dbError) {
        console.error("Failed to check existing profile:", dbError);
      }

      if (!userExists) {
        const payload = {
          uid: user.uid,
          name: user.displayName || user.email?.split("@")[0] || "IUTian",
          email: user.email,
        };
        if (user.photoURL) {
          payload.profileImage = user.photoURL;
        }

        try {
          await axiosInstance.post("/api/v1/users", payload, {
            validateStatus: (s) => s < 500,
          });
        } catch (createError) {
          console.warn("User create notice (may already exist):", createError);
        }

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

        const hasCompletedProfile =
          existingProfile?.role !== "USER" &&
          (Boolean(existingProfile?.studentProfile) ||
            Boolean(existingProfile?.alumniProfile));

        setTimeout(() => {
          router.push(hasCompletedProfile ? "/" : "/profile-setup");
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
