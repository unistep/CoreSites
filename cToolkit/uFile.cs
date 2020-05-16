
using Microsoft.AspNetCore.Http;
using System;
using System.IO;
using System.Text;

namespace uToolkit
{
	public class uFile
	{
		public uFile()
		{
		}


		// ======================================================================================================
		public static string GetBaseName (string _filePath, bool _withExt)
		{
			string fileName = "";
			try
			{
				if (_withExt)	fileName = Path.GetFileName(_filePath);
				else			fileName = Path.GetFileNameWithoutExtension(_filePath);
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.GetBaseName Error: Path: {_filePath}, Err: {e.Message}");
				return "";
			}

			return fileName;
		}

		public static string   GetFileExtension (string _filePath)
		{
			string fileExt = "";
			try
			{
				fileExt = Path.GetExtension(_filePath);
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.GetFileExtension Error: Path: {_filePath}, Err: {e.Message}");
				return "";
			}

			return fileExt;
		}


		public static string   GetDirPath (string _filePath)
		{
			string dirPath = "";
			try
			{
				dirPath = Path.GetDirectoryName(_filePath);
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.GetDirPath Error: Path: {_filePath}, Err: {e.Message}");
				return "";
			}

			return dirPath;
		}


		public static string[] GetFilesList (string _folderPath, string _template, bool _lookForDirectories)
		{
			string[] files = null;
			_folderPath += uStr.EndItWithXXX (_folderPath, "\\");

			try
			{
				if (_lookForDirectories)	files = Directory.GetDirectories (_folderPath, _template);
				else						files = Directory.GetFiles       (_folderPath, _template);
			}
			catch
			{	
			}
			
			return files;
		}

		public static string GetFileInfo(string _filePath)
		{
			string strDescription = "";

			try
			{
				FileInfo fiFile = new FileInfo(_filePath);

				strDescription = "'" + fiFile.Name + "',";
				strDescription += "'" + fiFile.Length.ToString() + "',";
				strDescription += "'" + GetFileType(_filePath) + "',";
				strDescription += "'" + fiFile.LastWriteTime.ToString() + "'";
			}
			catch
			{
			}

			return strDescription;
		}

		public static long GetFileSize(string _filePath)
		{
			try
			{
				FileInfo fiFile = new FileInfo(_filePath);
				return fiFile.Length;
			}
			catch
			{
			}

			return 0;
		}


		public static bool CreateDirectory(string _folderPath)
		{
			if (Directory.Exists(_folderPath)) return true;

			try
			{
				Directory.CreateDirectory(_folderPath);
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.CreateDirectory Error: Path: {_folderPath}, Err: {e.Message}");
				return false;
			}

			return true;
		}


		public static bool DeleteDirectory(string _folderPath)
		{
			if (!Directory.Exists(_folderPath)) return true;

			try
			{
				Directory.Delete(_folderPath, true);
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.DeleteDirectory Error: Path: {_folderPath}, Err: {e.Message}");
				return false;
			}

			return true;
		}

		public static bool DeleteFile(string _filePath)
		{
			if ((_filePath.Trim() == "") || !File.Exists(_filePath)) return true;

			try
			{
				FileAttributes fa = File.GetAttributes (_filePath);

				if ((fa & FileAttributes.ReadOnly) != 0) File.SetAttributes (_filePath, fa -= FileAttributes.ReadOnly);

				File.Delete (_filePath);
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.DeleteFile Error: Path: {_filePath}, Err: {e.Message}");
				return false;
			}

			return true;
		}

		public static bool CopyFile(string _sourceFilePath, string _destinationFilePath, bool _allowOverride = false)
		{
			try
			{
				File.Copy(_sourceFilePath, _destinationFilePath, _allowOverride);
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.CopyFile Error: SRC: {_sourceFilePath}, DST: {_destinationFilePath}, Err: {e.Message}");
				return false;
			}

			return true;
		}

		public static bool MoveFile(string _sourceFile, string _destinationFile)
		{
			try
			{
				File.Move(_sourceFile, _destinationFile);
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.MoveFile Error: Path: {_sourceFile + "->" + _destinationFile}, Err: {e.Message}");
				return false;
			}

			return true;
		}

		public static bool ReadLine(string _filePath, ref string _returnData)
		{
			if (!File.Exists (_filePath))
			{
				uApp.Loger($"*** uFile.ReadLine Error: Path: {_filePath}, Err: File not found");
				return false;
			}

			try
			{
				StreamReader sr = new StreamReader(_filePath, Encoding.Unicode);
				_returnData = sr.ReadLine ();
				sr.Close ();
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.ReadLine Error: Path: {_filePath}, Err: {e.Message}");
				return false;
			}

			return true;
		}

		public static bool ReadLine(ref StreamReader uSR, string _filePath, ref string _returnData)
		{
			if (uSR == null)
			{
				if (!File.Exists(_filePath))
				{
					uApp.Loger($"*** uFile.ReadLine Error: Path: {_filePath}, Err: File not found");
					return false;
				}

				try
				{
					uSR = new StreamReader(_filePath);
				}
				catch (Exception e)
				{
					uApp.Loger($"*** uFile.ReadLine Error: Path: {_filePath}, Err: {e.Message}");
					return false;
				}
			}

			if (uSR.EndOfStream)
			{
				_returnData = null;
				return true;
			}

			try
			{
				_returnData = uSR.ReadLine();
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.ReadLine Error: Path: {_filePath}, Err: {e.Message}");
				uSR.Close();
				return false;
			}

			return true;
		}

		public static bool ReadFile(string _filePath, ref string _returnData)
		{
			if (!File.Exists (_filePath))
			{
				uApp.Loger($"*** uFile.ReadFile Error: Path: {_filePath}, Err: File not found");
				return false;
			}

			try
			{
				StreamReader sr = new StreamReader(_filePath) ;
				_returnData = sr.ReadToEnd ();
				sr.Close ();
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.ReadFile Error: Path: {_filePath}, Err: {e.Message}");
				return false;
			}

			return true;
		}

		public static byte[] ReadFile(string _filePath)
		{
			FileStream fileStream = null;
			byte[] bytesIn = null;

			try
			{
				fileStream = new FileStream(
					_filePath, FileMode.Open, FileAccess.Read);

				bytesIn = new byte[(int)fileStream.Length];

				fileStream.Read(bytesIn, 0, (int)fileStream.Length);
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.ReadFile Error: Path: {_filePath}, Err: {e.Message}");
				return null;
			}

			if (fileStream != null) fileStream.Close();
			return bytesIn;
		}

		public static bool WriteTruncate(string _filePath, string _dataOut)
		{
			try
			{
				FileInfo file = new FileInfo(_filePath);

				FileStream fs;
				if (File.Exists(_filePath)) fs = file.Open(FileMode.Truncate);
				else        	  			fs = file.Open (FileMode.OpenOrCreate);
				fs.Close ();

				StreamWriter swTarget = file.AppendText();
				swTarget.Write (_dataOut);
				swTarget.Flush();
				swTarget.Close();
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.WriteTruncate Error: Path: {_filePath}, Err: {e.Message}");
				return false;
			}

			return true;
		}

		public static bool WriteFile (string _filePath, string _dataOut)
		{
			if (_filePath.Trim() == "") return true;
			try
			{
				FileInfo oFile = new FileInfo (_filePath);
				StreamWriter swTarget = oFile.AppendText();
				swTarget.Write (_dataOut);
				swTarget.Flush();
				swTarget.Close();
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.WriteFile Error: Path: {_filePath}, Err: {e.Message}");
				return false;
			}

			return true;
		}

		public static bool WriteFile(string _filePath, byte[] byteOutDate)
		{
			FileStream fileStream = null;

			try
			{
				fileStream = new FileStream(
					_filePath, FileMode.Create, FileAccess.Write);

				fileStream.Write(byteOutDate, 0, (int)byteOutDate.Length);
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.WriteFile Error: Path: {_filePath}, Err: {e.Message}");
				return false;
			}

			if (fileStream != null) fileStream.Close();
			return true;
		}

		public static string GetDocumentKeywords(string _filePath)
		{
			byte[] bytesDoc = uFile.ReadFile(_filePath);
			if (bytesDoc == null) return "";

			int index = 0;
			string keyword = "", keywordList = ""; ;

			while (true)
			{
				if ((keyword = uStr.GetNextKW(bytesDoc, ref index)) == "") break;
				uStr.ConcatenateArg(ref keywordList, keyword, ",");
			}

			return keywordList;
		}

		public static bool CopyReplaceContent(string _filePathIN, string _filePathOUT, string[] _convertList)
		{
			DeleteFile(_filePathOUT);

			string returnData = "";

			if (!ReadFile(_filePathIN, ref returnData)) return false;

			foreach (string strEntry in _convertList)
			{
				string stringORG = uStr.GetArgString(strEntry, 1, "|");
				string stringNEW = uStr.GetArgString(strEntry, 2, "|");
				returnData = returnData.Replace(stringORG, stringNEW);
			}

			if (!WriteFile(_filePathOUT, returnData)) return false;

			return true;
		}

		static public string GetFileType(string _fileName)
		{
			if (_fileName.Trim() == "") return "Note";

			switch (GetFileExtension (_fileName.ToLower()))
			{
				default:    return "Other";

				case ".ico":
				case ".bmp":
				case ".jpg":
				case ".jpeg":
				case ".gif":
				case ".tiff":
				case ".tif":
				case ".png": return "Image";

				case ".wav":
				case ".mp3":
				case ".m4p":
				case ".wpl":
				case ".wma": return "Sound";

				case ".doc": return "MS Word";
				case ".rtf": return "Rich Text";
				case ".txt": return "Text";
				case ".xls": return "MS Excel";
				case ".pdf": return "PDF";
				case ".cad": return "CAD";
				case ".ppt": return "MS Power Point";
				case ".csv": return "MS Visio";
				case ".mdb": return "MS Access";
				case ".one": return "MS One Note";
			}
		}

		public static bool CreateFile(IFormFile _file, string _outPath)
		{
			try
			{
				using (FileStream fs = System.IO.File.Create(_outPath))
				{
					_file.CopyTo(fs);
					fs.Flush();
				}
			}
			catch (Exception e)
			{
				uApp.Loger($"*** uFile.CreateFile Error: Path: {_outPath}, Err: {e.Message}");
				return false;
			}

			return true;
		}
	}
}
