using Newtonsoft.Json;
using System.Collections.Generic;

namespace uToolkit
{
	public class AppParams
	{
		public	static			AppParams m_instance = null;

		public	string			OnErrorNotify { get; set; }
		public	int				ListenTo { get; set; }
		public	int				Refresh { get; set; }
		public	int				Repeat { get; set; }
		public	string			DefaultLanguage { get; set; }
		public	string			RegistrationPolicy { get; set; }

		public	string			AppFolder { get; set; }
		public	string			FtpUserName { get; set; }
		public	string			FtpPassword { get; set; }
		public	string			ClearingVendor { get; set; }
		public	string			SmsVendor { get; set; }
		public	string			EmailVendor { get; set; }

		public	List<TextTable>	TextTables { get; set; }
		public	List<Database>	Databases { get; set; }
		public	List<Endpoint>	Endpoints { get; set; }
		public List<ProductKey> ProductKeys { get; set; }
		public List<SmsService> SmsServices { get; set; }
		public List<ClearingService> ClearingServices { get; set; }
		public EmailServices		EmailServices { get; set; }


		public static void Load()
		{
			m_instance	 = ReadJsonFile(uApp.m_homeDirectory + "\\" + uApp.m_assemblyTitle + ".json");
			AppParams so = ReadJsonFile(uApp.m_homeDirectory + "\\" + "System_Options.json");

			if (so == null)						return;

			if (m_instance.OnErrorNotify		== null) m_instance.OnErrorNotify		= so.OnErrorNotify;
			if (m_instance.ListenTo				== 0)	 m_instance.ListenTo			= so.ListenTo;
			if (m_instance.Refresh				== 0)    m_instance.Refresh				= so.Refresh;
			if (m_instance.Repeat				== 0)	 m_instance.Repeat				= so.Repeat;
			if (m_instance.DefaultLanguage		== null) m_instance.DefaultLanguage		= so.DefaultLanguage;
			if (m_instance.RegistrationPolicy	== null) m_instance.RegistrationPolicy	= so.RegistrationPolicy;
			if (m_instance.AppFolder			== null) m_instance.AppFolder			= so.AppFolder;
			if (m_instance.FtpUserName			== null) m_instance.FtpUserName 		= so.FtpUserName;
			if (m_instance.FtpPassword			== null) m_instance.FtpPassword 		= so.FtpPassword;
			if (m_instance.ClearingVendor		== null) m_instance.ClearingVendor  	= so.ClearingVendor;
			if (m_instance.SmsVendor			== null) m_instance.SmsVendor			= so.SmsVendor;
			if (m_instance.EmailVendor			== null) m_instance.EmailVendor			= so.EmailVendor;

			if (m_instance.TextTables			== null) m_instance.TextTables			= new List<TextTable> { };
			if (m_instance.Databases			== null) m_instance.Databases			= new List<Database> { };
			if (m_instance.Endpoints			== null) m_instance.Endpoints			= new List<Endpoint> { };
			if (m_instance.ProductKeys			== null) m_instance.ProductKeys			= new List<ProductKey> { };
			if (m_instance.SmsServices			== null) m_instance.SmsServices			= new List<SmsService> { };
			if (m_instance.ClearingServices		== null) m_instance.ClearingServices	= new List<ClearingService> { };
			if (m_instance.EmailServices		== null) m_instance.EmailServices		= so.EmailServices;

			if (so.TextTables			!= null) Add(m_instance.TextTables,				so.TextTables);
			if (so.Databases			!= null) Add(m_instance.Databases,				so.Databases);
			if (so.Endpoints			!= null) Add(m_instance.Endpoints,				so.Endpoints);
			if (so.ProductKeys			!= null) Add(m_instance.ProductKeys,			so.ProductKeys);
			if (so.SmsServices			!= null) Add(m_instance.SmsServices,			so.SmsServices);
			if (so.ClearingServices		!= null) Add(m_instance.ClearingServices,		so.ClearingServices);


			if (m_instance.DefaultLanguage		== "") m_instance.DefaultLanguage		= "English";
			if (m_instance.RegistrationPolicy	== "") m_instance.RegistrationPolicy	= "Admin";

			if (m_instance.RegistrationPolicy.ToLower() == "admin")		m_instance.RegistrationPolicy = "Admin";
			if (m_instance.RegistrationPolicy.ToLower() == "anonymous")	m_instance.RegistrationPolicy = "Anonymous";

			if ((m_instance.RegistrationPolicy.ToLower() != "admin") &&
				(m_instance.RegistrationPolicy.ToLower() != "anonymous"))
			{
				m_instance.RegistrationPolicy = "Admin";
			}
		}

		public static void Add<T>(ICollection<T> collection, IEnumerable<T> items)
		{
			foreach (var item in items) collection.Add(item);
		}

		public static AppParams ReadJsonFile (string _filePath)
		{
			string jsonString = "";
			if (!uFile.ReadFile(_filePath, ref jsonString) || (jsonString == "")) jsonString = "{}";
			return JsonConvert.DeserializeObject<AppParams>(jsonString);
		}
	}

	public class TextTable
	{
		public string Name { get; set; }
	}

	public class Database
	{
		public	string		DatabaseName { get; set; }
		public	string		ConnectionString { get; set; }
	}

	public class Endpoint
	{
		public	string		EndpointName { get; set; }
		public	string		EndpointUrl { get; set; }
		public	int			Timeout { get; set; }
	}

	public class ProductKey
	{
		public string Name { get; set; }
		public string Key { get; set; }
	}
	public class SmsService
	{
		public string ServiceName { get; set; }
		public string ServiceKeys { get; set; }
		public string CallerNumber { get; set; }
	}

	public class ClearingService
	{
		public string ServiceName { get; set; }
		public string EndpointURL { get; set; }
		public string TerminalID { get; set; }
		public string Password { get; set; }
		public string Company { get; set; }
		public string Currency { get; set; }
	}

	public class SendGridService
	{
		public string SendGridUser { get; set; }
		public string SendGridKey { get; set; }
		public string SendGridSender { get; set; }
	}

	public class GmailService
	{
		public string PrimaryDomain { get; set; }

		public int PrimaryPort { get; set; }

		public string UsernameEmail { get; set; }

		public string UsernamePassword { get; set; }

		public string FromEmail { get; set; }
	}

	public class EmailServices
	{
		public SendGridService SendGrid {get; set;}
		public GmailService Gmail { get; set; }
	}
}

