import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { translations, TranslationKey } from '@/utils/translations';

export const useTranslation = () => {
  const language = useSelector((state: RootState) => state.userConfig.language);

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return { t, language };
};

