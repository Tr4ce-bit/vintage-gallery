import { redirect } from "next/navigation";
import { AuthCard } from "@/components/ui/form";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { getShopSession } from "@/lib/auth/shop";
import { ShopSignUpForm } from "./sign-up-form";

export const metadata = { title: "Create an account" };

export default async function SignUp({ searchParams }: PageProps<"/sign-up">) {
  const params = await searchParams;
  const next = safeRedirectPath(typeof params.next === "string" ? params.next : undefined, "/account");
  if (await getShopSession()) redirect(next);
  return (
    <AuthCard title="Create an account">
      <ShopSignUpForm next={next} />
    </AuthCard>
  );
}
