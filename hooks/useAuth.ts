"use client";

import { useState, useEffect } from "react";
import { getCurrentUser, signOut as amplifySignOut, fetchAuthSession } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

export interface VGUser {
  userId: string;
  username: string;
  email?: string;
}

export function useAuth() {
  const [user, setUser]       = useState<VGUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    checkUser();

    const stopListening = Hub.listen("auth", ({ payload }) => {
      switch (payload.event) {
        case "signedIn":
          checkUser();
          break;
        case "signedOut":
          setUser(null);
          break;
      }
    });

    return stopListening;
  }, []);

  async function checkUser() {
    try {
      const current = await getCurrentUser();
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken;
      const email   = idToken?.payload?.email as string | undefined;

      setUser({ userId: current.userId, username: current.username, email });
    } catch {
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  }

  async function signOut() {
    await amplifySignOut();
    setUser(null);
  }

  /** Returns the ID token for API calls (contains email, verified server-side). */
  async function getAccessToken(): Promise<string | null> {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.idToken?.toString() ?? null;
    } catch {
      return null;
    }
  }

  return {
    user,
    isLoaded,
    isSignedIn: !!user,
    signOut,
    getAccessToken,
  };
}
