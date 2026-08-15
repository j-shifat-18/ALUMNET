import RegistrationForm from "@/components/auth/RegistrationForm";
import AuthLayout from "@/components/auth/AuthLayout";

export default function RegisterPage() {
  return (
    <AuthLayout
      heading="Join ALUMNET"
      subheading="Create your account with your official IUT email to connect with alumni and students."
    >
      <RegistrationForm />
    </AuthLayout>
  );
}