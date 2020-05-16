
using System;
using System.IO;
using System.Net;
using System.Text;

using uToolkit;

namespace uToolkit.ClearingInt
{
	public class TranzilaWebRequest : CreditCardRequest
	{
		public	static	string	CONST_Tranzila	= "Tranzila";

		public TranzilaWebRequest() : base(CONST_Tranzila)
		{
		}

		public override string DoTransaction(string referenceKey, string cardNumber, string expiredYear, string expiredMonth,
											 string billAmount, string payments, string cvv, string holderID,
											 string firstName, string lastName)
		{
			Encoding hebrewEncoding = Encoding.GetEncoding("windows-1255");

			string postData = "";
			postData  = ("supplier="	+ m_clearingService.TerminalID);
			postData += ("&TranzilaPW="	+ m_clearingService.Password);
			postData += ("&currency="	+ m_clearingService.Currency);

			postData += ("&ccno="		+ cardNumber);
			postData += ("&expdate="	+ expiredMonth+expiredYear);
			//postData += ("&ccexpy="	+ expiredYear);
			//postData += ("&ccexpm="	+ expiredMonth);
			postData += ("&sum="		+ billAmount);

			postData += ("&company="	+ hebrewEncoding.GetString(Encoding.Unicode.GetBytes(m_clearingService.Company)));

			if (firstName != "") postData += ("&first_name="
							+ hebrewEncoding.GetString(Encoding.Unicode.GetBytes(firstName)));
			if (lastName != "") postData += ("&last_name="
							+ hebrewEncoding.GetString(Encoding.Unicode.GetBytes(lastName)));
			if (holderID != "")  postData += ("&myid=" + holderID);
			if (cvv      != "")  postData += ("&mycvv=" + cvv);

			WriteTransactionLogRequest(postData);

			string response = "";
			try
			{
				byte[] data = Encoding.ASCII.GetBytes(postData);

				HttpWebRequest tranzilaRequest = (HttpWebRequest)WebRequest.Create(m_clearingService.EndpointURL);
				tranzilaRequest.Method = "POST";
				tranzilaRequest.ContentType = "application/x-www-form-urlencoded";
				tranzilaRequest.ContentLength = data.Length;

				Stream streamOUT = tranzilaRequest.GetRequestStream();
				streamOUT.Write(data, 0, data.Length);

				HttpWebResponse tranzilaResponse = (HttpWebResponse)tranzilaRequest.GetResponse();
				Stream streamIN = tranzilaResponse.GetResponseStream();
				StreamReader streamREAD = new StreamReader(streamIN, hebrewEncoding);

				response = streamREAD.ReadToEnd().Trim();

				WriteTransactionLogResponse(response);

				streamREAD.Close();
				streamOUT.Close();
				streamIN.Close();
				tranzilaResponse.Close();
			}
			catch (Exception e)
			{
				return Error($"{e.Message}");
			}

			string r_response = GetResponseKeywordValue(response, "Response");
			if (r_response == "")
			{
				return Error($"No ResponseCode");
			}

			if (uStr.String2Integer(r_response) != 0)
			{
				return Error($"Erroneous Response code= {r_response}");
			}

			string r_confirmationNo = GetResponseKeywordValue(response, "ConfirmationCode");
			if (r_confirmationNo == "")
			{
				return Error($"No confirmation number");
			}

			//if (uStr.String2Integer(r_confirmationNo) == 0)
			//{
			//    return Error($"Zero confirmation number");
			//}

			string r_clearanceID = GetResponseKeywordValue(response, "Responseid");
			string r_issuerID	= GetResponseKeywordValue(response, "cardissuer");
			string r_cardNo		= GetResponseKeywordValue(response, "ccno");
			string r_payments	= payments; // GetResponseKeywordValue(response, "Payments");

			string r_expired	= GetResponseKeywordValue(response, "expdate");
			string r_yearExp	= uStr.Substring(r_expired, 2, 2);
			string r_monthExp	= uStr.Substring(r_expired, 0, 2);

			int intPayments		= uStr.String2Integer(r_payments);

			if (r_clearanceID != "") r_confirmationNo	+= "-" + r_clearanceID;

			StoreTransaction(r_issuerID, r_cardNo, r_yearExp, r_monthExp, billAmount, intPayments, r_confirmationNo, referenceKey);

			uApp.Loger($"{m_clearingCenterID} Confirmed: {r_confirmationNo}, Issuer: {r_issuerID}, ccno: {r_cardNo}, sum: {billAmount}");

			return OK(r_confirmationNo, r_issuerID, m_clearingService.TerminalID, r_expired);
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
	}
}

//2015/02/08-16:30:56.941 Response=000&last_name=????&currency=1&ccno=2727&DclickTK=&supplier=testp54&TranzilaPW=NiQwWXe&expdate=0118&company=Unistep&sum=1.00&first_name=????&ConfirmationCode=0000000&index=7&Responsesource=0&Responsecvv=0&Responseid=0&Tempref=02710001&DBFIsForeign=0&DBFcard=2&DBFcardtype=6&DBFsolek=6&tz_parent=testp54
//2015/02/08-16:31:42.082 Response=000&last_name=????&currency=1&ccno=2727&DclickTK=&supplier=testp54&TranzilaPW=NiQwWXe&expdate=0118&company=Unistep&sum=1.00&first_name=????&ConfirmationCode=0000000&index=8&Responsesource=0&Responsecvv=0&Responseid=0&Tempref=02040001&DBFIsForeign=0&DBFcard=2&DBFcardtype=6&DBFsolek=6&tz_parent=testp54
