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

  // 监听来自父窗口的 postMessage（用于从问知应用获取 userCode）
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleMessage = (event: MessageEvent) => {
      // 验证消息来源（可选，根据实际部署情况调整）
      // 允许从 localhost:3000 或同源接收消息
      // if (event.origin !== "http://localhost:3000" && event.origin !== window.location.origin) return;

      if (event.data?.type === "USER_CODE" && event.data?.userCode) {
        const receivedCode = event.data.userCode.trim();
        if (receivedCode) {
          console.log("从父窗口接收到 userCode:", receivedCode);
          // 保存到 localStorage
          storeUserCode(receivedCode);
          // 更新状态，即使已经初始化也要更新
          setState((prevState) => {
            // 如果当前没有 userCode 或者接收到的不同，则更新
            if (!prevState.userCode || prevState.userCode !== receivedCode) {
              return { userCode: receivedCode, isReady: true };
            }
            return prevState;
          });
        }
      }
    };

    window.addEventListener("message", handleMessage);
    
    // 主动请求 userCode（如果当前没有）
    if (!state.userCode && window.parent && window.parent !== window) {
      // 向父窗口请求 userCode
      window.parent.postMessage({ type: "REQUEST_USER_CODE" }, "*");
    }
    
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [state.userCode]);

  return state;
};


