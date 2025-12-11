'use client';

import { useEffect, useState } from 'react';
import { setCanChangeKeys, setLLMConfig } from '@/store/slices/userConfig';
import { hasValidLLMConfig } from '@/utils/storeHelpers';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { checkIfSelectedOllamaModelIsPulled } from '@/utils/providerUtils';
import { LLMConfig } from '@/types/llm_config';
import { useTranslation } from '@/app/hooks/useTranslation';

export function ConfigurationInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const route = usePathname();
  const searchParams = useSearchParams();
  const disableRedirect = searchParams.get("disableRedirect") === "1";

  // Fetch user config state
  useEffect(() => {
    // 如果明确要求跳过校验（用于导出场景），仍然执行初始化但不执行重定向
    if (disableRedirect) {
      fetchUserConfigStateForExport();
      return;
    }
    fetchUserConfigState();
  }, [disableRedirect]);

  const setLoadingToFalseAfterNavigatingTo = (pathname: string) => {
    const interval = setInterval(() => {
      if (window.location.pathname === pathname) {
        clearInterval(interval);
        setIsLoading(false);
      }
    }, 500);
  }

  // 用于导出场景的初始化函数，不执行重定向
  const fetchUserConfigStateForExport = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/can-change-keys');
      const canChangeKeys = (await response.json()).canChange;
      dispatch(setCanChangeKeys(canChangeKeys));

      if (canChangeKeys) {
        const response = await fetch('/api/user-config');
        const llmConfig = await response.json();
        if (!llmConfig.LLM) {
          llmConfig.LLM = 'openai';
        }
        dispatch(setLLMConfig(llmConfig));
      }
      // 无论配置是否有效，都设置 loading 为 false，不执行重定向
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching user config for export:', error);
      // 即使出错也设置 loading 为 false，让页面继续渲染
      setIsLoading(false);
    }
  }

  const fetchUserConfigState = async () => {
    setIsLoading(true);
    const response = await fetch('/api/can-change-keys');
    const canChangeKeys = (await response.json()).canChange;
    dispatch(setCanChangeKeys(canChangeKeys));

    if (canChangeKeys) {
      const response = await fetch('/api/user-config');
      const llmConfig = await response.json();
      if (!llmConfig.LLM) {
        llmConfig.LLM = 'openai';
      }
      dispatch(setLLMConfig(llmConfig));
      const isValid = hasValidLLMConfig(llmConfig);
      if (isValid) {
        // Check if the selected Ollama model is pulled
        if (llmConfig.LLM === 'ollama') {
          const isPulled = await checkIfSelectedOllamaModelIsPulled(llmConfig.OLLAMA_MODEL);
          if (!isPulled) {
            // 如果明确要求跳过校验（用于导出场景），不执行重定向
            if (disableRedirect) {
              setIsLoading(false);
              return;
            }
            router.push('/');
            setLoadingToFalseAfterNavigatingTo('/');
            return;
          }
        }
        if (llmConfig.LLM === 'custom') {
          const isAvailable = await checkIfSelectedCustomModelIsAvailable(llmConfig);
          if (!isAvailable) {
            // 如果明确要求跳过校验（用于导出场景），不执行重定向
            if (disableRedirect) {
              setIsLoading(false);
              return;
            }
            router.push('/');
            setLoadingToFalseAfterNavigatingTo('/');
            return;
          }
        }
        if (route === '/') {
          router.push('/upload');
          setLoadingToFalseAfterNavigatingTo('/upload');
        } else {
          setIsLoading(false);
        }
      } else if (route !== '/') {
        // 如果明确要求跳过校验（用于导出场景），不执行重定向
        if (disableRedirect) {
          setIsLoading(false);
        } else {
        router.push('/');
        setLoadingToFalseAfterNavigatingTo('/');
        }
      } else {
        setIsLoading(false);
      }
    } else {
      if (route === '/') {
        router.push('/upload');
        setLoadingToFalseAfterNavigatingTo('/upload');
      } else {
        setIsLoading(false);
      }
    }
  }


  const checkIfSelectedCustomModelIsAvailable = async (llmConfig: LLMConfig) => {
    try {
      const response = await fetch('/api/v1/ppt/openai/models/available', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: llmConfig.CUSTOM_LLM_URL,
          api_key: llmConfig.CUSTOM_LLM_API_KEY,
        }),
      });
      const data = await response.json();
      return data.includes(llmConfig.CUSTOM_MODEL);
    } catch (error) {
      console.error('Error fetching custom models:', error);
      return false;
    }
  }


  // 如果明确要求跳过校验（用于导出场景），立即返回 children，不等待配置加载
  if (disableRedirect) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#E9E8F8] via-[#F5F4FF] to-[#E0DFF7] flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
            {/* Logo/Branding */}
            <div className="mb-6">
              <img
                src="/Logo.png"
                alt="PresentOn"
                className="h-12 mx-auto mb-4 opacity-90"
              />
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto rounded-full"></div>
            </div>

            {/* Loading Text */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800 font-inter">
                {t('app.initializing')}
              </h3>
              <p className="text-sm text-gray-600 font-inter">
                {t('app.loadingConfig')}
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mt-6">
              <div className="flex space-x-1 justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
