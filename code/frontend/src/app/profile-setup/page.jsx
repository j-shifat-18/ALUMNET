import ProtectedRoute from "@/components/layout/ProtectedRoute";
import ProfileSetupForm from "@/components/profile/ProfileSetupForm";
import AuthLayout from "@/components/auth/AuthLayout";
import profileSetupBg from "../../../public/iut-profile-setup-bg.jpg";

export default function ProfileSetupPage() {
  return (
    <ProtectedRoute>
      <AuthLayout
        bgImage={profileSetupBg}
        heading="Complete Your Profile"
        subheading="Help your fellow IUT students and alumni discover and connect with you by completing your profile details."
      >
        <ProfileSetupForm />
      </AuthLayout>
    </ProtectedRoute>
  );
}
