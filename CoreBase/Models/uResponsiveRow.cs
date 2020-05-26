
namespace CoreBase.Models
{
	public class uResponsiveRow
    {
		public	string	elementID	{ get; set; }
		public	string	boundColumn	{ get; set; }
		public	string	promptName	{ get; set; }
		public	string	iconName	{ get; set; }
		public	string	datasetName	{ get; set; }
		public	string	inputType	{ get; set; }
		public	string	attributes	{ get; set; }

		public uResponsiveRow()
		{
			elementID	= "";
			boundColumn = "";
			promptName	= "";
			iconName	= "";
			datasetName = "";
			inputType	= "text";
			attributes = "";
		}
	}
}
