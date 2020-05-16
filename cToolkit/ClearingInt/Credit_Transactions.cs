
using uToolkit;

namespace uToolkit.ClearingInt
{
	public class Credit_Transactions : uTable
	{
		static string[] COLUMN_LIST =
		{
			"ClearingCenter", "TerminalID", "CardIssuer", "CardNumber", "ExpiredYear", "ExpiredMonth",
			"BillAmount", "Payments", "ConfirmationNo", "Reference_Key"
		};

		public	string	m_clearingCenter = "";
		public	string	m_terminalID = "";
		public	string	m_cardIssuer = "";
		public	string	m_cardNumber = "";
		public	string	m_expiredYear = "";
		public	string	m_expiredMonth = "";
		public	float	m_billAmount = 0;
		public	int		m_payments = 0;
		public	string	m_confirmationNo = "";
		public	string	m_reference_SysID = "";

		public Credit_Transactions() : base("Credit_Transactions", COLUMN_LIST)
		{
		}

		public bool StoreRecord(string clearingCenter, string terminalID, string cardIssuer,
								string cardNumber, string expiredYear, string expiredMonth, string billAmount,
								int payments, string confirmationNo, string referenceKey)
		{
			string strValues = $"'{clearingCenter}', '{terminalID}', '{cardIssuer}', '{cardNumber}',"
				+ $"'{expiredYear}', '{expiredMonth}', {billAmount}, {payments}, '{confirmationNo}', {referenceKey}";

			if (!uDB.DoNoneQuery(FormInsertStmt(strValues), m_dbKey)) return false;

			return true;
		}

		public bool GetRecord(string referenceKey)
		{
			string stmt = FormSelectStmt(string.Format(" Reference_Key='{0}' ", referenceKey));
			string recordScript = uDB.GetRecordList(stmt);

			recordScript = uStr.Get_CSV_Record(recordScript, 1);
			if (recordScript == "") return false;

			m_clearingCenter = uStr.Get_CSV_Field(recordScript, 1);
			m_terminalID = uStr.Get_CSV_Field(recordScript, 2);
			m_cardIssuer = uStr.Get_CSV_Field(recordScript, 3);
			m_cardNumber = uStr.Get_CSV_Field(recordScript, 4);
			m_expiredYear = uStr.Get_CSV_Field(recordScript, 5);
			m_expiredMonth = uStr.Get_CSV_Field(recordScript, 6);
			m_billAmount = uStr.String2Float(uStr.Get_CSV_Field(recordScript, 7));
			m_payments = uStr.String2Integer(uStr.Get_CSV_Field(recordScript, 8));
			m_confirmationNo = uStr.Get_CSV_Field(recordScript, 9);
			m_reference_SysID = uStr.Get_CSV_Field(recordScript, 10);

			return true;
		}
	}
}
