
using System;
using System.Collections;
using System.Data.SqlClient;
using System.IO;
using System.Net;
using System.Threading;

namespace uToolkit
{
	public class uTextFile
	{
		public	static	ArrayList	m_textFiles			= new ArrayList();

		public	string				m_tableName			= "";
		public	ArrayList			m_knownLanguages	= null;

		//=======================  PUBLIC STATIC ==============================

		public static uTextFile Get(string _tableName)
		{
			foreach (uTextFile textFile in m_textFiles)
			{
				if (textFile.m_tableName.ToLower() == _tableName.ToLower()) return textFile;
			}

			return null;
		}


		public static void Create(string _tableName)
		{
			if (Get(_tableName) != null) return;

			new uTextFile(_tableName);
		}


		public static string LocalizeValue(string _keyword)
		{
			if ((_keyword == null) || (_keyword == "")) return "";

			return LocalizeValue(_keyword, AppParams.m_instance.DefaultLanguage);
		}


		public static string LocalizeValue(string _keyword, string _language)
		{
			if ((_keyword == null) || (_keyword == "")) return "";

			if ((_language == null) || (_language == "")) _language = "English";

			if (_keyword == "AppName") _keyword = uApp.m_assemblyTitle;

			foreach (uTextFile textFile in uTextFile.m_textFiles)
            {
                string promptValue = textFile.GetPrompt(_keyword, _language);
                if (promptValue != "") return promptValue;
            }

			if (_keyword == uApp.m_assemblyTitle) return _keyword;
			return "?" + _keyword;
		}


		public static void Create_i18n()
		{
			string internationalDrawer = uApp.m_homeDirectory + "/ClientApp/src/assets/i18n";// Angular

			string checkForPublic = "/ClientApp/public";  // true for React
			if (Directory.Exists(checkForPublic))
			{
				internationalDrawer = uApp.m_homeDirectory + "/ClientApp/public/assets/i18n";
			}

			if (Directory.Exists(internationalDrawer)) Directory.Delete(internationalDrawer, true);
			Thread.Sleep(200);
			if (!Directory.Exists(internationalDrawer)) uFile.CreateDirectory(internationalDrawer);
			Thread.Sleep(200);

			foreach (uLanguageCodes languageCode in uLanguageCodes.m_listLanguageCodes)
			{
				string i18nJson = "";

				foreach (uTextFile textFile in uTextFile.m_textFiles)
				{
					uKnownLanguage kl = textFile.GetLanguageArray(languageCode.m_googleName);
					if (kl == null) continue;

					foreach (uPrompt uPrompt in kl.m_promptList)
					{
						string prompt = uPrompt.m_prompt.Replace("\"", "\\\"").Replace("\\'", "''");
						i18nJson += "\"" + uPrompt.m_keyword + "\": \"" + prompt + "\",\n";
					}
				}

				if (i18nJson == "") continue;

				i18nJson = "{\n" + i18nJson.TrimEnd(",\n".ToCharArray()) + "\n}";
				uFile.WriteFile(internationalDrawer + "/" + languageCode.m_googleCode + ".json", i18nJson);
			}
		}

		public static ArrayList GetKnownLanguages()
		{
			return GetKnownLanguages(((uTextFile)uTextFile.m_textFiles[0]).m_tableName);
		}


		public static ArrayList GetKnownLanguages(string _tableName)
		{
			ArrayList _knownLanguages = new ArrayList();

			uTextFile textFile = Get(_tableName);

			if ((textFile != null) && (textFile.m_knownLanguages != null))
			{
				for (int i = 0; i < textFile.m_knownLanguages.Count; i++)
				{
					uKnownLanguage _knownLanguage = (uKnownLanguage)textFile.m_knownLanguages[i];
					_knownLanguages.Add(_knownLanguage.m_languageName);
				}
			}

			return _knownLanguages;
		}

		public static string GetJsonKnownLanguages()
		{
			return GetJsonKnownLanguages(((uTextFile)uTextFile.m_textFiles[0]).m_tableName);
		}


		public static string GetJsonKnownLanguages(string _tableName)
		{
			string _knownLanguages = "";

			uTextFile textFile = Get(_tableName);

			if ((textFile != null) && (textFile.m_knownLanguages != null))
			{
				for (int i = 0; i < textFile.m_knownLanguages.Count; i++)
				{
					uKnownLanguage _knownLanguage = (uKnownLanguage)textFile.m_knownLanguages[i];
					string _languagCode = uLanguageCodes.GetCodeByName(_knownLanguage.m_languageName);
					_knownLanguages +=	"{\"id\": \""  + _languagCode + "\"," +
										"\"name\": \"" + _knownLanguage.m_languageName + "\"},";
				}

				return "[" + _knownLanguages.Trim(",".ToCharArray()) + "]";
			}

			return _knownLanguages;
		}

		//=======================  MEMBERS ====================================

		public uTextFile()
		{
		}


		public uTextFile(string _tableName)
		{
			m_tableName	= _tableName;

			m_textFiles.Add(this);

			Initialize();
		}


		public string GetPrompt(string _keyword, string _language)
		{
			uPrompt _prompt = null;

			uKnownLanguage _knownLanguage = GetLanguageArray(_language);
			if (_knownLanguage != null)
			{
				_prompt = _knownLanguage.GetPrompt(_keyword);
				if ((_prompt != null) && (_prompt.m_prompt != ""))
				{
					return _prompt.m_prompt;
				}
			}

			return ((_language == "English") ? "" : GetPrompt(_keyword, "English"));
			//if ((_knownLanguage = GetLanguageArray("English")) == null) return _keyword;

			//uPrompt = _knownLanguage.GetPrompt(_keyword);
			//if (prompt != null)
			//{
			//	return prompt.m_prompt == "" ? _keyword : prompt.m_prompt;
			//}

			//prompt = new UPrompt(_keyword, "");
			//_knownLanguage.m_promptList.Add(prompt);

			//string stmt = "INSERT INTO {0} (Keyword) VALUES ('{1}')";

			//string dbKey = uDB.GetTarget_DB(m_tableName);
			//uDB.DoNoneQuery(string.Format(stmt, m_tableName, _keyword), dbKey);

			//return "?" + _keyword;
		}


		public void Initialize ()
		{
			string dbKey = uDB.GetTarget_DB(m_tableName);
			uApp.Loger(($"Locale Table: {dbKey}::{m_tableName}"));

			String stmt = String.Format("SELECT * FROM {0}", m_tableName);
			SqlDataReader dr = uDB.DoQuery(stmt);
			if (dr == null) return;

			if (m_knownLanguages == null)
			{
				m_knownLanguages = new ArrayList();

				for (int i = 0; i < dr.FieldCount; i++)
				{
					string languageName = dr.GetName(i); // Column named as google language names

					if (!uLanguageCodes.IsValidLanguageName(languageName)) continue;

					uKnownLanguage uLanguages = new uKnownLanguage(m_knownLanguages, languageName);
				}
			}

			while (dr.Read ())
			{
				string keyword = uStr.GetStringObject(dr["Keyword"]);

				for (int i = 0; i < dr.FieldCount; i++)
				{
					string languageName = dr.GetName(i);

					if (!uLanguageCodes.IsValidLanguageName(languageName)) continue;

					string promptValue = uStr.GetStringObject(dr[languageName]);

					uPrompt prompt = new uPrompt(keyword, promptValue);

					uKnownLanguage _knownLanguage = GetLanguageArray(languageName);
					if (_knownLanguage != null) _knownLanguage.m_promptList.Add(prompt);
				}
			}

			dr.Close ();
		}

		public uKnownLanguage GetLanguageArray (string _languageName)
		{
			foreach (uKnownLanguage _knownLanguage in m_knownLanguages)
			{
				if (_knownLanguage.m_languageName.ToLower() == _languageName.ToLower()) return _knownLanguage;
			}

			return null;
		}

		public bool IsKnownLanguageName(String _languageName)
		{
			foreach (uKnownLanguage _knownLanguage in m_knownLanguages)
			{
				if (_knownLanguage.m_languageName.ToLower() == _languageName.ToLower()) return true;
			}

			return false;
		}

		public bool IsKnownLanguageCode(String _languageCode)
		{
			foreach (uKnownLanguage _knownLanguage in m_knownLanguages)
			{
				if (uLanguageCodes.GetCodeByName(_knownLanguage.m_languageName).ToLower() == _languageCode.ToLower()) return true;
			}

			return false;
		}

		public bool SetNewLanguage(String _languageCode)
		{
			if (IsKnownLanguageCode(_languageCode)) return true;
			if (_languageCode.ToLower() == "en") return true;

			string _languageName = uLanguageCodes.GetNameByCode(_languageCode);
			if (_languageName == "") return false;

			uKnownLanguage languageEnglish = GetLanguageArray("English");
			if (languageEnglish == null) return false;

			bool isValidNewLanguage = false;
			ArrayList listPrompts = new ArrayList();

			foreach (uPrompt prompt in languageEnglish.m_promptList)
			{
				string strNewLangValue = GoogleDoTranslate("en", _languageCode, prompt.m_prompt);

				if (strNewLangValue != "") isValidNewLanguage = true;

				listPrompts.Add(new uPrompt(prompt.m_keyword, strNewLangValue));
			}

			if (!isValidNewLanguage) return false;

			uKnownLanguage newLanguage = new uKnownLanguage(m_knownLanguages, _languageName);
			newLanguage.m_promptList = listPrompts;

			string dbKey = uDB.GetTarget_DB(m_tableName);
			if (!uDB.CreateNewTableColumn(m_tableName, _languageName,
											 "nvarchar(MAX) NULL", dbKey)) return false;

			for (int i = 0; i < listPrompts.Count; i++)
			{
				string stmt = "UPDATE {0} SET {1}='{2}', LastModified='{3}' WHERE Keyword='{4}'";
				string lastModified = DateTime.Now.ToString("yyyy/MM/dd hh:mm:ss");

				uPrompt prompt = (uPrompt) listPrompts[i];

				stmt = string.Format(stmt, m_tableName, _languageName,
										prompt.m_prompt, lastModified, prompt.m_keyword);

				uDB.DoNoneQuery(stmt, dbKey);
			}

			return true;
		}


		public static string GoogleDoTranslate(string sourceLanguage, string targetLanguage, string sourceText)
		{
			string myKey = "";
			foreach (ProductKey productKey in AppParams.m_instance.ProductKeys)
			{
				if (productKey.Name.ToLower() != "googletranslate") continue;
				myKey = productKey.Key;
				break;
			}


			string url = "https://www.googleapis.com/language/translate/v2?key={0}&q={1}&source={2}&target={3}";

			string response = "";
			string request = string.Format(url, myKey, sourceText, sourceLanguage, targetLanguage);
			uApp.Loger(request);

			try
			{
				WebClient client = new WebClient();

				client.Encoding = System.Text.Encoding.UTF8;
				response = client.DownloadString(request);
			}
			catch (System.Exception e)
			{
				uApp.Loger($"*** GoogleDoTranslate Error: {e.Message}");
			}

			string result1 = response.Replace("\r\n", "\n");
			string result2 = uStr.GetArgString(result1, 5, "\n");
			string result3 = uStr.GetArgString(result2, 2, ":");
			string result4 = result3.Trim("\"".ToCharArray());
			result4 = result4.Replace("&#39;", "''");
			result4 = result4.Replace("&quot;", "\"");

			return result4.Trim();
		}

		//public void CreateNewPrompt(string keyword)
		//{
		//	uKnownLanguage _knownLanguage = GetLanguageArray("English");
		//	if (_knownLanguage == null) return;

		//	UPrompt prompt = new uPrompt(keyword, "");
		//	_knownLanguage.m_promptList.Add(prompt);

		//	string stmt = "INSERT INTO {0} (Keyword) VALUES ('{1}')";

		//	string dbKey = uDB.GetTarget_DB(m_tableName);
		//	uDB.DoNoneQuery(string.Format(stmt, m_tableName, keyword), dbKey);
		//}
	}
}
