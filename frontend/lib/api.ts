const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://snip-lang-backend.vercel.app/api";

class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    throw new ApiError(data.error || "Có lỗi xảy ra", response.status);
  }

  return data;
}

export const api = {
  get: (endpoint: string) => fetchApi(endpoint),
  post: (endpoint: string, body: any) =>
    fetchApi(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint: string, body: any) =>
    fetchApi(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  patch: (endpoint: string, body?: any) =>
    fetchApi(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: (endpoint: string, body?: any) =>
    fetchApi(endpoint, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
