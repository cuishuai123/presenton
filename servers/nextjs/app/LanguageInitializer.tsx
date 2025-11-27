"use client";

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setLanguage, Language } from '@/store/slices/userConfig';

export default function LanguageInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load language preference from localStorage
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('presenton-language') as Language | null;
      if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
        dispatch(setLanguage(savedLanguage));
      }
    }
  }, [dispatch]);

  return null;
}

