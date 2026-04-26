import { languages } from "../constants/languages";

const LanguageDropdown = ({ targetLang, setTargetLang }) => {
  return (
    <div>
      <label>Select Language:</label>
      <select
        value={targetLang}
        onChange={(e) => setTargetLang(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageDropdown;