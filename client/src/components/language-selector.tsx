import { useTranslation } from 'react-i18next';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
];

interface LanguageSelectorProps {
  variant?: 'button' | 'select';
  size?: 'sm' | 'md' | 'lg';
}

export function LanguageSelector({ variant = 'select', size = 'sm' }: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    // Set document direction for RTL languages
    document.documentElement.dir = ['ar', 'ur'].includes(languageCode) ? 'rtl' : 'ltr';
    // Set document language attribute
    document.documentElement.lang = languageCode;
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  if (variant === 'button') {
    return (
      <div className="flex items-center space-x-1 rtl:space-x-reverse">
        <Globe className="h-4 w-4 text-white" />
        <div className="flex space-x-1 rtl:space-x-reverse">
          {languages.map((language) => (
            <Button
              key={language.code}
              variant={i18n.language === language.code ? 'secondary' : 'ghost'}
              size="sm"
              className={`text-xs px-2 py-1 text-white hover:bg-white hover:text-blue-600 ${
                i18n.language === language.code ? 'bg-white text-blue-600' : 'bg-transparent'
              } ${
                size === 'sm' ? 'h-6 text-xs' : size === 'lg' ? 'h-8 text-sm' : 'h-7 text-xs'
              }`}
              onClick={() => handleLanguageChange(language.code)}
              data-testid={`language-${language.code}`}
            >
              {language.code.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <Globe className="h-4 w-4 text-gray-500" />
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger 
          className={`w-auto min-w-[100px] ${
            size === 'sm' ? 'h-8 text-xs' : size === 'lg' ? 'h-10 text-sm' : 'h-9 text-sm'
          }`}
          data-testid="language-selector"
        >
          <SelectValue>
            <span className="flex items-center space-x-2 rtl:space-x-reverse">
              <span>{currentLanguage.nativeName}</span>
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem 
              key={language.code} 
              value={language.code}
              data-testid={`language-option-${language.code}`}
            >
              <div className="flex items-center justify-between w-full">
                <span>{language.nativeName}</span>
                <span className="text-xs text-gray-500 ml-2 rtl:ml-0 rtl:mr-2">
                  {language.name}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}