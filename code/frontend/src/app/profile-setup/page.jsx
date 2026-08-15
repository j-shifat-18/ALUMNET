import ProtectedRoute from "@/components/layout/ProtectedRoute";
import ProfileSetupForm from "@/components/profile/ProfileSetupForm";

export default function page() {
  return (
    <ProtectedRoute>
      <ProfileSetupForm />
    </ProtectedRoute>
  )
}
