
using System;
using System.Data;
using System.Data.SqlClient;

namespace uToolkit
{
	public class uDB
	{
		public	static	string[,]	m_arrayDatabases	= null;
		public	static	string[,]	m_arrayTables		= null;


		// ======================================================================================================
		public static void GetApplication_DB_Map()
		{
			GetApplication_Database_Elements();
			GetApplication_Table_Elements();

			uApp.Loger("");

			DBStatistics();

			uApp.Loger("");
		}


		// ======================================================================================================
		public static void GetApplication_Database_Elements()
		{
			m_arrayDatabases = new string[AppParams.m_instance.Databases.Count, 2];

			for (int i = 0; i < AppParams.m_instance.Databases.Count; i++)
			{
				m_arrayDatabases[i, 0] = AppParams.m_instance.Databases[i].DatabaseName;
				m_arrayDatabases[i, 1] = AppParams.m_instance.Databases[i].ConnectionString;
			}
		}


		// ======================================================================================================
		public static void GetApplication_Table_Elements()
		{
			string stmt =	"SELECT sys.objects.name FROM sys.objects " +
							"WHERE sys.objects.type IN ('U', 'P', 'V') ORDER BY sys.objects.name";

			string tableList = "";

			SqlDataReader dr = null;

			for (int i = 0; i < m_arrayDatabases.GetLength(0); i++)
			{
				try
				{
					dr = uDB.DoQuery(stmt, m_arrayDatabases[i, 0]);
					if (dr == null) continue;

					while (dr.Read())
					{
						tableList += (string)dr[0] + "," + m_arrayDatabases[i, 0] + ";";
					}
				}
				catch (Exception e)
				{
					uApp.Loger(e.Message);
				}
			}

			string[] tableRows =
				tableList.Split(";".ToCharArray(), StringSplitOptions.RemoveEmptyEntries);

			m_arrayTables = new string[tableRows.Length, 2];

			for (int i = 0; i < tableRows.Length; i++)
			{
				m_arrayTables[i, 0]	= uStr.GetArgString(tableRows[i], 1, ",");
				m_arrayTables[i, 1] = uStr.GetArgString(tableRows[i], 2, ",");
			}
		}


		// ======================================================================================================
		public static void DBStatistics()
		{
			string stmt = "SELECT COUNT(*) from INFORMATION_SCHEMA.TABLES";

			for (int i = 0; i < m_arrayDatabases.GetLength(0); i++)
			{
				string dbName = m_arrayDatabases[i, 0];

				int rowCount = GetIntegerColumn(stmt, dbName);
				uApp.Loger($"DB: {dbName}({rowCount}) is {((rowCount == 0) ? "INACCESSABLE" : "OK")}");
			}
		}


		// ======================================================================================================
		public static string GetDatabaseKey(int index)
		{
			if (m_arrayDatabases.GetLength(0) <= index) index = 0;

			return m_arrayDatabases[index, 0];
		}


		// ======================================================================================================
		public static string GetConnectionString(string dbKey)
		{
			if (dbKey.Trim() == "") dbKey = m_arrayDatabases[0, 0];

			for (int i = 0; i < m_arrayDatabases.GetLength(0); i++)
			{
				if (dbKey.ToLower().Trim() == m_arrayDatabases[i, 0].ToLower().Trim())
				{
					return m_arrayDatabases[i, 1].Replace("|", ",");
				}
			}

			uApp.Loger($"*** uDB.GetConnectionString: Database Key Not Found: {dbKey}");
			return "";
		}


		// ======================================================================================================
		public static string GetTarget_DB(string tableName)
		{
			for (int i = 0; i < m_arrayTables.GetLength(0); i++)
			{
				if (tableName.Trim("[]".ToCharArray()).ToLower().Trim() == m_arrayTables[i, 0].ToLower().Trim())
				{
					return m_arrayTables[i, 1];
				}
			}

			return m_arrayDatabases[0, 0];
		}


		// ======================================================================================================
		public static bool CheckForProcedure(string procedureName, string dbKey)
		{
			string stmt = $"SELECT COUNT(*) FROM sys.objects WHERE type = 'P' AND OBJECT_ID = OBJECT_ID('dbo.{procedureName}')";

			int intCount = GetIntegerColumn(stmt, dbKey);
			return (intCount != 0);
		}


		// ======================================================================================================
		public static bool IsValidColumn(string table, string column)
		{
			String stmt = $"SELECT TOP 1 * FROM {table}";
			SqlDataReader dr = DoQuery(stmt);
			if (dr == null) return false;

			bool result = false;
			if (dr.Read()) result = IsColumnExist(dr, column);

			dr.Close();
			return result;
		}


		// ======================================================================================================
		public static bool CreateNewTableColumn(string table, string column, string descriptor, string dbKey)
		{
			String stmt = $"ALTER TABLE {table} ADD [{column}] {descriptor}";
			return DoNoneQuery(stmt, dbKey);
		}


		//====================================================================================
		public static void GetColumn(SqlDataReader reader, string column, ref object value)
		{
			value = null;
			if (!IsColumnNull(reader, column)) value = reader[column];
		}


		// ======================================================================================================
		public static void GetColumn(SqlDataReader reader, string column, ref string value)
		{
			value = "";
			if (!IsColumnNull(reader, column)) value = uStr.GetStringObject(reader[column]);
		}


		// ======================================================================================================
		public static void GetColumn(SqlDataReader reader, string column, ref bool value)
		{
			value = false;
			if (!IsColumnNull(reader, column)) value = uStr.GetBoolObject(reader[column]);
		}


		// ======================================================================================================
		public static void GetColumn(SqlDataReader reader, string column, ref DateTime value)
		{
			value = DateTime.MinValue;
			if (!IsColumnNull(reader, column)) value = uStr.GetDateObject(reader[column]);
		}


		// ======================================================================================================
		public static void GetColumn(SqlDataReader reader, string column, ref int value)
		{
			value = 0;
			if (!IsColumnNull(reader, column)) value = uStr.GetIntegerObject(reader[column]);
		}


		// ======================================================================================================
		public static void GetColumn(SqlDataReader reader, string column, ref Decimal value)
		{
			value = 0;
			if (!IsColumnNull(reader, column)) value = uStr.GetDecimalObject(reader[column]);
		}


		// ======================================================================================================
		public static void GetColumn(SqlDataReader reader, string column, ref float value)
		{
			value = 0;
			if (!IsColumnNull(reader, column)) value = uStr.GetFloatObject(reader[column]);
		}


		// ======================================================================================================
		public static void GetColumn(SqlDataReader reader, string column, ref double value)
		{
			value = 0;
			if (!IsColumnNull(reader, column)) value = uStr.GetDoubleObject(reader[column]);
		}


		// ======================================================================================================
		public static void GetColumn(SqlDataReader reader, string column, ref byte[] value)
		{
			value = null;
			if (!IsColumnNull(reader, column)) value = (byte[])reader[column];
		}


		//====================================================================================
		public static bool IsColumnEmpty(SqlDataReader reader, string column)
		{
			if (IsColumnNull(reader, column)) return true;

			return uStr.IsEmpty(reader[column]);
		}


		// ======================================================================================================
		public static bool IsColumnExist(SqlDataReader reader, string column)
		{
			return (GetColumnIndex(reader, column) != -1);
		}


		// ======================================================================================================
		public static bool IsColumnNull(SqlDataReader reader, string column)
		{
			return IsColumnNull(reader, GetColumnIndex(reader, column));
		}


		// ======================================================================================================
		public static bool IsColumnNull(SqlDataReader reader, int index)
		{
			return ((index == -1) || reader.IsDBNull(index));
		}


		// ======================================================================================================
		public static int GetColumnIndex(SqlDataReader reader, string column)
		{
			try
			{
				return reader.GetOrdinal(column);
			}
			catch (Exception)
			{
				return -1;
			}
		}


		// ======================================================================================================
		public static bool IsColumnEmpty(DataRow dataRow, string column)
		{
			if (IsColumnNull(dataRow, column)) return true;

			if (dataRow.Table.Columns[column].DataType.Name.ToLower() == "string") return ((string)dataRow[column] == "");
			if (dataRow.Table.Columns[column].DataType.Name.ToLower() == "int") return ((int)dataRow[column] == 0);
			if (dataRow.Table.Columns[column].DataType.Name.ToLower() == "int16") return ((int)dataRow[column] == 0);
			if (dataRow.Table.Columns[column].DataType.Name.ToLower() == "int32") return ((int)dataRow[column] == 0);
			if (dataRow.Table.Columns[column].DataType.Name.ToLower() == "int64") return ((int)dataRow[column] == 0);
			if (dataRow.Table.Columns[column].DataType.Name.ToLower() == "decimal") return ((decimal)dataRow[column] == 0);
			if (dataRow.Table.Columns[column].DataType.Name.ToLower() == "float") return ((float)dataRow[column] == 0);
			if (dataRow.Table.Columns[column].DataType.Name.ToLower() == "double") return ((double)dataRow[column] == 0);
			if (dataRow.Table.Columns[column].DataType.Name.ToLower() == "boolean") return true;
			if (dataRow.Table.Columns[column].DataType.Name.ToLower() == "datetime") return ((DateTime)dataRow[column] == DateTime.MinValue);

			return true;
		}


		// ======================================================================================================
		public static bool IsColumnExist(DataRow dataRow, string column)
		{
			return (!dataRow.IsNull(column));
		}


		// ======================================================================================================
		public static bool IsColumnNull(DataRow dataRow, string column)
		{
			return (!IsColumnExist(dataRow, column) || dataRow.IsNull(column));
		}


		// ======================================================================================================
		public static void ClearDataRow(DataRow dataRow)
		{
			for (int i = 0; i < dataRow.Table.Columns.Count; i++)
			{
				if (dataRow.Table.Columns[i].DataType.Name.ToLower() == "string") dataRow[i] = "";
				if (dataRow.Table.Columns[i].DataType.Name.ToLower() == "int") dataRow[i] = 0;
				if (dataRow.Table.Columns[i].DataType.Name.ToLower() == "int16") dataRow[i] = 0;
				if (dataRow.Table.Columns[i].DataType.Name.ToLower() == "int32") dataRow[i] = 0;
				if (dataRow.Table.Columns[i].DataType.Name.ToLower() == "int64") dataRow[i] = 0;
				if (dataRow.Table.Columns[i].DataType.Name.ToLower() == "decimal") dataRow[i] = 0;
				if (dataRow.Table.Columns[i].DataType.Name.ToLower() == "float") dataRow[i] = 0;
				if (dataRow.Table.Columns[i].DataType.Name.ToLower() == "double") dataRow[i] = 0;
				if (dataRow.Table.Columns[i].DataType.Name.ToLower() == "boolean") dataRow[i] = false;
				if (dataRow.Table.Columns[i].DataType.Name.ToLower() == "datetime") dataRow[i] = DateTime.MinValue;
			}
		}


		// GetObject by statement
		// ======================================================================================================
		// ======================================================================================================
		public static object GetObjectColumn(string stmt)
		{
			object column = null;
			GetObjectColumn(ref column, stmt);
			return column;
		}

		public static bool GetObjectColumn(ref object column, string stmt)
		{
			string dbKey = GetTarget_DB(GetTableNameOutOfStatement(stmt));
			SqlConnection connection = GetDBConnection(dbKey);
			if (connection == null) return false;

			SqlCommand command = new SqlCommand(stmt, connection);

			bool result = GetObjectColumn(command, ref column, stmt);
			connection.Close();
			return result;
		}

		public static object GetObjectColumn(SqlCommand command, string stmt)
		{
			object column = null;
			GetObjectColumn(command, ref column, stmt);
			return column;
		}

		public static bool GetObjectColumn(SqlCommand command, ref object column, string stmt)
		{
			column = null;

			SqlDataReader dr = DoQuery(command, stmt);
			if (dr == null) return false;

			if (dr.Read()) GetColumn(dr, dr.GetName(0), ref column);

			dr.Close();
			return true;
		}


		// Get INTEGER by statement
		// ======================================================================================================
		// ======================================================================================================
		public static int GetIntegerColumn(string stmt, string dbKey = "")
		{
			int column = 0;
			GetIntegerColumn(ref column, stmt, dbKey);
			return column;
		}


		public static bool GetIntegerColumn(ref int column, string stmt, string dbKey = "")
		{
			if (dbKey == "") dbKey = GetTarget_DB(GetTableNameOutOfStatement(stmt));
			SqlConnection connection = GetDBConnection(dbKey);
			if (connection == null) return false;

			SqlCommand command = new SqlCommand(stmt, connection);

			bool result = GetIntegerColumn(command, ref column, stmt);
			connection.Close();
			return result;
		}

		public static int GetIntegerColumn(SqlCommand command, string stmt)
		{
			int column = 0;
			GetIntegerColumn(command, ref column, stmt);
			return column;
		}

		public static bool GetIntegerColumn(SqlCommand command, ref int column, string stmt)
		{
			column = 0;

			SqlDataReader dr = DoQuery(command, stmt);
			if (dr == null) return false;

			if (dr.Read()) GetColumn(dr, dr.GetName(0), ref column);

			dr.Close();
			return true;
		}


		// Get BOOL by statement
		// ======================================================================================================
		// ======================================================================================================
		public static bool GetBoolColumn(string stmt)
		{
			bool column = false;
			GetBoolColumn(ref column, stmt);
			return column;
		}

		public static bool GetBoolColumn(ref bool column, string stmt)
		{
			string dbKey = GetTarget_DB(GetTableNameOutOfStatement(stmt));
			SqlConnection connection = GetDBConnection(dbKey);
			if (connection == null) return false;

			SqlCommand command = new SqlCommand(stmt, connection);

			bool result = GetBoolColumn(command, ref column, stmt);
			connection.Close();
			return result;
		}

		public static bool GetBoolColumn(SqlCommand command, string stmt)
		{
			bool column = false;
			GetBoolColumn(command, ref column, stmt);
			return column;
		}

		public static bool GetBoolColumn(SqlCommand command, ref bool column, string stmt)
		{
			column = false;

			SqlDataReader dr = DoQuery(command, stmt);
			if (dr == null) return false;

			if (dr.Read()) GetColumn(dr, dr.GetName(0), ref column);

			dr.Close();
			return true;
		}


		// Get binary
		// ======================================================================================================
		// ======================================================================================================
		public static byte[] GetBinaryColumn(string stmt)
		{
			byte[] column = null;
			GetBinaryColumn(ref column, stmt);
			return column;
		}

		public static bool GetBinaryColumn(ref byte[] column, string stmt)
		{
			string dbKey = GetTarget_DB(GetTableNameOutOfStatement(stmt));
			SqlConnection connection = GetDBConnection(dbKey);
			if (connection == null) return false;

			SqlCommand command = new SqlCommand(stmt, connection);

			bool result = GetBinaryColumn(command, ref column, stmt);
			connection.Close();
			return result;
		}

		public static byte[] GetBinaryColumn(SqlCommand command, string stmt)
		{
			byte[] column = null;
			GetBinaryColumn(command, ref column, stmt);
			return column;
		}

		public static bool GetBinaryColumn(SqlCommand command, ref byte[] column, string stmt)
		{
			column = null;

			SqlDataReader dr = DoQuery(command, stmt);
			if (dr == null) return false;

			if (dr.Read()) GetColumn(dr, dr.GetName(0), ref column);

			dr.Close();
			return true;
		}


		// Get FLOAT by statement
		// ======================================================================================================
		// ======================================================================================================
		public static float GetFloatColumn(string stmt)
		{
			float column = 0;
			GetFloatColumn(ref column, stmt);
			return column;
		}

		public static bool GetFloatColumn(ref float column, string stmt)
		{
			string dbKey = GetTarget_DB(GetTableNameOutOfStatement(stmt));
			SqlConnection connection = GetDBConnection(dbKey);
			if (connection == null) return false;

			SqlCommand command = new SqlCommand(stmt, connection);

			bool result = GetFloatColumn(command, ref column, stmt);
			connection.Close();
			return result;
		}

		public static float GetFloatColumn(SqlCommand command, string stmt)
		{
			float column = 0;
			GetFloatColumn(command, ref column, stmt);
			return column;
		}

		public static bool GetFloatColumn(SqlCommand command, ref float column, string stmt)
		{
			column = 0;

			SqlDataReader dr = DoQuery(command, stmt);
			if (dr == null) return false;

			if (dr.Read()) GetColumn(dr, dr.GetName(0), ref column);

			dr.Close();
			return true;
		}


		// Get DOUBLE by statement
		// ======================================================================================================
		// ======================================================================================================
		public static double GetDoubleColumn(string stmt)
		{
			double column = 0;
			GetDoubleColumn(ref column, stmt);
			return column;
		}

		public static bool GetDoubleColumn(ref double column, string stmt)
		{
			string dbKey = GetTarget_DB(GetTableNameOutOfStatement(stmt));
			SqlConnection connection = GetDBConnection(dbKey);
			if (connection == null) return false;

			SqlCommand command = new SqlCommand(stmt, connection);

			bool result = GetDoubleColumn(command, ref column, stmt);
			connection.Close();
			return result;
		}

		public static double GetDoubleColumn(SqlCommand command, string stmt)
		{
			double column = 0;
			GetDoubleColumn(command, ref column, stmt);
			return column;
		}

		public static bool GetDoubleColumn(SqlCommand command, ref double column, string stmt)
		{
			column = 0;

			SqlDataReader dr = DoQuery(command, stmt);
			if (dr == null) return false;

			if (dr.Read()) GetColumn(dr, dr.GetName(0), ref column);

			dr.Close();
			return true;
		}


		// Get DECIMAL by statement
		// ======================================================================================================
		// ======================================================================================================
		public static decimal GetDecimalColumn(string stmt)
		{
			decimal column = 0;
			GetDecimalColumn(ref column, stmt);
			return column;
		}

		public static bool GetDecimalColumn(ref decimal column, string stmt)
		{
			string dbKey = GetTarget_DB(GetTableNameOutOfStatement(stmt));
			SqlConnection connection = GetDBConnection(dbKey);
			if (connection == null) return false;

			SqlCommand command = new SqlCommand(stmt, connection);

			bool result = GetDecimalColumn(command, ref column, stmt);
			connection.Close();
			return result;
		}

		public static decimal GetDecimalColumn(SqlCommand command, string stmt)
		{
			decimal column = 0;
			GetDecimalColumn(command, ref column, stmt);
			return column;
		}

		public static bool GetDecimalColumn(SqlCommand command, ref decimal column, string stmt)
		{
			column = 0;

			SqlDataReader dr = DoQuery(command, stmt);
			if (dr == null) return false;

			if (dr.Read()) GetColumn(dr, dr.GetName(0), ref column);

			dr.Close();
			return true;
		}


		// Get STRING by statement
		// ======================================================================================================
		// ======================================================================================================
		public static string GetStringColumn(string stmt)
		{
			string column = "";
			GetStringColumn(ref column, stmt);
			return column;
		}

		public static bool GetStringColumn(ref string column, string stmt)
		{
			string dbKey = GetTarget_DB(GetTableNameOutOfStatement(stmt));
			SqlConnection connection = GetDBConnection(dbKey);
			if (connection == null) return false;

			SqlCommand command = new SqlCommand(stmt, connection);

			bool result = GetStringColumn(command, ref column, stmt);
			connection.Close();
			return result;
		}

		public static string GetStringColumn(SqlCommand command, string stmt)
		{
			string column = null;
			GetStringColumn(command, ref column, stmt);
			return column;
		}

		public static bool GetStringColumn(SqlCommand command, ref string column, string stmt)
		{
			column = "";

			SqlDataReader dr = DoQuery(command, stmt);
			if (dr == null) return false;

			if (dr.Read()) GetColumn(dr, dr.GetName(0), ref column);

			dr.Close();

			return true;
		}


		// Get DATETIME by statement
		// ======================================================================================================
		// ======================================================================================================
		public static DateTime GetDateTimeColumn(string stmt)
		{
			DateTime column = DateTime.MinValue;
			GetDateTimeColumn(ref column, stmt);
			return column;
		}

		public static bool GetDateTimeColumn(ref DateTime column, string stmt)
		{
			string dbKey = GetTarget_DB(GetTableNameOutOfStatement(stmt));
			SqlConnection connection = GetDBConnection(dbKey);
			if (connection == null) return false;

			SqlCommand command = new SqlCommand(stmt, connection);

			bool result = GetDateTimeColumn(command, ref column, stmt);
			connection.Close();
			return result;
		}

		public static DateTime GetDateTimeColumn(SqlCommand command, string stmt)
		{
			DateTime column = DateTime.MinValue;
			GetDateTimeColumn(command, ref column, stmt);
			return column;
		}

		public static bool GetDateTimeColumn(SqlCommand command, ref DateTime column, string stmt)
		{
			column = DateTime.MinValue;

			SqlDataReader dr = DoQuery(command, stmt);
			if (dr == null) return false;

			if (dr.Read()) GetColumn(dr, dr.GetName(0), ref column);

			dr.Close();
			return true;
		}


		// ======================================================================================================
		// ======================================================================================================
		public static SqlConnection GetDBConnection()
		{
			return GetDBConnection("");
		}


		// ======================================================================================================
		public static SqlConnection GetDBConnection(string dbKey)
		{
			string connectionString = GetConnectionString(dbKey);
			connectionString = connectionString + " MultipleActiveResultSets=True;";

			try
			{
				SqlConnection connection = new SqlConnection(connectionString);
				connection.Open();
				return connection;
			}
			catch (Exception e)
			{
				string message = e.Message.Replace("\r\n", " ");
				uApp.Loger($"*** uDB.GetDBConnection Error: {message}");
			}

			return null;
		}



		// ======================================================================================================
		public static SqlCommand StartTransaction(string dbKey)
		{
			SqlConnection connection = GetDBConnection(dbKey);
			if (connection == null) return null;

			SqlCommand command = connection.CreateCommand();
			command.Transaction = connection.BeginTransaction();
			return command;
		}


		// ======================================================================================================
		public static bool EndTransaction(SqlTransaction transaction, bool success)
		{
			SqlConnection connection = transaction.Connection;

			if (!success)
			{
				success = RollBack(transaction);
			}
			else
			{
				success = Commit(transaction);
			}

			connection.Close();
			return success;
		}


		// ======================================================================================================
		public static bool RollBack(SqlTransaction transaction)
		{
			if (transaction == null) return true;

			try
			{
				transaction.Rollback();
				return true;
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uDB.RollBack Error: {e.Message}");
			}

			return false;
		}


		// ======================================================================================================
		public static bool Commit(SqlTransaction transaction)
		{
			if (transaction == null) return true;

			try
			{
				transaction.Commit();
				return true;
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uDB.Commit Error: {e.Message}");
			}

			return false;
		}


		// ======================================================================================================
		public static string GetJsonRecordSet(string stmt)
		{
			string dataset_format = "";
			return GetJsonRecordSet(stmt, ref dataset_format);
		}


		// ======================================================================================================
		public static string GetJsonRecordSet(string stmt, ref string dataset_format)
		{
			dataset_format = "[]";

			SqlDataReader dr = DoQuery(stmt);
			if (dr == null) return "[]";

			string recordList = "";
			for (int i = 0; dr.Read(); i++)
			{
				recordList += GetJsonRowScript(dr) + ",";
			}

			dataset_format = "[" + GetJsonRowLayoutScript(dr) + "]";

			return "[" + recordList.TrimEnd(",".ToCharArray()) + "]";
		}


		// ======================================================================================================
		public static string GetJsonRowLayoutScript(SqlDataReader dr)
		{
			string rowLayout = "";

			for (int i = 0; i < dr.FieldCount; i++)
			{
				string fieldName = dr.GetName(i);
				string fieldType = GetJsonColumnLayoutScript(dr, i);

				rowLayout += "\"" + fieldName + "\"" + ":\"" + fieldType + "\",";
			}

			return "{" + rowLayout.TrimEnd(",".ToCharArray()) + "}";
		}


		// ======================================================================================================
		public static string GetJsonColumnLayoutScript(SqlDataReader dr, int index)
		{
			string fieldType = "";

			Type typeCode = dr.GetFieldType(index);

			if (typeCode == typeof(Boolean))
			{
				fieldType = "Boolean";
			}
			else if (typeCode == typeof(Byte))
			{
				fieldType = "String";
			}
			else if (typeCode == typeof(Byte[]))
			{
				fieldType = "String";
			}
			else if (typeCode == typeof(Int64))
			{
				fieldType = "Int";
			}
			else if (typeCode == typeof(Int32))
			{
				fieldType = "Int";
			}
			else if (typeCode == typeof(Int16))
			{
				fieldType = "Int";
			}
			else if (typeCode == typeof(SByte)) // tiny int
			{
				fieldType = "Int";
			}
			else if (typeCode == typeof(UInt64))
			{
				fieldType = "Int";
			}
			else if (typeCode == typeof(UInt32))
			{
				fieldType = "Int";
			}
			else if (typeCode == typeof(UInt16))
			{
				fieldType = "Int";
			}
			else if (typeCode == typeof(String))
			{
				fieldType = "String";
			}
			else if (typeCode == typeof(DateTime))
			{
				fieldType = "DateTime";
			}
			else if (typeCode == typeof(TimeSpan))
			{
				fieldType = "Time";
			}
			else if (typeCode == typeof(decimal))
			{
				fieldType = "Real";
			}
			else if (typeCode == typeof(double))
			{
				fieldType = "Real";
			}
			else if (typeCode == typeof(float))
			{
				fieldType = "Real";
			}
			else
			{
				fieldType = "String";
			}

			return fieldType;
		}


		// ======================================================================================================
		public static string GetJsonRowScript(SqlDataReader dr)
		{
			string rowScript = "";

			for (int i = 0; i < dr.FieldCount; i++)
			{
				rowScript += GetJsonScriptOfColumn(dr, i) + ",";
			}

			return "{" + rowScript.TrimEnd(",".ToCharArray()) + "}";
		}


		// ======================================================================================================
		public static string GetJsonScriptOfColumn(SqlDataReader dr, int index)
		{
			string columnName = "\"" + dr.GetName(index) + "\"";

			string columnValue = "\"" + GetStringPresentationOfColumn(dr, index).Replace("\"", "\\\"") + "\"";

			return columnName + ":" + columnValue;
		}


		// ======================================================================================================
		public static string GetRecordList(string stmt)
		{
			return GetRecordList(stmt, false);
		}


		// ======================================================================================================
		public static string GetRecordList(string stmt, bool includeHeaderLine)
		{
			SqlDataReader dr = DoQuery(stmt);
			if (dr == null) return "";

			string recordList = "";
			for (int i = 0; dr.Read(); i++)
			{
				recordList += GetRowScript(dr) + uStr.CONST_Record_Delimitor;
			}

			recordList = recordList.TrimEnd(uStr.CONST_Record_Delimitor.ToCharArray());

			if (includeHeaderLine && !string.IsNullOrEmpty(recordList))
			{
				recordList = GetRowLayout(dr) + recordList;
			}

			return recordList;
		}


		// ======================================================================================================
		public static string GetRowLayout(SqlDataReader dr)
		{
			string rowLayout = "";

			for (int i = 0; i < dr.FieldCount; i++)
			{
				string fieldName = dr.GetName(i);

				rowLayout += fieldName + ",";
			}

			return rowLayout.TrimEnd(",".ToCharArray()) + uStr.CONST_Record_Delimitor;
		}


		// ======================================================================================================
		public static string GetRowScript(SqlDataReader dr)
		{
			string rowScript = "";

			for (int i = 0; i < dr.FieldCount; i++)
			{
				rowScript += GetStringPresentationOfColumn(dr, i) + "^";
			}

			return rowScript.TrimEnd("^".ToCharArray());
		}


		// ======================================================================================================
		public static string WrapUpSqlStmtArgument(Type typeCode, string value)
		{
			if (typeCode == typeof(String))
			{
				return "'" + value + "'";
			}
			else if (typeCode == typeof(DateTime))
			{
				return "'" + value + "'";
			}
			else if (typeCode == typeof(TimeSpan))
			{
				return "'" + value + "'";
			}

			return value;
		}


		// ======================================================================================================
		public static string GetStringPresentationOfColumn(SqlDataReader dr, int index)
		{
			if (IsColumnNull(dr, index)) return "";

			string columnStringValue = "";

			Type typeCode = dr.GetFieldType(index);

			if (typeCode == typeof(Boolean))
			{
				bool boolValue = dr.GetBoolean(index);
				columnStringValue = boolValue ? "1" : "0";
			}
			else if (typeCode == typeof(Byte))
			{
				byte byteValue = dr.GetByte(index);
				columnStringValue = byteValue.ToString();
			}
			else if (typeCode == typeof(Byte[]))
			{
				byte[] bytesValue = (byte[])dr[index];
				columnStringValue = uStr.UGetString(bytesValue);  // Goes ASCII
			}
			else if (typeCode == typeof(Int64))
			{
				Int64 intValue = dr.GetInt64(index);
				columnStringValue = intValue.ToString();
			}
			else if (typeCode == typeof(Int32))
			{
				Int32 intValue = dr.GetInt32(index);
				columnStringValue = intValue.ToString();
			}
			else if (typeCode == typeof(Int16))
			{
				Int16 intValue = dr.GetInt16(index);
				columnStringValue = intValue.ToString();
			}
			else if (typeCode == typeof(SByte))
			{
				SByte sbyteValue = (SByte)dr.GetInt16(index);
				columnStringValue = sbyteValue.ToString();
			}
			else if (typeCode == typeof(UInt64))
			{
				UInt64 uintValue = (UInt64)dr.GetInt64(index);
				columnStringValue = uintValue.ToString();
			}
			else if (typeCode == typeof(UInt32))
			{
				UInt32 uintValue = (UInt32)dr.GetInt32(index);
				columnStringValue = uintValue.ToString();
			}
			else if (typeCode == typeof(UInt16))
			{
				UInt16 uintValue = (UInt16)dr.GetInt16(index);
				columnStringValue = uintValue.ToString();
			}
			else if (typeCode == typeof(String))
			{
				columnStringValue = dr.GetString(index);

				columnStringValue = columnStringValue.Replace(uStr.CONST_Record_Delimitor, uStr.CONST_Tilde_Mark);
				columnStringValue = columnStringValue.Replace(uStr.CONST_Field_Delimitor, uStr.CONST_UpArrow_Mark);
				while (columnStringValue.IndexOf("  ") != -1) columnStringValue = columnStringValue.Replace("  ", " ");
				columnStringValue = columnStringValue.Trim();
			}
			else if (typeCode == typeof(Decimal))
			{
				Decimal decValue = dr.GetDecimal(index);
				columnStringValue = decValue.ToString("N2");
			}
			else if (typeCode == typeof(DateTime))
			{
				DateTime datetimeValue = dr.GetDateTime(index);
				if (datetimeValue == DateTime.MinValue) columnStringValue = "";
				else columnStringValue = datetimeValue.ToString("yyyy/MM/dd HH:mm:ss");
			}
			else if (typeCode == typeof(TimeSpan))
			{
				TimeSpan spanValue = dr.GetTimeSpan(index);
				columnStringValue = spanValue.ToString();
			}
			else if (typeCode == typeof(Double))
			{
				Double doubleValue = dr.GetDouble(index);
				columnStringValue = doubleValue.ToString();
			}
			else if (typeCode == typeof(float))
			{
				float floatValue = dr.GetFloat(index);
				columnStringValue = floatValue.ToString();
			}

			return columnStringValue;
		}


		// ======================================================================================================
		public static SqlDataReader DoQuery(string stmt, string dbKey = "")
		{
			if (dbKey == "") dbKey = GetTarget_DB(GetTableNameOutOfStatement(stmt));

			SqlConnection connection = GetDBConnection(dbKey);
			if (connection == null) return null;

			SqlCommand command = new SqlCommand(stmt, connection);
			return DoQuery(command, stmt);
		}


		// ======================================================================================================
		public static SqlDataReader DoQuery(SqlCommand command, string stmt)
		{

			if (!uStr.WildCompareNoCase(command.Connection.ConnectionString, "Access"))
			{
				stmt = stmt.Replace('#', (char)0x27);
			}

			try
			{
				command.CommandText = stmt;
				return command.ExecuteReader();
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uDB.DoQuery Error: STMT={stmt}; Err={e.Message}");
				return null;
			}
		}


		// ======================================================================================================
		public static bool DoNoneQuery(string stmt, string dbKey)
		{
			SqlConnection connection = GetDBConnection(dbKey);
			if (connection == null) return false;
			SqlCommand command = new SqlCommand(stmt, connection);

			bool result = DoNoneQuery(command, stmt);
			connection.Close();
			return result;
		}


		// ======================================================================================================
		public static bool DoNoneQuery(SqlCommand command, string stmt)
		{
			while (stmt.IndexOf(" '") != -1) stmt = stmt.Replace(" '", "'");
			stmt = stmt.Replace("='", "=N'"); // UPDATE Syntax 
			stmt = stmt.Replace(",'", ",N'"); // INSERT Syntax.  Regular arg
			stmt = stmt.Replace("('", "(N'"); // INSERT Syntax.  First arg

			if (!uStr.WildCompareNoCase(command.Connection.ConnectionString, "Access"))
			{
				stmt = stmt.Replace('#', (char)0x27);
			}

			try
			{
				command.CommandText = stmt;
				command.ExecuteNonQuery();
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uDB.DoNoneQury Error: STMT={stmt}; Err={e.Message}");
				return false;
			}

			return true;
		}


		// ======================================================================================================
		public static string GetPrimaryKeysForTable(string tableName)
		{
			SqlConnection connection = GetDBConnection(GetTarget_DB(tableName));
			if (connection == null) return "";

			string primaryKeyList = "";
			SqlCommand command = new SqlCommand("sp_pkeys", connection);
			command.CommandType = System.Data.CommandType.StoredProcedure;
			command.Parameters.AddWithValue("@table_name", tableName);
			SqlDataReader reader = command.ExecuteReader();
			while (reader.Read())
			{
				uStr.ConcatenateArg(ref primaryKeyList, reader[3].ToString(), "|");
			}

			return primaryKeyList;
		}


		// ======================================================================================================
		public static string GetTableNameOutOfStatement(string _stmt)
		{
			string tableName = "";
			_stmt = _stmt.Trim() + " ";
			while (_stmt.IndexOf("  ") != -1) _stmt = _stmt.Replace("  ", " ");
			int tableEnd = -1, tableStart = _stmt.ToUpper().IndexOf(" FROM ");
			if (tableStart != -1)
			{
				tableStart += " FROM ".Length;
				if ((tableEnd = _stmt.IndexOf(" ", tableStart)) != -1)
				{
					tableName = uStr.Substring(_stmt, tableStart, tableEnd - tableStart);
				}
			}

			return tableName.Trim("[]".ToCharArray());
		}
	}
}

/*
static public int AddProductCategory(string newName, string connString)
{
    Int32 newProdID = 0;
    string sql =
        "INSERT INTO Production.ProductCategory (Name) VALUES (@Name); "
        + "SELECT CAST(scope_identity() AS int)";
    using (SqlConnection conn = new SqlConnection(connString))
    {
        SqlCommand cmd = new SqlCommand(sql, conn);
        cmd.Parameters.Add("@Name", SqlDbType.VarChar);
        cmd.Parameters["@name"].Value = newName;
        try
        {
            conn.Open();
            newProdID = (Int32)cmd.ExecuteScalar();
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
        }
    }
    return (int)newProdID;
} */
