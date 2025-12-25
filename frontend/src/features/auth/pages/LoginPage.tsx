import { AuthLayout } from "../components/AuthLayout";
import { LoginForm } from "../components/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Enter your credentials to access your account"
    >
      <LoginForm />
    </AuthLayout>
  );
}
