import { GoogleAuth } from "google-auth-library";

const FCM_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";

function getProjectId(): string {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set");
  const sa = JSON.parse(raw) as { project_id: string };
  return sa.project_id;
}

async function getAccessToken(): Promise<string> {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set");

  const credentials = JSON.parse(raw);
  const auth = new GoogleAuth({ credentials, scopes: [FCM_SCOPE] });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();
  if (!tokenResponse.token) throw new Error("Failed to obtain FCM access token");
  return tokenResponse.token;
}

export interface FcmResult {
  success: boolean;
  messageId?: string;
  error?: string;
  skipped?: boolean;
  staleToken?: boolean;
}

export async function sendPushNotification(params: {
  token: string | null | undefined;
  title: string;
  body: string;
  actionUrl?: string;
  data?: Record<string, string>;
}): Promise<FcmResult> {
  const { token, title, body, actionUrl, data } = params;

  if (!token || token.trim() === "") {
    return { success: true, skipped: true };
  }

  try {
    const [accessToken, projectId] = await Promise.all([
      getAccessToken(),
      Promise.resolve(getProjectId()),
    ]);

    const endpoint = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const message = {
      message: {
        token,
        notification: { title, body },
        webpush: {
          notification: {
            icon: "/icons/icon-192x192.png",
            ...(actionUrl && { click_action: actionUrl }),
          },
          ...(data && { data }),
        },
      },
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("FCM API error:", response.status, errorBody);

      // Detect stale token errors
      const isStaleToken =
        errorBody.includes("UNREGISTERED") ||
        (response.status === 400 && errorBody.includes("INVALID_ARGUMENT"));

      return {
        success: false,
        error: errorBody,
        ...(isStaleToken && { staleToken: true }),
      };
    }

    const result = (await response.json()) as { name: string };
    return { success: true, messageId: result.name };
  } catch (error) {
    console.error("FCM sendPushNotification failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown FCM error",
    };
  }
}
