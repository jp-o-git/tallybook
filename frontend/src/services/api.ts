const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "omit",
  });
}

export async function responseError(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body.detail === "string") return body.detail;
    if (Array.isArray(body.detail)) {
      return body.detail
        .map(
          (detail: { loc?: (string | number)[]; msg?: string }) =>
            `${detail.loc?.slice(1).join(".") || "field"}: ${detail.msg}`,
        )
        .join("; ");
    }
  } catch {
    return fallback;
  }

  return fallback;
}
