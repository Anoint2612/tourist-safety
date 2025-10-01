import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useTranslation } from 'react-i18next';

const LanguageSelection = ({ navigation }) => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  // Set English as default if not set
  React.useEffect(() => {
    if (!language || language === '') {
      setLanguage('en');
    }
  }, []);

  // Handler to switch language and navigate
  const handleSelect = async (lang) => {
    try {
      await setLanguage(lang);
      // Navigate to RegisterScreen after language is set
      if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate('Register', { fromLanguageSelection: true });
      }
    } catch (error) {
      console.error('Error setting language:', error);
      // Still navigate even if language setting fails
      if (navigation && typeof navigation.navigate === 'function') {
        navigation.navigate('Register', { fromLanguageSelection: true });
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('choose_language')}</Text>
      <View style={styles.options}>
        <TouchableOpacity
          style={[styles.option, language === 'en' && styles.selected]}
          onPress={() => handleSelect('en')}
        >
          <Text style={styles.optionText}>{t('english')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, language === 'hi' && styles.selected]}
          onPress={() => handleSelect('hi')}
        >
          <Text style={styles.optionText}>{t('hindi')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  options: {
    flexDirection: 'row',
    gap: 16,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginHorizontal: 8,
  },
  selected: {
    backgroundColor: '#cce5ff',
    borderWidth: 2,
    borderColor: '#007bff',
  },
  optionText: {
    fontSize: 18,
    fontWeight: '500',
  },
});

export default LanguageSelection;