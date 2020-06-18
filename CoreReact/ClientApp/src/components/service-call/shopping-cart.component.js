
import React  from 'react';
import { Redirect } from "react-router-dom";

import Select from 'react-select';
import { InputRow } from '../../lib/templates/input-row.component';
import './service-call.component.scss';
import { BaseFormComponent } from '../../lib/templates/BaseFormComponent'
import '../service-call/splitter.css'
import * as splitter from '../service-call/splitter';

import { translate } from '../../lib/services/u-language-codes.service';

import * as $ from 'jquery';

export class ShoppingCart extends BaseFormComponent {
    selectedProductFamily = {};
    selectedProduct = {};
    productFamily = [];
    product = [];
    state = {
        inited: false,
        redirect: null
    };

    constructor(props) {
        super(props);

        this.setThis(this);

        this.componentDidMount = this.componentDidMount.bind(this);
        this.genericActionNew = this.genericActionNew.bind(this);
        this.genericActionDelete = this.genericActionDelete.bind(this);
        this.genericActionExit = this.genericActionExit.bind(this);
        this.productFamilyChanged = this.productFamilyChanged.bind(this);
        this.productChanged = this.productChanged.bind(this);

    }

    //=================================================================================
    componentDidMount() {
        var splitterX = splitter;
        splitterX.dragElement(document.getElementById("seperator"), "H");
        this.setsScreenProperties();

        const query = new URLSearchParams(this.props.location.search);
        const viewKeyValue = query.get('view_key_value');
        this.udb.recordPosition = parseInt(query.get('parent_position'));

        this.ufw.ShoppingCart(shoppingCartResponse, viewKeyValue);

        const self = this;
        function shoppingCartResponse(response) {
            self.getFormData(response);
		}
    }


    //=================================================================================
    getFormData(response) {
        this.formInit(response, true, this, ".rframe");

        $("#Product_Sale_Price").change(this.productSalePriceChanged.bind(this));
        $("#Product_Sale_Quantity").change(this.productSalePriceChanged.bind(this));
        $("#Product_Sale_Price").attr("readonly", false);
        $("#Product_Sale_Quantity").attr("readonly", false);
    }


    //=================================================================================
    afterBinding() {
        const cartRow = this.udb.primary_dataset.dataset_content[this.udb.recordPosition];
        const productRow = this.udb.getDatasetRow('Product', 'id', cartRow.Product_ID)

        const dataset = this.udb.getDataset('Product_Family');
        this.productFamily = dataset.dataset_content;
        const name = this.ugs.uTranslate("Product_Family");
        this.productFamily.splice(0, 0, { id: '', name });

        if (!productRow) this.selectedProductFamily = this.productFamily[0];
        else this.selectedProductFamily = this.udb.getDatasetRow('Product_Family', 'id', productRow.Product_Family_ID);
        this.productFamilyChangedX();

        if (!productRow) this.selectedProduct = this.product[0];
        else this.selectedProduct = this.udb.getDatasetRow('Product', 'id', productRow.id);
        this.productChangedX();

        this.setState({ inited: true, redirect: null });
    }

    //=================================================================================
    productChangedX() {
        console.log("productChangedX: " + this.selectedProduct.id)
        $('#Product_ID').val(!this.selectedProduct ? '' : this.selectedProduct.id);
        $('#Product_Unit_Price').val(!this.selectedProduct ? '0.00' : this.selectedProduct.Product_Unit_Price);

        if (this.udb.on_binding) return;
        $('#Product_Sale_Price').val(!this.selectedProduct.id ? '0.00' : this.selectedProduct.Product_Unit_Price);
        $('#Product_Sale_Quantity').val('1');
        $('#Cart_Row_Total_Price').val(!this.selectedProduct.id ? '0.00' : this.selectedProduct.Product_Unit_Price);
    }

    //=================================================================================
    productChanged = selectedProduct => {
        this.selectedProduct = selectedProduct;
        this.productChangedX();
        this.setState({ inited: true, redirect: null });
    }

    //=================================================================================
    productSalePriceChanged() {
        let productSalePrice = $("#Product_Sale_Price").val();
        if (!productSalePrice) {
            productSalePrice = $("#Product_Unit_Price").val();
            $("#Product_Sale_Price").val(productSalePrice);
        }
        let productSaleQuantity = $("#Product_Sale_Quantity").val();
        if (!productSaleQuantity) {
            productSaleQuantity = "1";
            $("#Product_Sale_Quantity").val(productSaleQuantity);
        }

        const totalAmount = (productSaleQuantity * productSalePrice);

        $("#Cart_Row_Total_Price").val(totalAmount/*.toLocaleString('he', { style: 'currency', currency: 'ILS' })*/);
    }


    //=================================================================================
    getSelectedValue(eidElement) {
        if (eidElement === 'Product_Family_ID')
            return (this.selectedProductFamily ? this.electedProductFamily.id : '');

        if (eidElement === 'Product_Desc')
            return (this.selectedProduct ? this.selectedProduct.id : '');

        return '';
    }

    //=================================================================================
    setSelectedValue(eidElement, itemID) {
        if (eidElement === 'Product_Family_ID')
            this.selectedProductFamily = this.product.filter(function (item) { return item.id === itemID; })[0];

        if (eidElement === 'Product_Desc')
            this.selectedProduct = this.produ3ctFamily.filter(function (item) { return item.id === itemID; })[0];
    }

    //=================================================================================
    genericActionNew(action) {
        this.udb.genericActions("New");
    }

    //=================================================================================
    genericActionDelete(action) {
        this.udb.genericActions("Delete");
    }

    //=================================================================================
    genericActionExit(action) {
        if (!this.udb.onAboutToNavigate()) return;

        const query = new URLSearchParams(this.props.location.search);

        var parent_view = query.get('parent_view');
        const view_key_value = query.get('view_key_value');
        var view_position = query.get('parent_position');
        var view_tab = query.get('parent_tab');

        const url = `/${parent_view}?`
            + `view_key_value=${view_key_value}&`
            + `view_position=${view_position}&`
            + `view_tab=${view_tab}`;

        this.setState({
            inited: false, redirect: url
        });
    }

    //=================================================================================
    productFamilyChangedX() {
        const productFamilyID = (this.selectedProductFamily.id ? this.selectedProductFamily.id : '');
        this.product = this.udb.getDatasetRowsArray('Product', 'Product_Family_ID', productFamilyID);
        const name = this.ugs.uTranslate("Product");
        this.product.splice(0, 0, { id: '', name });
    }

    //=================================================================================
    productFamilyChanged = selectedProductFamily => {
        if (this.udb.on_binding) return;

        this.selectedProductFamily = selectedProductFamily
        this.productFamilyChangedX();
        this.selectedProduct = this.product[0];
        this.productChangedX();
        this.setState({ inited: true, redirect: "" });
    }


    //==================================[RENDER]=======================================
    render() {
        if (this.state.redirect) {
            return <Redirect to={this.state.redirect} />
        }
        return (
            <div className="main_frame">
                <div className="splitter">
                    <div id="first">
                        <div className="lframe">
                            <div className="main_grid_wraper form-horizontal">
                                <table id="eid_main_table" className="main_grid" data-bind="VU_Cart_Detail_Line_Extended">
                                    <thead>
                                        <tr>
                                            <th className="width10" data-bind="Product_Name">
                                                <label>{translate('Product_Name')}</label>
                                            </th>
                                            <th className="width35" data-bind="Product_Desc">
                                                <label>{translate('Product_Desc')}</label>
                                            </th>
                                            <th className="width15" data-bind="Product_Sale_Quantity">
                                                <label>{translate('Product_Sale_Quantity')}</label>
                                            </th>
                                            <th className="width15" data-bind="Product_Sale_Price">
                                                <label>{translate('Product_Sale_Price')}</label>
                                            </th>
                                            <th className="width30" data-bind="Cart_Row_Total_Price">
                                                <label>{translate('Cart_Row_Total_Price')}</label>
                                            </th>
                                        </tr>
                                    </thead>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div id="seperator"></div>
                    <div id="second">
                        <div className="rframe">
                            <h3 style={{ textDecorationStyle: "solid" }}>{translate('ShoppingCart')}</h3>
                            <div className="tframe">
                                <div id="eid_cart_row" className="form-horizontal">
                                    <div className="row form-group col-12">
                                        <div className="col-4">
                                            <div className="input-group">
                                                <input type="button" className="btn btn-primary btn-block r_input"
                                                    value={translate('New')}
                                                    id="eid_btn_new" style={{ textAlign: "center" }}
                                                    onClick={this.genericActionNew} />
                                                <span className="input-group-addon">
                                                    <i className="fa fa-cart-plus icon-align-opposite"
                                                        style={{ color: "white" }} aria-hidden="true"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="input-group">
                                                <input type="button" className="btn btn-primary btn-block r_input"
                                                    value={translate('Delete')}
                                                    id="eid_btn_delete" style={{ textAlign: "center" }}
                                                    onClick={this.genericActionDelete} />
                                                <span className="input-group-addon">
                                                    <i className="fa fa-cart-arrow-down icon-align-opposite" style={{ color: "white" }} aria-hidden="true"></i>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="input-group">
                                                <input type="button" className="btn btn-primary btn-block r_input"
                                                    value={translate('Exit')}
                                                    id="eid_btn_exit" style={{ textAlign: "center" }}
                                                    onClick={this.genericActionExit} />
                                                <span className="input-group-addon">
                                                    <i className="fa fa-sign-out icon-align-opposite" style={{ color: "white" }} aria-hidden="true"></i>
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row form-group col-12">
                                        <label className="col-4 col-form-label label-align-opposite">{translate('Product_Family')}</label>
                                        <div className="col-8">
                                            <div className="input-group">
                                                <Select id='Product_Family_ID' placeholder={translate('Product_Family')}
                                                    value={this.selectedProductFamily}
                                                    onChange={this.productFamilyChanged}
                                                    getOptionLabel={option => option.name}
                                                    getOptionValue={option => option.id}
                                                    options={this.productFamily}
                                                    className="form-control r_input"
                                                />
                                                <i className="fa fa-group icon-align-opposite" aria-hidden="true"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row form-group col-12">
                                        <label className="col-4 col-form-label label-align-opposite">{translate('Product')}</label>
                                        <div className="col-8">
                                            <div className="input-group">
                                                <Select id='Product_Desc' placeholder={translate('Product')}
                                                    value={this.selectedProduct}
                                                    onChange={this.productChanged}
                                                    getOptionLabel={option => option.name}
                                                    getOptionValue={option => option.id}
                                                    options={this.product}
                                                    className="form-control r_input" />
                                                <i className="fa fa-group icon-align-opposite" aria-hidden="true"></i>
                                                <i className="fa fa-navicon icon-align-opposite" aria-hidden="true"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <InputRow label='Product_ID' elementID='Product_ID' icon='fa fa-cart-arrow-down'></InputRow>
                                    <InputRow label='Product_Unit_Price' elementID='Product_Unit_Price' boundColumn='Product_Sale_Price' icon='fa fa-money'></InputRow>
                                    <InputRow label='Product_Sale_Price' elementID='Product_Sale_Price' boundColumn='Product_Sale_Price' icon='fa fa-money'></InputRow>
                                    <InputRow label='Product_Sale_Quantity' elementID='Product_Sale_Quantity' boundColumn='Product_Sale_Quantity' icon='fa fa-arrows-v'></InputRow>
                                    <InputRow label='Cart_Row_Total_Price' elementID='Cart_Row_Total_Price' boundColumn='Cart_Row_Total_Price' icon='fa fa-ils'></InputRow>
                                </div>
                            </div>
                            <div id="navigatebar">
                            </div>
                        </div>
                    </div >
                </div>
            </div>
        );
    }
}
