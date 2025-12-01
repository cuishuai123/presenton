"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getStoredUserCode, storeUserCode } from "../utils/userCode";

interface UserCodeState {
  userCode: string | null;
  isReady: boolean;
}

export const useUserCode = (): UserCodeState => {
  const searchParams = useSearchParams();
  const searchParamCode = searchParams?.get("userCode");

  const [state, setState] = useState<UserCodeState>(() => {
    // 初始化时立即尝试从 localStorage 读取
    if (typeof window !== "undefined") {
      const stored = getStoredUserCode();
      if (stored) {
        return { userCode: stored, isReady: true };
      }
    }
    return { userCode: null, isReady: false };
  });

  useEffect(() => {
    const init = () => {
      const normalizedParam = searchParamCode?.trim();
      if (normalizedParam) {
        storeUserCode(normalizedParam);
        setState({ userCode: normalizedParam, isReady: true });
        return;
      }

      // 如果 URL 没有参数，尝试从 localStorage 读取
      const stored = getStoredUserCode();
      if (stored) {
        setState({ userCode: stored, isReady: true });
      } else {
        // 如果都没有，标记为 ready 但 userCode 为 null
        setState({ userCode: null, isReady: true });
      }
    };

    init();
  }, [searchParamCode]);

  return state;
};


