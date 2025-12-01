export const USER_CODE_STORAGE_KEY = "ppt_user_code";
export const LOGIN_USER_CODE_KEY = "userCode";

export const storeUserCode = (code?: string | null) => {
  if (typeof window === "undefined" || !code) return;
  try {
    window.localStorage.setItem(USER_CODE_STORAGE_KEY, code);
  } catch {
    // ignore storage errors (e.g., private mode)
  }
};

export const getStoredUserCode = (): string | null => {
  if (typeof window === "undefined") return null;
  try {
    const loginStored = window.localStorage.getItem(LOGIN_USER_CODE_KEY);
    if (loginStored) {
      return loginStored;
    }
    return window.localStorage.getItem(USER_CODE_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const appendUserCodeToPath = (
  path: string,
  userCode?: string | null
): string => {
  if (!userCode) return path;

  const [base, hash = ""] = path.split("#");
  const [pathname, query = ""] = base.split("?");
  const params = new URLSearchParams(query);
  params.set("userCode", userCode);
  const queryString = params.toString();
  const nextPath = queryString ? `${pathname}?${queryString}` : pathname;
  return hash ? `${nextPath}#${hash}` : nextPath;
};


