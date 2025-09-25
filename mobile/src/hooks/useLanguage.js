import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import i18n from '../i18n/i18n';
import { updateUserPreferences } from '../store/actions/userActions';

// Custom hook for language selection and Redux integration
export const useLanguage = () => {
  const dispatch = useDispatch();
  // Assume preferences.language is the selected language code
  const language = useSelector(state => state.user?.preferences?.language || 'en');

  // Switch language in i18n and update Redux
  const setLanguage = useCallback(
    (lang) => {
      i18n.changeLanguage(lang);
      dispatch(updateUserPreferences({ language: lang }));
    },
    [dispatch]
  );

  return { language, setLanguage };
};