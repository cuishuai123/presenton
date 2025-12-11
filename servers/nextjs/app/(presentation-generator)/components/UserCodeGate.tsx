"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useUserCode } from "../hooks/useUserCode";
import { appendUserCodeToPath } from "../utils/userCode";

export const UserCodeGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = useMemo(() => searchParams.toString(), [searchParams]);
  const { userCode, isReady } = useUserCode();
  const [isSynced, setIsSynced] = useState(false);
  const disableGate = searchParams.get("disableRedirect") === "1";

  useEffect(() => {
    // 如果明确要求跳过校验（用于导出场景），完全跳过所有逻辑
    if (disableGate) {
      setIsSynced(true);
      return;
    }

    if (!isReady) {
      // 如果还没准备好，等待一下再检查
      const timer = setTimeout(() => {
        setIsSynced(true);
      }, 100);
      return () => clearTimeout(timer);
    }

    if (!userCode) {
      setIsSynced(true);
      return;
    }

    const currentCode = searchParams.get("userCode");
    if (currentCode === userCode) {
      setIsSynced(true);
      return;
    }

    // 如果 URL 中没有 userCode，但 localStorage 中有，则添加到 URL
    const nextPath = appendUserCodeToPath(
      searchString ? `${pathname}?${searchString}` : pathname,
      userCode
    );
    setIsSynced(false);
    router.replace(nextPath, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, disableGate ? [] : [isReady, userCode, router, pathname, searchParams, searchString]);

  // 如果明确要求跳过校验（用于导出场景），立即渲染 children，不等待任何状态
  if (disableGate) {
    return <>{children}</>;
  }

  if (!isReady || !isSynced) {
    return null;
  }

  if (!userCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#E9E8F8] px-6">
        <div className="bg-white shadow-xl rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            未获取到用户信息
          </h2>
          <p className="text-gray-600 mb-6">
            请从问知重新打开 PPT 助手，系统将自动获取您的用户信息。
          </p>
          <p className="text-sm text-gray-500">
            如果问题持续存在，请联系管理员。
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

