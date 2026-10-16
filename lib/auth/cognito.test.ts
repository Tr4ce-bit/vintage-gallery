import { describe, expect, it } from "vitest";
import { answerMfaCode, authErrorMessage, finishMfaSetup, refreshTokens, secretHash, signIn, type Sender } from "./cognito";

const cfg = { userPoolId: "eu-west-1_test", clientId: "client-id", clientSecret: "client-secret" };

/** Records each command's input and replies from a queue. */
function fake(...replies: unknown[]) {
  const sent: { name: string; input: Record<string, unknown> }[] = [];
  const sender: Sender = {
    async send(command) {
      const c = command as { constructor: { name: string }; input: Record<string, unknown> };
      sent.push({ name: c.constructor.name, input: c.input });
      return replies.shift() ?? {};
    },
  };
  return { sender, sent };
}

describe("secretHash", () => {
  it("matches an HMAC-SHA256 worked out independently", () => {
    // python: base64(hmac.new(b"client-secret", b"ama@example.comclient-id", sha256).digest())
    expect(secretHash("ama@example.com", cfg)).toBe("MpKme1KF89bRF0dHBdOx8GWDjusauBW5Zufa6SB4tZc=");
  });
});

describe("signIn", () => {
  it("returns tokens and sends the secret hash", async () => {
    const { sender, sent } = fake({ AuthenticationResult: { IdToken: "id", AccessToken: "access", RefreshToken: "refresh", ExpiresIn: 3600 } });
    const step = await signIn(cfg, "ama@example.com", "pw", sender);
    expect(step).toEqual({ step: "done", tokens: { idToken: "id", accessToken: "access", refreshToken: "refresh", expiresIn: 3600 } });
    expect(sent[0].name).toBe("InitiateAuthCommand");
    expect(sent[0].input).toMatchObject({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: "client-id",
      AuthParameters: { USERNAME: "ama@example.com", SECRET_HASH: secretHash("ama@example.com", cfg) },
    });
  });

  it.each([
    ["NEW_PASSWORD_REQUIRED", "new-password"],
    ["MFA_SETUP", "mfa-setup"],
    ["SOFTWARE_TOKEN_MFA", "mfa-code"],
  ])("maps the %s challenge to %s", async (challenge, step) => {
    const { sender } = fake({ ChallengeName: challenge, Session: "s1" });
    expect(await signIn(cfg, "a@b.co", "pw", sender)).toEqual({ step, session: "s1" });
  });

  it("refuses challenges it doesn't handle", async () => {
    const { sender } = fake({ ChallengeName: "SMS_MFA", Session: "s1" });
    expect(await signIn(cfg, "a@b.co", "pw", sender)).toEqual({ step: "unsupported", challenge: "SMS_MFA" });
  });
});

describe("challenges", () => {
  it("answers an authenticator code with the session", async () => {
    const { sender, sent } = fake({ AuthenticationResult: { IdToken: "id", AccessToken: "a" } });
    const step = await answerMfaCode(cfg, "a@b.co", "s1", "123456", sender);
    expect(step.step).toBe("done");
    expect(sent[0].input).toMatchObject({ ChallengeName: "SOFTWARE_TOKEN_MFA", Session: "s1", ChallengeResponses: { SOFTWARE_TOKEN_MFA_CODE: "123456" } });
  });

  it("stays on set-up when the first authenticator code is wrong", async () => {
    const { sender, sent } = fake({ Status: "ERROR" });
    expect(await finishMfaSetup(cfg, "a@b.co", "s1", "000000", sender)).toEqual({ step: "mfa-setup", session: "s1" });
    expect(sent).toHaveLength(1);
  });

  it("finishes set-up with the session Cognito returns after verifying", async () => {
    const { sender, sent } = fake({ Status: "SUCCESS", Session: "s2" }, { AuthenticationResult: { IdToken: "id", AccessToken: "a" } });
    expect((await finishMfaSetup(cfg, "a@b.co", "s1", "123456", sender)).step).toBe("done");
    expect(sent[1]).toMatchObject({ name: "RespondToAuthChallengeCommand", input: { ChallengeName: "MFA_SETUP", Session: "s2" } });
  });
});

describe("refreshTokens", () => {
  it("sends the client secret and returns new tokens", async () => {
    const { sender, sent } = fake({ AuthenticationResult: { IdToken: "id2", AccessToken: "a2", ExpiresIn: 3600 } });
    expect((await refreshTokens(cfg, "r1", sender)).idToken).toBe("id2");
    expect(sent[0]).toMatchObject({ name: "GetTokensFromRefreshTokenCommand", input: { ClientSecret: "client-secret", RefreshToken: "r1" } });
  });

  it("throws when Cognito returns no tokens", async () => {
    const { sender } = fake({});
    await expect(refreshTokens(cfg, "r1", sender)).rejects.toThrow();
  });
});

describe("authErrorMessage", () => {
  it("gives the same message for a wrong password and an unknown account", () => {
    expect(authErrorMessage({ name: "NotAuthorizedException" })).toBe(authErrorMessage({ name: "UserNotFoundException" }));
  });
  it("never shows Cognito's own text", () => {
    expect(authErrorMessage({ name: "InternalErrorException", message: "secret detail" })).not.toContain("secret detail");
  });
});
