const ROLE_ALIASES = {
  guardian: "guardian",
  GUARDIAN: "guardian",
  보호자: "guardian",
  elder: "elder",
  ELDER: "elder",
  senior: "elder",
  SENIOR: "elder",
  어르신: "elder",
};

export function normalizeRole(role) {
  if (!role) return null;
  return ROLE_ALIASES[String(role).trim()] ?? null;
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken") || localStorage.getItem("token");
}

export function getStoredRole() {
  if (typeof window === "undefined") return null;
  return normalizeRole(
    localStorage.getItem("userRole") || localStorage.getItem("role")
  );
}

export function getDefaultPathForRole(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === "elder") {
    return "/elder-home";
  }

  if (normalizedRole === "guardian") {
    const selectedElderId =
      localStorage.getItem("selectedElderId") ||
      localStorage.getItem("elder_id");

    return selectedElderId ? `/dashboard/${selectedElderId}` : "/dashboard";
  }

  return "/login";
}

export function saveAuthSession({ accessToken, refreshToken, role }) {
  const normalizedRole = normalizeRole(role);

  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }

  if (normalizedRole) {
    localStorage.setItem("userRole", normalizedRole);
    localStorage.setItem("role", normalizedRole);
  }

  return normalizedRole;
}

export function clearAuthSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("role");
}
