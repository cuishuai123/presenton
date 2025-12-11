import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { translations, TranslationKey } from '@/utils/translations';

export const useTranslation = () => {
  const language = useSelector((state: RootState) => state.userConfig.language);

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    let text = translations[language][key] || key;
    
    // Replace placeholders like {percentage} with actual values
    if (params) {
      Object.keys(params).forEach(paramKey => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
      });
    }
    
    return text;
  };

  return { t, language };
};

