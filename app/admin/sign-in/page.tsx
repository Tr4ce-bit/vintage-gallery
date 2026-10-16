import { redirect } from "next/navigation";
import { AuthCard } from "@/components/ui/form";
import { getAdminSession } from "@/lib/auth/admin";
import { AdminSignInForm } from "./sign-in-form";

export const metadata = { title: "Admin sign-in", robots: { index: false, follow: false } };

// Accounts are created by the owner in the admin user pool (see README).
export default async function AdminSignIn() {
  if (await getAdminSession()) redirect("/");
  return (
    <AuthCard title="Admin sign-in">
      <AdminSignInForm />
    </AuthCard>
  );
}
