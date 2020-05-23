
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using uToolkit.ClearingInt;
using System.Security.Claims;
using System.Linq;

namespace uToolkit
{
	public class WebApiController : Controller
	{
		public WebApiController()
		{
		}
		////====================================================================================================
		//public string GetCallerLoginName()
		//{
		//	if (!User.Identity.IsAuthenticated) return "Anonymous";

		//	var userId = User.FindFirst(ClaimTypes.NameIdentifier).Value;
		//	if (String.IsNullOrEmpty(userId)) return "Anonymous";
		//	string _user = uDB.GetStringColumn($"SELECT UserName FROM AspNetUsers WHERE Id='{userId}'");

		//	return _user;
		//}

		public IActionResult Error(string message)
		{
			OnErrorNotifications($"{message}");
			return Ok($"{{\"errorMessage\":\"{message}\"}}");
		}

		//====================================================================================================
		[HttpPost("TimeClock")]
		public IActionResult TimeClock(uBusinessObject businessObject)
		{
			businessObject.datasets = new List<uDatasets>();

			// Primary dataset goes FIRST!
			string stmt = $"SELECT Top 1 * FROM Time_Clock WHERE User_Login='{businessObject.view_key_value}'";
			stmt += " ORDER BY Time_Reported DESC";
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt));  // PRIMARY DATASET comes FIRST!

			return Ok(businessObject);
		}

		//====================================================================================================
		[HttpPost("GetAppParams")]
		public IActionResult GetAppParams(string language)
		{
			SetSessionLanguage(language);

			Dictionary<string, string> parameters = new Dictionary<string, string>();

			parameters.Add("AssemblyVersion", uApp.m_assemblyVersion);
			parameters.Add("KnownLanguages", JsonConvert.SerializeObject(uTextFile.GetKnownLanguages()));
			parameters.Add("Language", GetSessionLanguage());
			parameters.Add("Endpoints", JsonConvert.SerializeObject(AppParams.m_instance.Endpoints));

			return Ok(parameters);
		}


		[HttpGet("MVC_ChangeLanguage")]
		//====================================================================================================
		public IActionResult MVC_ChangeLanguage(string language)
		{
			SetSessionLanguage(language);

			var caller = (Request.Headers["Referer"] != "") ?
						Request.Headers["Referer"].ToString() : "DefaultRedirect";

			return Redirect(caller);
		}

		//====================================================================================================
		[HttpPost("SPA_ChangeLanguage")]
		public IActionResult SPA_ChangeLanguage(string language)
		{
			SetSessionLanguage(language);
			return Ok("[]");
		}


		[HttpGet("SetNewLanguage")]
		//====================================================================================================
		public IActionResult SetNewLanguage()
		{
			var caller = (Request.Headers["Referer"] != "") ?
						Request.Headers["Referer"].ToString() : "DefaultRedirect";

			return Redirect(caller);
		}

		//====================================================================================================
		[HttpPost("Upload"), DisableRequestSizeLimit]
		public IActionResult Upload()
		{
			string userName = ""; // await GetCallerLoginName();

			if (Request.Form.Files.Count < 1)
			{
				return Error($"Upload file Error: Caller={userName}, No files recieved");
			}

			IFormFile file = Request.Form.Files[0];
			long fileSize = file.Length;
			string fileName = file.Name;
			uApp.Loger($"Upload file request: Caller={userName}, {fileName}, Size: {fileSize}");

			string strFilePath = uApp.m_homeDirectory + "/uploads/" + fileName;

			string dirPath = uFile.GetDirPath(strFilePath);
			if (dirPath == "") return BadRequest();

			if (!uFile.CreateDirectory(dirPath))
			{
				return Error($"Upload file Error: Caller={userName}, Unable to create directory");
			}

			if (!uFile.CreateFile(file, strFilePath))
			{
				return Error($"Upload file Error: Caller={userName}, Unable to create file");
			}

			uApp.Loger($"{strFilePath} successfully uploaded");
			return Ok("{}");
		}

		[HttpPost("SendSMS")]
		//====================================================================================================
		public async Task<IActionResult> SendSMS()
		{
			var details = JsonConvert.DeserializeObject<dynamic>(await GetRawBodyString(Request));
			
			string userName = GetCallerLoginName();
			string recipient = details["recipient"];
			string message = details["message"];

			uApp.Loger($"SMS: Caller={userName}, Recipient={recipient}, Message={message}");
			await uSmsMessage.SendSmsDirect("", recipient, message);

			return Ok("{}");
		}

		//====================================================================================================
		[HttpPost("CreditAction")]
		public async Task<IActionResult> CreditAction()
		{
			var details = JsonConvert.DeserializeObject<dynamic>(await GetRawBodyString(Request));

			string userName = GetCallerLoginName();

			string transType = details["transType"];
			string transID = details["transID"];
			string cardNumber = details["cardNumber"];
			string expiredYear = details["expiredYear"];
			string expiredMonth = details["expiredMonth"];
			string billAmount = details["billAmount"];
			string payments = details["payments"];
			string cvv = details["cvv"];
			string holderID = details["holderID"];
			string firstName = details["firstName"];
			string lastName = details["lastName"];

			uApp.Loger($"CreditAction: Caller={userName}, ActionType={transType}, CardInfo={cardNumber}");

			CreditCardRequest creditPayment = null;
			string clearingCenter = AppParams.m_instance.ClearingVendor;

			if (clearingCenter.ToLower() == PelecardWebRequest.CONST_Pelecard.ToLower())
			{
				creditPayment = new PelecardWebRequest();
			}
			else if (clearingCenter.ToLower() == TranzilaWebRequest.CONST_Tranzila.ToLower())
			{
				creditPayment = new TranzilaWebRequest();
			}
			else if (clearingCenter.ToLower() == YaadPayWebRequest.CONST_YaadPay.ToLower())
			{
				creditPayment = new YaadPayWebRequest();
			}

			if (creditPayment == null)
			{
				return Error($"{transType} Error: No Clearing center has been defined!");
			}

			string response = "";

			if (transType.ToLower().Trim() == "CreditPayment".ToLower())
			{
				response = creditPayment.DoTransaction(transID, cardNumber, expiredYear, expiredMonth, billAmount, payments,
						cvv, holderID, firstName, lastName);
			}
			else if (transType.ToLower().Trim() == "AuthorizeCredit".ToLower())
			{
				response = creditPayment.AuthorizeCreditCard(transID, cardNumber, expiredYear, expiredMonth, billAmount, payments,
						cvv, holderID, firstName, lastName);
			}
			else
			{
				return Error($"{transType} Error: Unknown transaction type");
			}

			//OnErrorNotifications(response);

			//uApp.Loger($"Response: {response}");

			if (response.IndexOf("<ERROR>:") != -1)
			{
				return Error(response.Replace("<ERROR>:", "ERROR:"));
			}

			return Ok(response);
		}

		public Task<string> GetRawBodyString(HttpRequest request, Encoding encoding = null)
		{
			if (encoding == null) encoding = Encoding.UTF8;

			using (StreamReader reader = new StreamReader(request.Body, encoding))
				return reader.ReadToEndAsync();
		}


		[HttpPost("WebApi")]
		//====================================================================================================
		public IActionResult WebApi(string request_type, string param1, string param2)
		{
			string userName = ""; // GetCallerLoginName();
			string response = "";

			switch (request_type)
			{
				case "WebQuery":
					response = WebQuery(userName, param1, param2);
					break;
				case "WebProcedure":
					response = WebProcedure(userName, param1, param2);
					break;
				default:
					break;
			}

			if (response != "") return Ok(response);

			response = $"Unknown Request: Caller={userName}, Request={request_type}, Param1={param1}, Param2={param2}";
			uApp.Loger($"*** {response}");
			return Ok($"Error, {response}");
		}


		//====================================================================================================
		public string WebQuery(string userName, string table, string stmt)
		{
			uApp.Loger($"WebQuery: Caller={userName}, table={table}, Stmt={stmt}");

			if (String.IsNullOrEmpty(stmt) || String.IsNullOrEmpty(table)) return "Error, Empty statement";

			string response = uDB.GetJsonRecordSet(stmt);

			uApp.Loger($"Response: Byte Count={response.Length}");

			return response;
		}


		//====================================================================================================
		public string WebProcedure(string userName, string procedure, string stmt)
		{
			uApp.Loger($"WebProcedure: Caller={userName}, Procedure={procedure}, Stmt={stmt}");

			if (String.IsNullOrEmpty(stmt) || String.IsNullOrEmpty(procedure)) return "Error, Empty statement";

			string dbKey = uDB.GetTarget_DB(procedure);
			if (dbKey == "") return "Error, Unknown dataset name";

			//if (!uDB.CheckForProcedure(procedure))
			//{
			//	uApp.Loger($"*** Unknown Procedure: {procedure}");
			//	return "ERROR";
			//}

			string response = uDB.DoNoneQuery(stmt, dbKey) ? "OK" : "Error";

			uApp.Loger($"Response: {response}");
			return response;
		}

		public void OnErrorNotifications(string logMessage)
		{
			// --- IMPORTANT TO REMOVE ALARM TAGS FROM THE NOTIFYING MESSAGES TO PREVENT A MESS!!! ---
			logMessage = logMessage.Replace("\r", "").Replace("\n", "");
			logMessage = logMessage.Replace("***", "").Replace(">>>>", "");
			// --- IMPORTANT TO REMOVE ALARM TAGS FROM THE NOTIFYING MESSAGES TO PREVENT A MESS!!! ---

			string onErrorNotify = AppParams.m_instance.OnErrorNotify;

			if (onErrorNotify == "")
			{
				uApp.Loger(logMessage);
				return;
			}

			string recipients = onErrorNotify.Replace(" ", ""); // ";" separators

			string service = AppParams.m_instance.SmsVendor;
			string sender = uStr.Get_CMD_Field(service, 2);
			sender = sender == "" ? "0543456789" : sender;

			string message = $"App: {uApp.m_assemblyTitle}, {logMessage}";
			uApp.Loger($"Notifying SMS recipients: {recipients}, {message}");

			uSmsMessage.SendSmsDirect(sender, recipients, message);
		}


		//====================================================================================================
		public string GetSessionLanguage()
		{
			if ((HttpContext.Session == null) ||
				!HttpContext.Session.IsAvailable ||
				(HttpContext.Session.GetString("Language") == null) ||
				(HttpContext.Session.GetString("Language") == ""))
			{
				SetSessionLanguage(AppParams.m_instance.DefaultLanguage);
				return AppParams.m_instance.DefaultLanguage;
			}

			string language = HttpContext.Session.GetString("Language");
			return language;
		}


		//====================================================================================================
		public void SetSessionLanguage(string language)
		{
			if ((HttpContext.Session == null) ||
				!HttpContext.Session.IsAvailable)
			{
				return;
			}

			if ((language == null) || (language == "")) language = AppParams.m_instance.DefaultLanguage;
			HttpContext.Session.SetString("Language", language);
		}


		//====================================================================================================
		public string GetCallerLoginName()
		{
			string userName = "Anonymous";
			if ((HttpContext != null) && (HttpContext.User != null) && (HttpContext.User.Identities != null))
			{
				userName = HttpContext.User.Identity.Name;
			}

			return userName;
		}
	}
}
