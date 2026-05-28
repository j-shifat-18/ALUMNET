import ProtectedRoute from "@/components/shared/ProtectedRoute";
import ProfileSetupForm from "@/components/ui/ProfileSetup/ProfileSetupForm";

export default function page() {
  return (
    <ProtectedRoute>
      <ProfileSetupForm />
    </ProtectedRoute>
  )
}
