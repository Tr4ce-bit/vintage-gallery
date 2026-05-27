import { CognitoJwtVerifier } from "aws-jwt-verify";

let verifier: ReturnType<typeof CognitoJwtVerifier.create> | null = null;

function getVerifier() {
  if (!verifier) {
    verifier = CognitoJwtVerifier.create({
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
      clientId:   process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
      tokenUse:   "id",
    });
  }
  return verifier;
}

export interface AuthUser {
  userId: string;
  email:  string | null;
  // Cognito group memberships from the "cognito:groups" JWT claim.
  // Used by requireAdmin() to check for the "admin" group.
  groups: string[];
}

export async function getAuthUser(request: Request): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;

    const token   = authHeader.replace("Bearer ", "");
    const payload = await getVerifier().verify(token);

    return {
      userId: payload.sub,
      email:  (payload.email as string | undefined) ?? null,
      groups: (payload["cognito:groups"] as string[] | undefined) ?? [],
    };
  } catch {
    return null;
  }
}
