import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface TranslateAllButtonProps {
  className?: string;
}

export function TranslateAllButton({ className = '' }: TranslateAllButtonProps) {
  const { 
    translateAllContent, 
    revertAllTranslations, 
    getTranslationStats 
  } = useTranslation();
  
  const [targetLanguage, setTargetLanguage] = useState('vi');
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  
  const stats = getTranslationStats();
  const hasTranslations = stats.translated > 0;
  const isTranslating = stats.translating > 0;

  const languages = [
    { code: 'vi', name: 'Vietnamese' },
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ru', name: 'Russian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'it', name: 'Italian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'th', name: 'Thai' }
  ];

  const handleTranslateAll = async () => {
    if (isTranslating) return;
    
    try {
      await translateAllContent({ to: targetLanguage });
    } catch (error) {
      console.error('Bulk translation failed:', error);
    }
  };

  const handleRevertAll = () => {
    if (isTranslating) return;
    revertAllTranslations();
  };

  const toggleLanguageSelect = () => {
    setShowLanguageSelect(!showLanguageSelect);
  };

  const handleLanguageChange = (langCode: string) => {
    setTargetLanguage(langCode);
    setShowLanguageSelect(false);
  };

  const selectedLanguage = languages.find(lang => lang.code === targetLanguage);

  return (
    <div className={`translate-all-container ${className}`}>
      <div className="translate-controls">
        {!hasTranslations ? (
          <>
            <div className="language-selector">
              <button
                onClick={toggleLanguageSelect}
                className="language-select-btn"
                disabled={isTranslating}
              >
                🌐 {selectedLanguage?.name || 'Vietnamese'}
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {showLanguageSelect && (
                <div className="language-dropdown">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`language-option ${lang.code === targetLanguage ? 'selected' : ''}`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={handleTranslateAll}
              disabled={isTranslating || stats.total === 0}
              className="translate-all-btn"
            >
              {isTranslating ? (
                <>
                  <span className="translate-icon">⏳</span>
                  Translating... ({stats.translating}/{stats.total})
                </>
              ) : (
                <>
                  <span className="translate-icon">🌐</span>
                  Translate All ({stats.total})
                </>
              )}
            </button>
          </>
        ) : (
          <div className="translation-status">
            <span className="translation-info">
              📝 {stats.translated}/{stats.total} translated to {selectedLanguage?.name}
            </span>
            <button
              onClick={handleRevertAll}
              disabled={isTranslating}
              className="revert-all-btn"
            >
              <span className="revert-icon">↩️</span>
              Revert All
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
