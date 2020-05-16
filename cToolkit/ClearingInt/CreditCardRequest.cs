
using System;

namespace uToolkit.ClearingInt
{
	public class CreditCardRequest
	{
		public	string	m_clearingCenterID	= "";

		public ClearingService m_clearingService = null;
		public	string	m_transactionLog	= "";

		public CreditCardRequest(string clearingCenterID)
		{
			m_clearingCenterID = clearingCenterID;

			for (int i = 0; i < AppParams.m_instance.ClearingServices.Count; i++)
			{
				if (AppParams.m_instance.ClearingServices[i].ServiceName.ToLower() != m_clearingCenterID.ToLower()) continue;
				m_clearingService = AppParams.m_instance.ClearingServices[i];
				break;
			}
		}

		public void GetTerminal_Parameters()
		{
			m_transactionLog = uApp.m_homeDirectory + "\\" + uApp.m_assemblyTitle + "\\"
				   + m_clearingCenterID + "_" + DateTime.Now.ToString("yyyy_MM_dd") + ".Log";
		}

		public virtual string DoTransaction(string referenceKey, string cardNumber, string expiredYear,
											string expiredMonth, string billAmount,string payments,
											string cvv, string holderID, string firstName, string lastName)
		{
			return Error("No Supplier");
		}

		public virtual string AuthorizeCreditCard(string referenceKey, string cardNumber, string expiredYear,
								string expiredMonth, string billAmount, string payments, string cvv,
								string holderID, string firstName, string lastName)
		{
			return Error("No Supplier");
		}

		public virtual void StoreTransaction(string cardIssuer, string cardNumber, string expiredYear, string expiredMonth,
											 string billAmount, int intPayments, string strConfirmationNo,
											 string referenceKey)
		{
			new Credit_Transactions().StoreRecord(m_clearingCenterID, m_clearingService.TerminalID, cardIssuer, cardNumber,
								 expiredYear, expiredMonth, billAmount, intPayments, strConfirmationNo, referenceKey);
		}

		public virtual Credit_Transactions GetTransaction(string referenceKey)
		{
			Credit_Transactions creditTransaction = new Credit_Transactions();  // SYSTEM/USERS
			if (!creditTransaction.GetRecord(referenceKey)) creditTransaction = null;
			return creditTransaction;
		}

		public virtual void WriteTransactionLogRequest(string logMessage)
		{
			string timeStamp = DateTime.Now.ToString("yyyy/MM/dd-HH:mm:ss >>> REQUEST:");
			uFile.WriteFile(m_transactionLog,
				"\r\n-------------------------------------\r\n" + timeStamp + "\r\n" + logMessage + "\r\n");
		}

		public virtual void WriteTransactionLogResponse(string logMessage)
		{
			string timeStamp = DateTime.Now.ToString("yyyy/MM/dd-HH:mm:ss >>> RESPONSE:");
			uFile.WriteFile(m_transactionLog, "\r\n" + timeStamp + "\r\n" + logMessage + "\r\n");
		}

		public string OK(string confirmationNo, string issuerID, string terminalID, string expired) 
		{
			return  $"{{\"confirmationNo\":\"{confirmationNo}\","
					+ $"\"issuerID\":\"{issuerID}\","
					+ $"\"TerminalID\":\"{terminalID}\","
					+ $"\"expired\":\"{expired}\"}}";
		}

		public string Error(string message)
		{
			return $"{m_clearingCenterID} <ERROR>: {message}";
		}
	}
}
