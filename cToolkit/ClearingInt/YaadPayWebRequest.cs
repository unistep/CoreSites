
using System;
using System.IO;
using System.Net;
using System.Text;

using uToolkit;

namespace uToolkit.ClearingInt
{
	public class YaadPayWebRequest : CreditCardRequest
	{
		public	static	string	CONST_YaadPay = "YaadPay";

		public YaadPayWebRequest() : base(CONST_YaadPay)
		{
		}

		public override string DoTransaction(string referenceKey, string cardNumber, string expiredYear, string expiredMonth,
											string billAmount, string payments, string cvv, string holderID, string firstName,
											 string lastName)
		{
			string sentinel = uStr.GetArgString(cardNumber, 1, "-") + "-" + uStr.GetArgString(cardNumber, 2, "-");
			string cCNumber = uStr.GetArgString(cardNumber, 3, "-");

			Credit_Transactions creditTransaction = GetTransaction(referenceKey);
			if (creditTransaction != null)
			{
				uApp.Loger(string.Format("*** Duplicate Debit Error: Reference={0}, CardNumber=****{1}, BillAmount={2}",
					referenceKey, cCNumber, billAmount));

				string exp =	creditTransaction.m_expiredYear + creditTransaction.m_expiredMonth;
				return "OK, " + creditTransaction.m_confirmationNo + "/" +
								creditTransaction.m_cardIssuer + "/" +
								creditTransaction.m_terminalID + "/" + exp;
			}

			if (firstName == "") firstName = "FISRAEL";
			if (lastName == "") lastName   = "LISRAEL";

			Encoding enc = Encoding.GetEncoding("windows-1255");

			string postData = "action=soft&MoreData=True";
            postData += ("&Masof="		+ m_clearingService.TerminalID);
            postData += ("&Amount="		+ billAmount);
			postData += ("&CC2="		+ sentinel);

			postData += ("&ClientName="	+ firstName);
			postData += ("&ClientLName=" + lastName);
			postData += ("&Info="		+ referenceKey);
			postData += ("&UserId=000000000");
            if ((payments != "") && (payments != "1")) postData += ("&Tash=" + payments);

			WriteTransactionLogRequest("****" + cCNumber + "\r\n" + postData);

			string response = "";
			try
			{
				byte[] data = Encoding.ASCII.GetBytes(postData);

				HttpWebRequest webRequest = (HttpWebRequest)WebRequest.Create(m_clearingService.EndpointURL);
                webRequest.Method = "POST";
                webRequest.ContentType = "application/x-www-form-urlencoded";
                webRequest.ContentLength = data.Length;

                Stream streamOUT = webRequest.GetRequestStream();
				streamOUT.Write(data, 0, data.Length);

                HttpWebResponse webResponse = (HttpWebResponse)webRequest.GetResponse();
                Stream streamIN = webResponse.GetResponseStream();
				StreamReader streamREAD = new StreamReader(streamIN, enc);

				response = streamREAD.ReadToEnd().Trim();

				WriteTransactionLogResponse(response);

				streamREAD.Close();
				streamOUT.Close();
				streamIN.Close();
                webResponse.Close();
			}
			catch (Exception e)
			{
				uApp.Loger(string.Format("*** {0} Error: {1}", m_clearingCenterID, e.Message));
				return "ERROR, Unknown";
			}

            string r_response = GetResponseKeywordValue(response, "CCode");
			if (r_response == "")
			{
				uApp.Loger(string.Format("*** {0} Error: No response code", m_clearingCenterID));
				return "ERROR, No response code";
			}

			if (uStr.String2Integer(r_response) != 0)
			{
				uApp.Loger(string.Format("*** {0} Erroneous response code= {1}", m_clearingCenterID, r_response));
				return "ERROR, " + r_response;
			}

			string r_confirmationNo = GetResponseKeywordValue(response, "ACode");
			if (r_confirmationNo == "")
			{
				uApp.Loger(string.Format("*** {0} Error: No confirmation number", m_clearingCenterID));
				return "ERROR, No confirmation number";
			}

			//if (uStr.String2Integer(r_confirmationNo) == 0)
			//{
			//	uApp.Loger(string.Format("*** {0} Error: Zero confirmation number", m_clearingCenterID));
			//	return "ERROR, Zero confirmation number";
			//}


			string r_clearanceID = GetResponseKeywordValue(response, "Id");
            string r_issuerID	= GetResponseKeywordValue(response, "Issuer");
            string r_cardNo		= GetResponseKeywordValue(response, "L4digit");
            string r_payments	= GetResponseKeywordValue(response, "Payments");

			string r_yearExp	= GetResponseKeywordValue(response, "Tyear");
			string r_monthExp	= GetResponseKeywordValue(response, "Tmonth");

			int intPayments		= uStr.String2Integer(r_payments);

			r_confirmationNo += "-" + r_clearanceID;

			StoreTransaction(r_issuerID, r_cardNo, r_yearExp, r_monthExp, billAmount, intPayments, r_confirmationNo, referenceKey);

			uApp.Loger(string.Format("{0} Confirmation: ConfirmationCode={1}", m_clearingCenterID, r_confirmationNo));

			string strR_Exp = uStr.Substring(r_yearExp, 2, 2) + r_monthExp;
			return "OK, " + r_confirmationNo + "/" + r_issuerID + "/" + m_clearingService.TerminalID + "/" + strR_Exp;
		}

		public string GetResponseKeywordValue(string response, string keyword)
		{
			string[] keywords = response.Split("&".ToCharArray());

			foreach (string row in keywords)
			{
				string kw = uStr.GetArgString(row, 1, "=");
				if (kw.ToLower() != keyword.ToLower()) continue;

				return uStr.GetArgString(row, 2, "=");
			}

			return "";
		}


		//public string GetElementByIndex(string sentinel, int intIndex)
		//{
		//    int intLeftOP = -1, intRightOP = 0;
		//    for (int i = 0; i < intIndex; i++)
		//    {
		//        if ((intLeftOP = sentinel.IndexOf("[", intLeftOP + 1)) == -1) break;
		//    }

		//    if (intLeftOP != -1) intRightOP = sentinel.IndexOf("]", intLeftOP + 1);

		//    if ((intLeftOP == -1) || (intRightOP <= 0)) return "";

		//    string strElementValue =  uStr.Substring(sentinel, intLeftOP + 1, intRightOP - intLeftOP - 1);

		//    return strElementValue.Trim();
		//}
	}
}

//RESPONSE
//Id=3506952&CCode=0&Amount=4&ACode=0012345&Fild1=&Fild2=&Fild3=&Bank=6&tashType=&Payments=1&TashFirstPayment=&UserId=000000000&Brand=2&Issuer=6&L4digit=2346&
//firstname=AVISHAY&lastname=SARAGA SARIG&info=DOC_11&street=&city=&zip=&cell=&email=&Coin=1&Tmonth=11&Tyear=2016

