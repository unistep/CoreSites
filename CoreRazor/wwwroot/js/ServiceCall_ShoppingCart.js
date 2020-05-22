

//=================================================================================
$(document).ready(function ()
{
	$("#Product_Family_ID").on("change", function () { productFamilyChanged(); });
	$("#Product_ID").on("change", function () { productChanged(null); });
	$("#Product_Sale_Price").on("change", function () { productSalePriceChanged(null); });
	$("#Product_Sale_Quantity").on("change", function () { productSalePriceChanged(null); });

	g_auto_update = true; // Binding procedure should sync data with server
	bindData();
});


//=================================================================================
function afterBinding() {
	var cartRow = g_primary_dataset.dataset_content[g_record_position];
	var productRows = getProductRows('//*[Product_ID="' + cartRow.Product_ID + '"]');

	$('#Product_Family_ID').val(productRows.length == 0 ? '' : productRows[0].Product_Family_ID);
	$('#Product_Family_ID').trigger('change');

	$('#Product_ID').val(cartRow.Product_ID);
	$('#Product_ID').trigger('change');
}


//=================================================================================
function productFamilyChanged() {
	productFamilyID = $("#Product_Family_ID").val();

	productRows = getProductRows('//*[Product_Family_ID="' + productFamilyID + '"]');

	initializeSelect2Element("#Product_ID", productRows, false); // false: with no empty option
}


//=================================================================================
function productChanged() {
	product_id = $('#Product_ID').val();
	productRows = getProductRows('//*[Product_ID="' + product_id + '"]');

	$('#Product_Name').val(productRows.length == 0 ? '' : productRows[0].Product_Name);
	$('#Product_Unit_Price').val(productRows.length == 0 ? '0.00' : productRows[0].Product_Unit_Price);

	if (g_on_binding) return;

	$('#Product_Sale_Price').val(productRows.length == 0 ? '0.00' : productRows[0].Product_Unit_Price);
	$('#Product_Sale_Quantity').val('1');
	$('#Cart_Row_Total_Price').val(productRows.length == 0 ? '0.00' : productRows[0].Product_Unit_Price);
}


//=================================================================================
function productSalePriceChanged() {
	productSalePrice = document.getElementById("Product_Sale_Price").value;
	if (!productSalePrice) {
		productSalePrice = document.getElementById("Product_Unit_Price").value;
		document.getElementById("Product_Sale_Price").value = productSalePrice;
	}

	productSaleQuantity = document.getElementById("Product_Sale_Quantity").value;
	if (!productSaleQuantity) {
		productSaleQuantity = "1";
		document.getElementById("Product_Sale_Quantity").value = productSaleQuantity;
	}

	document.getElementById("Cart_Row_Total_Price").value =
		sprintf ("%.2f", productSaleQuantity * productSalePrice);
}


//=================================================================================
function getProductRows(template) {
	dataset = getDataset("Product");
	if (!dataset) return "[]";

	return JSON.search(dataset.dataset_content, template);
}
