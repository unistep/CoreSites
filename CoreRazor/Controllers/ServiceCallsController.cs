
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using System;
using System.Collections.Generic;

using CoreBase.Models;

namespace CoreRazor.Controllers
{
	[AllowAnonymous]
    public class ServiceCallsController : Controller
	{
		[HttpGet]
		//====================================================================================================
		public ActionResult ServiceCall(uBusinessObject businessObject)
        {
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
			stmt = "SELECT Product_Family_ID AS id, Product_Family_Desc AS text FROM Product_Family";
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt));

			// JUST A DEMO: in real world it should contain "technician inventory warehouse" (by technician ID)  
			stmt = "SELECT Product_ID as id, Product_Desc as text, * FROM Product";  // + where... se above   
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets (stmt));

			return this.View(businessObject);
        }


		[HttpGet]
		//====================================================================================================
		public ActionResult ServiceCall_ShoppingCart(uBusinessObject businessObject)
		{
			businessObject.actions = new List<uActionLink>();

			((List<uActionLink>)businessObject.actions).Add(new uActionLink { action = "New", controller = "", prompt = "New" });
			((List<uActionLink>)businessObject.actions).Add(new uActionLink { action = "Delete", controller = "", prompt = "Delete" });
			((List<uActionLink>)businessObject.actions).Add(new uActionLink { action = "Exit", controller = "", prompt = "Exit" });

			businessObject.datasets = new List<uDatasets>();

			// Primary dataset goes FIRST!
			string stmt = $"SELECT * FROM Cart_Detail_Line WHERE Cart_Header_Line_pKey='{businessObject.view_key_value}'";
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt, "Cart_Header_Line_pKey", "Work_Order_PKey", businessObject.view_key_value));

			// Combo box content with no relation to primary dataset
			stmt = "SELECT Product_Family_ID AS id, Product_Family_Desc AS text FROM Product_Family";
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt));

			// JUST A DEMO: in real world it should contain "technician inventory warehouse" (by technician ID)  
			stmt = "SELECT Product_ID as id, Product_Desc as text, * FROM Product";  // + where businessObject.parent_key_value (not view_key_value)...    
			((List<uDatasets>)businessObject.datasets).Add(new uDatasets(stmt));

			string viewName = System.IO.Path.GetFileName(HttpContext.Request.Path.Value);
			return View(viewName, businessObject);
		}
	}
}
