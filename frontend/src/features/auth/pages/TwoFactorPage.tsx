import { AuthLayout } from "../components/AuthLayout";
import { TwoFactorForm } from "../components/TwoFactorForm";

export default function TwoFactorPage() {
  return (
    <AuthLayout 
      title="Two-Factor Authentication" 
      subtitle="Please verify your identity"
    >
      <TwoFactorForm />
    </AuthLayout>
  );
}
