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

  useEffect(() => {
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
  }, [isReady, userCode, router, pathname, searchParams, searchString]);

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

