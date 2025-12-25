import { AuthLayout } from "../components/AuthLayout";
import { RegisterForm } from "../components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout 
      title="Create Account" 
      subtitle="Join ECHOSPHERE today"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
