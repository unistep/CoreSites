using System.Collections;
using System.IO;
using System.Net;
using System.Text;
using System.Threading;
using System.Threading.Tasks;


namespace uToolkit
{
	public class uSmsMessage
	{
		public	static	string	CONST_SMS_SmsService	= "SmsService";

		public	static	string	CONST_SMS_ClickAtell	= "ClickAtell";
		public	static	string	CONST_SMS_Micropay		= "Micropay";
		public	static	string	CONST_SMS_InforUMobile	= "InforUMobile";

		public	static	readonly object m_lockerSmsQueu	= new object();
		public	static	Thread			m_threadSmsQueue = null;
		private	static	ArrayList		m_smsQueue	= ArrayList.Synchronized(new ArrayList());

		public	string	m_sender		= "";
		public	string	m_recipients	= "";
		public	string	m_message		= null;


		public uSmsMessage(string sender, string recipients, string message)
		{
			m_sender		= sender;
			m_recipients	= recipients;
			m_message		= message;
		}


		public static void StartSmsQueueThread()
		{
			m_threadSmsQueue = new Thread(SmsQueueThread);
			m_threadSmsQueue.Name = "SmsQueueThread";
			m_threadSmsQueue.Start();
		}


		public static void StopSmsQueueThread()
		{
			if (m_threadSmsQueue != null)
			{
				m_threadSmsQueue.Abort();
				m_threadSmsQueue = null;
			}
		}


		public static bool SendSmsMessage(string sender, string recipients, string message)
		{
			message = message.Replace("'", "");

			if (m_threadSmsQueue != null)
			{
				lock (m_lockerSmsQueu)
				{
					m_smsQueue.Add(new uSmsMessage(sender, recipients, message));
				}

				return true;
			}

			SendSmsDirect(sender, recipients, message);
			return true;
		}


		public static Task SendSmsDirect(string _sender, string _recipients, string _message)
		{
			SmsService smsParams = null;

			for (int i = 0; i < AppParams.m_instance.SmsServices.Count; i++)
			{
				if (AppParams.m_instance.SmsServices[i].ServiceName.ToLower() !=
					AppParams.m_instance.SmsVendor.ToLower()) continue;
				smsParams = AppParams.m_instance.SmsServices[i];
				break;
			}

			_message = _message.Replace("'", "");

			if (smsParams.ServiceName.ToLower() == CONST_SMS_ClickAtell.ToLower())
			{
				SendSmsMessage_ClickAtell(smsParams, _sender, _recipients, _message);
			}
			else if (smsParams.ServiceName.ToLower() == CONST_SMS_Micropay.ToLower())
			{
				SendSmsMessage_Micropay(smsParams, _sender, _recipients, _message);
			}
			else if (smsParams.ServiceName.ToLower() == CONST_SMS_InforUMobile.ToLower())
			{
				SendSmsMessage_InforUMobile(smsParams, _sender, _recipients, _message);
			}
			else
			{
				uApp.Loger("*** SendSmsMessage Error: No SMS service supplier!");
			}

			return Task.FromResult(0);
		}


		public static Task SendSmsMessage_ClickAtell(SmsService smsParams, string _sender, string _recipients, string _message)
		{
			string serviceKeys = smsParams.ServiceKeys;
			string userName = uStr.Get_CMD_Field(serviceKeys, 1);
			string password = uStr.Get_CMD_Field(serviceKeys, 2);
			string apiID	= uStr.Get_CMD_Field(serviceKeys, 3);

			WebClient client = new WebClient();

			client.Headers.Add("user-agent", "Mozilla/4.0(compatible; MSIE 6.0; Windows NT 5.2; .NET CLR1.0.3705;)");
			client.QueryString.Add("user", userName);
			client.QueryString.Add("password", password);
			client.QueryString.Add("api_id", apiID);
			client.QueryString.Add("to", _recipients);
			client.QueryString.Add("text", _message);

			Stream data = client.OpenRead("http://api.clickatell.com/http/sendmsg");
			StreamReader reader = new StreamReader(data);
			string s = reader.ReadToEnd();
			data.Close();
			reader.Close();

			return Task.FromResult(0);
		}


		public static Task SendSmsMessage_Micropay(SmsService smsParams, string _sender, string _recipients, string _message)
		{
			string serviceKeys = smsParams.ServiceKeys;
			string userName = uStr.Get_CMD_Field(serviceKeys, 1);
			string userID = uStr.Get_CMD_Field(serviceKeys, 2);
			if (_sender == "") _sender = smsParams.CallerNumber;
			_sender = uStr.Substring(_sender, 0, 11);

			_recipients = _recipients.Replace(";", ",");

			WebClient client = new WebClient();
			string strMicroPay = "http://www.micropay.co.il/ExtApi/ScheduleSms.php?get=1" +
				"&charset=utf-8&uid=" + userID + "&un=" + userName + "&msglong=" +
				_message + "&from=" + _sender + "&list=" + _recipients;

			string response = "";

			try
			{
				Stream data = client.OpenRead(strMicroPay);
				StreamReader reader = new StreamReader(data);
				response = reader.ReadToEnd();
				data.Close();
				reader.Close();
			}
			catch (System.Exception e)
			{
				uApp.Loger($"*** Micropay Send SMS Error: {e.Message}");
				return Task.FromResult(0);
			}

			if (response.IndexOf("OK") == -1)
			{
				uApp.Loger($"*** Fail to send SMS : {response}");
			}

			//uApp.Loger($"SMS: From={_sender}, Recipients={_recipients}, Msg={_message}");
			return Task.FromResult(0);
		}

		public static Task SendSmsMessage_InforUMobile(SmsService smsParams, string _sender, string _recipients, string _message)
		{
			string serviceKeys = smsParams.ServiceKeys;
			string userName = uStr.Get_CMD_Field(serviceKeys, 1);
			string password = uStr.Get_CMD_Field(serviceKeys, 2);
			if (_sender == "") _sender = smsParams.CallerNumber;

			_sender = uStr.Substring(_sender, 0, 11);

			string messageText = System.Security.SecurityElement.Escape(_message);

			StringBuilder sbXml = new StringBuilder();
			sbXml.Append("<Inforu>");
			sbXml.Append("<User>");
			sbXml.Append("<Username>" + userName + "</Username>");
			sbXml.Append("<Password>" + password + "</Password>");
			sbXml.Append("</User>");
			sbXml.Append("<Content Type=\"sms\">");
			sbXml.Append("<Message>" + messageText + "</Message>");
			sbXml.Append("</Content>");
			sbXml.Append("<Recipients>");
			sbXml.Append("<PhoneNumber>" + _recipients + "</PhoneNumber>");
			sbXml.Append("</Recipients>");
			sbXml.Append("<Settings>");
			sbXml.Append("<Sender>" + _sender + "</Sender>");
			sbXml.Append("</Settings>");
			sbXml.Append("</Inforu>");

			byte[] utf8Bytes = Encoding.UTF8.GetBytes(sbXml.ToString());
			string strXML = "InforuXML=" + Encoding.UTF8.GetString(utf8Bytes);

			WebClient client = new WebClient();
			string targetURL = "http://api.inforu.co.il/SendMessageXml.ashx";

			string result = string.Empty;
			WebRequest request = WebRequest.Create(targetURL);
			request.Timeout = 10000;
			request.Method = "POST";
			request.ContentType = "application/x-www-form-urlencoded";

			try
			{
				strXML = strXML.Replace(" ", "+");

				byte[] PostBuffer = Encoding.UTF8.GetBytes(strXML);
				request.ContentLength = PostBuffer.Length;

				Stream RequestStream = request.GetRequestStream();
				RequestStream.Write(PostBuffer, 0, PostBuffer.Length);
				RequestStream.Close();

				WebResponse response;
				response = request.GetResponse();
				StreamReader sr = new StreamReader(response.GetResponseStream(), Encoding.UTF8);

				result = sr.ReadToEnd();

				sr.Close();
				response.Close();
			}
			catch (System.Exception e)
			{
				uApp.Loger($"*** InforUMobile Send SMS Error: {e.Message}");
				return Task.FromResult(0);
			}

			string status = uStr.GetXmlNodeValue(result, "Status");
			string description = uStr.GetXmlNodeValue(result, "Description");

			if (status != "1")
			{
				uApp.Loger($"*** InforUMobile Send SMS Error: Status={status}, Desc={description}");
			}

			//uApp.Loger($"SMS: From={_sender}, Recipients={_recipients}, Msg={_message}");
			return Task.FromResult(0);
		}


		public static uSmsMessage GetSmsMessage(int index)
		{
			lock (m_lockerSmsQueu)
			{
				if (index >= m_smsQueue.Count) return null;

				uSmsMessage itemSms = (uSmsMessage)m_smsQueue[index];
				m_smsQueue.RemoveAt(index);
				return itemSms;
			}
		}


		public static void SmsQueueThread()
		{
			while (true)
			{
				Thread.Sleep(500);

				if (m_smsQueue.Count == 0) continue;

				uSmsMessage smsMessage = GetSmsMessage(0); // Which will remove the array entry as well
				if (smsMessage == null) continue;

				SendSmsDirect(smsMessage.m_sender, smsMessage.m_recipients, smsMessage.m_message);
			}
		}
	}
}
