import { redirect } from "next/navigation";
import { AuthCard } from "@/components/ui/form";
import { safeRedirectPath } from "@/lib/auth/redirect";
import { getShopSession } from "@/lib/auth/shop";
import { ShopSignInForm } from "./sign-in-form";

export const metadata = { title: "Sign in" };

export default async function SignIn({ searchParams }: PageProps<"/sign-in">) {
  const params = await searchParams;
  const next = safeRedirectPath(typeof params.next === "string" ? params.next : undefined, "/account");
  if (await getShopSession()) redirect(next);
  const notice = params.reset ? "Password changed. Sign in with your new one." : undefined;
  return (
    <AuthCard title="Sign in">
      <ShopSignInForm next={next} notice={notice} />
    </AuthCard>
  );
}
