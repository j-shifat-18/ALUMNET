import LoginForm from "@/components/auth/LoginForm";
import AuthLayout from "@/components/auth/AuthLayout";

export default function LoginPage() {
  return (
    <AuthLayout
      heading="Welcome to ALUMNET"
      subheading="Connect with the Islamic University of Technology student and alumni community."
    >
      <LoginForm />
    </AuthLayout>
  );
}