"use client";

import { configureAmplify } from "@/lib/cognitoConfig";

configureAmplify();

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
