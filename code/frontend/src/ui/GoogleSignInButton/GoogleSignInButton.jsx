import { useState } from "react";
import Button from "../../components/ui/button";
import { GoogleIcon } from "../../components/ui/icons";
import { useAuth } from "@/context/AuthProvider";
import axiosInstance from "@/lib/axios";
import { useRouter } from "next/navigation";

const GoogleSignInButton = () => {
  const { signInGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const user = await signInGoogle();

      try {
        await axiosInstance.post("/api/v1/users", {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: user.role,
          photoURL: user.photoURL
        });
      } catch (err) {
      }

      alert(`Signed in successfully! Welcome, ${user.displayName || user.email}!`);
      router.push("/");
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