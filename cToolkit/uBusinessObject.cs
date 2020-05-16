
using System.Collections.Generic;

namespace uToolkit
{
	public class uBusinessObject
	{
		public string inner_partial_view { get; set; }
		public string view_key_value { get; set; }
		public string view_position { get; set; }
		public string view_tab { get; set; }

		public string parent_key_value { get; set; }
		public string parent_view { get; set; }
		public string parent_position { get; set; }
		public string parent_tab { get; set; }

		public List<uActionLink> actions { get; set; }
		public List<uDatasets> datasets { get; set; }
	}


	//====================================================================================================
	public class uActionLink
    {
		public string action { get; set; }
		public string controller { get; set; }
		public string prompt { get; set; }
	}


	//====================================================================================================
	public class uDatasets
	{
		public string dataset_name { get; set; }
		public string dataset_format { get; set; }  // Actually, column types
		public string dataset_content { get; set; }   // As json
		public string primary_key_fields { get; set; }
		public string foreign_key_field { get; set; }
		public string parent_key_field { get; set; }  // might be set to parent primary key as default
		public string foreign_key_value { get; set; } // For primary business objects only


		//====================================================================================================
		public uDatasets(string _stmt)
		{
			Initialize(_stmt, "", "", "");
		}


		//====================================================================================================
		public uDatasets(string _stmt, string _foreign_key_field, string _parent_key_field)
		{
			Initialize(_stmt, _foreign_key_field, _parent_key_field, "");
		}


		//====================================================================================================
		public uDatasets(string _stmt, string _foreign_key_field, string _parent_key_field, string _foreign_key_value)
		{
			Initialize(_stmt, _foreign_key_field, _parent_key_field, _foreign_key_value);
		}


		//====================================================================================================
		public void Initialize(string _stmt, string _foreign_key_field, string _parent_key_field, string _foreign_key_value)
		{
			foreign_key_field	= _foreign_key_field;
			parent_key_field	= _parent_key_field;
			foreign_key_value	= _foreign_key_value;

			dataset_name		= uDB.GetTableNameOutOfStatement(_stmt);
			primary_key_fields	= uDB.GetPrimaryKeysForTable(dataset_name);
			//if (string.IsNullOrEmpty(primary_key_fields)) primary_key_fields = "pKey";

			string format		= "";
			dataset_content		= uDB.GetJsonRecordSet(_stmt, ref format);
			dataset_format		= format;
		}
	}
}
