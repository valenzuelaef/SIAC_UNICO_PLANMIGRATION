(function ($, undefined) {

    'use strict';

    var Form = function ($element, options) {
        $.extend(this, $.fn.FormChoosePlan.defaults, $element.data(), typeof options === 'object' && options);

        this.setControls({
            form: $element,
            btnClean:               $('#btnClean', $element),
            cboFilter:              $('.cboFilter', $element),
            cboStatusFilter:        $('#cboStatusFilter', $element),
            cboCampaignFilter:      $('#cboCampaignFilter', $element),
            cboSolutionFilter:      $('#cboSolutionFilter', $element),
            tblPlans:               $('#tblPlans', $element),
            txtSearch:              $('#txtSearch', $element),
            cboPageLength:          $('#cboPageLength', $element),

            
        });
    }

    Form.prototype = {
        constructor: Form,

        init: function () {
            var that = this;
            var controls = this.getControls();            
            that.render();
        },

        render: function () {
            var that = this,
                controls = this.getControls();
  
            that.loadPlansDataTable();

            controls.cboFilter.addEvent(that, 'change', that.onChangeFilter);
            controls.cboPageLength.addEvent(that, 'change', that.onChangePageLength);
            controls.btnClean.addEvent(that, 'click', that.btnClean_Click);
            controls.txtSearch.addEvent(that, 'keyup', that.searchByDescription);

        },

        planMigrationSession: {},

        getControls: function () {
            return this.m_controls || {};
        },

        setControls: function (value) {
            this.m_controls = value;
        },

        dropdownFormat: function (arr, property) {

            return arr.map(
                function (obj) {
                    return obj[property]
                })
                .filter(function (v, i, a) {
                    return a.indexOf(v) === i
                })
                .sort()
                .map(function (value) {
                    return { Id: value, Desc: value, attributes: {} }
                });
        },

        onChangePageLength: function () {

            var that = this,
                controls = that.getControls();

            var $select = event.target ? $(event.target) : $(event.srcElement);
            var $optionSelect = $select.find('option:selected');

            var table = controls.tblPlans.DataTable();
            table.page.len($optionSelect.val()).draw();

        },

        searchByDescription: function () {

            var that = this,
                controls = that.getControls();

            var table = controls.tblPlans.DataTable();
            var $input = event.target ? $(event.target) : $(event.srcElement);

            table.search($input.val()).draw();
        },
        
        onChangeFilter: function () {

            var that = this,
                controls = that.getControls();
            var dataSource;

            var dataSourceStatusCampaign;
            if (controls.cboStatusFilter.val() == 'ALL') {
                dataSourceStatusCampaign = that.planMigrationSession.FixedPlan;
            } else {
                dataSourceStatusCampaign = that.planMigrationSession.FixedPlan.filter(function (item) {
                                                    return item.PlanStatus == controls.cboStatusFilter.val()
                                                });
            }

            var $select = event.target ? $(event.target) : $(event.srcElement);

            if ($select.attr('id') == 'cboStatusFilter') {
                var solutionFilter = that.dropdownFormat(dataSourceStatusCampaign, 'SolutionDescription');
                var campaignFilter = that.dropdownFormat(dataSourceStatusCampaign, 'CampaignDescription');
                solutionFilter.unshift({ Id: 'ALL', Desc: 'Todos', attributes: {} });
                campaignFilter.unshift({ Id: 'ALL', Desc: 'Todos', attributes: {} });

                controls.cboSolutionFilter.populateDropDown(solutionFilter);
                controls.cboCampaignFilter.populateDropDown(campaignFilter);
                }

            if ($select.attr('id') == 'cboCampaignFilter') {

                if (controls.cboStatusFilter.val() == 'ALL') {
                    dataSourceStatusCampaign = dataSourceStatusCampaign.filter(function (item) {
                        return item.CampaignDescription == controls.cboCampaignFilter.val()
                    });
                } else {
                    dataSourceStatusCampaign = that.planMigrationSession.FixedPlan.filter(function (item) {
                        return item.CampaignDescription == controls.cboCampaignFilter.val() && item.vigencia == controls.cboStatusFilter.val()
                    });
                }
  
                var solutionFilter = that.dropdownFormat(dataSourceStatusCampaign, 'SolutionDescription');
                solutionFilter.unshift({ Id: 'ALL', Desc: 'Todos', attributes: {} });
                controls.cboSolutionFilter.populateDropDown(solutionFilter);              
            }          

            dataSource = dataSourceStatusCampaign;
   
            $.each(controls.cboFilter, function (idx, cbo) {

                var filter = $(cbo).attr('data-filter');
                var value = $(cbo).find('option:selected').val();

                if (value !== 'ALL') {
                    dataSource = dataSource.filter(function (obj) {
                        return obj[filter] == value
                    });
                }
            });

            controls.tblPlans.dataTable().fnClearTable();
            controls.tblPlans.dataTable().fnAddData(dataSource);
            
        },
        
        loadPlansDataTable: function () {
          
            var that = this,
               controls = that.getControls();

            var parameters = {};
            parameters.ContratoId = Session.ContratoId,
            parameters.IdTransaccion = Session.idTransactionFront;//"1";
            parameters.IdProceso = "1";
            //parameters.IdProducto = "5";// Listar Campañas FTTH - Codigo: 5
            //parameters.tecnologia = "5";// Listar Campañas FTTH - Codigo: 5
            parameters.IdProducto = Session.Product;// Listar Campañas FTTH - Codigo: 5
            parameters.tecnologia = Session.Technology;// Listar Campañas FTTH - Codigo: 5
            parameters.oferta = Session.Offert;
            parameters.oficina = Session.oficina;
            parameters.oficinaDefault = Session.oficinaDefault;
            parameters.flagEjecucion = Session.FlagEjecucion;


            var dataPlanes = [];
            var urlBase = '/PlanMigration/Home/GetPlanesMigracion';
            that.loadDataTable(dataPlanes, 'Cargando...');
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                url: urlBase,
                data: JSON.stringify(parameters),
                async: true,
                success: function (response) {
                    //debugger;
                    if (response.success) {

                        if (Session.plataformaAT === 'ASIS') {

                            if (Session.Technology == '9')
                                response.data = response.data.filter(function (x) { return x.CampaignDescription.indexOf('FTTH') > -1 });
                        else
                            response.data = response.data.filter(function (x) { return x.CampaignDescription.indexOf('FTTH') == -1 });
                        }
                        $.each(response.data, function (index, value) {
                            var vigencia = '';
                            var fecCurrent = new Date();

                            var CampaignStartDate = value.CampaignStartDate.substring(0, 9).split('-');
                            var CampaignEndDate = value.CampaignEndDate.substring(0, 9).split('-');
                            var fecStart = new Date(CampaignStartDate[0], CampaignStartDate[1], CampaignStartDate[2]);
                            var fecEnd = new Date(CampaignEndDate[0], CampaignEndDate[1], CampaignEndDate[2]);


                            if (fecStart <= fecCurrent && fecCurrent <= fecEnd)
                                vigencia = 'Sí';
                            else
                                vigencia = 'No';

                            var feed =
                                {
                                    PlanCode: value.PlanCode,
                                    PlanDescription: value.PlanDescription,
                                    CampaignDescription: value.CampaignDescription,
                                    SolutionDescription: value.SolutionDescription,
                                    PlanStatus: value.PlanStatus,
                                    TMCode: value.TMCode,
                                    vigencia: vigencia
                                };

                            dataPlanes.push(feed);

                        
                        });
                        Session.FixedPlan = dataPlanes;

                        Session.FixedPlan = Session.FixedPlan.map(function (plan) {
                            plan.PlanStatus = plan.vigencia == 'Sí' ? 'Sí' : 'No';
                            return plan;
                        });

                        that.planMigrationSession.FixedPlan = Session.FixedPlan;

                        var dataSource = that.planMigrationSession.FixedPlan;
                        var statusFilter = that.dropdownFormat(dataSource, 'PlanStatus');
                        var solutionFilter = that.dropdownFormat(dataSource, 'SolutionDescription');
                        var campaignFilter = that.dropdownFormat(dataSource, 'CampaignDescription');

                        statusFilter.unshift({ Id: 'ALL', Desc: 'Todos', attributes: {} });
                        solutionFilter.unshift({ Id: 'ALL', Desc: 'Todos', attributes: {} });
                        campaignFilter.unshift({ Id: 'ALL', Desc: 'Todos', attributes: {} });


                        controls.cboStatusFilter.populateDropDown(statusFilter);
                        controls.cboSolutionFilter.populateDropDown(solutionFilter);
                        controls.cboCampaignFilter.populateDropDown(campaignFilter);


                        that.loadDataTable(dataSource,'')
                            }
                    else
                    {
                        alert("No se encontraron planes.");
                        that.loadDataTable(dataPlanes, 'No se encontraron datos.');

                    }


                },
                error: function (ex) {
                    alert("Error al consultar los planes. Por favor intente nuevamente.");
                    that.loadDataTable(dataPlanes, 'No se encontraron datos.');
                }

            });


          
            
            
        },
        loadDataTable: function (dataSource,text) {
            var that = this,
                controls = that.getControls();
            var strUrlLogo = window.location.protocol + '//' + window.location.host + '/Content/images/SUFija/loading_Claro.gif';
            controls.tblPlans.DataTable({
                'pagingType': 'full_numbers',
                'scrollY': '200px',
                'scrollCollapse': true,
                'processing': true,
                'serverSide': false,
                'paging': true,
                'pageLength': 10,
                'destroy': true,
                'searching': true,
                'language': {
                    //'lengthMenu': 'Mostrar _MENU_ registros por página.',
                    'zeroRecords': text,
                    'loadingRecords': '&nbsp;',
                    'processing': '<img src= "' + strUrlLogo +' " width="25" height="25" /> Cargando ... </div>',
                    'info': ' ',
                    'infoEmpty': ' ',
                    'infoFiltered': '(Filtrado de _MAX_ registros)',
                    'search': 'Busqueda General',
                    'oPaginate': {
                        'sFirst': 'Primero',
                        'sPrevious': 'Anterior',
                        'sNext': 'Siguiente',
                        'sLast': 'Último'
                    },
                    'emptyTable': text
                },
                'data': dataSource
                ,
                'columns': [
                    { 'orderable': false, 'data': null, className: 'select-radio', 'defaultContent': '', render: function (data) { return '&nbsp'; } },
                    { 'orderable': true, order: 'asc', 'data': 'PlanDescription', 'defaultContent': '' },

                    { 'data': 'PlanDescription', 'defaultContent': '' },
                    { 'data': 'CampaignDescription', 'defaultContent': '' },
                    { 'data': 'SolutionDescription', 'defaultContent': '' },
                    { 'data': 'vigencia', 'defaultContent': '' }
                ],
                'columnDefs': [
                   { 'targets': -1, 'className': 'text-center' },
                   { 'targets': 1, 'bVisible': false },
                ],
                'bLengthChange': false,
                select: {
                    style: 'os',
                    info: false
                }
            });

            $('.dataTables_filter').hide();
        },
       
        btnClean_Click: function () {

            var that = this,
                controls = that.getControls();

            $.each(controls.cboFilter, function (idx, cbo) { $(cbo).val('ALL'); });
            that.onChangeFilter();
        },

    }

    $.fn.FormChoosePlan = function () {
        var option = arguments[0],
            args = arguments,
            value,
            allowedMethods = [];

        this.each(function () {
            var $this = $(this),
                data = $this.data('FormChoosePlan'),
                options = $.extend({}, $.fn.FormChoosePlan.defaults,
                    $this.data(), typeof option === 'object' && option);

            if (!data) {
                data = new Form($this, options);
                $this.data('FormChoosePlan', data);
            }

            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0) {
                    throw 'Unknown method: ' + option;
                }
                value = data[option](args[1]);
            } else {
                data.init();
                if (args[1]) {
                    value = data[args[1]].apply(data, [].slice.call(args, 2));
                }
            }
        });

        return value || this;
    };

    $.fn.FormChoosePlan.defaults = {
    }

    $('#divChoosePlan', $('.modal:last')).FormChoosePlan();

})(jQuery, null);
