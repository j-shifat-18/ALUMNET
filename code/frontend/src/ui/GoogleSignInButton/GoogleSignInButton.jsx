import { useState } from "react";
import Button from "../../components/ui/button";
import { GoogleIcon } from "../../components/ui/icons";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";

const GoogleSignInButton = () => {
  const { signInGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInGoogle();

      try {
        await axiosInstance.post("/api/v1/users", {
          id: user.uid,
          name: user.displayName || user.email,
          email: user.email,
        });
      } catch (err) {
      }

      alert(`Signed in successfully! Welcome, ${user.displayName || user.email}!`);
    } catch (err) {
      alert(`Sign-in failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <Button
        variant="outline"
        iconLeft={<GoogleIcon />}
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? "Signing in..." : "Continue with Google"}
      </Button>
    </div>
  );
};

export default GoogleSignInButton;