import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        className={`px-2 py-1 rounded text-sm ${i18n.language === 'en' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'}`}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
      <button
        className={`px-2 py-1 rounded text-sm ${i18n.language === 'ms' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'}`}
        onClick={() => changeLanguage('ms')}
      >
        BM
      </button>
    </div>
  );
};

export default LanguageSwitcher;