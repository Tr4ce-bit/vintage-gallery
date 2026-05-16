/**
 * Server-side Cognito JWT verification for API routes.
 * Verifies the access token sent in the Authorization header.
 */
import { CognitoJwtVerifier } from "aws-jwt-verify";

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      clientId:   process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      tokenUse:   "access",
    });
  }
  return verifier;
}

/**
 * Extract and verify the Cognito access token from the Authorization header.
 * Returns the sub (user ID) on success, null on failure.
 */
export async function getAuthUser(
  request: Request
): Promise<{ userId: string; email: string | null } | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token   = authHeader.replace("Bearer ", "");
    const payload = await getVerifier().verify(token);

    return {
      userId: payload.sub,
      email:  (payload.email as string | undefined) ?? null,
    };
  } catch {
    return null;
  }
}
