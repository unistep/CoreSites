
import { Component } from 'react';

import ufwX from '../../lib/services/ufw-interface';
import ugsX from '../../lib/services/u-generics.service';
import udbX from '../../lib/services/u-db.service';
import gmapX from '../../lib/services/u-gmaps.service';

import * as $ from 'jquery';

export class BaseFormComponent extends Component {
    parentThis = null;

    primary_table_name = '';
    primary_table_columns = [];
    splitDir = localStorage.getItem('direction');

    ufx = null;
    ugs = null;
    udb = null;
    gmap = null;

    constructor() {
        super();

        this.ufw = ufwX;
        this.ugs = ugsX;
        this.udb = udbX;
        this.gmap = gmapX;
	}
    //===============================================
    setThis(pthis) {
        this.parentThis = pthis;
    }
    //===============================================
    formInit(scData, autoUpdate, caller, setNavBar) {
        this.udb.setNavigationBar(setNavBar);

        this.udb.prepareDatasets(scData);
        this.udb.auto_update = autoUpdate; // Binding procedure should auto sync data with server
        this.udb.bindData(caller);

        $('#eid_main_table tr td').click(this.mainTableClicked.bind(caller));
        this.setMainTableCursor();
    }

    setsScreenProperties() {
        this.ugs.setsScreenProperties();
    }

    //=================================================================================
    mainTableClicked(e) {
        if (!this.udb.onAboutToNavigate()) return;
        this.udb.recordPosition = e.currentTarget.parentNode.rowIndex - 1;
        this.udb.bindData(this.parentThis);
        this.setMainTableCursor();
    }
    //=================================================================================
    setMainTableCursor() {
        var table  = document.getElementById('eid_main_table');
        if (!table) return;
        var row = null;
        var cells = table.getElementsByTagName('td');

        for (var i = 0; i < cells.length; i++) {
            cells[i].classList.remove('high-light');
        }
        if (!this.udb.recordPosition) this.udb.recordPosition = 0;
        if (this.udb.recordPosition >= (table.rows.length - 1)) this.udb.recordPosition = table.rows.length - 2;
        var idx = this.udb.recordPosition + 1;
        row = table.rows[idx];
        cells = row.getElementsByTagName('td');
        for (var j = 0; j < cells.length; j++) {
            cells[j].classList.add('high-light');
        }
    }
 }

