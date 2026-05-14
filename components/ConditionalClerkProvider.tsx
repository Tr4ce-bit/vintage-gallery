// Server component — wraps children in ClerkProvider only when keys are present.
// Without this guard, Clerk throws a fatal error in production if keys are missing.
import { ClerkProvider } from "@clerk/nextjs";

export default function ConditionalClerkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    // Keys not configured yet — render without auth wrapper
    return <>{children}</>;
  }

  return <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>;
}
