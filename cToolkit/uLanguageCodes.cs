
using System;
using System.Collections;

namespace uToolkit
{
	public class uLanguageCodes
	{
		// Use Google global coding for languages
		public	static	ArrayList	m_listLanguageCodes	= null;

		public	string				m_googleCode	= "";
		public	string				m_i18nCode		= "";
		public	string				m_googleName	= "";


		public uLanguageCodes()
		{
		}


		public uLanguageCodes(string _googleCode, string _i18nCode, string _googleName)
		{
			m_googleCode	= _googleCode;
			m_i18nCode		= _i18nCode;
			m_googleName	= _googleName;

			if (m_listLanguageCodes == null) m_listLanguageCodes = new ArrayList();

			m_listLanguageCodes.Add(this);
		}

		//public static string GetDefaultLanguage()
		//{
		//	var name = uApp.m_menuLanguage;
		//	var id = GetCodeByName(name);

		//	return $"{{\"id\": \"{id}\", \"name\": \"{name}\"}}";
		//}

		public static void Initialize()
		{
			if (m_listLanguageCodes != null) return;

			SetGoogleDefaultLanguageList();
		}


		public static string GetCodeByName (string _strLanguageName)
		{
			foreach (uLanguageCodes uLanguage in m_listLanguageCodes)
			{
				if (uLanguage.m_googleName.ToLower() == _strLanguageName.ToLower()) return uLanguage.m_googleCode;
			}

			return "en";
		}


		public static string GetNameByCode(string _strLanguageCode)
		{
			foreach (uLanguageCodes uLanguage in m_listLanguageCodes)
			{
				if (uLanguage.m_googleCode.ToLower() == _strLanguageCode.ToLower()) return uLanguage.m_googleName;
			}

			return "English";
		}


		public static bool IsValidLanguageName(String _strLanguageName)
		{
			foreach (uLanguageCodes uLanguage in m_listLanguageCodes)
			{
				if (uLanguage.m_googleName.ToLower() == _strLanguageName.ToLower()) return true;
			}

			return false;
		}


		public static bool IsValidLanguageCode(String _strLanguageCode)
		{
			foreach (uLanguageCodes uLanguage in m_listLanguageCodes)
			{
				if (uLanguage.m_googleCode.ToLower() == _strLanguageCode.ToLower()) return true;
			}

			return false;
		}


		public static string GetJsonGoogleLaguages()
		{
			string strGoogleLanguages = "";

			for (int i = 0; i < uLanguageCodes.m_listLanguageCodes.Count; i++)
			{
				uLanguageCodes gLang = (uLanguageCodes)uLanguageCodes.m_listLanguageCodes[i];
				strGoogleLanguages += "{\"id\": \"" + gLang.m_googleCode + "\"," +
										"\"text\": \"" + gLang.m_googleName + "\"},";
			}

			return "[" + strGoogleLanguages.Trim(",".ToCharArray()) + "]";
		}


		public static void SetGoogleDefaultLanguageList()  // For offline sessions
		{
			new uLanguageCodes("af",	"af",	"Afrikaans");
			new uLanguageCodes("sq",	"sq",	"Albanian");
			new uLanguageCodes("ar",	"ar",	"Arabic");
			new uLanguageCodes("hy",	"hy",	"Armenian");
			new uLanguageCodes("az",	"az",	"Azerbaijani");
			new uLanguageCodes("eu",	"eu",	"Basque");
			new uLanguageCodes("be",	"be",	"Belarusian");
			new uLanguageCodes("bn",	"bn",	"Bengali");
			new uLanguageCodes("bs",	"bs",	"Bosnian");
			new uLanguageCodes("bg",	"bg",	"Bulgarian");
			new uLanguageCodes("ca",	"ca",	"Catalan");
			new uLanguageCodes("zh",	"zh",	"Chinese");
			new uLanguageCodes("hr",	"hr",	"Croatian");
			new uLanguageCodes("cs",	"cs",	"Czech");
			new uLanguageCodes("da",	"da",	"Danish");
			new uLanguageCodes("nl",	"nl",	"Dutch");
			new uLanguageCodes("en",	"en",	"English");
			new uLanguageCodes("eo",	"eo",	"Esperanto");
			new uLanguageCodes("et",	"et",	"Estonian");
			new uLanguageCodes("tl",	"",		"Filipino");	////
			new uLanguageCodes("fi",	"fi",	"Finnish");
			new uLanguageCodes("fr",	"fr",	"French");
			new uLanguageCodes("gl",	"gl",	"Galician");
			new uLanguageCodes("ka",	"ka",	"Georgian");
			new uLanguageCodes("de",	"de",	"German");
			new uLanguageCodes("el",	"el",	"Greek");
			new uLanguageCodes("gu",	"gu",	"Gujarati");
			new uLanguageCodes("ht",	"ht",	"Haitian");
			new uLanguageCodes("iw",	"he",	"Hebrew");		////
			new uLanguageCodes("hi",	"hi",	"Hindi");
			new uLanguageCodes("hu",	"hu",	"Hungarian");
			new uLanguageCodes("is",	"is",	"Icelandic");
			new uLanguageCodes("id",	"id",	"Indonesian");
			new uLanguageCodes("ga",	"ga",	"Irish");
			new uLanguageCodes("it",	"it",	"Italian");
			new uLanguageCodes("ja",	"ja",	"Japanese");
			new uLanguageCodes("kn",	"kn",	"Kannada");
			new uLanguageCodes("kk",	"kk",	"Kazakh");
			new uLanguageCodes("km",	"km",	"Khmer");
			new uLanguageCodes("ko",	"ko",	"Korean");
			new uLanguageCodes("la",	"la",	"Latin");
			new uLanguageCodes("lv",	"lv",	"Latvian");
			new uLanguageCodes("lt",	"lt",	"Lithuanian");
			new uLanguageCodes("mk",	"mk",	"Macedonian");
			new uLanguageCodes("ms",	"ms",	"Malay");
			new uLanguageCodes("ml",	"ml",	"Malayalam");
			new uLanguageCodes("mt",	"mt",	"Maltese");
			new uLanguageCodes("mi",	"mi",	"Maori");
			new uLanguageCodes("mr",	"mr",	"Marathi");
			new uLanguageCodes("mn",	"",		"Mongolian");			////
			new uLanguageCodes("my",	"",		"Myanmar (Burmese)");	////
			new uLanguageCodes("ne",	"ne",	"Nepali");
			new uLanguageCodes("no",	"no",	"Norwegian");
			new uLanguageCodes("fa",	"fa-ir","Persian");
			new uLanguageCodes("pl",	"pl",	"Polish");
			new uLanguageCodes("pt",	"pt",	"Portuguese");
			new uLanguageCodes("pa",	"pa",	"Punjabi");
			new uLanguageCodes("ro",	"ro",	"Romanian");
			new uLanguageCodes("ru",	"ru",	"Russian");
			new uLanguageCodes("sr",	"sr",	"Serbian");
			new uLanguageCodes("st",	"",		"Sesotho");  ////
			new uLanguageCodes("si",	"si",	"Sinhala");
			new uLanguageCodes("sk",	"sk",	"Slovak");
			new uLanguageCodes("sl",	"sl",	"Slovenian");
			new uLanguageCodes("so",	"so",	"Somali");
			new uLanguageCodes("es",	"es",	"Spanish");
			new uLanguageCodes("su",	"",		"Sundanese");  ////
			new uLanguageCodes("sw",	"sw",	"Swahili");
			new uLanguageCodes("sv",	"sv",	"Swedish");
			new uLanguageCodes("tg",	"",		"Tajik");     ////
			new uLanguageCodes("ta",	"ta",	"Tamil");
			new uLanguageCodes("te",	"te",	"Telugu");
			new uLanguageCodes("th",	"th",	"Thai");
			new uLanguageCodes("tr",	"tr",	"Turkish");
			new uLanguageCodes("uk",	"uk",	"Ukrainian");
			new uLanguageCodes("ur",	"ur",	"Urdu");
			new uLanguageCodes("uz",	"",		"Uzbek");       ////
			new uLanguageCodes("vi",	"vi",	"Vietnamese");
			new uLanguageCodes("cy",	"cy",	"Welsh");
			new uLanguageCodes("yi",	"ji",	"Yiddish");
			new uLanguageCodes("yo",	"",		"Yoruba");		////
			new uLanguageCodes("zu",	"zu",	"Zulu");
		}
	}
}
