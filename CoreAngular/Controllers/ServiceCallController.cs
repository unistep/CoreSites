
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using uToolkit;

namespace CoreAngular.Controllers
{
	public class ServiceCallController : Controller
	{
		//====================================================================================================
		[HttpGet("ServiceCall")]
		public IActionResult ServiceCall(uBusinessObject businessObject)
		{
			uApp.Loger("ServiceCallController, ServiceCall API");
			businessObject.datasets = new List<uDatasets>();

			// JUST A DEMO: view_key_value should contain technician ID
			string where = (String.IsNullOrEmpty(businessObject.view_key_value) ? "" : $" WHERE Technician_ID={businessObject.view_key_value}");

			string stmt = "SELECT *, Vehicle_Color + ', ' + Gear_Type as __Description FROM Work_Orders" + where;
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt));  // PRIMARY DATASET comes FIRST!

			// CHILD DATASET (as the one below) need to declare its own foreign key and the parent key field it related to
			// Default for parent key field is its own (first in row) primary key
			stmt = "SELECT * FROM VU_Cart_Detail_Line_Extended";
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt, "Cart_Header_Line_pKey", "Work_Order_PKey"));

			// Combo box content with no relation to primary dataset
			stmt = "SELECT Product_Family_ID AS id, Product_Family_Desc AS name FROM Product_Family";
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt));

			// JUST A DEMO: in real world it should contain "technician inventory warehouse" (by technician ID)  
			stmt = "SELECT Product_ID as id, Product_Desc as name, * FROM Product";  // + where... se above   
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt));

			return Ok(businessObject);
		}


		//====================================================================================================
		[HttpGet("ShoppingCart")]
		public IActionResult ShoppingCart(uBusinessObject businessObject)
		{
			uApp.Loger("ServiceCallController, ShoppingCart API");

			businessObject.actions = new List<uActionLink>();

			businessObject.datasets = new List<uDatasets>();

			// Primary dataset goes FIRST!
			string stmt = $"SELECT * FROM Cart_Detail_Line WHERE Cart_Header_Line_pKey='{businessObject.view_key_value}' ORDER BY pKey";
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt, "Cart_Header_Line_pKey", "Work_Order_PKey", businessObject.view_key_value));

			stmt = $"SELECT * FROM VU_Cart_Detail_Line_Extended WHERE Cart_Header_Line_pKey='{businessObject.view_key_value}' ORDER BY pKey";
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt, "Cart_Header_Line_pKey", "Work_Order_PKey", businessObject.view_key_value));

			// Combo box content with no relation to primary dataset
			stmt = "SELECT Product_Family_ID AS id, Product_Family_Desc AS name FROM Product_Family";
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt));

			// JUST A DEMO: in real world it should contain "technician inventory warehouse" (by technician ID)  
			stmt = "SELECT Product_ID as id, Product_Desc as name, * FROM Product";  // + where businessObject.parent_key_value (not view_key_value)...    
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt));

			//businessObject.parent_view = System.IO.Path.GetFileName(HttpContext.Request.Path.Value);
			return Ok(businessObject);
		}


		//====================================================================================================
		//[HttpPost("Upload"), DisableRequestSizeLimit]
		//public IActionResult Upload()
		//{
		//	string userName = GetCallerLoginName();

		//	if (Request.Form.Files.Count < 1)
		//	{
		//		uApp.Loger($"*** Upload file Error: Caller={userName}, No files recieved");
		//		return BadRequest();
		//	}

		//	IFormFile file = Request.Form.Files[0];
		//	long fileSize = file.Length;
		//	string fileName = file.Name;
		//	uApp.Loger($"Upload file request: Caller={userName}, {fileName}, Size: {fileSize}");

		//	string strFilePath = uApp.m_homeDirectory + "/uploads/" + fileName;

		//	string dirPath = uFile.GetDirPath(strFilePath);
		//	if (dirPath == "") return BadRequest();

		//	if (!uFile.CreateDirectory(dirPath)) return BadRequest();

		//	if (!CreateFile(file, strFilePath)) return BadRequest();

		//	uApp.Loger("Uploaded 1 files");
		//	return Ok();
		//}
	}
}

