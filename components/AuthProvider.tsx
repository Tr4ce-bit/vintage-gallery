"use client";

/**
 * Configures AWS Amplify once on the client side.
 * Replaces ConditionalClerkProvider.
 */
import { configureAmplify } from "@/lib/cognitoConfig";

// Configure at module load — safe because this is "use client"
configureAmplify();

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
