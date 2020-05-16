using System.IO;
using System.Net;
using System.Text;

using uToolkit;

namespace uToolkit.ClearingInt
{
	public class PelecardWebRequest : CreditCardRequest
	{
		public	static	string	CONST_Pelecard	= "Pelecard";

		public PelecardWebRequest() : base(CONST_Pelecard)
		{
		}

		public string FormJsonRow(string keyword, string value)
		{
			return string.Format("\"{0}\":\"{1}\",", keyword, value);
		}

		public override string DoTransaction(string referenceKey, string cardNumber, string expiredYear, string expiredMonth,
											string billAmount, string payments, string cvv, string holderID, string firstName,
											 string lastName)
		{
			Encoding enc = Encoding.GetEncoding("windows-1255");

			string postData = "";
			postData  = FormJsonRow ("terminalNumber",		m_clearingService.TerminalID);
			postData += FormJsonRow ("user",				m_clearingService.Company);
			postData += FormJsonRow ("password",			m_clearingService.Password);
			postData += FormJsonRow ("shopNumber",			"001");
			postData += FormJsonRow ("creditCard",			cardNumber);
			postData += FormJsonRow ("creditCardDateMmYy",	expiredMonth+expiredYear);
			postData += FormJsonRow ("total",				billAmount);
			postData += FormJsonRow ("currency",			m_clearingService.Currency);

			string urlParam = "";

			if (!string.IsNullOrEmpty(payments) && (payments != "1"))
			{
				urlParam = "DebitPaymentsType";
				postData += FormJsonRow("paymentsNumber", payments);
			}
			else
			{
				urlParam = "DebitRegularType";
			}

			if (!string.IsNullOrEmpty(cvv))
			{
				postData += FormJsonRow ("cvv2",				cvv);
			}

			postData += FormJsonRow ("id",					referenceKey);

			postData = postData.TrimEnd(",".ToCharArray());

			WriteTransactionLogRequest(postData);

			postData = "{\r\n" + postData.Replace(",", ",\r\n") + "\r\n}";

			string response = MakeRequest(urlParam, postData);

			WriteTransactionLogResponse(response.Replace("\r\n", ""));

			//string r_response = uJson.Get_ProprtyValue(response, "StatusCode");
			//if (r_response == "")
			//{
			//	uApp.Loger(string.Format("*** {0} Error: No ResponseCode", m_clearingCenterID));
			//	return "ERROR, NoResponseCode";
			//}

			//if (uStr.String2Integer(r_response) != 0)
			//{
			//	uApp.Loger(string.Format("*** {0} Erroneous Response code= {1}", m_clearingCenterID, r_response));
			//	return "ERROR, " + r_response;
			//}

			//string r_confirmationNo = uJson.Get_ProprtyValue(response, "ResultData", "DebitApproveNumber");
			//if (r_confirmationNo == "")
			//{
			//	uApp.Loger(string.Format("*** {0} Error: No confirmation number", m_clearingCenterID));
			//	return "ERROR, No confirmation number";
			//}

			////if (uStr.String2Integer(r_confirmationNo) == 0)
			////{
			////    uApp.Loger(string.Format("*** {0} Error: Zero confirmation number", m_clearingCenterID));
			////    return "ERROR, Zero confirmation number";
			////}

			//string r_clearanceID = uJson.Get_ProprtyValue(response, "ResultData", "PelecardTransactionId");
			//string r_issuerID	= uJson.Get_ProprtyValue(response, "ResultData", "CreditCardCompanyIssuer");
			//string r_cardNo		= uJson.Get_ProprtyValue(response, "ResultData", "CreditCardNumber"); 
			//string r_payments	= uJson.Get_ProprtyValue(response, "ResultData", "TotalPayments");

			//string r_expired		= uJson.Get_ProprtyValue(response, "ResultData", "CreditCardExpDate");
			//string r_yearExp		= "20" + uStr.Substring(r_expired, 2, 2);
			//string r_monthExp	= uStr.Substring(r_expired, 0, 2);
			//expired				= r_yearExp + "-" + r_monthExp;

			//int intPayments		= uStr.String2Integer(r_payments);

			//r_confirmationNo += "-" + r_clearanceID;

			//StoreTransaction(r_issuerID, r_cardNo, expired, billAmount, intPayments, r_confirmationNo, referenceKey);

			//uApp.Loger(string.Format("{0} Confirmation: ConfirmationCode={1}", m_clearingCenterID, r_confirmationNo));

			//string r_exp = uStr.Substring(r_yearExp, 2, 2) + r_monthExp;
			//return "OK, " + r_confirmationNo + "/" + r_issuerID + "/" + m_terminalID + "/" + r_exp;
			return "OK";
		}


		public override string AuthorizeCreditCard(string referenceKey, string cardNumber, string expiredYear, string expiredMonth,
												string billAmount, string payments, string cvv, string holderID, string firstName,
												string lastName)
		{
			string response	= ConvertToToken(cardNumber, expiredMonth+expiredYear);
			string isOK		= uStr.GetArgString(response, 1, ",");
			if (isOK != "OK") return response;
			string token		= uStr.GetArgString(response, 2, ",");

			Encoding enc = Encoding.GetEncoding("windows-1255");

			string postData = "";
			postData  = FormJsonRow("terminalNumber", m_clearingService.TerminalID);
			postData += FormJsonRow("user", m_clearingService.Company);
			postData += FormJsonRow("password", m_clearingService.Password);
			postData += FormJsonRow("shopNumber", "001");
			postData += FormJsonRow("token", token);
			postData += FormJsonRow("total", billAmount);
			postData += FormJsonRow("currency", m_clearingService.Currency);

			string urlParam = "";

			if (!string.IsNullOrEmpty(payments) && (payments != "1"))
			{
				urlParam = "AuthorizePaymentsType";
				postData += FormJsonRow("paymentsNumber", payments);
			}
			else
			{
				urlParam = "AuthorizeCreditCard";
			}

			if (!string.IsNullOrEmpty(cvv))
			{
				postData += FormJsonRow("cvv2", cvv);
			}

			postData += FormJsonRow("id", referenceKey);

			postData = postData.TrimEnd(",".ToCharArray());

			WriteTransactionLogRequest(postData);

			postData = "{\r\n" + postData.Replace(",", ",\r\n") + "\r\n}";

			response = MakeRequest(urlParam, postData);

			WriteTransactionLogResponse(response.Replace("\r\n", ""));

			//string r_response = uJson.Get_ProprtyValue(response, "StatusCode");
			//if (r_response == "")
			//{
			//	uApp.Loger(string.Format("*** {0} Error: No ResponseCode", m_clearingCenterID));
			//	return "ERROR, NoResponseCode";
			//}

			//if (uStr.String2Integer(r_response) != 0)
			//{
			//	uApp.Loger(string.Format("*** {0} Erroneous Response code= {1}", m_clearingCenterID, r_response));
			//	return "ERROR, " + r_response;
			//}

			//string r_confirmationNo = uJson.Get_ProprtyValue(response, "ResultData", "DebitApproveNumber");
			//if (r_confirmationNo == "")
			//{
			//	uApp.Loger(string.Format("*** {0} Error: No confirmation number", m_clearingCenterID));
			//	return "ERROR, No confirmation number";
			//}

			////if (uStr.String2Integer(r_confirmationNo) == 0)
			////{
			////    uApp.Loger(string.Format("*** {0} Error: Zero confirmation number", m_clearingCenterID));
			////    return "ERROR, Zero confirmation number";
			////}

			//string r_clearanceID = uJson.Get_ProprtyValue(response, "ResultData", "PelecardTransactionId");
			//string r_issuerID = uJson.Get_ProprtyValue(response, "ResultData", "CreditCardCompanyIssuer");
			//string r_cardNo = uJson.Get_ProprtyValue(response, "ResultData", "CreditCardNumber");
			//string r_payments = uJson.Get_ProprtyValue(response, "ResultData", "TotalPayments");

			//string r_expired = uJson.Get_ProprtyValue(response, "ResultData", "CreditCardExpDate");
			//string r_yearExp = "20" + uStr.Substring(r_expired, 2, 2);
			//string r_monthExp = uStr.Substring(r_expired, 0, 2);
			//expired = r_yearExp + "-" + r_monthExp;

			//int intPayments = uStr.String2Integer(r_payments);

			//r_confirmationNo += "-" + r_clearanceID;

			//uApp.Loger(string.Format("{0} Confirmation: ConfirmationCode={1}", m_clearingCenterID, r_confirmationNo));

			//string r_exp = uStr.Substring(r_yearExp, 2, 2) + r_monthExp;
			//return "OK, " + token + "-" + r_confirmationNo + "/" + r_issuerID + "/" + m_terminalID + "/" + r_exp;
			return "OK";
		}


		public string ConvertToToken(string cardNumber, string expired)
		{
			Encoding enc = Encoding.GetEncoding("windows-1255");

			string postData = "";
			postData  = FormJsonRow ("terminalNumber",		m_clearingService.TerminalID);
			postData += FormJsonRow ("user",				m_clearingService.Company);
			postData += FormJsonRow ("password",			m_clearingService.Password);
			postData += FormJsonRow ("shopNumber",			"001");
			postData += FormJsonRow ("creditCard",			cardNumber);
			postData += FormJsonRow ("creditCardDateMmYy",	expired);
			postData += FormJsonRow ("addFourDigits",		"false");

			string urlParam = "ConvertToToken";

			postData = postData.TrimEnd(",".ToCharArray());

			WriteTransactionLogRequest(postData);

			postData = "{\r\n" + postData.Replace(",", ",\r\n") + "\r\n}";

			string response = MakeRequest(urlParam, postData);

			WriteTransactionLogResponse(response.Replace("\r\n", ""));

			//string r_response = uJson.Get_ProprtyValue(response, "StatusCode");
			//if (r_response == "")
			//{
			//	uApp.Loger(string.Format("*** {0} Error: No ResponseCode", m_clearingCenterID));
			//	return "ERROR, NoResponseCode";
			//}

			//if (uStr.String2Integer(r_response) != 0)
			//{
			//	uApp.Loger(string.Format("*** {0} Erroneous Response code= {1}", m_clearingCenterID, r_response));
			//	return "ERROR, " + r_response;
			//}

			//string r_token = uJson.Get_ProprtyValue(response, "ResultData", "Token");
			//if (r_token == "")
			//{
			//	uApp.Loger(string.Format("*** {0} Error: No Token received", m_clearingCenterID));
			//	return "ERROR, No Token received";
			//}

			return "OK, ";// + r_token;
		}


		public string MakeRequest(string urlParam, string postData)
		{
			var request = (HttpWebRequest)WebRequest.Create(m_clearingService.EndpointURL + urlParam);

			var bytes = Encoding.GetEncoding("iso-8859-1").GetBytes(postData);

			request.Method			= "POST";
			request.ContentType		= "Application/Data";
			request.ContentLength	= bytes.Length;

			using (var writeStream = request.GetRequestStream())
			{
				writeStream.Write(bytes, 0, bytes.Length);
			}

			string responseValue = string.Empty;

			using (var response = (HttpWebResponse)request.GetResponse())
			{
				if (response.StatusCode != HttpStatusCode.OK)
				{
					uApp.Loger(string.Format("*** {0} Error: {1}", m_clearingCenterID, response.StatusCode));
					return "";
				}

				using (var responseStream = response.GetResponseStream())
				{
					if (responseStream != null)
					{
						using (var reader = new StreamReader(responseStream))
						{
							responseValue = reader.ReadToEnd();
						}
					}
				}
			}

			return responseValue;
		}
	}
}

/*
{
 "terminalNumber": "0962210",
 "user": "shachartest",
 "password": "Test1Test",
 "shopNumber": "001",
 "creditCard": "458045804580",
 "creditCardDateMmYy": "1219",
 "token": "",
 "total": "100",
 "currency": "1",
 "cvv2": "123",
 "id": "123456789",
 "authorizationNumber": "",
 "paramX": "test"
}
*/

