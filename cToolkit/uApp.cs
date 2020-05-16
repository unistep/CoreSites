
using System;
using System.Collections;
using System.IO;
using System.Reflection;
using Newtonsoft.Json;

namespace uToolkit
{
	public class uApp
	{
		public	static	string	m_homeDirectory			= "";
		public	static	string	m_assemblyTitle			= "";       // Program Name
		public	static	string	m_assemblyVersion		= "";       // Executable Version

		public	static	readonly	object	m_lockerLoger	= new object();
		public	static	ArrayList	m_logerMessages			= null;

		// ======================================================================================================
		public static void Initialize(bool isServer)
		{
			m_homeDirectory = Directory.GetCurrentDirectory();

			Assembly runningAssembly = Assembly.GetEntryAssembly();
			if (runningAssembly == null) runningAssembly = Assembly.GetExecutingAssembly();

			m_assemblyTitle = runningAssembly.GetName().Name;
			m_assemblyVersion = runningAssembly.GetName().Version.ToString();

			if (!Directory.Exists(m_homeDirectory + "\\" + m_assemblyTitle))
			{
				uFile.CreateDirectory(m_homeDirectory + "\\" + m_assemblyTitle);
			}

			if (isServer) m_logerMessages = ArrayList.Synchronized(new ArrayList());

			Loger("");
			Loger("");
			Loger("====================================================================================================");
			Loger($"Current System Version: {Environment.OSVersion.Version.ToString()}");
			Loger($"Current Application Version: {m_assemblyVersion}");

			AppParams.Load();

			uDB.GetApplication_DB_Map();

			uLanguageCodes.Initialize();
			
			foreach (TextTable item in AppParams.m_instance.TextTables) uTextFile.Create(item.Name);

			uTextFile.Create_i18n();
		}


		// ======================================================================================================
		public static void Loger(string message)
		{
			if (message.Trim() != "")
			{
				message = DateTime.Now.ToString("yyyy/MM/dd-HH:mm:ss.fff ") + message;
			}

			lock (m_lockerLoger)
			{
				Console.WriteLine(message);

				string logPath	= m_homeDirectory + "\\" + m_assemblyTitle + "\\"
								+ m_assemblyTitle + "_" + DateTime.Now.ToString("yyyy_MM_dd") + ".Log";
				uFile.WriteFile(logPath, message + "\r\n");
			}

			if (m_logerMessages != null) m_logerMessages.Add(message + "\r\n");
		}


		// ======================================================================================================
		public static void AddSupportForNewLanguage(string _languageCode)
		{
			if (!uLanguageCodes.IsValidLanguageCode(_languageCode)) return;

			foreach (uTextFile textFile in uTextFile.m_textFiles)
			{
				textFile.SetNewLanguage(_languageCode);
			}
		}
	}
}
