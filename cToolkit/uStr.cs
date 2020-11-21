
using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Xml;

namespace uToolkit
{
	public class uStr
	{
		public static	string		CONST_Tilde_Mark		= "**TIL**";
		public static	string		CONST_UpArrow_Mark		= "**UPA**";

		public static	string		CONST_Record_Delimitor	= "~";
		public static	string		CONST_Field_Delimitor	= "^";

		public	static	string		CONST_CMD_Record_Delim	= "\r\n";
		public	static	string		CONST_CMD_Field_Delim	= ",";

		public	const	int	CONST_ASCII		= 1;
		public	const	int	CONST_UNICODE	= 2;
		public	const	int	CONST_UTF7		= 3;
		public	const	int	CONST_UTF8		= 4;
		public	const	int	CONST_UTF32		= 5;

		public static Random m_randomPrimaryKey = new Random();

		public uStr()
		{
		}

		public static string Get_CMD_ScriptSection(string _filePath, string _sectionName)
		{
			if ((_filePath.Trim() == "") || (_sectionName.Trim() == "")) return "";

			string fileContent = "";
			if ((!uFile.ReadFile(_filePath, ref fileContent)) || (fileContent.Trim() == "")) return "";

			int index = 0;
			string sectionHeader = string.Format("[{0}]", _sectionName);

			if ((index = fileContent.ToLower().IndexOf(sectionHeader.ToLower())) == -1) return "";
			fileContent = Substring(fileContent, index + sectionHeader.Length).Trim();
			if (fileContent == "") return "";

			if ((index = fileContent.IndexOf(string.Format("{0}[", CONST_CMD_Record_Delim))) == -1)
			{
				index = fileContent.Length;
			}

			string[] scriptLines =
				Substring(fileContent, 0, index).Trim().Split(CONST_CMD_Record_Delim.ToCharArray(), StringSplitOptions.RemoveEmptyEntries);

			string scriptSection = "";

			foreach (string scriptRow in scriptLines)
			{
				if (scriptRow.StartsWith("REM ")) continue;
				scriptSection += scriptRow + CONST_CMD_Record_Delim;
			}

			return scriptSection.Trim();
		}

		public static string Get_CMD_Record(string _scriptSection, int _offset)
		{
			if (_scriptSection == "" || _scriptSection == null || _offset == 0) return "";

			string[] args = _scriptSection.Split(CONST_CMD_Record_Delim.ToCharArray(), StringSplitOptions.RemoveEmptyEntries);

			if ((args.Length == 0) || (args.Length < _offset)) return "";

			String value = args[_offset - 1].Trim();

			return value;
		}

		public static string Get_CMD_Field(string _scriptRow, int _offset)
		{
			if (_scriptRow == "" || _scriptRow == null || _offset == 0) return "";

			string[] args = _scriptRow.Split(CONST_CMD_Field_Delim.ToCharArray(), StringSplitOptions.None);

			if ((args.Length == 0) || (args.Length < _offset)) return "";

			return args[_offset - 1].Trim();
		}

		public static string Get_CMD_Field_Value(string _scriptSection, string _keyword)
		{
			for (int i = 1; ; i++)
			{
				string scriptRow = uStr.Get_CMD_Record(_scriptSection, i);
				if (scriptRow.Trim() == "") break;

				string arg1 = uStr.Get_CMD_Field(scriptRow, 1);
				string arg2 = uStr.Get_CMD_Field(scriptRow, 2);

				if (arg1.ToLower() == _keyword.ToLower()) return arg2;
			}

			return "";
		}

		public static string Get_CSV_Record(string _script, int _offset)
		{
			if (_script == "" || _script == null || _offset == 0) return "";

			string[] args = _script.Split(CONST_Record_Delimitor.ToCharArray(), StringSplitOptions.RemoveEmptyEntries);

			if ((args.Length == 0) || (args.Length < _offset)) return "";

			return args[_offset - 1].Trim();
		}

		public static string Get_CSV_Field(string _script, int _offset)
		{
			if (_script == "" || _script == null || _offset == 0) return "";

			string[] args = _script.Split(CONST_Field_Delimitor.ToCharArray(), StringSplitOptions.None);

			if ((args.Length == 0) || (args.Length < _offset)) return "";

			String value = args[_offset - 1].Trim();
			value = value.Replace(CONST_Tilde_Mark, CONST_Record_Delimitor);
			value = value.Replace(CONST_UpArrow_Mark, CONST_Field_Delimitor);
			return value;
		}

		public static string GetArgString(string _script, int _offset, string _stops)
		{
			if (_script == "" || _script == null || _offset == 0) return "";

			string[] args = _script.Split(_stops.ToCharArray(), StringSplitOptions.None);

			if ((args.Length == 0) || (args.Length < _offset)) return "";

			return args[_offset - 1].Trim ();
		}

		public static string GetNextKW(byte[] bytesDoc, ref int _index)
		{
			string keyword = "";
			for (; _index < bytesDoc.Length; _index++)
			{
				if (bytesDoc[_index] != (byte)'{') continue;

				for (_index++; bytesDoc[_index] != (byte)'}'; _index++)
				{
					if (((bytesDoc[_index] < 0x21) || (bytesDoc[_index] > 0x7D)) && (bytesDoc[_index] != 0x20))
					{
						keyword = "";
						break;
					}
					keyword += (char)bytesDoc[_index];
				}

				if (keyword != "") return keyword;
			}

			return "";
		}

		public static bool WildCompareNoCase(string _source, string _patern)
		{
			if ((_source == "") || (_patern == "")) return false;
			if (_source.Length < _patern.Length)    return false;

			return (_source.ToLower().Trim().IndexOf (_patern.ToLower().Trim()) != -1);
		}

		public static int GetCountOf (string _source, string _patern)
		{
			if ((_source == null) || (_patern == null))  return 0;

			if ((_source = _source.ToLower ()) == "") return 0;
			if ((_patern    = _patern.ToLower ())    == "") return 0;

			int intOccurs = 0;

			for (int i = 0; ((i = _source.IndexOf (_patern, i)) != -1); i += _patern.Length) intOccurs++;

			return intOccurs;
		}

		public static bool CompareNoCase (string _arg1, string _arg2)
		{
			return (_arg1.ToLower() == _arg2.ToLower());
		}

		public static string SetLength (string _source, int _length)
		{
			return SetLength (_source, _length, " ");
		}
			
		public static string SetLength (string _source, int _length, string strPadWith)
		{
			while (_source.Length < _length) _source += strPadWith;

			string strRtn = Substring (_source, 0, _length);
			if (strRtn.Length != _length)
			{
				return strRtn;
			}

			return strRtn;
		}

		public static void ConcatenateKW (ref string _script, string _keyword, string _arg, string _stops)
		{
			if ((_script == null) || (_keyword == null) || (_keyword == "") || (_arg == null)) return;

			ConcatenateArg (ref _script, string.Format ("{0}={1}", _keyword, _arg), _stops);
		}

		public static void ConcatenateKW (ref string _script, string _keyword, int _arg, string _stops)
		{
			if ((_script == null) || (_keyword == null) || (_keyword == "")) return;

			ConcatenateArg (ref _script, string.Format ("{0}={1:d}", _keyword, _arg), _stops);
		}

		public static void ConcatenateArg (ref string _script, string _arg, string _stops)
		{
			if (_script != "") _script += _stops;
			_script += _arg;
		}

		public static void ConcatenateArg (ref string _script, int _arg, string _stops)
		{
			if (_script != "") _script += _stops;
			_script += _arg.ToString ();
		}

		public static string EndItWithXXX (string _source, string _ext)
		{
			if (_ext.StartsWith ("\\") && _source.EndsWith ("//"))
			{
				_source = Substring (_source, 0, _source.Length - 1) + "\\";
			}

			int startIndex = _source.Length - _ext.Length;
			if (!CompareNoCase (Substring (_source, startIndex), _ext)) return _ext;

			return "";
		}

		public static bool IsEmpty(object _object)
		{
			if ((_object == null) || (_object is DBNull)) return true;

            if (_object is byte)     return ((byte)     _object == 0);
            if (_object is int)      return ((int)      _object == 0);
            if (_object is short)    return ((short)    _object == 0);
            if (_object is long)     return ((long)     _object == 0);
            if (_object is decimal)  return ((decimal)  _object == 0);
            if (_object is double)   return ((double)   _object == 0);
            if (_object is float)    return ((float)    _object == 0);
            if (_object is string)   return (((string)  _object).Trim() == "");
            if (_object is DateTime) return ((DateTime) _object == DateTime.MinValue);
            if (_object is bool)     return false;

            return true;
		}

		public static string Substring(string _source, int startIndex)
		{
			try
			{
				return _source.Substring(startIndex);
			}
			catch (Exception)
			{
				return "";
			}
		}

		public static string Substring(string _source, int _startIndex, int _length)
		{
			if (_startIndex > _source.Length) return "";
			if ((_startIndex + _length) > _source.Length)
			{
				_length = _source.Length - _startIndex;
				if (_length == 0) return "";
			}

			try
			{
				return _source.Substring(_startIndex, _length);
			}
			catch (Exception)
			{
				return "";
			}
		}

		public static int String2Integer(string _arg)
		{
			int result = 0;
			String2Integer(ref result, _arg, 10);
			return result;
		}

		public static bool String2Integer(ref int _result, string _arg)
		{
			return String2Integer(ref _result, _arg, 10);
		}

		public static bool String2Integer(ref int _result, string _arg, int _base)
		{
			int value = 0;
			if ((_arg = _arg.Trim()) == "") return true;

			try
			{
				switch (_base)
				{
					default:
					case 10: value = Int32.Parse(_arg); break;
					case 16: value = Int32.Parse(_arg, System.Globalization.NumberStyles.HexNumber); break;
				}

				_result = value;
				return true;
			}
			catch (Exception)
			{
			}

			uApp.Loger($"*** uStr.String2Integer Error: Invalid digit value: {_arg}");
			return false;
		}

		public static decimal String2Decimal(string _arg)
		{
			decimal result= 0;
			String2Decimal(ref result, _arg);
			return result;
		}

		public static bool String2Decimal(ref decimal _result, string _arg)
		{
			if ((_arg = _arg.Trim()) == "") return true;

			try
			{
				_result = decimal.Parse(_arg);
				return true;
			}
			catch (Exception)
			{
			}

			uApp.Loger($"*** uStr.String2Decimal Error: Invalid digit value: {_arg}");
            return false;
		}

		public static float String2Float(string _arg)
		{
			float result = 0;
			String2Float(ref result, _arg);
			return result;
		}

		public static bool String2Float(ref float _result, string _arg)
		{
			_result = 0;
			if ((_arg = _arg.Trim()) == "") return true;

			try
			{
				float value = float.Parse(_arg);
				_result = value;
				return true;
			}
			catch (Exception)
			{
			}

			uApp.Loger($"*** uStr.String2Float Error: Invalid digit value: {_arg}");
            return false;
		}


		public static bool String2Double(ref double _result, string _arg)
		{
			_result = 0;
			if ((_arg = _arg.Trim()) == "") return true;

			try
			{
				double value = double.Parse(_arg);
				_result = value;
				return true;
			}
			catch (Exception)
			{
			}

			uApp.Loger($"*** uStr.String2Double Error: Invalid digit value: {_arg}");
            return false;
		}


		public static string Reverse(string _value)
		{
			string reversed = "";

			for (int i = 0; i < _value.Length; i++)
			{
				reversed += _value[_value.Length - i - 1];
			}

			return reversed;
		}

		public static string EncryptPassword(string _password) // AES
		{
			if ((_password == null) || ((_password = _password.Trim()) == "")) return "";

			MemoryStream msEncrypt	= null;
			CryptoStream csEncrypt	= null;
			StreamWriter swEncrypt	= null;
			RijndaelManaged aesAlg	= null;
			string	 encryption	= "";

			try
			{
				aesAlg = new RijndaelManaged();
				aesAlg.Key = UGetBytes("AIzaSyCcFSmbfCJWDk3VDPu78X43YB8V");
				aesAlg.IV = UGetBytes("aqJkgMTmxxEY4V0A");

				ICryptoTransform encryptor = aesAlg.CreateEncryptor(aesAlg.Key, aesAlg.IV);

				msEncrypt = new MemoryStream();
				csEncrypt = new CryptoStream(msEncrypt, encryptor, CryptoStreamMode.Write);
				swEncrypt = new StreamWriter(csEncrypt);

				swEncrypt.Write(_password);
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uStr.DecryptPassword Error: {e.Message}");

				if (swEncrypt != null) swEncrypt.Dispose();
				if (csEncrypt != null) csEncrypt.Dispose();
				if (msEncrypt != null) msEncrypt.Dispose();
				if (aesAlg != null) aesAlg.Clear();
			}
			finally
			{
				if (swEncrypt != null) swEncrypt.Dispose();
				if (csEncrypt != null) csEncrypt.Dispose();
				if (msEncrypt != null) msEncrypt.Dispose();
				if (aesAlg != null) aesAlg.Clear();
			}


			byte[] byteEncryptrd = msEncrypt.ToArray();
			encryption = Convert.ToBase64String(byteEncryptrd).Replace("=", "*");
			return encryption;
		}


		public static string DecryptPassword(string _encryption)
        {
			if ((_encryption == null) || ((_encryption = _encryption.Trim()) == "")) return "";
			if ((_encryption.Length != 24) || !_encryption.EndsWith("**")) return "";

			MemoryStream	msDecrypt	= null;
            CryptoStream	csDecrypt	= null;
            StreamReader	srDecrypt	= null;
            RijndaelManaged	aesAlg		= null;
			string			strPassword	= "";

            try
            {
				byte[] bytePassword = Convert.FromBase64String(_encryption.Replace("*", "="));
				if (bytePassword == null) return "";

				aesAlg = new RijndaelManaged();
				aesAlg.Key	= UGetBytes("AIzaSyCcFSmbfCJWDk3VDPu78X43YB8V");
				aesAlg.IV	= UGetBytes("aqJkgMTmxxEY4V0A");

                ICryptoTransform decryptor = aesAlg.CreateDecryptor(aesAlg.Key, aesAlg.IV);

                msDecrypt	= new MemoryStream(bytePassword);
                csDecrypt	= new CryptoStream(msDecrypt, decryptor, CryptoStreamMode.Read);
                srDecrypt	= new StreamReader(csDecrypt);

				strPassword	= srDecrypt.ReadToEnd();
            }
			catch (Exception e)
			{
				uApp.Loger($"*** uStr.DecryptPassword Error: {e.Message}");

				if (srDecrypt != null) srDecrypt.Dispose();
				if (csDecrypt != null) csDecrypt.Dispose();
				if (msDecrypt != null) msDecrypt.Dispose();
				if (aesAlg != null) aesAlg.Clear();
			}
			finally
            {
				if (srDecrypt != null) srDecrypt.Dispose();
				if (csDecrypt != null) csDecrypt.Dispose();
				if (msDecrypt != null) msDecrypt.Dispose();
				if (aesAlg != null) aesAlg.Clear();
            }

			return strPassword;
        }


		public static string GeneratePassword(int _lowercase, int _uppercase, int _numerics)
		{
			string lowers = "abcdefghijklmnopqrstuvwxyz";
			string uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			string number = "0123456789";

			Random random = new Random();

			string generated = "!";
			for (int i = 1; i <= _lowercase; i++)
				generated = generated.Insert(
					random.Next(generated.Length),
					lowers[random.Next(lowers.Length - 1)].ToString()
				);

			for (int i = 1; i <= _uppercase; i++)
				generated = generated.Insert(
					random.Next(generated.Length),
					uppers[random.Next(uppers.Length - 1)].ToString()
				);

			for (int i = 1; i <= _numerics; i++)
				generated = generated.Insert(
					random.Next(generated.Length),
					number[random.Next(number.Length - 1)].ToString()
				);

			return generated.Replace("!", string.Empty);
		}


		public static DateTime GetDateObject(object objectDate)
		{
			return (IsEmpty(objectDate)) ? DateTime.MinValue : (DateTime)objectDate;
		}


		public static float GetFloatObject(object objectNumeric)
		{
			if (IsEmpty(objectNumeric)) return 0;

			if (objectNumeric is    byte)	return (float)((byte)objectNumeric);
			if (objectNumeric is  double)	return (float)((double)objectNumeric);
			if (objectNumeric is decimal)	return (float)((decimal)objectNumeric);
			if (objectNumeric is   float)	return (float)objectNumeric;
			if (objectNumeric is     int)	return (float)((int)objectNumeric);
			if (objectNumeric is   short)	return (float)((short)objectNumeric);
			if (objectNumeric is    long)	return (float)((long)objectNumeric);
			if (objectNumeric is  string)	return uStr.String2Float((string)objectNumeric);

			return 0;
		}


		public static double GetDoubleObject(object objectNumeric)
		{
			if (IsEmpty(objectNumeric)) return 0;

			if (objectNumeric is    byte)	return (double)((byte)objectNumeric);
			if (objectNumeric is  double)	return (double) objectNumeric;
			if (objectNumeric is decimal)	return (double)((decimal)objectNumeric);
			if (objectNumeric is   float)	return (double)((float)objectNumeric);
			if (objectNumeric is     int)	return (double)((int)objectNumeric);
			if (objectNumeric is   short)	return (double)((short)objectNumeric);
			if (objectNumeric is    long)	return (double)((long)objectNumeric);
			if (objectNumeric is  string)	return (double)uStr.String2Float((string)objectNumeric);
			return 0;
		}


		public static decimal GetDecimalObject(object objectNumeric)
		{
			if (IsEmpty(objectNumeric)) return 0;

			if (objectNumeric is    byte)	return (decimal)((byte)objectNumeric);
			if (objectNumeric is  double)	return (decimal)((double)objectNumeric);
			if (objectNumeric is decimal)	return (decimal) objectNumeric;
			if (objectNumeric is   float)	return (decimal)((float)objectNumeric);
			if (objectNumeric is     int)	return (decimal)((int)objectNumeric);
			if (objectNumeric is   short)	return (decimal)((short)objectNumeric);
			if (objectNumeric is    long)	return (decimal)((long)objectNumeric);
			if (objectNumeric is  string)	return (decimal)uStr.String2Integer((string)objectNumeric);
			return 0;
		}


		public static int GetIntegerObject(object objectNumeric)
		{
			if (IsEmpty(objectNumeric)) return 0;

			if (objectNumeric is    byte)	return (int)((byte)objectNumeric);
			if (objectNumeric is  double)	return (int)((double)objectNumeric);
			if (objectNumeric is decimal)	return (int)((decimal)objectNumeric);
			if (objectNumeric is   float)	return (int)((float)objectNumeric);
			if (objectNumeric is     int)	return (int)objectNumeric;
			if (objectNumeric is   short)	return (int)((short)objectNumeric);
			if (objectNumeric is    long)	return (int)((long)objectNumeric);
			if (objectNumeric is  string)	return uStr.String2Integer((string)objectNumeric);
			return 0;
		}


		public static string GetStringObject(object objectString)
		{
			if (IsEmpty(objectString)) return "";

			if (objectString is decimal) return ((decimal)objectString).ToString("N2");

			string strValue = objectString.ToString().Trim();
			if (objectString is DateTime) strValue = uStr.GetArgString(strValue, 1, " ");
			while (strValue.IndexOf("  ") != -1) strValue = strValue.Replace("  ", " ");

			return strValue.Trim();
		}


		public static bool GetBoolObject(object objectBool)
		{
			if (IsEmpty(objectBool)) return false;

			if (objectBool is Boolean) return (bool)objectBool;
			if (objectBool is bool)    return (bool)objectBool;
			if (objectBool is decimal) return (((decimal)objectBool) != 0);
			if (objectBool is double)  return (((double)objectBool)  != 0);
			if (objectBool is float)   return (((float)objectBool)   != 0);
			if (objectBool is int)     return (((int)objectBool)     != 0);
			if (objectBool is short)   return (((short)objectBool)   != 0);
			if (objectBool is long)    return (((long)objectBool)    != 0);

			return false;
		}


		public static string GetRandomNumber(int _digits)
		{
			string result = m_randomPrimaryKey.Next().ToString();

			return SetLength(result, _digits, m_randomPrimaryKey.Next().ToString());
		}


		public static System.Array ResizeArray(System.Array oldArray, int newSize)
		{
			int oldSize = oldArray.Length;

			System.Type elementType = oldArray.GetType().GetElementType();
			System.Array newArray = System.Array.CreateInstance(elementType, newSize);

			int preserveLength = System.Math.Min(oldSize, newSize);
			if (preserveLength > 0) System.Array.Copy(oldArray, newArray, preserveLength);

			return newArray;
		}

		public static byte[] UGetBytes(string data)
		{
			return UGetBytes(data, CONST_ASCII);
		}

		public static byte[] UGetBytes(string _data, int _code)
		{
			try
			{
				switch (_code)
				{
					case CONST_ASCII:
						return Encoding.ASCII.GetBytes(_data);
					case CONST_UNICODE:
						return Encoding.Unicode.GetBytes(_data);
					//case CONST_UTF7:
					//	return Encoding.UTF7.GetBytes(_data);
					case CONST_UTF8:
						return Encoding.UTF8.GetBytes(_data);
					case CONST_UTF32:
						return Encoding.UTF32.GetBytes(_data);
				}
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uStr.UGetBytes Error: {e.Message}");
			}

			return null;
		}

		public static string UGetString(byte[] data)
		{
			return UGetString(data, 0, data.Length, CONST_ASCII);
		}

		public static string UGetString(byte[] data, int _index, int _count)
		{
			return UGetString(data, _index, _count, CONST_ASCII);
		}

		public static string UGetString(byte[] data, int _index, int _count, int code)
		{
			try
			{
				switch (code)
				{
					case CONST_ASCII:
						return Encoding.ASCII.GetString   (data, _index, _count);
					case CONST_UNICODE:
						return Encoding.Unicode.GetString (data, _index, _count);
					//case CONST_UTF7:
					//	return Encoding.UTF7.GetString    (data, _index, _count);
					case CONST_UTF8:
						return Encoding.UTF8.GetString    (data, _index, _count);
					case CONST_UTF32:
						return Encoding.UTF32.GetString   (data, _index, _count);
				}
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uStr.UGetString Error: {e.Message}");
			}

			return null;
		}

		public static string GetXmlNodeValue(string _xmlInput, string _nodeName)
		{
			string nodeValue = "";
			XmlTextReader readerMB = null;

			try
			{
				readerMB = new XmlTextReader(new System.IO.StringReader(_xmlInput));

				while (readerMB.Read())
				{
					if (readerMB.NodeType != XmlNodeType.Element)	continue;

					if (readerMB.Name.ToLower() != _nodeName.ToLower())		continue;

					if (readerMB.Depth == 0) continue;

					nodeValue = readerMB.ReadElementContentAsString();
					break;
				}
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uStr.GetXmlNodeValue Error: {e.Message}");
			}

			readerMB.Close();
			return nodeValue;
		}

		public static string GetControlBaseName(string controlName)
		{
			int indexOf = controlName.IndexOf("_");
			if (indexOf != -1) controlName = Substring(controlName, indexOf + 1);
			return controlName;
		}
	}
}
