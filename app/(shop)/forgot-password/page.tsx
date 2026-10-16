import { AuthCard } from "@/components/ui/form";
import { ResetPasswordForm } from "./reset-form";

export const metadata = { title: "Reset your password" };

export default function ForgotPassword() {
  return (
    <AuthCard title="Reset your password">
      <ResetPasswordForm />
    </AuthCard>
  );
}
