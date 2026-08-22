export class ApiError extends Error {
  constructor(code, message, status, data) {
    super(message);
    this.code = code;
    this.status = status;
    this.data = data;
  }
}
const _RAW_API_URL = import.meta.env.VITE_API_URL ?? "";
if (!import.meta.env.VITE_API_URL && import.meta.env.PROD) {
  console.warn("[api] VITE_API_URL is not set. All API calls will use relative paths — ensure your backend is on the same origin.");
}
// Validate API_URL is a same-origin relative path or an explicit trusted origin.
// This prevents SSRF if the env var is ever tampered with.
function validateApiUrl(url) {
  // Allow relative paths (e.g. "") — safest option for same-origin deployments
  if (!url || url === "/") return "";
  try {
    const parsed = new URL(url);
    const allowed = ["http:", "https:"];
    if (!allowed.includes(parsed.protocol)) {
      console.error("[api] VITE_API_URL uses a disallowed protocol — falling back to relative.");
      return "";
    }
    return `${parsed.origin}`;
  } catch {
    // Not a full URL — treat as relative base path
    return url.startsWith("/") ? url.replace(/\/$/, "") : "";
  }
}
function isLocalDevUrl(url) {
  if (!url) return false;
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
}
function resolveApiUrl() {
  const envUrl = validateApiUrl(_RAW_API_URL);
  const publicUrl = validateApiUrl(import.meta.env.VITE_PUBLIC_URL ?? "");

  // Production on Vercel: call /api on the public site (vercel.json proxies to Railway).
  // Never use localhost (from committed .env) or *.railway.app (blocked on some ISPs).
  if (import.meta.env.PROD) {
    if (publicUrl && !isLocalDevUrl(publicUrl)) return publicUrl;
    if (!envUrl || isLocalDevUrl(envUrl) || envUrl.includes("railway.app")) return "";
  }

  return envUrl;
}
const API_URL = resolveApiUrl();
export const REGISTRATION_STORAGE_KEY = "janmashtami_registration_result";
// Use sessionStorage instead of localStorage for the admin token.
// sessionStorage is cleared when the tab closes, limiting the exposure window
// compared to localStorage which persists indefinitely across sessions.
export const ADMIN_TOKEN_KEY = "janmashtami_admin_token";
export const ADMIN_USER_KEY = "janmashtami_admin_user";
export const adminTokenStore = {
  get: (key) => typeof window !== "undefined" ? sessionStorage.getItem(key) : null,
  set: (key, val) => sessionStorage.setItem(key, val),
  remove: (key) => sessionStorage.removeItem(key),
};

export function saveAdminSession({ token, admin }) {
  adminTokenStore.set(ADMIN_TOKEN_KEY, token);
  adminTokenStore.set(ADMIN_USER_KEY, JSON.stringify(admin));
}

export function loadAdminSession() {
  const token = adminTokenStore.get(ADMIN_TOKEN_KEY);
  const raw = adminTokenStore.get(ADMIN_USER_KEY);
  if (!token) return null;
  let admin = null;
  if (raw) {
    try {
      admin = JSON.parse(raw);
    } catch {
      admin = null;
    }
  }
  return { token, admin };
}

export function clearAdminSession() {
  adminTokenStore.remove(ADMIN_TOKEN_KEY);
  adminTokenStore.remove(ADMIN_USER_KEY);
}

export const ADMIN_PAGE_KEYS = [
  "scanner",
  "register",
  "registrations",
  "volunteers",
  "abhishek",
  "fancy-dress",
  "laddu-gopal",
  // REFERRAL DISABLED
  // "leaderboard",
  "admins",
];

export function adminHasPage(admin, page) {
  if (!admin) return false;
  if (admin.role === "super_admin") return true;
  return Array.isArray(admin.pages) && admin.pages.includes(page);
}
async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      }
    });
  } catch {
    throw new ApiError("NETWORK_ERROR", "Could not reach the server. Is the backend running?", 0);
  }
  let json;
  try {
    json = await res.json();
  } catch {
    throw new ApiError("PARSE_ERROR", `Server error (${res.status}). Please try again.`, res.status);
  }
  if (!json.success) {
    throw new ApiError(json.error?.code ?? "UNKNOWN", json.error?.message ?? "Request failed", res.status, json.data);
  }
  return json.data;
}
function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}
export function saveRegistrationResult(result) {
  sessionStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(result));
}
export function loadRegistrationResult() {
  const raw = sessionStorage.getItem(REGISTRATION_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
export function clearRegistrationResult() {
  sessionStorage.removeItem(REGISTRATION_STORAGE_KEY);
}
export const api = {
  register(body) {
    return request("/api/register", {
      method: "POST",
      body: JSON.stringify(body)
    });
  },
  // REFERRAL DISABLED
  // validateReferral(code) {
  //   return request(`/api/validate-referral/${encodeURIComponent(code)}`);
  // },
  // getLeaderboard() {
  //   return request("/api/leaderboard");
  // },
  getStatsCount() {
    return request("/api/stats/count");
  },
  findRegistration(phone, dob) {
    return request("/api/find-registration", {
      method: "POST",
      body: JSON.stringify({
        phone,
        dob
      })
    });
  },
  adminLogin(username, password) {
    return request("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      })
    });
  },
  adminMe(token) {
    return request("/api/admin/me", {
      headers: authHeaders(token),
    });
  },
  listAdmins(token) {
    return request("/api/admin/users", {
      headers: authHeaders(token),
    });
  },
  createAdmin(token, body) {
    return request("/api/admin/users", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
  },
  updateAdmin(token, id, body) {
    return request(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
  },
  scanCheckin(token, signedPayload) {
    return request("/api/scan/checkin", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        signedPayload
      })
    });
  },
  scanCheckinOverride(token, entryCode, reason) {
    return request("/api/scan/checkin/override", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        entryCode,
        reason
      })
    });
  },
  listRegistrations(token, params = {}) {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.checkedIn) qs.set("checkedIn", params.checkedIn);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return request(`/api/admin/registrations${query ? `?${query}` : ""}`, {
      headers: authHeaders(token),
    });
  },
  exportRegistrations(token, params = {}) {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.checkedIn) qs.set("checkedIn", params.checkedIn);
    const query = qs.toString();
    // Returns the raw Response so the caller can stream/blob the CSV.
    // Throws ApiError on non-2xx so callers get consistent error handling.
    return fetch(`${API_URL}/api/admin/registrations/export${query ? `?${query}` : ""}`, {
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
    }).then((res) => {
      if (!res.ok) throw new ApiError("EXPORT_FAILED", `Export failed (${res.status})`, res.status);
      return res;
    }).catch((err) => {
      if (err instanceof ApiError) throw err;
      throw new ApiError("NETWORK_ERROR", "Could not reach the server.", 0);
    });
  },
  deskRegister(token, body) {
    return request("/api/admin/register", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
    });
  },
  whatsappStatus(token) {
    return request("/api/admin/whatsapp/status", { headers: authHeaders(token) });
  },
  whatsappPairStart(token) {
    return request("/api/admin/whatsapp/pair", {
      method: "POST",
      headers: authHeaders(token),
    });
  },
  whatsappPairQr(token) {
    return request("/api/admin/whatsapp/pair/qr", { headers: authHeaders(token) });
  },
  whatsappPairingCode(token, phone) {
    return request("/api/admin/whatsapp/pairing-code", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({ phone }),
    });
  },
  whatsappPairCancel(token) {
    return request("/api/admin/whatsapp/pair/cancel", {
      method: "POST",
      headers: authHeaders(token),
    });
  },
  whatsappChangeNumber(token) {
    return request("/api/admin/whatsapp/change-number", {
      method: "POST",
      headers: authHeaders(token),
    });
  },
  whatsappReconnect(token) {
    return request("/api/admin/whatsapp/reconnect", {
      method: "POST",
      headers: authHeaders(token),
    });
  },
  whatsappDisconnect(token) {
    return request("/api/admin/whatsapp/disconnect", {
      method: "POST",
      headers: authHeaders(token),
    });
  },
  whatsappAckAlert(token) {
    return request("/api/admin/whatsapp/ack-alert", {
      method: "POST",
      headers: authHeaders(token),
    });
  },
  whatsappListMessages(token, params = {}) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") qs.set(k, String(v));
    });
    const query = qs.toString();
    return request(`/api/admin/whatsapp/messages${query ? `?${query}` : ""}`, {
      headers: authHeaders(token),
    });
  },
  whatsappRetryMessage(token, id) {
    return request(`/api/admin/whatsapp/messages/${id}/retry`, {
      method: "POST",
      headers: authHeaders(token),
    });
  },
  whatsappRetryRegistration(token, registrationId) {
    return request(`/api/admin/whatsapp/registrations/${registrationId}/retry`, {
      method: "POST",
      headers: authHeaders(token),
    });
  },
  listOptIn(token, kind, params = {}) {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    if (params.page) qs.set("page", String(params.page));
    if (params.limit) qs.set("limit", String(params.limit));
    const query = qs.toString();
    return request(`/api/admin/${kind}${query ? `?${query}` : ""}`, {
      headers: authHeaders(token),
    });
  },
  exportOptIn(token, kind, params = {}) {
    const qs = new URLSearchParams();
    if (params.search) qs.set("search", params.search);
    const query = qs.toString();
    return fetch(`${API_URL}/api/admin/${kind}/export${query ? `?${query}` : ""}`, {
      headers: { ...authHeaders(token), "Content-Type": "application/json" },
    }).then((res) => {
      if (!res.ok) throw new ApiError("EXPORT_FAILED", `Export failed (${res.status})`, res.status);
      return res;
    }).catch((err) => {
      if (err instanceof ApiError) throw err;
      throw new ApiError("NETWORK_ERROR", "Could not reach the server.", 0);
    });
  },
};

export function normalizePhone(phone) {
  let d = String(phone ?? "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return d;
}

/** Turn API errors into clear registration messages (duplicate user, validation, etc.) */
export function formatRegistrationError(err) {
  const code = err?.code;
  const dupes = err?.data?.duplicates ?? [];

  if (code === "DUPLICATE_REGISTRATION") {
    if (dupes.length === 0) {
      return {
        message: "Duplicate user — someone with these details is already registered.",
        duplicateNames: [],
      };
    }
    const names = dupes.map((d) => d.name);
    const memberDupes = dupes.filter((d) => d.kind === "member" || d.suggestion === "duplicate-member");
    if (memberDupes.length > 0 && memberDupes.length === dupes.length) {
      return {
        message: `Duplicate member: ${memberDupes.map((d) => d.name).join(", ")} — same name and date of birth already registered.`,
        duplicateNames: names,
      };
    }
    return {
      message: `Duplicate user: ${names.join(", ")} — already registered with this phone and date of birth.`,
      duplicateNames: names,
    };
  }

  if (code === "VALIDATION_ERROR") {
    const fields = err?.data?.errors;
    if (Array.isArray(fields) && fields.length > 0) {
      return { message: fields.map((e) => e.message).join(" "), duplicateNames: [] };
    }
    return { message: err.message || "Please check your details and try again.", duplicateNames: [] };
  }

  if (code === "NETWORK_ERROR" || code === "PARSE_ERROR") {
    return { message: err.message, duplicateNames: [] };
  }

  if (err instanceof ApiError || err?.message) {
    return { message: err.message, duplicateNames: [] };
  }

  return { message: "Registration failed. Please try again.", duplicateNames: [] };
}