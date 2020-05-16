
namespace uToolkit
{
	public class uTable
	{
		public	string		m_dbKey			= "";
		public	string		m_tableName		= "";
		public	string[]	m_columnList	= null;


		public uTable(string _tableName, string[] columnList)
		{
			m_dbKey   = uDB.GetTarget_DB(m_tableName = _tableName);
			m_columnList = columnList;
		}


		public string FormSelectStmt(string _where)
		{
			string stmt = "SELECT ";
			foreach (string columnName in m_columnList) stmt += "[" + columnName + "],";
			stmt = stmt.TrimEnd(",".ToCharArray()) + " FROM " + m_tableName;
			if ((_where = _where.Trim()) != "") stmt += " WHERE " + _where;
			return stmt;
		}


		public string FormDeleteStmt(string _where)
		{
			string stmt = "DELETE FROM " + m_tableName;
			if ((_where = _where.Trim()) != "") stmt += " WHERE " + _where;
			return stmt;
		}


		public string FormInsertStmt(string _values)
		{
			string stmt = "INSERT INTO " + m_tableName + " (";
			foreach (string columnName in m_columnList) stmt += "[" + columnName + "],";
			stmt = stmt.TrimEnd(",".ToCharArray()) + ") VALUES (" + _values + ")";
			return stmt;
		}


		public string FormUpdateStmt(string[] _values, string _where)
		{
			string stmt = "UPDATE " + m_tableName + " SET ";
			for (int i = 0; i < m_columnList.Length; i++)
			{
				stmt += "[" + m_columnList[i] + "]='" + _values[i] + "',";
			}

			stmt = stmt.Trim(",".ToCharArray());
			if ((_where = _where.Trim()) != "") stmt += " WHERE " + _where;
			return stmt;
		}
	}
}
