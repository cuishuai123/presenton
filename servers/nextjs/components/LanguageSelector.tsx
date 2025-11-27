"use client";

import React from 'react';
import { useDispatch } from 'react-redux';
import { setLanguage, Language } from '@/store/slices/userConfig';
import { useTranslation } from '@/app/hooks/useTranslation';
import { Switch } from "@/components/ui/switch";

const LanguageSelector = () => {
  const dispatch = useDispatch();
  const { language } = useTranslation();

  const handleLanguageToggle = (checked: boolean) => {
    // checked = true means Chinese, false means English
    dispatch(setLanguage(checked ? 'zh' : 'en'));
  };

  return (
    <div className="flex items-center gap-3">
      <span className={`text-sm font-medium transition-colors ${language === 'en' ? 'text-white font-semibold' : 'text-white/60'}`}>
        EN
      </span>
      <Switch
        checked={language === 'zh'}
        onCheckedChange={handleLanguageToggle}
        className="data-[state=checked]:bg-white/40 data-[state=unchecked]:bg-white/40"
      />
      <span className={`text-sm font-medium transition-colors ${language === 'zh' ? 'text-white font-semibold' : 'text-white/60'}`}>
        中文
      </span>
    </div>
  );
};

export default LanguageSelector;

