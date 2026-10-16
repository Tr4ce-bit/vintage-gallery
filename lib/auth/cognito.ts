import { createHmac } from "node:crypto";
import {
  AssociateSoftwareTokenCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  GetTokensFromRefreshTokenCommand,
  InitiateAuthCommand,
  ResendConfirmationCodeCommand,
  RespondToAuthChallengeCommand,
  SignUpCommand,
  VerifySoftwareTokenCommand,
  type AuthenticationResultType,
  type ChallengeNameType,
} from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";

// Server-side sign-in against Cognito. The browser only ever talks to our
// own server; passwords pass through it once over TLS and tokens end up in
// httpOnly cookies. Every call here is an unauthenticated Cognito API, so
// the Lambda needs no IAM permission for it, only the app client's secret.

export type PoolKind = "shop" | "admin";

export interface PoolConfig {
  userPoolId: string;
  clientId: string;
  clientSecret: string;
}

export function poolConfig(kind: PoolKind): PoolConfig {
  const env = kind === "admin" ? "ADMIN_USER_POOL_ID" : "SHOP_USER_POOL_ID";
  const client = kind === "admin" ? Resource.AdminWebClient : Resource.ShopWebClient;
  const userPoolId = process.env[env];
  if (!userPoolId) throw new Error(`${env} is not set`);
  return { userPoolId, clientId: client.id, clientSecret: client.secret };
}

/** Cognito's SECRET_HASH: base64(HMAC-SHA256(clientSecret, username + clientId)). */
export function secretHash(username: string, cfg: Pick<PoolConfig, "clientId" | "clientSecret">): string {
  return createHmac("sha256", cfg.clientSecret).update(username + cfg.clientId).digest("base64");
}

export interface Tokens {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export type AuthStep =
  | { step: "done"; tokens: Tokens }
  | { step: "new-password"; session: string }
  | { step: "mfa-setup"; session: string }
  | { step: "mfa-code"; session: string }
  | { step: "unsupported"; challenge: string };

/** Anything with Cognito's `send`, so tests can pass a fake. */
export interface Sender {
  send(command: object): Promise<unknown>;
}

let defaultClient: CognitoIdentityProviderClient | undefined;
export function cognito(): Sender {
  defaultClient ??= new CognitoIdentityProviderClient({});
  return defaultClient as Sender;
}

interface AuthResponse {
  AuthenticationResult?: AuthenticationResultType;
  ChallengeName?: ChallengeNameType | string;
  Session?: string;
}

function toStep(res: AuthResponse): AuthStep {
  const r = res.AuthenticationResult;
  if (r?.IdToken && r.AccessToken) {
    return {
      step: "done",
      tokens: { idToken: r.IdToken, accessToken: r.AccessToken, refreshToken: r.RefreshToken, expiresIn: r.ExpiresIn ?? 3600 },
    };
  }
  const session = res.Session ?? "";
  switch (res.ChallengeName) {
    case "NEW_PASSWORD_REQUIRED":
      return { step: "new-password", session };
    case "MFA_SETUP":
      return { step: "mfa-setup", session };
    case "SOFTWARE_TOKEN_MFA":
      return { step: "mfa-code", session };
    default:
      return { step: "unsupported", challenge: String(res.ChallengeName) };
  }
}

export async function signIn(cfg: PoolConfig, email: string, password: string, c = cognito()): Promise<AuthStep> {
  const res = (await c.send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: cfg.clientId,
      AuthParameters: { USERNAME: email, PASSWORD: password, SECRET_HASH: secretHash(email, cfg) },
    }),
  )) as AuthResponse;
  return toStep(res);
}

export async function answerNewPassword(cfg: PoolConfig, email: string, session: string, newPassword: string, c = cognito()) {
  const res = (await c.send(
    new RespondToAuthChallengeCommand({
      ClientId: cfg.clientId,
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      Session: session,
      ChallengeResponses: { USERNAME: email, NEW_PASSWORD: newPassword, SECRET_HASH: secretHash(email, cfg) },
    }),
  )) as AuthResponse;
  return toStep(res);
}

export async function answerMfaCode(cfg: PoolConfig, email: string, session: string, code: string, c = cognito()) {
  const res = (await c.send(
    new RespondToAuthChallengeCommand({
      ClientId: cfg.clientId,
      ChallengeName: "SOFTWARE_TOKEN_MFA",
      Session: session,
      ChallengeResponses: { USERNAME: email, SOFTWARE_TOKEN_MFA_CODE: code, SECRET_HASH: secretHash(email, cfg) },
    }),
  )) as AuthResponse;
  return toStep(res);
}

/** First step of enrolling an authenticator app: returns the secret to show. */
export async function startMfaSetup(session: string, c = cognito()) {
  const res = (await c.send(new AssociateSoftwareTokenCommand({ Session: session }))) as {
    SecretCode?: string;
    Session?: string;
  };
  if (!res.SecretCode || !res.Session) throw new Error("Cognito did not return an authenticator secret");
  return { secretCode: res.SecretCode, session: res.Session };
}

export async function finishMfaSetup(cfg: PoolConfig, email: string, session: string, code: string, c = cognito()) {
  const verified = (await c.send(
    new VerifySoftwareTokenCommand({ Session: session, UserCode: code, FriendlyDeviceName: "Authenticator" }),
  )) as { Status?: string; Session?: string };
  if (verified.Status !== "SUCCESS" || !verified.Session) return { step: "mfa-setup", session } as AuthStep;
  const res = (await c.send(
    new RespondToAuthChallengeCommand({
      ClientId: cfg.clientId,
      ChallengeName: "MFA_SETUP",
      Session: verified.Session,
      ChallengeResponses: { USERNAME: email, SECRET_HASH: secretHash(email, cfg) },
    }),
  )) as AuthResponse;
  return toStep(res);
}

export async function refreshTokens(cfg: PoolConfig, refreshToken: string, c = cognito()): Promise<Tokens> {
  const res = (await c.send(
    new GetTokensFromRefreshTokenCommand({ ClientId: cfg.clientId, ClientSecret: cfg.clientSecret, RefreshToken: refreshToken }),
  )) as AuthResponse;
  const step = toStep(res);
  if (step.step !== "done") throw new Error("Refresh did not return tokens");
  return step.tokens;
}

export async function signUp(cfg: PoolConfig, email: string, password: string, fullName: string, c = cognito()) {
  await c.send(
    new SignUpCommand({
      ClientId: cfg.clientId,
      Username: email,
      Password: password,
      SecretHash: secretHash(email, cfg),
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: fullName },
      ],
    }),
  );
}

export async function confirmSignUp(cfg: PoolConfig, email: string, code: string, c = cognito()) {
  await c.send(
    new ConfirmSignUpCommand({ ClientId: cfg.clientId, Username: email, ConfirmationCode: code, SecretHash: secretHash(email, cfg) }),
  );
}

export async function resendCode(cfg: PoolConfig, email: string, c = cognito()) {
  await c.send(new ResendConfirmationCodeCommand({ ClientId: cfg.clientId, Username: email, SecretHash: secretHash(email, cfg) }));
}

export async function forgotPassword(cfg: PoolConfig, email: string, c = cognito()) {
  await c.send(new ForgotPasswordCommand({ ClientId: cfg.clientId, Username: email, SecretHash: secretHash(email, cfg) }));
}

export async function confirmForgotPassword(cfg: PoolConfig, email: string, code: string, newPassword: string, c = cognito()) {
  await c.send(
    new ConfirmForgotPasswordCommand({
      ClientId: cfg.clientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword,
      SecretHash: secretHash(email, cfg),
    }),
  );
}

/** A message safe to show the person, never Cognito's raw text for sign-in errors. */
export function authErrorMessage(err: unknown): string {
  const name = (err as { name?: string })?.name ?? "";
  switch (name) {
    case "NotAuthorizedException":
    case "UserNotFoundException":
      return "That email and password don't match.";
    case "UserNotConfirmedException":
      return "Please confirm your email first. We've sent you a code.";
    case "CodeMismatchException":
      return "That code isn't right. Check it and try again.";
    case "ExpiredCodeException":
      return "That code has expired. Ask for a new one.";
    case "EnableSoftwareTokenMFAException":
      return "That authenticator code isn't right. Try the next one.";
    case "InvalidPasswordException":
      return "That password doesn't meet the rules shown under the field.";
    case "UsernameExistsException":
      return "An account with that email already exists. Try signing in.";
    case "LimitExceededException":
    case "TooManyRequestsException":
    case "TooManyFailedAttemptsException":
      return "Too many attempts. Wait a few minutes and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}
