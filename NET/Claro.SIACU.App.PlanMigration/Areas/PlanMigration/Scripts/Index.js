(function ($, undefined) {

    'use strict';

    var Form = function ($element, options) {
        $.extend(this, $.fn.PlanMigration.defaults, $element.data(), typeof options === 'object' && options);

        this.setControls({
            form: $element,
            container: $('#containerPlanMigration', $element),
            divCustomerInformation: $('#divCustomerDataView', $element),
            stepsContainer: $('.process-row-step', $element),
            btnStep: $('.next-step'),

            divFooterInfoSot: $('.footer-info-sot'),
            btnPrevStep: $('.prev-step'),
            btnConstancy: $('#btnConstancy'),

            btnSave: $('.Save-step'),
        });
    }

    Form.prototype = {
        constructor: Form,

        init: function () {
            var that = this;
            that.render();
        },

        render: function () {
            var that = this,
                controls = this.getControls();

            moment.locale('es');
            that.timer();
            that.planMigrationInit();
            that.planMigrationSession.TelephonyValuePrev = '';
            that.planMigrationSession.intCampania = 0;
            controls.hidFlagCampaniaColab = $("#hidFlagCampaniaColab").val();
            controls.hidCodCampaniaColab = $("#hidCodCampaniaColab").val();
            controls.hidMsgErrorConsultCam = $("#hidMsgErrorConsultCam").val();
        },

        getControls: function () {
            return this.m_controls || {};
        },

        setControls: function (value) {
            this.m_controls = value;
        },

        resizeContent: function () {
            var controls = this.getControls();
            $('#navbar-body').css('height', $(window).outerHeight() - $('#main-header').outerHeight() - $('#main-footer').outerHeight());
        },

        updateControl: function (object) {

            for (var prop in object) {
                if (typeof this.m_controls[prop] == 'undefined') {
                    this.m_controls[prop] = object[prop];
                }
            }
        },

        timer: function () {

            var that = this,
                controls = that.getControls();

            that.resizeContent();
            var time = moment().format('DD/MM/YYYY hh:mm:ss a');
            $('#idSession').html(string.format('Session ID: {0} &nbsp&nbsp {1}', Session.UrlParams.IdSession, time));
            var t = setTimeout(function () { that.timer() }, 500);
        },

        /* Metodos Carga Información */

        planMigrationSession: {},

        getFechaActual: function () {
            var that = this;
            var d = new Date();
            var FechaActual = that.AboveZero(d.getDate()) + "/" + (that.AboveZero(d.getMonth() + 1)) + "/" + d.getFullYear();
            return FechaActual;
        },

        //JFlores
        getFechaActualMas1: function () {
            var that = this;
            var d = new Date();
            var FechaActual = that.AboveZero(d.getDate() + 1) + "/" + (that.AboveZero(d.getMonth() + 1)) + "/" + d.getFullYear();
            return FechaActual;
        },

        getHoraActual: function () {
            var that = this;
            var d = new Date();
            var HoraActual = that.AboveZero(d.getHours()) + ":" + (that.AboveZero(d.getMinutes() + 1)) + ":" + d.getSeconds();
            return HoraActual;
        },

        AboveZero: function (i) {

            if (i < 10) {
                i = '0' + i;
            }
            return i;
        },

        planMigrationInit: function () {
            var that = this,
                controls = that.getControls();

            controls.btnSave.addEvent(that, 'click', that.Save_click);

            //Session.SessionParams.DATACUSTOMER.ContractID = "13326803";
            //Session.SessionParams.DATACUSTOMER.CustomerID = "36248101";
            debugger;
            var plataformaAT = !$.string.isEmptyOrNull(Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT) ? Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT : '';
            var idTransactionFront = $.app.getTypeClientAsIsOrToBe(plataformaAT, '1', '9');

            //var customerPromise = that.customerInformationPromise(controls.divCustomerInformation);
            var customerInformationPromise = $.reusableViews.viewOfTheLeftSide(controls.divCustomerInformation);
            var initialConfigurationPromise = $.app.transactionInitialConfigurationPromise(Session.SessionParams, idTransactionFront);
            Promise.all([customerInformationPromise, initialConfigurationPromise])
                .then(function (res) {

                    var initialConfiguration = res[1].oInitialDataResponse.MessageResponse.Body,
                        AdditionalFixedData = res[1].oDatosAdi.MessageResponse.Body,
                        AuditRequest = res[1].oAuditRequest,

                        Configuraciones = res[1].oConfiguraciones,


                        CoreServices = initialConfiguration.CoreServices || {},
                        AdditionalServices = initialConfiguration.AdditionalServices || {},
                        Igv = initialConfiguration.Igv,
                        CustomerInformation = initialConfiguration.CustomerInformation || {},
                        PuntoAtencion = initialConfiguration.PuntoAtencion || {},
                        DatosUsuarioCtaRed = initialConfiguration.obtenerDatosUsuarioCuentaRed || {},
                        OficinaVentaUsuario = initialConfiguration.obtenerOficinaVentaUsuario || {},
                        Configuration = AdditionalFixedData.servicios.configuracionesfija_obtenerConfiguraciones || {},
                        Tipificacion = AdditionalFixedData.servicios.tipificacionreglas_obtenerInformacionTipificacion || {},
                        Instalacion = AdditionalFixedData.servicios.datosinstalacioncliente_obtenerDatosInstalacion || {},
                        FixedPlan = AdditionalFixedData.servicios.FixedPlan || {},
                        FixedPlanDetail = AdditionalFixedData.servicios.FixedPlanDetail || {},
                        ValidarTransaccion = AdditionalFixedData.servicios.consultatransaccionfija_validarTransaccion || {},
                        Programacion = AdditionalFixedData.servicios.gestionprogramacionesfija_validarTareasProgramadas || {},
                        AuditRequest = AuditRequest || {};

                    that.planMigrationSession.Data = {};
                    // Set Configuration 
                    that.planMigrationSession.Configuration = {};

                    // Current Selected Information
                    that.planMigrationSession.Current = {};
                    that.planMigrationSession.Data.idTransactionFront = idTransactionFront;
                    that.planMigrationSession.Data.plataformaAT = plataformaAT;
                    that.planMigrationSession.Data.FixedPlan = (FixedPlan.CodeResponse == '0') ? FixedPlan.PlanList : [];
                    that.planMigrationSession.Data.FixedPlanDetail = (FixedPlanDetail.CodeResponse == '0') ? FixedPlanDetail.DetailList : [];
                    that.planMigrationSession.Data.CustomerInformation = (CustomerInformation.CodeResponse == '0') ? CustomerInformation.CustomerList[0] : [];
                    that.planMigrationSession.Data.CoreServices = (CoreServices.CodeResponse == '0') ? CoreServices.ServiceList : [];
                    that.planMigrationSession.Data.AdditionalServices = (AdditionalServices.CodeResponse == '0') ? AdditionalServices.AdditionalServiceList : [];
                    that.planMigrationSession.Data.AdditionalEquipment = (AdditionalServices.CodeResponse == '0') ? AdditionalServices.AdditionalEquipmentList : [];
                    that.planMigrationSession.Data.ListIgv = (Igv.CodeResponse == '0') ? Igv.listaIGV : [];
                    that.planMigrationSession.Data.Configuration = (Configuration.CodeResponse == '0') ? Configuration.ProductTransaction.ConfigurationAttributes : [];
                    //FIRU
                    that.planMigrationSession.Data.ValidarTransaccion = (ValidarTransaccion.ResponseAudit.CodigoRespuesta == '0') ? ValidarTransaccion.ResponseData : [];

                    that.planMigrationSession.Data.Instalacion = (Instalacion.codigoRespuesta == '0') ? Instalacion : [];
                    that.planMigrationSession.Data.PuntoAtencion = (PuntoAtencion.CodigoRespuesta == '0') ? PuntoAtencion.listaRegistros : [];
                    that.planMigrationSession.Data.DatosUsuarioCtaRed = (DatosUsuarioCtaRed.CodigoRespuesta == '0') ? DatosUsuarioCtaRed.listaDatosUsuarioCtaRed : [];
                    that.planMigrationSession.Data.OficinaVentaUsuario = (OficinaVentaUsuario.CodigoRespuesta == '0') ? OficinaVentaUsuario.listaOficinaVenta : [];
                    that.planMigrationSession.Data.Tipificacion = (Tipificacion.CodigoRespuesta == '0') ? Tipificacion.listaTipificacionRegla : [];
                    that.planMigrationSession.Data.Programacion = Programacion;
                    that.planMigrationSession.Data.AuditRequest = AuditRequest;


                    that.planMigrationSession.Configuration.Constants = {};
                    that.planMigrationSession.Configuration.Constants = Configuraciones;

                    $.reusableBusiness.getIgv(that.planMigrationSession.Data.ListIgv, function (igv) {

                        that.planMigrationSession.Data.Configuration.Constantes_Igv = igv
                        // Load Customer Information - Left Panel
                        $.app.renderCustomerInformation(that.planMigrationSession);
                        // Load Core Service Information - Left Panel					
                        //if (!$.array.isEmptyOrNull(that.planMigrationSession.Data.CoreServices))
                        $.app.renderCoreServices(that.planMigrationSession);
                        // Load Additional Service Information - Left Panel
                        //if (!$.array.isEmptyOrNull(that.planMigrationSession.Data.AdditionalServices))
                        $.app.renderAdditionalServices(that.planMigrationSession);
                        // Load Additional Equipment Information - Left Panel
                        $.app.renderAdditionalEquipment(that.planMigrationSession);

                    });

                    if (!that.InitialValidation()) {
                        return false;
                    }
                    
                    var attributes = that.planMigrationSession.Data.Configuration;
                    that.planMigrationSession.Configuration.Steps = attributes.filter(function (e) { return (e.AttributeName == 'step') });
                    that.planMigrationSession.Configuration.Views = attributes.filter(function (e) { return (e.AttributeType == 'CONTENEDOR') });
                    that.planMigrationSession.Configuration.Constants.Technology = CoreServices.Technology;

                    that.planMigrationSession.Configuration.Constants.Plataforma_Facturador = Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT === 'TOBE' ? 'CBIO' : 'BSCS7';

                    that.planMigrationSession.Configuration.Constants.nroOrdenTOA = "0";
                    that.planMigrationSession.Configuration.Constants.Constantes_maxDecosAdicionales = "4";
                    var
                        viewsPromise = that.viewsRenderPromise(),
                        stepsPromise = that.stepsRenderPromise(controls.stepsContainer);

                    Promise.all([viewsPromise, stepsPromise]) // Carga de las Vistas de la Transacción
                        .then(function (renderResponse) {

                            // Reasign HTML Controls
                            controls = that.AsignControls(that, controls.form);

                            that.removeAdditionalService();
                            that.onSelectAdditionalService();
                            $.reusableBusiness.LoadPointOfAttention(controls.ddlCenterofAttention, that.planMigrationSession);
                            // Click Events
                            controls.btnAddPlan.addEvent(that, 'click', that.btnAddPlan_Click);
                            controls.btnStep.addEvent(that, 'click', that.navigateTabs);
                            controls.btnCopy.addEvent(that, 'click', $.app.copyToClipboard);
                            controls.btnAddMore.addEvent(that, 'click', that.addAdditionalEquipment);
                            controls.btnAddMin.addEvent(that, 'click', that.substractAdditionalEquipment);

                            controls.btnSave.addEvent(that, 'click', that.Save_click);
                            controls.btnConstancy.addEvent(that, 'click', that.Constancy_click);

                            controls.txtCalendar.change(function () { that.txtCalendar_Change() });
                            controls.ddlTimeZone.change(function () { that.ddlTimeZone_Click() });

                            controls.ddlWorkType.change(function () { that.ddlWorkType_Click() });
                            controls.ddlSubWorkType.change(function () { that.ddlSubWorkType_Click() });
                            controls.ddlCenterofAttention.change(function () { that.ddlCenterofAttention_Click() });

                            // Change Events
                            controls.mailCheck.addEvent(that, 'click', that.onMailCheck);
                            controls.mailText.addEvent(that, 'focusout', that.onFocusoutEmail);
                            controls.cboCoreServices.addEvent(that, 'change', that.onSelectCoreService);
                            controls.navigateIcon.addEvent(that, 'click', that.navigateIcons);
                            controls.txtReferencePhone.keydown(function (event) { that.ValidateNumbers_Click(event); });
                            // External Libraries Events
                            controls.txtCalendar.datepicker({ format: 'dd/mm/yyyy' });


                            controls.sectionScheduling.hide();

                        }
                        )
                        .catch(function (e) {
                            $.unblockUI();
                            alert(string.format('Ocurrio un error al cargar la transacción - {0}', e));
                            $('#navbar-body').showMessageErrorLoadingTransaction();
                        })
                        .then(function (renderResponse) {
                            $.unblockUI();
                        });
                }
                )
                .catch(function (e) {
                    $.unblockUI();
                    alert(string.format('Ocurrio un error al obtener la Configuración - {0}', e));
                    $('#navbar-body').showMessageErrorLoadingTransaction();
                })
                .then(function () {
                    $.unblockUI();
                });

        },

        AsignControls: function (that, $element) {

            that.updateControl({

                spnCustomerName: $('#spnCustomerName', $element),
                spnContactName: $('#spnContactName', $element),
                spnContractNumber: $('#spnContractNumber', $element),
                spnActivationDate: $('#spnActivationDate', $element),
                spnLegalRepresentative: $('#spnLegalRepresentative', $element),
                spnLegalRepresentativeDocument: $('#spnLegalRepresentativeDocument', $element),
                spnDocumentNumber: $('#spnDocumentNumber', $element),
                spnCustomerID: $('#spnCustomerID', $element),
                spnCustomerType: $('#spnCustomerType', $element),
                spnBillingCycle: $('#spnBillingCycle', $element),
                spnPhoneNumber1: $('#spnPhoneNumber1', $element),
                spnPhoneNumber2: $('#spnPhoneNumber2', $element),

                totalPrice: $('#TotalPrice', $element),
                totalPriceAdditional: $('#TotalPriceAdditional', $element),

                currentFixedCharge: $('#currentFixedCharge', $element),
                promotionalFixedCharge: $('#promotionalFixedCharge', $element),
                newFixedCharge: $('#newFixedCharge', $element),
                nextReceipt: $('#nextReceipt', $element),
                //JFlores
                nextReceiptApportionment: $('#nextReceiptApportionment', $element),

                txtSolucion: $('#txtSolucion', $element),
                txtCalendar: $('#txtCalendar', $element),
                ddlTimeZone: $('#ddlTimeZone', $element),
                btnAddPlan: $('#btnAddPlan', $element),
                btnAddMin: $('.btnMinAdditional', $element),
                btnAddMore: $('.btnMoreAdditional', $element),
                btnCopy: $('#btnCopy', $element),

                tblServicesCore: $('#tblServicesCore', $element),
                tblAdditionalServices: $('#tblAdditionals', $element),
                tblAdditionalPoints: $('#tblAdditionalPoint', $element),
                tblRecurrentServices: $('.recurrentService', $element),
                tblNonRecurrentServices: $('.nonRecurrentService', $element),
                tblAllServices: $('.recurrentService, .nonRecurrentService', $element),

                cboCoreServices: $('.coreServices', $element),
                cboAdditionalServices: $('.additionalService', $element),
                cboCoreCableServices: $('#coreCableServices', $element),
                cboCoreInternetServices: $('#coreInternetServices', $element),
                cboCoreTelephonyServices: $('#coreTelephonyServices', $element),
                cboCableAdditionalServices: $('#cableAdditionalServices', $element),
                cboInternetAdditionalServices: $('#internetAdditionalServices', $element),
                cboTelephonyAdditionalServices: $('#telephonyAdditionalServices', $element),
                ddlWorkType: $('#ddlWorkType', $element),
                ddlSubWorkType: $('#ddlSubWorkType', $element),
                ddlCenterofAttention: $('#ddlCenterofAttention', $element),
                resumeServices: $('#resumeServices', $element),

                mailText: $('#txtEmail', $element),
                mailCheck: $('#chkEmail', $element),
                mailErrorMessage: $('#ErrorMessageEmail', $element),
                WorkTypeErrorMessage: $('#ErrorMessageddlWorkType', $element),
                subWorkTypeErrorMessage: $('#ErrorMessageddlSubWorkType', $element),
                calendarErrorMessage: $('#ErrorMessagetxtCalendar', $element),
                timeZoneErrorMessage: $('#ErrorMessageddlTimeZone', $element),
                centroAtencionZoneErrorMessage: $('#ErrorMessageddlCenterofAttention', $element),

                whitePagesCheck: $('#chkWhitePages', $element),

                sectionNewPlan: $('#divNewPlan', $element),
                sectionAdditionalServices: $('#divAdditionalServices', $element),
                sectionScheduling: $('#divScheduling', $element),
                sectionTechnicalData: $('#divTechnicalData', $element),

                txtNote: $('#txtNote', $element),
                txtReferencePhone: $('#txtReferencePhone', $element),
                navigateIcon: $('.btn-circle-step', $element),



            });

            return that.getControls();
        },

        stepsRenderPromise: function (container) {

            var that = this,
                controls = that.getControls();

            return new Promise(function (resolve, reject) {
                $.app.createSteps(that.planMigrationSession.Configuration.Steps, container);
                resolve();
            });
        },

        viewsRenderPromise: function () {

            var that = this,
                controls = that.getControls();

            return new Promise(function (resolve, reject) {
                var transactionViews = that.planMigrationSession.Configuration.Views;
                $.app.ViewsRender(transactionViews, transactionViews, '', 'transactionContent', resolve);
            });
        },

        InitialValidation: function () {
            var that = this,
                controls = that.getControls(),
                stateContract = !$.string.isEmptyOrNull(that.planMigrationSession.Data.CustomerInformation.ContractStatus) ? that.planMigrationSession.Data.CustomerInformation.ContractStatus : '',
                stateService = !$.string.isEmptyOrNull(that.planMigrationSession.Data.CustomerInformation.ServiceStatus) ? that.planMigrationSession.Data.CustomerInformation.ServiceStatus : '';

            //debugger;
            if (!$.array.isEmptyOrNull(that.planMigrationSession.Data.CustomerInformation)) {
                console.log('stateContracto: ' + stateContract);
                console.log('stateService:  ' + stateService);
                console.log('Plataforma:  ' + Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT);
                if (Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT === 'TOBE') {
                    if (stateContract.trim().toUpperCase() != 'ACTIVO' || stateService.trim().toUpperCase() != 'ACTIVO') {
                        alert("El contrato no se encuentra activo.", 'Alerta', function () {
                            $.unblockUI();
                            parent.window.close();
                        });
                        return false;
                    }
                }
                else {
                    if (stateContract.trim().toUpperCase() != 'ACTIVO') {
                        alert("El contrato no se encuentra activo.", 'Alerta', function () {
                            $.unblockUI();
                            parent.window.close();
                        });
                        return false;
                    }
                }
            }

            debugger;

            if (!$.array.isEmptyOrNull(that.planMigrationSession.Data.ValidarTransaccion)) {
                if (that.planMigrationSession.Data.ValidarTransaccion.Codigo == "-3") {
                    alert(that.planMigrationSession.Data.ValidarTransaccion.Mensaje, 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });
                    return false;
                }

                if (that.planMigrationSession.Data.ValidarTransaccion.Codigo == "-1") {
                    alert("Error al validar transacción", 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });
                    return false;
                }

            }

            //Checking for scheduled tasks.
            var tareas = that.planMigrationSession.Data.Programacion.CantidadTareasProgramadas;
            if (tareas != null || tareas != undefined) {
                if (tareas.trim() != "0") {
                    alert(that.planMigrationSession.Data.Programacion.MensajeRespuesta, 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });
                    return false;
                }
            } else {
                alert('Hubo un error al validar las transacciones anteriores. Informe o vuelva a intentar', 'Alerta', function () {
                    $.unblockUI();
                    parent.window.close();
                });
                return false;
            }

            return true;
        },

        getLoadingPage: function () {
            var strUrlLogo = window.location.protocol + '//' + window.location.host + '/Content/images/SUFija/loading_Claro.gif';
            $.blockUI({
                message: '<div align="center"><img src="' + strUrlLogo + '" width="25" height="25" /> Cargando ... </div>',
                css: {
                    border: 'none',
                    padding: '15px',
                    backgroundColor: '#000',
                    '-webkit-border-radius': '10px',
                    '-moz-border-radius': '10px',
                    opacity: .5,
                    color: '#fff',
                }
            });
        },

        /* PartialView NewPlan - Nuevo Plan */

        btnAddPlan_Click: function () {

            var that = this,
                controls = that.getControls(),
                urlBase = location.protocol + '//' + location.host + '/PlanMigration/Home/ChoosePlan';



            Session.FixedPlan = that.planMigrationSession.Data.FixedPlan;

            that.planMigrationSession.Configuration.Constants.Constantes_oficinaDefault = '1213';

            var index = that.planMigrationSession.Data.OficinaVentaUsuario.length;
            var usuarioPDV = that.planMigrationSession.Data.OficinaVentaUsuario.length > 0 ?
                             that.planMigrationSession.Data.OficinaVentaUsuario[index - 1].codigoOficinaVenta : that.planMigrationSession.Configuration.Constants.Constantes_oficinaDefault;


            Session.ContratoId = Session.SessionParams.DATACUSTOMER.ContractID;
            Session.Technology = Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT === 'TOBE' ? that.planMigrationSession.Configuration.Constants.Technology : '5';
            Session.Product = Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT === 'TOBE' ? that.planMigrationSession.Configuration.Constants.Technology : '5';
            Session.Offert = '01';// that.planMigrationSession.Configuration.Constants.Constantes_Offert;
            Session.FlagEjecucion = '0';// that.planMigrationSession.Configuration.Constants.Constantes_FlagEjecucion;
            Session.oficinaDefault = that.planMigrationSession.Configuration.Constants.Constantes_oficinaDefault;
            Session.idTransactionFront = that.planMigrationSession.Data.idTransactionFront;
            Session.plataformaAT = Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT;
            console.log(Session.Technology);

            Session.oficina = usuarioPDV;

            $.window.open({
                modal: false,
                controlBox: false,
                type: 'post',
                title: "SELECCIONAR NUEVO PLAN",
                icon: 'new-plan-icon',
                url: urlBase,
                width: 1024,
                height: 550,
                buttons: {
                    Cancelar: {
                        class: 'btn btn-style-default btn-sm',
                        click: function (sender, args) {
                            this.close();
                        }
                    },
                    Seleccionar: {
                        "class": 'btn btn-style btn-sm',
                        click: function () {
                            var rowPost = $('#tblPlans').DataTable().rows({ selected: true }).data();
                            var item = rowPost[0];

                            if (item != undefined) {

                                if (item.CampaignDescription == '' || typeof item.CampaignDescription == 'undefined') {
                                    alert("Debe seleccionar un plan válido.");
                                }
                                else {
                                    // Initializing Values
                                    that.planMigrationSession.Current.Plan = {};
                                    that.planMigrationSession.Current.ServicesCore = [];
                                    that.planMigrationSession.Current.AdditionalPoints = [];
                                    that.planMigrationSession.Current.AdditionalServices = [];
                                    that.planMigrationSession.Current.AdditionalEquipment = [];


                                    that.planMigrationSession.Current.Plan = item;

                                    controls.txtSolucion.val(item.CampaignDescription);
                                    controls.tblAdditionalPoints.find('tbody').empty();
                                    controls.tblRecurrentServices.find('tbody').empty();
                                    console.log('Contrato: ' + Session.SessionParams.DATACUSTOMER.ContractID);
                                    console.log('Customer: ' + Session.SessionParams.DATACUSTOMER.CustomerID);
                                    console.log('coIdPub: ' + Session.SessionParams.DATACUSTOMER.coIdPub);
                                    console.log('CodigoPlan: ' + that.planMigrationSession.Current.Plan.PlanCode);
                                    that.planMigrationSession.Current.Plan.CampaignDescription = item.CampaignDescription;
                                    that.planMigrationSession.Current.Plan.PlanDescription = item.PlanDescription;
                                    that.planMigrationSession.Current.Plan.SolutionDescription = item.SolutionDescription;
                                    that.planMigrationSession.Current.Plan.TMCode = item.TMCode;
                                    that.GetPlanFijaServicio(that.planMigrationSession.Current.Plan.PlanCode);


                                    that.resetEquipments();
                                    that.loadServicesCore();
                                    that.loadAdditionalServices();

                                    that.calculateCost(controls.tblAllServices, [controls.nextReceipt]);
                                    that.calculateCost(controls.tblRecurrentServices, [controls.totalPrice, controls.newFixedCharge]);

                                    this.close();

                                }
                            } else {
                                alert("Debe seleccionar un nuevo plan.");
                            }
                        }
                    }
                }
            });
        },

        loadServicesCore: function () {
            debugger;
            var that = this,
                coreServices = that.getPlanMigrationSessionDataFixedPlanDetail('PRINCIPAL', 'SERVICIO'),//Servicios Core
               // oCoreCableServices = coreServices.filter(function (item) { return item.ServiceType == 'Cable' })
               oCoreCableServices = coreServices.filter(function (item) { return item.ServiceType.toUpperCase().indexOf('CABLE') > -1 })
                    .map(function (item) {
                        return {
                            Id: item.LineID,
                            Desc: item.ServiceDescription,
                            attributes: {
                                'data-price': item.FixedCharge,
                                LineID: item.LineID == null ? "" : item.LineID,
                                ServiceDescription: item.ServiceDescription == null ? "" : item.ServiceDescription,
                                ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                                IdServicio: item.sncode == null ? "" : item.sncode,
                                price: item.FixedCharge == null ? "" : item.FixedCharge,
                                idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                                idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                                banwid: item.capacidad == null ? "" : item.capacidad,
                                unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                                Tipequ: item.tipEqu == null ? "" : item.tipEqu,
                                CodTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                                cantidad: item.cantidad == null ? "" : item.cantidad,
                                descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                                codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                                tipoServicio: item.tipoServicio == null ? "" : item.tipoServicio,
                                spcode: item.spCode == null ? "" : item.spCode,
                                GroupName: item.Group == null ? "" : item.Group,
                                CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                                po: item.po == null ? "" : item.po,
                                poType: item.poType == null ? "" : item.poType,
                                idProducto: item.idProducto == null ? "" : item.idProducto,
                                umbCons: item.umbCons == null ? "" : item.umbCons,
                                tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                                familia: item.familia == null ? "" : item.familia,
                                pop1: item.tipoLimCred == null ? "" : item.pop1,
                                pop2: item.familia == null ? "" : item.pop2
                            }
                        }
                    }),
                 /**-> Mostrar solo un servicio(equipo) Combo - Enviar los 2 equipo (IP TV - GPON) **/
                coreCableServices = $.array.unique(oCoreCableServices, 'Desc'),
                /***/

              //  oCoreInternetServices = coreServices.filter(function (item) { return item.ServiceType == 'Internet' })
            oCoreInternetServices = coreServices.filter(function (item) { return item.ServiceType.toUpperCase().indexOf('INTERNET') > -1 })
                    .map(function (item) {
                        return {
                            Id: item.LineID,
                            Desc: item.ServiceDescription,
                            attributes: {
                                'data-price': item.FixedCharge,
                                LineID: item.LineID == null ? "" : item.LineID,
                                ServiceDescription: item.ServiceDescription == null ? "" : item.ServiceDescription,
                                ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                                IdServicio: item.sncode == null ? "" : item.sncode,
                                price: item.FixedCharge == null ? "" : item.FixedCharge,
                                idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                                idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                                banwid: item.capacidad == null ? "" : item.capacidad,
                                unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                                Tipequ: item.tipEqu == null ? "" : item.tipEqu,
                                CodTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                                cantidad: item.cantidad == null ? "" : item.cantidad,
                                descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                                codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                                spcode: item.spCode == null ? "" : item.spCode,
                                GroupName: item.Group == null ? "" : item.Group,
                                CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                                po: item.po == null ? "" : item.po,
                                poType: item.poType == null ? "" : item.poType,
                                idProducto: item.idProducto == null ? "" : item.idProducto,
                                umbCons: item.umbCons == null ? "" : item.umbCons,
                                tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                                familia: item.familia == null ? "" : item.familia,
                                pop1: item.pop1 == null ? "" : item.pop1,
                                pop2: item.pop2 == null ? "" : item.pop2,
                            }
                        }
                    }),
                    /**-> Mostrar solo un servicio(equipo) Combo - Enviar los 2 equipo (IP TV - GPON) **/
                    coreInternetServices = $.array.unique(oCoreInternetServices, 'Desc'),
                    /***/
                  // oCoreTelephonyServices = coreServices.filter(function (item) { return item.ServiceType == 'Telefonia' || item.ServiceType == 'Telefonía' })
                  oCoreTelephonyServices = coreServices.filter(function (item) { return item.ServiceType.toUpperCase().indexOf('TELEFONIA') > -1 || item.ServiceType.toUpperCase().indexOf('TELEFONÍA') > -1 })
                    .map(function (item) {
                        return {
                            Id: item.LineID,
                            Desc: item.ServiceDescription,
                            attributes: {
                                'data-price': item.FixedCharge,
                                LineID: item.LineID == null ? "" : item.LineID,
                                ServiceDescription: item.ServiceDescription == null ? "" : item.ServiceDescription,
                                ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                                IdServicio: item.sncode == null ? "" : item.sncode,
                                price: item.FixedCharge == null ? "" : item.FixedCharge,
                                idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                                idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                                banwid: item.capacidad == null ? "" : item.capacidad,
                                unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                                Tipequ: item.tipEqu == null ? "" : item.tipEqu,
                                CodTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                                cantidad: item.cantidad == null ? "" : item.cantidad,
                                descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                                codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                                spcode: item.spCode == null ? "" : item.spCode,
                                GroupName: item.Group == null ? "" : item.Group,
                                CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                                po: item.po == null ? "" : item.po,
                                poType: item.poType == null ? "" : item.poType,
                                idProducto: item.idProducto == null ? "" : item.idProducto,
                                umbCons: item.umbCons == null ? "" : item.umbCons,
                                tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                                familia: item.familia == null ? "" : item.familia,
                                pop1: item.pop1 == null ? "" : item.pop1,
                                pop2: item.pop2 == null ? "" : item.pop2
                            }
                        }
                    }),
                    /**-> Mostrar solo un servicio(equipo) Combo - Enviar los 2 equipo (IP TV - GPON) **/
                    coreTelephonyServices = $.array.unique(oCoreTelephonyServices, 'Desc'),
                    /***/
                controls = that.getControls();


            coreCableServices.unshift({ Id: '', Desc: 'Seleccionar', attributes: {} });
            coreInternetServices.unshift({ Id: '', Desc: 'Seleccionar', attributes: {} });
            coreTelephonyServices.unshift({ Id: '', Desc: 'Seleccionar', attributes: {} });

            controls.cboCoreCableServices.populateDropDown(coreCableServices);
            controls.cboCoreInternetServices.populateDropDown(coreInternetServices);
            controls.cboCoreTelephonyServices.populateDropDown(coreTelephonyServices);
            //debugger;
            $.each(controls.cboCoreServices, function (idx, el) {

                var $select = $(el), $optionSelect;

                if ($select.children().length == 2) {

                    $select.val($select.find('option:last-child').val());
                    $optionSelect = $select.find('option:selected');


                    /**************************SE AÑADE EL SERVICIO PRINCIPAL DEL COMBO QUE TENGA UN*********************
                    ***************************SOLO SERVICIO  A LA TABLA LADO DERECHO X DEFECTO***************************
                    *******************************************************************************************************/
                    that.addCoreService({
                        id: $select.attr('id'),
                        desc: $optionSelect.text(),
                        dataId: $optionSelect.val(),
                        dataPrice: $optionSelect.attr('data-price')
                    })

                    /************************************************************************************************
                    ***************************AÑADIMOS EL SERVICO AL ARRAY SERIVECESCORE****************************
                    *******************************************************************************************************/

                    // debugger;
                    var EquServicio = coreServices
                                 .filter(function (item) {
                                     return item.ServiceType == $optionSelect.attr('servicetype') &&
                                            item.ServiceDescription == $optionSelect.text()
                                 });

                    $.each(EquServicio, function (index, item) {
                        that.planMigrationSession.Current.ServicesCore.push({
                            LineID: item.LineID == null ? "" : item.LineID,
                            ServiceDescription: item.ServiceDescription == null ? "" : item.ServiceDescription,
                            ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                            idServicio: item.sncode == null ? "" : item.sncode,
                            Price: item.FixedCharge == null ? "" : item.FixedCharge,
                            idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                            idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                            banwid: item.capacidad == null ? "" : item.capacidad,
                            unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                            tipequ: item.tipEqu == null ? "" : item.tipEqu,
                            codTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                            cantidad: item.cantidad == null ? "" : item.cantidad,
                            descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                            codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                            spcode: item.spCode == null ? "" : item.spCode,
                            GroupName: item.Group == null ? "" : item.Group,
                            CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                            po: item.po == null ? "" : item.po,
                            poType: item.poType == null ? "" : item.poType,
                            idProducto: item.idProducto == null ? "" : item.idProducto,
                            umbCons: item.umbCons == null ? "" : item.umbCons,
                            tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                            familia: item.familia == null ? "" : item.familia,
                            pop1: item.pop1 == null ? "" : item.pop1,
                            pop2: item.pop2 == null ? "" : item.pop2
                        });
                    });
                }
            })
        },

        loadAdditionalServices: function () {
            debugger
            /***************************************************************************
            ******CARGAMOS LA INFORMACION DE LOS SERVICIOS ADICIONALES AL COMBO
            ******ENVIAMOS LOS VALORES EN LOS ATRIBUTOS PARA SER USADO EN LA TRAMA DE VISITA
            ******TECNICA Y EN LA TRAMA DE "SERVICIOS" DEL TRANSVERSAL 
            ******LUIS MIGUEL ANTON 
            ***************************************************************************/
            var that = this,
                iconService = { Cable: 'ico_cable', Internet: 'ico_internet', Telefonia: 'ico_phone' },
				additionalServices = that.planMigrationSession.Data.FixedPlanDetail.filter(function (item) { return item.PlanCode == that.planMigrationSession.Current.Plan.PlanCode && item.Group == 'ADICIONAL' && item.ServiceEquiptment == 'SERVICIO' && item.coreAdicional != 'CORE ADICIONAL' }),
				additionalCoreServices = that.planMigrationSession.Data.FixedPlanDetail.filter(function (item) { return item.PlanCode == that.planMigrationSession.Current.Plan.PlanCode && item.Group == 'ADICIONAL' && item.ServiceEquiptment == 'SERVICIO' && item.coreAdicional == 'CORE ADICIONAL' }),

                //Cable - Servicios Adicionales
               // cableAdditionalServices = additionalServices.filter(function (item) { return item.ServiceType == 'Cable' })
			    cableAdditionalServices = additionalServices.filter(function (item) { return item.ServiceType.toUpperCase().indexOf('CABLE') > -1 })
                    .map(function (item) {
                        return {
                            value: item.LineID,
                            label: item.ServiceDescription,
                            selected: item.coreAdicional == 'CORE ADICIONAL' ? true : false,
                            disabled: item.coreAdicional == 'CORE ADICIONAL' ? true : false,
                            attributes: {
                                LineID: item.LineID == null ? "" : item.LineID,
                                ServiceDescription: item.ServiceDescription == null ? "" : item.ServiceDescription,
                                ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                                IdServicio: item.sncode == null ? "" : item.sncode,
                                spcode: item.spCode == null ? "" : item.spCode,
                                GroupName: item.Group == null ? "" : item.Group,

                                CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                                price: item.FixedCharge == null ? "" : item.FixedCharge,
                                idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                                idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                                banwid: item.capacidad == null ? "" : item.capacidad,
                                unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                                Tipequ: item.tipEqu == null ? "" : item.tipEqu,
                                CodTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                                cantidad: item.cantidad == null ? "" : item.cantidad,
                                descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                                codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                                po: item.po == null ? "" : item.po,
                                poType: item.poType == null ? "" : item.poType,
                                idProducto: item.idProducto == null ? "" : item.idProducto,
                                umbCons: item.umbCons == null ? "" : item.umbCons,
                                tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                                familia: item.familia == null ? "" : item.familia,
                                pop1: item.pop1 == null ? "" : item.pop1,
                                pop2: item.pop2 == null ? "" : item.pop2,
                                img: string.format('/Content/Images/SUFija/{0}.svg', "ico_cable")//iconService[item.ServiceType])
                            }
                        }
                    }),
                //Internet - Servicios Adicionales
                //internetAdditionalServices = additionalServices.filter(function (item) { return item.ServiceType == 'Internet' })
				internetAdditionalServices = additionalServices.filter(function (item) { return item.ServiceType.toUpperCase().indexOf('INTERNET') > -1 })
                    .map(function (item) {
                        return {
                            value: item.LineID,
                            label: item.ServiceDescription,
                            selected: item.coreAdicional == 'CORE ADICIONAL' ? true : false,
                            disabled: item.coreAdicional == 'CORE ADICIONAL' ? true : false,
                            attributes: {
                                LineID: item.LineID == null ? "" : item.LineID,
                                ServiceDescription: item.ServiceDescription == null ? "" : item.ServiceDescription,
                                ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                                IdServicio: item.sncode == null ? "" : item.sncode,
                                spcode: item.spCode == null ? "" : item.spCode,
                                GroupName: item.Group == null ? "" : item.Group,

                                CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                                price: item.FixedCharge == null ? "" : item.FixedCharge,
                                idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                                idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                                banwid: item.capacidad == null ? "" : item.capacidad,
                                unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                                Tipequ: item.tipEqu == null ? "" : item.tipEqu,
                                CodTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                                cantidad: item.cantidad == null ? "" : item.cantidad,
                                descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                                codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                                po: item.po == null ? "" : item.po,
                                poType: item.poType == null ? "" : item.poType,
                                idProducto: item.idProducto == null ? "" : item.idProducto,
                                umbCons: item.umbCons == null ? "" : item.umbCons,
                                tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                                familia: item.familia == null ? "" : item.familia,
                                pop1: item.pop1 == null ? "" : item.pop1,
                                pop2: item.pop2 == null ? "" : item.pop2,
                                img: string.format('/Content/Images/SUFija/{0}.svg', "ico_internet")// iconService[item.ServiceType])
                            }
                        }
                    }),
                //Telefonia - Servicios Adicionales
               // telephonyAdditionalServices = additionalServices.filter(function (item) { return item.ServiceType == 'Telefonia' || item.ServiceType == 'Telefonía' })
				telephonyAdditionalServices = additionalServices.filter(function (item) { return item.ServiceType.toUpperCase().indexOf('TELEFONIA') > -1 || item.ServiceType.toUpperCase().indexOf('TELEFONÍA') > -1 })
                    .map(function (item) {
                        return {
                            value: item.LineID,
                            label: item.ServiceDescription,
                            selected: item.coreAdicional == 'CORE ADICIONAL' ? true : false,
                            disabled: item.coreAdicional == 'CORE ADICIONAL' ? true : false,
                            attributes: {
                                LineID: item.LineID == null ? "" : item.LineID,
                                ServiceDescription: item.ServiceDescription == null ? "" : item.ServiceDescription,
                                ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                                IdServicio: item.sncode == null ? "" : item.sncode,
                                spcode: item.spCode == null ? "" : item.spCode,
                                GroupName: item.Group == null ? "" : item.Group,

                                CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                                price: item.FixedCharge == null ? "" : item.FixedCharge,
                                idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                                idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                                banwid: item.capacidad == null ? "" : item.capacidad,
                                unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                                Tipequ: item.tipEqu == null ? "" : item.tipEqu,
                                CodTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                                cantidad: item.cantidad == null ? "" : item.cantidad,
                                descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                                codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                                po: item.po == null ? "" : item.po,
                                poType: item.poType == null ? "" : item.poType,
                                idProducto: item.idProducto == null ? "" : item.idProducto,
                                umbCons: item.umbCons == null ? "" : item.umbCons,
                                tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                                familia: item.familia == null ? "" : item.familia,
                                pop1: item.pop1 == null ? "" : item.pop1,
                                pop2: item.pop2 == null ? "" : item.pop2,
                                img: string.format('/Content/Images/SUFija/{0}.svg', 'ico_phone')//iconService[item.ServiceType]
                            }
                        }
                    }),
                controls = that.getControls();

            telephonyAdditionalServices.unshift({ value: '', label: 'Seleccionar', selected: true, disabled: false, attributes: {} });

            controls.cboCableAdditionalServices.multiselect('dataprovider', cableAdditionalServices);
            controls.cboInternetAdditionalServices.multiselect('dataprovider', internetAdditionalServices);
            controls.cboTelephonyAdditionalServices.multiselect('dataprovider', telephonyAdditionalServices);

            //var cableAdditionalCoreServices = additionalCoreServices.filter(function (item) { return item.ServiceType == 'Cable' })
            var cableAdditionalCoreServices = additionalCoreServices.filter(function (item) { return item.ServiceType.toUpperCase().indexOf('CABLE') > -1 })
                    .map(function (item) {
                        return {
                            value: item.LineID,
                            label: item.ServiceDescription,
                            selected: item.coreAdicional == 'CORE ADICIONAL' ? true : false,
                            disabled: item.coreAdicional == 'CORE ADICIONAL' ? true : false,
                            attributes: {
                                LineID: item.LineID == null ? "" : item.LineID,
                                ServiceDescription: item.ServiceDescription == null ? "" : item.ServiceDescription,
                                ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                                IdServicio: item.sncode == null ? "" : item.sncode,
                                spcode: item.spCode == null ? "" : item.spCode,
                                GroupName: item.Group == null ? "" : item.Group,

                                CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                                price: item.FixedCharge == null ? "" : item.FixedCharge,
                                idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                                idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                                banwid: item.capacidad == null ? "" : item.capacidad,
                                unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                                Tipequ: item.tipEqu == null ? "" : item.tipEqu,
                                CodTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                                cantidad: item.cantidad == null ? "" : item.cantidad,
                                descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                                codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                                po: item.po == null ? "" : item.po,
                                poType: item.poType == null ? "" : item.poType,
                                idProducto: item.idProducto == null ? "" : item.idProducto,
                                umbCons: item.umbCons == null ? "" : item.umbCons,
                                tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                                familia: item.familia == null ? "" : item.familia,
                                pop1: item.pop1 == null ? "" : item.pop1,
                                pop2: item.pop2 == null ? "" : item.pop2,
                                img: string.format('/Content/Images/SUFija/{0}.svg', 'ico_cable')// iconService[item.ServiceType])
                            }
                        }
                    }),
                //internetAdditionalCoreServices = additionalCoreServices.filter(function (item) { return item.ServiceType == 'Internet' })
                internetAdditionalCoreServices = additionalCoreServices.filter(function (item) { item.ServiceType.toUpperCase().indexOf('INTERNET') > -1 })
                    .map(function (item) {
                        return {
                            value: item.LineID,
                            label: item.ServiceDescription,
                            selected: item.coreAdicional == 'CORE ADICIONAL' ? true : false,
                            disabled: item.coreAdicional == 'CORE ADICIONAL' ? true : false,
                            attributes: {
                                LineID: item.LineID == null ? "" : item.LineID,
                                ServiceDescription: item.ServiceDescription == null ? "" : item.ServiceDescription,
                                ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                                IdServicio: item.sncode == null ? "" : item.sncode,
                                spcode: item.spCode == null ? "" : item.spCode,
                                GroupName: item.Group == null ? "" : item.Group,

                                CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                                price: item.FixedCharge == null ? "" : item.FixedCharge,
                                idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                                idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                                banwid: item.capacidad == null ? "" : item.capacidad,
                                unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                                Tipequ: item.tipEqu == null ? "" : item.tipEqu,
                                CodTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                                cantidad: item.cantidad == null ? "" : item.cantidad,
                                descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                                codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                                po: item.po == null ? "" : item.po,
                                poType: item.poType == null ? "" : item.poType,
                                idProducto: item.idProducto == null ? "" : item.idProducto,
                                umbCons: item.umbCons == null ? "" : item.umbCons,
                                tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                                familia: item.familia == null ? "" : item.familia,
                                pop1: item.pop1 == null ? "" : item.pop1,
                                pop2: item.pop2 == null ? "" : item.pop2,
                                img: string.format('/Content/Images/SUFija/{0}.svg', 'ico_internet')// iconService[item.ServiceType])
                            }
                        }
                    }),
                //telephonyAdditionalCoreServices = additionalCoreServices.filter(function (item) { return item.ServiceType == 'Telefonia' || item.ServiceType == 'Telefonía' })
                telephonyAdditionalCoreServices = additionalCoreServices.filter(function (item) { return item.ServiceType.toUpperCase().indexOf('TELEFONIA') > -1 || item.ServiceType.toUpperCase().indexOf('TELEFONÍA') > -1 })
                    .map(function (item) {
                        return {
                            value: item.LineID,
                            label: item.ServiceDescription,
                            selected: item.coreAdicional == 'CORE ADICIONAL' ? true : false,
                            disabled: item.coreAdicional == 'CORE ADICIONAL' ? true : false,
                            attributes: {
                                LineID: item.LineID == null ? "" : item.LineID,
                                ServiceDescription: item.ServiceDescription == null ? "" : item.ServiceDescription,
                                ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                                IdServicio: item.sncode == null ? "" : item.sncode,
                                spcode: item.spCode == null ? "" : item.spCode,
                                GroupName: item.Group == null ? "" : item.Group,

                                CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                                price: item.FixedCharge == null ? "" : item.FixedCharge,
                                idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                                idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                                banwid: item.capacidad == null ? "" : item.capacidad,
                                unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                                Tipequ: item.tipEqu == null ? "" : item.tipEqu,
                                CodTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                                cantidad: item.cantidad == null ? "" : item.cantidad,
                                descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                                codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                                po: item.po == null ? "" : item.po,
                                poType: item.poType == null ? "" : item.poType,
                                idProducto: item.idProducto == null ? "" : item.idProducto,
                                umbCons: item.umbCons == null ? "" : item.umbCons,
                                tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                                familia: item.familia == null ? "" : item.familia,
                                pop1: item.pop1 == null ? "" : item.pop1,
                                pop2: item.pop2 == null ? "" : item.pop2,
                                img: string.format('/Content/Images/SUFija/{0}.svg', 'ico_phone')//iconService[item.ServiceType]
                            }
                        }
                    });
            //

            var table = controls.tblAdditionalServices;


            $.each(internetAdditionalCoreServices, function (index, value) {
                if (value.selected) {
                    var markup = "";
                    markup += string.format('<tr id="{0}">', value.value);
                    markup += '<td class="td-cp text-left"><span><a href="javascript:void(0)" class="" style="padding-right:10px;">';
                    markup += string.format('<i class="glyphicon glyphicon-check-sign"></i></a></span><img src="{0}">{1}', value.attributes.img, value.label);//opt.data('img'), opt[0].label);
                    markup += '</td><td class="td-cp"></td>';
                    markup += string.format('<td class="td-cp text-right" data-price="{0}"> S/. {1}</td>', value.attributes.price, that.priceFormat(value.attributes.price));
                    markup += '</tr>';
                    //debugger;
                    table.find('tbody').append(markup);

                    that.planMigrationSession.Current.AdditionalServices.push({
                        LineID: value.attributes.LineID == null ? "" : value.attributes.LineID,
                        ServiceDescription: value.attributes.ServiceDescription == null ? "" : value.attributes.ServiceDescription,
                        ServiceType: value.attributes.ServiceType == null ? "" : value.attributes.ServiceType,
                        idServicio: value.attributes.IdServicio == null ? "" : value.attributes.IdServicio,
                        Price: value.attributes.price == null ? "" : value.attributes.price,
                        idGrupoPrincipal: value.attributes.idGrupoPrincipal == null ? "" : value.attributes.idGrupoPrincipal,
                        idGrupo: value.attributes.idGrupo == null ? "" : value.attributes.idGrupo,
                        banwid: value.attributes.banwid == null ? "" : value.attributes.banwid,
                        unidadcapacidad: value.attributes.unidadcapacidad == null ? "" : value.attributes.unidadcapacidad,
                        tipequ: value.attributes.Tipequ == null ? "" : value.attributes.Tipequ,
                        codTipoEquipo: value.attributes.CodTipoEquipo == null ? "" : value.attributes.CodTipoEquipo,
                        descEquipo: value.attributes.descEquipo == null ? "" : value.attributes.descEquipo,
                        cantidad: value.attributes.cantidad, //== null ? "0" : value.attributes.cantidad,
                        codigoExterno: value.attributes.codigoExterno == null ? "" : value.attributes.codigoExterno,
                        spcode: value.attributes.spcode == null ? "" : value.attributes.spcode,
                        GroupName: value.attributes.GroupName == null ? "" : value.attributes.GroupName,
                        CoreAdicional: value.attributes.CoreAdicional == null ? "" : value.attributes.CoreAdicional,
                        po: value.attributes.po == null ? "" : value.attributes.po,
                        poType: value.attributes.poType == null ? "" : value.attributes.poType,
                        idProducto: value.attributes.idProducto == null ? "" : value.attributes.idProducto,
                        umbCons: value.attributes.umbCons == null ? "" : value.attributes.umbCons,
                        tipoLimCred: value.attributes.tipoLimCred == null ? "" : value.attributes.tipoLimCred,
                        familia: value.attributes.familia == null ? "" : value.attributes.familia,
                        pop1: value.attributes.pop1 == null ? "" : value.attributes.pop1,
                        pop2: value.attributes.pop2 == null ? "" : value.attributes.pop2,
                        id: value.value,
                        desc: value.label,
                        img: value.attributes.img
                    })
                }
            });

            $.each(telephonyAdditionalCoreServices, function (index, value) {
                if (value.selected) {
                    var markup = "";

                    /*// No Mostrar  call features -Solicitud del Usuario
                    markup += string.format('<tr id="{0}">', value.value);
                    markup += '<td class="td-cp text-left"><span><a href="javascript:void(0)" class="" style="padding-right:10px;">';
                    markup += string.format('<i class="glyphicon glyphicon-check-sign"></i></a></span><img src="{0}">{1}', '/Content/Images/SUFija/ico_phone.svg', value.label);//opt.data('img'), opt[0].label);
                    markup += '</td><td class="td-cp"></td>';
                    markup += string.format('<td class="td-cp text-right" data-price="{0}"> S/. {1}</td>', value.attributes.price, that.priceFormat(value.attributes.price));
                    markup += '</tr>';*/
                    //debugger;
                    table.find('tbody').append(markup);

                    that.planMigrationSession.Current.AdditionalServices.push({
                        LineID: value.attributes.LineID == null ? "" : value.attributes.LineID,
                        ServiceDescription: value.attributes.ServiceDescription == null ? "" : value.attributes.ServiceDescription,
                        ServiceType: value.attributes.ServiceType == null ? "" : value.attributes.ServiceType,
                        idServicio: value.attributes.IdServicio == null ? "" : value.attributes.IdServicio,
                        Price: value.attributes.price == null ? "" : value.attributes.price,
                        idGrupoPrincipal: value.attributes.idGrupoPrincipal == null ? "" : value.attributes.idGrupoPrincipal,
                        idGrupo: value.attributes.idGrupo == null ? "" : value.attributes.idGrupo,
                        banwid: value.attributes.banwid == null ? "" : value.attributes.banwid,
                        unidadcapacidad: value.attributes.unidadcapacidad == null ? "" : value.attributes.unidadcapacidad,
                        tipequ: value.attributes.Tipequ == null ? "" : value.attributes.Tipequ,
                        codTipoEquipo: value.attributes.CodTipoEquipo == null ? "" : value.attributes.CodTipoEquipo,
                        descEquipo: value.attributes.descEquipo == null ? "" : value.attributes.descEquipo,
                        cantidad: value.attributes.cantidad, //== null ? "0" : value.attributes.cantidad,
                        codigoExterno: value.attributes.codigoExterno == null ? "" : value.attributes.codigoExterno,
                        spcode: value.attributes.spcode == null ? "" : value.attributes.spcode,
                        GroupName: value.attributes.GroupName == null ? "" : value.attributes.GroupName,
                        CoreAdicional: value.attributes.CoreAdicional == null ? "" : value.attributes.CoreAdicional,
                        po: value.attributes.po == null ? "" : value.attributes.po,
                        poType: value.attributes.poType == null ? "" : value.attributes.poType,
                        idProducto: value.attributes.idProducto == null ? "" : value.attributes.idProducto,
                        umbCons: value.attributes.umbCons == null ? "" : value.attributes.umbCons,
                        tipoLimCred: value.attributes.tipoLimCred == null ? "" : value.attributes.tipoLimCred,
                        familia: value.attributes.familia == null ? "" : value.attributes.familia,
                        pop1: value.attributes.pop1 == null ? "" : value.attributes.pop1,
                        pop2: value.attributes.pop2 == null ? "" : value.attributes.pop2,
                        id: value.value,
                        desc: value.label,
                        img: value.attributes.img
                    })
                }
            });

            $.each(cableAdditionalCoreServices, function (index, value) {
                if (value.selected) {
                    var markup = "";
                    markup += string.format('<tr id="{0}">', value.value);
                    markup += '<td class="td-cp text-left"><span><a href="javascript:void(0)" class="" style="padding-right:10px;">';
                    markup += string.format('<i class="glyphicon glyphicon-check-sign"></i></a></span><img src="{0}">{1}', value.attributes.img, value.label);//opt.data('img'), opt[0].label);
                    markup += '</td><td class="td-cp"></td>';
                    markup += string.format('<td class="td-cp text-right" data-price="{0}"> S/. {1}</td>', value.attributes.price, that.priceFormat(value.attributes.price));
                    markup += '</tr>';
                    //debugger;
                    table.find('tbody').append(markup);

                    that.planMigrationSession.Current.AdditionalServices.push({
                        LineID: value.attributes.LineID == null ? "" : value.attributes.LineID,
                        ServiceDescription: value.attributes.ServiceDescription == null ? "" : value.attributes.ServiceDescription,
                        ServiceType: value.attributes.ServiceType == null ? "" : value.attributes.ServiceType,
                        idServicio: value.attributes.IdServicio == null ? "" : value.attributes.IdServicio,
                        Price: value.attributes.price == null ? "" : value.attributes.price,
                        idGrupoPrincipal: value.attributes.idGrupoPrincipal == null ? "" : value.attributes.idGrupoPrincipal,
                        idGrupo: value.attributes.idGrupo == null ? "" : value.attributes.idGrupo,
                        banwid: value.attributes.banwid == null ? "" : value.attributes.banwid,
                        unidadcapacidad: value.attributes.unidadcapacidad == null ? "" : value.attributes.unidadcapacidad,
                        tipequ: value.attributes.Tipequ == null ? "" : value.attributes.Tipequ,
                        codTipoEquipo: value.attributes.CodTipoEquipo == null ? "" : value.attributes.CodTipoEquipo,
                        descEquipo: value.attributes.descEquipo == null ? "" : value.attributes.descEquipo,
                        cantidad: value.attributes.cantidad, //== null ? "0" : value.attributes.cantidad,
                        codigoExterno: value.attributes.codigoExterno == null ? "" : value.attributes.codigoExterno,
                        spcode: value.attributes.spcode == null ? "" : value.attributes.spcode,
                        GroupName: value.attributes.GroupName == null ? "" : value.attributes.GroupName,
                        CoreAdicional: value.attributes.CoreAdicional == null ? "" : value.attributes.CoreAdicional,
                        po: value.attributes.po == null ? "" : value.attributes.po,
                        poType: value.attributes.poType == null ? "" : value.attributes.poType,
                        idProducto: value.attributes.idProducto == null ? "" : value.attributes.idProducto,
                        umbCons: value.attributes.umbCons == null ? "" : value.attributes.umbCons,
                        tipoLimCred: value.attributes.tipoLimCred == null ? "" : value.attributes.tipoLimCred,
                        familia: value.attributes.familia == null ? "" : value.attributes.familia,
                        pop1: value.attributes.pop1 == null ? "" : value.attributes.pop1,
                        pop2: value.attributes.pop2 == null ? "" : value.attributes.pop2,
                        id: value.value,
                        desc: value.label,
                        img: value.attributes.img
                    })
                }
            });
        },

        resetEquipments: function () {

            var that = this,
                additionalEquipment = that.planMigrationSession.Data.FixedPlanDetail
                    .filter(function (item) {
                        return item.PlanCode == (that.planMigrationSession.Current.Plan.PlanCode && item.coreAdicional == 'EQUIPO_ALQUILER' && item.ServiceEquiptment == 'EQUIPO' && isNaN(item.EquipmentCode)) || item.ServiceType == 'ALQUILER EQUIPOS IPTV' || item.ServiceType == 'ALQUILER EQUIPOS'
                    })
                    .map(function (item) {
                        // item.ServiceDescription = $.string.capitalize(item.ServiceDescription.split(' ').slice(1).join(' '));
                        return {
                            //item
                            //ServiceDescription: $.string.capitalize(item.ServiceDescription.split(' ').slice(1).join(' ')),
                            //ServiceDescription: $.string.capitalize(item.descEquipo.split(' ').slice(1).join(' ')),
                            ServiceDescription: $.string.capitalize(item.tipoEquipo),
                            LineID: item.LineID == null ? "" : item.LineID,
                            FixedCharge: item.FixedCharge == null ? "" : item.FixedCharge,

                            ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                            IdServicio: item.sncode == null ? "" : item.sncode,
                            //spcode: item.spCode == null ? "" : item.spCode,
                            //spcode: item.coreAdicional == 'EQUIPO_ALQUILER' && (item.spCode == null ||item.spCode == '')? '1124' : item.spCode, //Default 1124  EQUIPO_ALQUILER
                            spcode: (item.coreAdicional == 'EQUIPO_ALQUILER' || item.ServiceType == 'ALQUILER EQUIPOS IPTV' || item.ServiceType == 'ALQUILER EQUIPOS') && $.string.isEmptyOrNull(item.spCode) ? '1124' : item.spCode, //Default 1124  EQUIPO_ALQUILER
                            GroupName: item.Group == null ? "" : item.Group,

                            price: item.FixedCharge == null ? "" : item.FixedCharge,
                            idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                            idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                            banwid: item.capacidad == null ? "" : item.capacidad,
                            unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                            Tipequ: item.tipEqu == null ? "" : item.tipEqu,
                            CodTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                            cantidad: item.cantidad == null ? "" : item.cantidad,
                            descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                            codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                            CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                            po: item.po == null ? "" : item.po,
                            poType: item.poType == null ? "" : item.poType,
                            idProducto: item.idProducto == null ? "" : item.idProducto,
                            umbCons: item.umbCons == null ? "" : item.umbCons,
                            tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                            familia: item.familia == null ? "" : item.familia,
                            pop1: item.pop1 == null ? "" : item.pop1,
                            pop2: item.pop2 == null ? "" : item.pop2
                        };
                    }),
                equipments = $.array.unique(additionalEquipment, 'ServiceDescription'),
                controls = this.getControls();

            $('#pvAdditionalEquipments').empty();

            var markup = '';
            var PrimerEquAdicional = $.array.unique(that.planMigrationSession.Data.FixedPlanDetail
                    .filter(function (item) {
                        return item.ServiceDescription.indexOf('1er') > -1 //item.FixedCharge 
                    }));


            $.each(equipments, function (idx, el) {

                markup += string.format('<tr data-type="{0}" data-price="{1}" data-name="{2}" data-LineID="{3}" data-ServiceDescription="{4}" data-ServiceType="{5}" data-IdServicio="{6}" data-spcode="{7}" data-GroupName="{8}" data-idGrupoPrincipal="{9}" data-idGrupo="{10}" data-banwid="{11}" data-unidadcapacidad="{12}" data-Tipequ="{13}" data-CodTipoEquipo="{14}" data-descEquipo="{15}" data-codigoExterno="{16}" data-coreAdicional="{17}"  data-po="{18}" data-poType="{19}" data-idProducto="{20}"  data-umbCons="{21}" data-tipoLimCred="{22}" data-familia="{23}"  data-pop1="{24}" data-pop2="{25}">',
                    el.LineID,
                    el.FixedCharge,
                    el.ServiceDescription,
                    el.LineID,
                    el.ServiceDescription,
                    el.ServiceType,
                    el.IdServicio,
                    el.spcode,
                    el.GroupName,
                    el.idGrupoPrincipal,
                    el.idGrupo,
                    el.banwid,
                    el.unidadcapacidad,
                    el.Tipequ,
                    el.CodTipoEquipo,
                    el.descEquipo,
                    el.codigoExterno,
                    el.CoreAdicional,
                    el.po,
                    el.poType,
                    el.idProducto,
                    el.umbCons,
                    el.tipoLimCred,
                    el.familia,
                    el.pop1,
                    el.pop2
                );

                markup += '<td>';
                markup += string.format('<img src="/Content/Images/SUFija/ico_deco.svg" alt="..." class=""><label>{0}</label>', el.ServiceDescription.replace("_", " "));
                markup += '</td>';
                markup += '<td class="text-right">';
                markup += string.format('<span>{0}</span>', that.priceFormat(el.FixedCharge));
                //markup += string.format('<span>{0}</span>', that.priceFormat(PrimEquAdicional[0].FixedCharge));
                markup += '</td>';
                markup += '<td>';
                markup += '<button type="button" class="close math-operator pull-right btnMore">+</button>';
                markup += string.format('<span id="spnQuantity{0}" class="badge math-operator pull-right">0</span>', el.LineID);
                markup += '<button type="button" class="close math-operator pull-right btnMin">-</button>';
                markup += '</td>';
                markup += '</tr>';

            });

            $('#pvAdditionalEquipments').append(markup);

            controls = this.getControls();

            $('.btnMore').addEvent(that, 'click', that.addEquipment);
            $('.btnMin').addEvent(that, 'click', that.substractEquipment);

            $('span[id^="spnQuantity"]').each(function () { $(this).text('0') });
            controls.btnAddMin.each(function () { $(this).attr('disabled', false) });
            controls.btnAddMore.each(function () { $(this).attr('disabled', false) });
        },

        onSelectCoreService: function () {
            //debugger;
            var that = this,
                controls = that.getControls(),
                coreServices = that.getPlanMigrationSessionDataFixedPlanDetail('PRINCIPAL', 'SERVICIO');

            var markup = '';
            var $select = event.target ? $(event.target) : $(event.srcElement);

            var $optionSelect = $select.find('option:selected');
            var row = $(string.format('#{0}Row', $select.attr('id')));

            var oRow = {}

            oRow.id = $select.attr('id')
            oRow.desc = $optionSelect.text()
            oRow.dataId = $optionSelect.val()
            oRow.dataPrice = $optionSelect.attr('data-price')
            debugger;
            if (typeof row[0] == 'undefined') {
                //debugger;
                //1_2_3_play_cable- IPTV + GPON
                var EquServicio = coreServices
                                  .filter(function (item) {
                                      return item.ServiceType == $optionSelect.attr('servicetype') &&
                                             item.ServiceDescription == $optionSelect.text()
                                  });

                $.each(EquServicio, function (index, item) {
                    that.planMigrationSession.Current.ServicesCore.push({
                        LineID: item.LineID == null ? "" : item.LineID,
                        ServiceDescription: item.ServiceDescription == null ? "" : item.ServiceDescription,
                        ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                        idServicio: item.sncode == null ? "" : item.sncode,
                        Price: item.FixedCharge == null ? "" : item.FixedCharge,
                        idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                        idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                        banwid: item.capacidad == null ? "" : item.capacidad,
                        unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                        tipequ: item.tipEqu == null ? "" : item.tipEqu,
                        codTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                        cantidad: item.cantidad == null ? "" : item.cantidad,
                        descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                        codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                        spcode: item.spCode == null ? "" : item.spCode,
                        GroupName: item.Group == null ? "" : item.Group,
                        CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                        po: item.po == null ? "" : item.po,
                        poType: item.poType == null ? "" : item.poType,
                        idProducto: item.idProducto == null ? "" : item.idProducto,
                        umbCons: item.umbCons == null ? "" : item.umbCons,
                        tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                        familia: item.familia == null ? "" : item.familia,
                        pop1: item.pop1 == null ? "" : item.pop1,
                        pop2: item.pop2 == null ? "" : item.pop2
                    });
                });
                console.log(that.planMigrationSession.Current.ServicesCore);


                if ($optionSelect.val() !== '') { that.addCoreService(oRow) }
            }
            else {
                if ($optionSelect.val() == '') {
                    that.planMigrationSession.Current.ServicesCore = that.planMigrationSession.Current.ServicesCore.filter(function (el, idx) { return row.attr('data-id') != el.LineID });
                    row.remove();

                }
                else {
                    //debugger;
                    that.planMigrationSession.Current.ServicesCore = that.planMigrationSession.Current.ServicesCore.filter(function (el, idx) { return row.attr('data-id') != el.LineID });
                    row.empty().attr('data-id', $optionSelect.val());


                    markup += '<td class="td-cp"><img src="/Content/Images/SUFija/ico_3play_sm.svg" alt=""></td>';
                    markup += string.format('<td class="td-cp name-items">{0}</td>', $optionSelect.text());
                    markup += '<td class="td-cp"></td>';
                    markup += string.format('<td class="td-cp" data-price="{0}">S/. {1}</td>', $optionSelect.attr('data-price'), that.priceFormat($optionSelect.attr('data-price')));
                    row.append(markup);
                    //1_2_3_play_cable- IPTV + GPON                    
                    var EquServicio = coreServices
                                      .filter(function (item) {
                                          return item.ServiceType == $optionSelect.attr('servicetype') &&
                                                 item.ServiceDescription == $optionSelect.text()
                                      });

                    $.each(EquServicio, function (index, item) {
                        that.planMigrationSession.Current.ServicesCore.push({
                            LineID: item.LineID == null ? "" : item.LineID,
                            ServiceDescription: item.ServiceDescription == null ? "" : item.ServiceDescription,
                            ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                            idServicio: item.sncode == null ? "" : item.sncode,
                            Price: item.FixedCharge == null ? "" : item.FixedCharge,
                            idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                            idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                            banwid: item.capacidad == null ? "" : item.capacidad,
                            unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                            tipequ: item.tipEqu == null ? "" : item.tipEqu,
                            codTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                            cantidad: item.cantidad == null ? "" : item.cantidad,
                            descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                            codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                            spcode: item.spCode == null ? "" : item.spCode,
                            GroupName: item.Group == null ? "" : item.Group,
                            CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                            po: item.po == null ? "" : item.po,
                            poType: item.poType == null ? "" : item.poType,
                            idProducto: item.idProducto == null ? "" : item.idProducto,
                            umbCons: item.umbCons == null ? "" : item.umbCons,
                            tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                            familia: item.familia == null ? "" : item.familia,
                            pop1: item.pop1 == null ? "" : item.pop1,
                            pop2: item.pop2 == null ? "" : item.pop2
                        });
                    });
                    // debugger;
                }
            }

            that.calculateCost(controls.tblAllServices, [controls.nextReceipt]);
            that.calculateCost(controls.tblRecurrentServices, [controls.totalPrice, controls.newFixedCharge]);
        },

        addCoreService: function (oRow) {

            var that = this,
                controls = this.getControls();

            var markup = '';

            markup += string.format('<tr id="{0}Row" data-id="{1}">', oRow.id, oRow.dataId);
            markup += '<td class="td-cp"><img src="/Content/Images/SUFija/ico_3play_sm.svg" alt=""></td>';
            markup += string.format('<td class="td-cp name-items">{0}</td>', oRow.desc);
            markup += '<td class="td-cp"></td>';
            markup += string.format('<td class="td-cp" data-price="{0}">S/. {1}</td>', oRow.dataPrice, that.priceFormat(oRow.dataPrice));
            markup += '</tr>';

            controls.tblServicesCore.find('tbody').append(markup);




        },

        /* PartialView AdditionalServices - Servicios Adicionales */

        onSelectAdditionalService: function () {

            var that = this,
                controls = this.getControls();

            $.each(controls.cboAdditionalServices, function (idx, select) {

                $(this).multiselect({

                    onChange: function (opt, checked) {
                        var table = controls.tblAdditionalServices;

                        if (checked) {

                            if (that.planMigrationSession.TelephonyValuePrev !== '') {
                                if (opt[0].value !== '') {
                                    if (opt.data('servicetype') == 'Telefonia' || opt.data('servicetype') == 'Telefonía') {
                                        if (that.planMigrationSession.TelephonyValuePrev !== opt[0].value) {
                                            $('#' + that.planMigrationSession.TelephonyValuePrev).remove();
                                            that.planMigrationSession.Current.AdditionalServices = that.planMigrationSession.Current.AdditionalServices.filter(function (el, idx) { return that.planMigrationSession.TelephonyValuePrev != el.id });
                                        }
                                    }
                                } else {
                                    $('#' + that.planMigrationSession.TelephonyValuePrev).remove();
                                    that.planMigrationSession.Current.AdditionalServices = that.planMigrationSession.Current.AdditionalServices.filter(function (el, idx) { return that.planMigrationSession.TelephonyValuePrev != el.id });
                                    that.calculateCost(controls.tblAllServices, [controls.nextReceipt]);
                                    that.calculateCost(controls.tblRecurrentServices, [controls.totalPrice, controls.newFixedCharge]);
                                    return;
                                }
                            }

                            var markup = "";
                            markup += string.format('<tr id="{0}">', opt[0].value);
                            markup += '<td class="td-cp text-left"><span><a href="javascript:void(0)" class="remove addedService" style="padding-right:10px;">';
                            markup += string.format('<i class="glyphicon glyphicon-minus-sign"></i></a></span><img src="{0}">{1}', opt.data('img'), opt[0].label);
                            markup += '</td><td class="td-cp"></td>';
                            markup += string.format('<td class="td-cp text-right" data-price="{0}"> S/. {1}</td>', opt.data('price'), that.priceFormat(opt.data('price')));
                            markup += '</tr>';
                            //debugger;
                            table.find('tbody').append(markup);
                            //IdServicio :  item.sncode, CodTipoEquipo :  item.codigoTipEqu, Tipequ :
                            that.planMigrationSession.Current.AdditionalServices.push({
                                LineID: opt.data('lineid') == null ? "" : opt.data('lineid'),
                                ServiceDescription: opt.data('servicedescription') == null ? "" : opt.data('servicedescription'),
                                ServiceType: opt.data('servicetype') == null ? "" : opt.data('servicetype'),
                                idServicio: opt.data('idservicio') == null ? "" : opt.data('idservicio'),
                                Price: opt.data('price') == null ? "" : opt.data('price'),
                                idGrupoPrincipal: opt.data('idgrupoprincipal') == null ? "" : opt.data('idgrupoprincipal'),
                                idGrupo: opt.data('idgrupo') == null ? "" : opt.data('idgrupo'),
                                banwid: opt.data('banwid') == null ? "" : opt.data('banwid'),
                                unidadcapacidad: opt.data('unidadcapacidad') == null ? "" : opt.data('unidadcapacidad'),
                                tipequ: opt.data('tipequ') == null ? "" : opt.data('tipequ'),
                                codTipoEquipo: opt.data('codtipoequipo') == null ? "" : opt.data('codtipoequipo'),
                                descEquipo: opt.data('descEquipo') == null ? "" : opt.data('descEquipo'),
                                cantidad: opt.data('cantidad'), //== null ? "0" : opt.data('cantidad'),
                                codigoExterno: opt.data('codigoExterno') == null ? "" : opt.data('codigoExterno'),
                                spcode: opt.data('spcode') == null ? "" : opt.data('spcode'),
                                GroupName: opt.data('groupname') == null ? "" : opt.data('groupname'),
                                CoreAdicional: opt.data('coreadicional') == null ? "" : opt.data('coreadicional'),
                                po: opt.data('po') == null ? "" : opt.data('po'),
                                poType: opt.data('potype') == null ? "" : opt.data('potype'),
                                idProducto: opt.data('idProducto') == null ? "" : opt.data('idProducto'),
                                umbCons: opt.data('umbCons') == null ? "" : opt.data('umbCons'),
                                tipoLimCred: opt.data('tipoLimCred') == null ? "" : opt.data('tipoLimCred'),
                                familia: opt.data('familia') == null ? "" : opt.data('familia'),
                                pop1: opt.data('pop1') == null ? "" : opt.data('pop1'),
                                pop2: opt.data('pop2') == null ? "" : opt.data('pop2'),
                                id: opt[0].value,
                                desc: opt[0].label,
                                img: opt.data('img')
                            })

                            if (opt.data('servicetype') == 'Telefonia' || opt.data('servicetype') == 'Telefonía') {
                                that.planMigrationSession.TelephonyValuePrev = opt[0].value;
                            }
                        }
                        else {
                            $('#' + opt[0].value).remove();
                            that.planMigrationSession.Current.AdditionalServices = that.planMigrationSession.Current.AdditionalServices.filter(function (el, idx) { return opt[0].value != el.id });
                        }

                        that.calculateCost(controls.tblAllServices, [controls.nextReceipt]);
                        that.calculateCost(controls.tblRecurrentServices, [controls.totalPrice, controls.newFixedCharge]);
                    }
                });
            });

        },
        removeAdditionalService: function () {

            var that = this,
                controls = this.getControls();

            controls.tblAdditionalServices.on('click', '.addedService',
                function (e) {
                    var row = $(this).closest('tr');

                    row.remove();
                    controls.cboAdditionalServices.multiselect('deselect', row.attr('id'));
                    that.planMigrationSession.Current.AdditionalServices = that.planMigrationSession.Current.AdditionalServices.filter(function (el, idx) { return row.attr('id') != el.id });

                    that.calculateCost(controls.tblAllServices, [controls.nextReceipt]);
                    that.calculateCost(controls.tblRecurrentServices, [controls.totalPrice, controls.newFixedCharge]);
                });
        },

        addEquipment: function (el) {
            //debugger;
            var that = this,
                controls = that.getControls();

            var obj = {};
            var equipment = {};

            
            if (that.planMigrationSession.Current.AdditionalEquipment.length == that.planMigrationSession.Configuration.Constants.Constantes_maxDecosAdicionales){
                alert('Se alcanzó el número máximo de Decos adicionales.');
                return
            }             

            equipment.name = $(el).closest('tr').attr('data-name');
            equipment.type = $(el).closest('tr').attr('data-type');
            equipment.unitPrice = $(el).closest('tr').attr('data-price');
            equipment.quantity = $(string.format('#spnQuantity{0}', equipment.type)).text();
            equipment.ServiceDescription = $(el).closest('tr').attr('data-servicedescription') == null ? "" : $(el).closest('tr').attr('data-servicedescription');

            var quantity = parseInt(equipment.quantity, 10) + 1;

            var cantidadTotalDecos = that.planMigrationSession.Current.AdditionalEquipment.length == 0 ? 1 :
                that.planMigrationSession.Current.AdditionalEquipment.length + 1;
            if (cantidadTotalDecos > parseInt(that.planMigrationSession.Configuration.Constants.Constantes_CantidadMaximaEquipos)) return; //that.planMigrationSession.Configuration.Constants.CantidadMaximaEquipos



            var additionalEquipment = that.planMigrationSession.Data.FixedPlanDetail
                .filter(function (item) {
                    return item.PlanCode == that.planMigrationSession.Current.Plan.PlanCode &&
                        /*item.coreAdicional == 'EQUIPO_ALQUILER' &&
                        item.ServiceEquiptment == 'EQUIPO' &&*/
                        ((item.coreAdicional == 'EQUIPO_ALQUILER' && item.ServiceEquiptment == 'EQUIPO') || item.ServiceType == 'ALQUILER EQUIPOS IPTV' || item.ServiceType == 'ALQUILER EQUIPOS') &&
                        item.tipoEquipo.toUpperCase() == equipment.ServiceDescription.toUpperCase() &&
                        item.ServiceDescription.toUpperCase().indexOf(quantity) > -1 &&
                        isNaN(item.EquipmentCode)
                })
                .map(function (item) {
                    return {

                        ServiceDescription: item.ServiceDescription,
                        LineID: item.LineID == null ? "" : item.LineID, //Cod Plan PVUDB
                        FixedCharge: item.FixedCharge == null ? "" : item.FixedCharge,



                        ServiceType: item.ServiceType == null ? "" : item.ServiceType,
                        IdServicio: item.sncode == null ? "" : item.sncode,
                        spcode: item.spCode == null ? "" : item.spCode,
                        GroupName: item.Group == null ? "" : item.Group,
                        unitPrice: item.FixedCharge == null ? "" : item.FixedCharge,
                        price: item.FixedCharge == null ? "" : item.FixedCharge,
                        idGrupoPrincipal: item.grupoPadre == null ? "" : item.grupoPadre,
                        idGrupo: item.CodeGroup == null ? "" : item.CodeGroup,
                        banwid: item.capacidad == null ? "" : item.capacidad,
                        unidadcapacidad: item.unidadCapacidad == null ? "" : item.unidadCapacidad,
                        Tipequ: item.tipEqu == null ? "" : item.tipEqu,
                        CodTipoEquipo: item.codigoTipEqu == null ? "" : item.codigoTipEqu,
                        cantidad: item.cantidad == null ? "" : item.cantidad,
                        descEquipo: item.descEquipo == null ? "" : item.descEquipo,
                        codigoExterno: item.codigoExterno == null ? "" : item.codigoExterno,
                        CoreAdicional: item.coreAdicional == null ? "" : item.coreAdicional,
                        po: item.po == null ? "" : item.po,
                        poType: item.poType == null ? "" : item.poType,
                        idProducto: item.idProducto == null ? "" : item.idProducto,
                        umbCons: item.umbCons == null ? "" : item.umbCons,
                        tipoLimCred: item.tipoLimCred == null ? "" : item.tipoLimCred,
                        familia: item.familia == null ? "" : item.familia,
                        pop1: item.pop1 == null ? "" : item.pop1,
                        pop2: item.pop2 == null ? "" : item.pop2
                    };
                });


            //SI NO HAY DESCRIPCION DE SERVICIO ACORDE A LA CANTIDAD QUE ESTA INGRESANDO , ENTONCES NO INGRESA
            if (additionalEquipment.length <= 0) {
                quantity = quantity--;
                cantidadTotalDecos--;
                return;
            }
            //var quantity = parseInt(equipment.quantity, 10) + 1;
            $(string.format('#spnQuantity{0}', equipment.type)).text(quantity);

            var equipmentRow = controls.tblAdditionalServices.find(string.format('tr[id="{0}Row"]', additionalEquipment[0].LineID /*equipment.type*/));


            //ESTO ES PARA MOSTRAR EL TOTAL DE PRECIO POR DETALLE DE EQUIPOS
            var markup = '';
            markup += string.format('<tr id="{0}Row">', additionalEquipment[0].LineID);
            markup += string.format('<td class="td-cp text-left"><img src="/Content/Images/SUFija/ico_deco.svg">Deco {0}</td>', additionalEquipment[0].ServiceDescription /*equipment.name*/);
            markup += '<td class="td-cp"></td>';
            //markup += string.format('<td class="td-cp text-right" data-price="{0}">S/ {1}</td>', equipment.unitPrice, that.priceFormat(equipment.unitPrice));
            markup += string.format('<td class="td-cp text-right" data-price="{0}">S/ {1}</td>', additionalEquipment[0].unitPrice, that.priceFormat(additionalEquipment[0].unitPrice));
            markup += '</tr>';

            controls.tblAdditionalServices.find('tbody').append(markup);

            that.planMigrationSession.Current.AdditionalEquipment.push({

                LineID: additionalEquipment[0].LineID,
                ServiceDescription: additionalEquipment[0].ServiceDescription,
                ServiceType: additionalEquipment[0].ServiceType,
                idServicio: additionalEquipment[0].IdServicio,
                Price: additionalEquipment[0].price,
                idGrupoPrincipal: additionalEquipment[0].idGrupoPrincipal,
                idGrupo: additionalEquipment[0].idGrupo,
                banwid: additionalEquipment[0].banwid,
                unidadcapacidad: additionalEquipment[0].unidadcapacidad,
                tipequ: additionalEquipment[0].Tipequ,
                codTipoEquipo: additionalEquipment[0].CodTipoEquipo,
                descEquipo: additionalEquipment[0].descEquipo,
                cantidad: "1",//quantity,
                codigoExterno: additionalEquipment[0].codigoExterno,
                spcode: (additionalEquipment[0].spcode == null || additionalEquipment[0].spcode == '') ? '1124' : additionalEquipment[0].spCode, //Default 1124  EQUIPO_ALQUILER
                GroupName: additionalEquipment[0].GroupName,
                CoreAdicional: additionalEquipment[0].CoreAdicional,
                po: additionalEquipment[0].po,
                poType: additionalEquipment[0].poType,
                idProducto: additionalEquipment[0].idProducto,
                umbCons: additionalEquipment[0].umbCons,
                tipoLimCred: additionalEquipment[0].tipoLimCred,
                familia: additionalEquipment[0].familia,
                pop1: additionalEquipment[0].pop1,
                pop2: additionalEquipment[0].pop2,
                id: equipment.type,
                desc: equipment.name,
                img: '/Content/Images/SUFija/ico_deco.svg',
                quantity: quantity
            })
            that.calculateCost(controls.tblAllServices, [controls.nextReceipt]);
            that.calculateCost(controls.tblRecurrentServices, [controls.totalPrice, controls.newFixedCharge]);



        },

        substractEquipment: function (el) {

            var that = this,
                controls = that.getControls();

            var obj = {};
            var equipment = {};

            equipment.name = $(el).closest('tr').attr('data-name');
            equipment.type = $(el).closest('tr').attr('data-type');
            equipment.unitPrice = $(el).closest('tr').attr('data-price');
            equipment.quantity = $(string.format('#spnQuantity{0}', equipment.type)).text();

            equipment.id = $(el).closest('tr').attr('data-idservicio');


            if (equipment.quantity == 0) {
                return false;
            }
            else {
                var quantity = parseInt(equipment.quantity, 10) - 1;
                $(string.format('#spnQuantity{0}', equipment.type)).text(quantity);


                var xadditionalEquipment = that.planMigrationSession.Data.FixedPlanDetail
                      .filter(function (item) {
                          return item.PlanCode == that.planMigrationSession.Current.Plan.PlanCode &&
                              /*item.coreAdicional == 'EQUIPO_ALQUILER' &&
                              item.ServiceEquiptment == 'EQUIPO' &&*/
                              ((item.coreAdicional == 'EQUIPO_ALQUILER' && item.ServiceEquiptment == 'EQUIPO') || item.ServiceType == 'ALQUILER EQUIPOS IPTV' || item.ServiceType == 'ALQUILER EQUIPOS') &&
                              item.tipoEquipo.toUpperCase() == equipment.name.toUpperCase() &&
                              item.ServiceDescription.toUpperCase().indexOf(equipment.quantity) > -1 &&
                              isNaN(item.EquipmentCode)
                      })
                      .map(function (item) {
                          return {
                              LineID: item.LineID == null ? "" : item.LineID,
                          };
                      });


                var equipmentRow = controls.tblAdditionalServices.find(string.format('tr[id="{0}Row"]', xadditionalEquipment[0].LineID));

                ///if (equipmentRow.length > 0) {
                equipmentRow.remove();

                if (quantity == 0) {
                    //equipmentRow.remove();
                    //that.planMigrationSession.Current.AdditionalEquipment = that.planMigrationSession.Current.AdditionalEquipment.filter(function (el, idx) { return equipment.type != el.id });

                }
                else {
                    equipmentRow.children().each(function (idx) {
                        if (typeof $(this).attr('data-price') !== 'undefined') {
                            $(this).attr('data-price', quantity * equipment.unitPrice);
                            $(this).text(string.format('S/ {0}', that.priceFormat(quantity * equipment.unitPrice)));
                        }
                    });

                    //obj = that.planMigrationSession.Current.AdditionalEquipment.find(function (e) { return e.id == equipment.type })
                    //obj.quantity = quantity;

                }


                var additionalEquipment = that.planMigrationSession.Data.FixedPlanDetail
                    .filter(function (item) {
                        return item.PlanCode == that.planMigrationSession.Current.Plan.PlanCode &&
                           /*item.coreAdicional == 'EQUIPO_ALQUILER' &&
                            item.ServiceEquiptment == 'EQUIPO' && */
                            ((item.coreAdicional == 'EQUIPO_ALQUILER' && item.ServiceEquiptment == 'EQUIPO') || item.ServiceType == 'ALQUILER EQUIPOS IPTV' || item.ServiceType == 'ALQUILER EQUIPOS') &&
                            item.tipoEquipo.toUpperCase() == equipment.name.toUpperCase() &&
                            item.ServiceDescription.toUpperCase().indexOf(equipment.quantity) > -1 &&
                            isNaN(item.EquipmentCode)
                    })
                    .map(function (item) {
                        return {
                            LineID: item.LineID == null ? "" : item.LineID,
                        };
                    });


                that.planMigrationSession.Current.AdditionalEquipment = that.planMigrationSession.Current.AdditionalEquipment.filter(function (el, idx) {
                    return el.LineID != additionalEquipment[0].LineID
                });
                ////}

                that.calculateCost(controls.tblAllServices, [controls.nextReceipt]);
                that.calculateCost(controls.tblRecurrentServices, [controls.totalPrice, controls.newFixedCharge]);
            }
        },

        /* PartialView AdditionalPoints - Puntos Adicionales */

        addAdditionalEquipment: function (el) {

            var that = this,
                controls = that.getControls();

            var obj = {};
            var equipment = {};

            equipment.name = $(el).closest('tr').attr('data-name');
            equipment.type = $(el).closest('tr').attr('data-type');
            equipment.unitPrice = $(el).closest('tr').attr('data-price');
            equipment.quantity = $(string.format('#spnQuantity{0}', equipment.type)).text();
            equipment.image = (equipment.type == 'Anx') ? 'ico_phone.svg' : 'ico_internet.svg';

            var quantity = parseInt(equipment.quantity, 10) + 1;
            $(string.format('#spnQuantity{0}', equipment.type)).text(quantity);

            var equipmentRow = controls.tblAdditionalPoints.find(string.format('tr[id="{0}Row"]', equipment.type));

            if (equipmentRow.length == 0) {

                var markup = '';
                markup += string.format('<tr id="{0}Row">', equipment.type);
                markup += string.format('<td class="td-cp text-left" colspan="2"><img src="/Content/Images/SUFija/{0}">{1}</td>', equipment.image, equipment.name);
                markup += string.format('<td class="td-cp text-right" data-price="{0}">S/ {1}</td>', equipment.unitPrice, that.priceFormat(equipment.unitPrice));
                markup += '</tr>';


                that.planMigrationSession.Current.AdditionalPoints.push({ id: equipment.type, desc: equipment.name, img: string.format('/Content/Images/SUFija/{0}', equipment.image), quantity: quantity })
                controls.tblAdditionalPoints.prepend(markup);
            }
            else {
                equipmentRow.children().each(function (idx) {
                    if (typeof $(this).attr('data-price') !== 'undefined') {
                        $(this).attr('data-price', quantity * equipment.unitPrice);
                        $(this).text(string.format('S/ {0}', that.priceFormat(quantity * equipment.unitPrice)));
                    }
                });

                obj = that.planMigrationSession.Current.AdditionalPoints.find(function (e) { return e.id == equipment.type })
                obj.quantity = quantity;
            }

            that.installationFee();
            that.calculateCost(controls.tblAllServices, [controls.nextReceipt]);
        },

        substractAdditionalEquipment: function (el) {

            var that = this,
                controls = that.getControls();

            var obj = {};
            var equipment = {};

            equipment.name = $(el).closest('tr').attr('data-name');
            equipment.type = $(el).closest('tr').attr('data-type');
            equipment.unitPrice = $(el).closest('tr').attr('data-price');
            equipment.quantity = $(string.format('#spnQuantity{0}', equipment.type)).text();

            if (equipment.quantity == 0) {
                return false; // alert(string.format('No se pueden eliminar más {0}.', equipment.name));
            }
            else {
                var quantity = parseInt(equipment.quantity, 10) - 1;
                $(string.format('#spnQuantity{0}', equipment.type)).text(quantity);

                var equipmentRow = controls.tblAdditionalPoints.find(string.format('tr[id="{0}Row"]', equipment.type));

                if (equipmentRow.length > 0) {

                    if (quantity == 0) {
                        equipmentRow.remove();
                        that.planMigrationSession.Current.AdditionalPoints = that.planMigrationSession.Current.AdditionalPoints.filter(function (el, idx) { return equipment.type != el.id });
                    }
                    else {
                        equipmentRow.children().each(function (idx) {
                            if (typeof $(this).attr('data-price') !== 'undefined') {
                                $(this).attr('data-price', quantity * equipment.unitPrice);
                                $(this).text(string.format('S/ {0}', that.priceFormat(quantity * equipment.unitPrice)));
                            }
                        });

                        obj = that.planMigrationSession.Current.AdditionalPoints.find(function (e) { return e.id == equipment.type })
                        obj.quantity = quantity;
                    }
                }

                that.installationFee();
                that.calculateCost(controls.tblAllServices, [controls.nextReceipt]);
            }
        },

        installationFee: function () {

            var that = this,
                controls = that.getControls();

            var rows = controls.tblNonRecurrentServices.find('tbody').children();

            if (rows.length > 0) {

                if ($('#instFee').length == 0) {

                    var markup = '';

                    markup += '<tr id="instFee">';
                    markup += '<td class="td-cp text-left"><img src="/Content/Images/SUFija/ico_wrench.svg">Costo de Instalación</td>';
                    markup += '<td class="td-cp text-left"><input type="checkbox"> Fidelizar</td>';
                    markup += '<td class="td-cp text-right" data-price="10">S/ 10.00</td>';
                    markup += '</tr>';

                    controls.tblAdditionalPoints.append(markup);

                    $('#instFee').find('input').on('click', function () {

                        if ($(this).is(':checked')) {
                            $(this).closest('tr').find('td').last().html('S/ 0.00');
                            $(this).closest('tr').find('td').last().attr('data-price', 0);
                        }
                        else {
                            $(this).closest('tr').find('td').last().html('S/ 10.00');
                            $(this).closest('tr').find('td').last().attr('data-price', 10);
                        }

                        that.calculateCost(controls.tblAllServices, [controls.nextReceipt]);
                    });
                }
                else {
                    if (rows.length == 1 && $('#instFee').length > 0) {
                        $('#instFee').find('input').off();
                        $('#instFee').remove();
                    }
                }
            }

        },

        /* PartialView Scheduling - Agendamiento */

        loadSchedulingInformation: function () {

            var that = this,
                controls = this.getControls();


        },

        /* PartialView TechnicalData - Datos Técnicos */

        loadTechnicalDataInformation: function () {

            var that = this,
                controls = this.getControls();

            // Default Email
            if (controls.mailText.length > 0) { controls.mailText.val(that.planMigrationSession.Data.CustomerInformation.Email); }

        },
        txtCalendar_Change: function () {
            var that = this;
            var controls = this.getControls();


            if ($("#ddlWorkType option:selected").html() == '-Seleccionar-' && that.planMigrationSession.Data.ValidaEta.FlagIndica != '0') {
                controls.ddlWorkType.closest('.form-control').addClass('has-error');
                controls.WorkTypeErrorMessage.text('Seleccione un Tipo de Trabajo válido');
                alert('Seleccione un Tipo de Trabajo válido');
                controls.ddlWorkType.focus();
                return false;
            }

            if ($("#ddlSubWorkType option:selected").html() == '-Seleccionar-' && that.planMigrationSession.Data.ValidaEta.FlagIndica != '0') {
                controls.ddlSubWorkType.closest('.form-control').addClass('has-error');
                controls.subWorkTypeErrorMessage.text('Seleccione un Sub Tipo de Trabajo válido');
                alert('Seleccione un Sub Tipo de Trabajo válido');
                controls.ddlSubWorkType.focus();
                return false;
            }

            //var fechaSeleccionada = that.getFormatFecha(controls.txtCalendar.val());
            var fechaSeleccionada = controls.txtCalendar.val(); //FORMATO =>;/"25/10/2020"//
            //2= SI O SI SUBTIPO DE TRABAJO 


            that.getLoadingPage();

            //var ActivityCapacity = [
            //    { "nombre": "XA_Map", "valor": "0LAMO088-F" }, /*controls.txtCodPlane.val().padStart(10, "0") *///000LMSQ090 //"000L14001V"
            //    { "nombre": "XA_WorkOrderSubtype", "valor": "FTTHTE01" },// controls.ddlSubWorkType.val() },// HFCPTI01
            //    { "nombre": "XA_Zone", "valor": "4000" }/*that.planMigrationSession.Data.ValidaEta.CodigoZona *///3133
            //]

            var ActivityCapacity = [
                //{ "nombre": "XA_Map", "valor": that.planMigrationSession.Data.Instalacion.CodPlano.padStart(10, "0") }, /*controls.txtCodPlane.val().padStart(10, "0") *///000LMSQ090 //"000L14001V"
                { "nombre": "XA_Map", "valor": that.PadLeft(that.planMigrationSession.Data.Instalacion.CodPlano, 10) },
                { "nombre": "XA_WorkOrderSubtype", "valor": controls.ddlSubWorkType.val() },// controls.ddlSubWorkType.val() },// HFCPTI01
                { "nombre": "XA_Zone", "valor": that.planMigrationSession.Data.ValidaEta.CodigoZona }/*that.planMigrationSession.Data.ValidaEta.CodigoZona *///3133
            ]



            controls.txtCalendar.closest('.form-control').removeClass('has-error');
            controls.calendarErrorMessage.text('');


            that.loadCargaFranjaHorario(
                that.planMigrationSession.Data.ValidaEta.FlagIndica,//flagValidaEta
                controls.ddlWorkType.val(),
                fechaSeleccionada,//fechaAgenda
                that.planMigrationSession.Configuration.Constants.Constantes_Origen, //    that.planMigrationSession.Configuration.Constants.Origen,//origen
                that.planMigrationSession.Data.Instalacion.CodPlano, // "LAMO088-F", 
                that.planMigrationSession.Data.Instalacion.Ubigeo, //"150114", 
                $("#ddlSubWorkType option:selected").attr("idtiposervicio"), //"Post-Venta",//$("#ddlSubWorkType option:selected").attr("typeservice"); //"Post-Venta"- 0062
                $("#ddlSubWorkType option:selected").attr('codtipoorden'), //"FTTHTE",//tipoOrden--Necesario?
                controls.ddlSubWorkType.val(),//"FTTHTE01",
                that.planMigrationSession.Data.ValidaEta.CodigoZona,//"4000",
                Session.SessionParams.DATACUSTOMER.CustomerID,
                Session.SessionParams.DATACUSTOMER.ContractID,
                that.planMigrationSession.Configuration.Constants.Constantes_ReglaValidacion,//that.planMigrationSession.Configuration.Constants.ReglaValidacion,
                ActivityCapacity
            );

        },
        loadCargaFranjaHorario: function (
            flagValidaEta,
            tipoTrabajo,
            fechaAgenda,
            origen,
            idPlano,
            ubigeo,
            tipoServicio,
            tipoOrden,
            subtipoOrden,
            codZona,
            customer,
            contrato,
            reglaValidacion,
            listaCampoActividadCapacidad
        ) {
            //debugger;
            var that = this,
                controls = this.getControls();
            var objLoadParameters = {};
            objLoadParameters.flagValidaEta = flagValidaEta;
            objLoadParameters.disponibilidad = $("#ddlSubWorkType option:selected").attr("disponibilidad"); // "180";//$("#ddlSubWorkType option:selected").attr("disponibilidad");
            objLoadParameters.tipTra = tipoTrabajo;
            objLoadParameters.tipSrv = tipoServicio
            objLoadParameters.fechaAgenda = fechaAgenda;
            objLoadParameters.origen = origen;
            objLoadParameters.idPlano = idPlano;
            objLoadParameters.ubigeo = ubigeo;
            objLoadParameters.tipoOrden = tipoOrden;
            objLoadParameters.subtipoOrden = subtipoOrden;
            objLoadParameters.codZona = codZona;
            objLoadParameters.customer = customer;
            objLoadParameters.contrato = contrato;
            objLoadParameters.reglaValidacion = reglaValidacion;
            objLoadParameters.listaCampoActividadCapacidad = listaCampoActividadCapacidad;

            $.app.ajax({
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                url: '/PlanMigration/Home/GetDatosFranjaHorario',
                data: JSON.stringify(objLoadParameters),
                success: function (response) {
                    that.createDropdownFillFranja(response, controls.ddlTimeZone);

                    $.unblockUI();
                },
                error: function (ex) {
                }
            }
            );
        },

        createDropdownFillFranja: function (response, objeto) {
            objeto.empty();

            var that = this;
            objeto.append($('<option>', { value: '', html: 'Seleccionar' }));

            if (response.dataCapacity.MessageResponse.Body.listaFranjaHorarioCapacity != null) {
                var i = 0;
                $.each(response.dataCapacity.MessageResponse.Body.listaFranjaHorarioCapacity, function (index, value) {
                    if (value.Estado == 'RED') {
                        objeto.append('<option idHorario="' + value.Descripcion2.split('-')[0] + '" style="background-color: #E60000; color:#ffffff" value="' + value.Codigo + '" Disabled>' + value.Descripcion + '</option>');
                    }
                    else {
                        objeto.append('<option idHorario="' + value.Descripcion2.split('-')[0] + '" idConsulta="' + value.Codigo2 + '" Franja="' + value.Codigo + '" idBucket="' + value.Codigo3 + '" style="background-color: #FFFFFF;" value="' + value.Codigo + '+' + value.Codigo3 + '">' + value.Descripcion + '</option>');
                        //value.Codigo2: idConsulta- xejmpl: 7176588
                        //value.Codigo :vFranja  - xejmpl: AM2
                        //value.Codigo3: idBucket - xejmpl: BUCKET_PRUEBA_FTTH
                        //value.Descripcion2: FRANJA_HOR - xejmpl: 09:00-11:00
                    }
                });
            }

            if (response.dataCapacity.MessageResponse.Body.listaFranjaHorarioSga != null) {
                $.each(response.dataCapacity.MessageResponse.Body.listaFranjaHorarioSga, function (index, value) {

                    if (value.Codigo == null) //Debe retorna el servicio
                        objeto.append($('<option>', { value: value.Descripcion, html: value.Descripcion }));
                    else
                        objeto.append($('<option>', { value: value.Descripcion, html: value.Descripcion }));

                });
            }

            if (response.dataCapacity.MessageResponse.Body.listaFranjaHorarioXml != null) {
                $.each(response.dataCapacity.MessageResponse.Body.listaFranjaHorarioXml, function (index, value) {

                    if (value.Codigo == null) //Debe retorna el servicio
                        objeto.append($('<option>', { value: value.Descripcion, html: value.Descripcion }));
                    else
                        objeto.append($('<option>', { value: value.Descripcion, html: value.Descripcion }));

                });
            }
        },

        onMailCheck: function () {

            var that = this,
                controls = this.getControls();

            if (controls.mailCheck.is(':checked')) {
                controls.mailText.attr('disabled', false);
            }
            else {
                controls.mailErrorMessage.text('');
                controls.mailText.val('');
                controls.mailText.closest('.form-group').removeClass('has-error');
                controls.mailText.attr('disabled', true);
            }
        },

        onFocusoutEmail: function () {

            var that = this,
                controls = this.getControls();

            var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

            if (controls.mailCheck.is(':checked')) {
                if (!filter.test(controls.mailText.val())) {
                    controls.mailText.closest('.form-control').addClass('has-error');
                    controls.mailErrorMessage.text('Ingrese una dirección de correo válida.');
                    controls.mailText.focus();

                    return false;
                }
                else {
                    controls.mailText.closest('.form-control').removeClass('has-error');
                    controls.mailErrorMessage.text('');

                    return true;
                }
            }

            return true;
        },

        /* PartialView SummaryPackage - Resumen */

        generatePlanDetail: function () {

            var that = this,
                arrPlan, content, separator,
                controls = this.getControls();

            controls.resumeServices.empty();

            separator = '<span class="text-line text-line-red  remove-padding">+</span>';

            content = '<img src="/Content/Images/SUFija/ico_3play_md.svg" alt="" class="icon-collapse-bar-horizontal remove-padding" style="width: 80px;" />';
            content += string.format('<span class="text-line remove-padding">{0}</span>', controls.txtSolucion.val());


            $.each(that.planMigrationSession.Current.AdditionalServices, function (idx, service) {
                content += separator;
                content += string.format('<img src="{0}" alt="" class="icon-collapse-bar-horizontal remove-padding" style="width: 30px;" />', service.img);
                content += string.format('<span class="text-line">{0}</span>', service.desc);
            });

            $.each(that.planMigrationSession.Current.AdditionalEquipment, function (idx, equipment) {
                content += separator;
                content += string.format('<img src="{0}" alt="" class="icon-collapse-bar-horizontal remove-padding" style="width: 30px;" />', equipment.img);
                content += string.format('<span class="text-line">{0} {1}</span>', equipment.quantity, equipment.desc);
            });

            $.each(that.planMigrationSession.Current.AdditionalPoints, function (idx, equipment) {
                content += separator;
                content += string.format('<img src="{0}" alt="" class="icon-collapse-bar-horizontal remove-padding" style="width: 30px;" />', equipment.img);
                content += string.format('<span class="text-line">{0} {1}</span>', equipment.quantity, equipment.desc);
            });

            controls.resumeServices.append(content);

            //debugger;
            var markup = "";
            markup += '<b>---------------PLAN ACTUAL---------------</b><br />';
            markup += string.format('<b>Campaña:</b>{0} <br />', Session.SessionParams.DATASERVICE.Campaign);
            markup += string.format('<b>Ciclo de Facturación:</b>{0} <br />', that.planMigrationSession.Data.CustomerInformation.BillingCycle);
            markup += string.format('<b>Servicio:</b>{0}<br />', that.planMigrationSession.Data.CustomerInformation.PackageDescription);
            markup += string.format('<b>Combinación:</b> {0}<br />', Session.SessionParams.DATASERVICE.Plan);
            /******/
            var servicesCoreCurrent = that.planMigrationSession.Data.CoreServices;
            var aplicaIGV = (that.planMigrationSession.Data.plataformaAT == 'TOBE') ? '1.00' : '1.' + that.planMigrationSession.Data.Configuration.Constantes_Igv;/*TOBE  incluido Igv*/
            debugger;
            $.each(servicesCoreCurrent, function (i, serv) {
                markup += string.format('<b> {0} | {1}  Costo S/.  {2}  </b>  <br />', serv.ServiceName, serv.ServiceDescription, that.priceFormat(parseFloat(serv.FixedCharge) * parseFloat(aplicaIGV)));
            });

            /*var additionalInternetCurrent = that.planMigrationSession.Data.AdditionalServices.filter(function (el, idx) { return el.ServiceName == 'Internet' }),
                additionalTelefoniaCurrent = that.planMigrationSession.Data.AdditionalServices.filter(function (el, idx) { return (el.ServiceName == 'Telefonía' || el.ServiceName == 'Telefonia') && parseFloat(el.FixedCharge) > 0.00 }),
                additionalCableCurrent = that.planMigrationSession.Data.AdditionalServices.filter(function (el, idx) { return el.ServiceName == 'Cable' }),
                servicesAdditionalCurrent = additionalInternetCurrent.concat(additionalTelefoniaCurrent).concat(additionalCableCurrent);*/
            var additionalInternetCurrent = that.planMigrationSession.Data.AdditionalServices.filter(function (el, idx) { return el.ServiceName.toUpperCase().indexOf('INTERNET') > -1 }),
               additionalTelefoniaCurrent = that.planMigrationSession.Data.AdditionalServices.filter(function (el, idx) { return (el.ServiceName.toUpperCase().indexOf('TELEFONIA') > -1 || el.ServiceName.toUpperCase().indexOf('TELEFONÍA') > -1) && parseFloat(el.FixedCharge) > 0.00 }),
               additionalCableCurrent = that.planMigrationSession.Data.AdditionalServices.filter(function (el, idx) { return el.ServiceName.toUpperCase().indexOf('CABLE') > -1 }),
                servicesAdditionalCurrent = additionalInternetCurrent.concat(additionalTelefoniaCurrent).concat(additionalCableCurrent);
            $.each(servicesAdditionalCurrent, function (i, serv) {
                markup += string.format('<b> {0} | {1}  Costo S/.  {2}  </b>  <br />', serv.ServiceName, serv.ServiceDescription, that.priceFormat(parseFloat(serv.FixedCharge) * parseFloat(aplicaIGV)));
            });
            if (!$.array.isEmptyOrNull(that.planMigrationSession.Data.AdditionalEquipment)) {
                /* var additionalEquipmentCable = that.planMigrationSession.Data.AdditionalEquipment.filter(function (el, idx) { return el.ServiceName == 'Internet' }),
                additionalEquipmentTelephony = that.planMigrationSession.Data.AdditionalEquipment.filter(function (el, idx) { return el.ServiceName == 'Telefonia' }),
                additionalEquipmentInternet = that.planMigrationSession.Data.AdditionalEquipment.filter(function (el, idx) { return el.ServiceName == 'Cable' }),
                     additionalEquipmentCurrent = additionalEquipmentCable.concat(additionalEquipmentTelephony).concat(additionalEquipmentInternet);*/
                var additionalEquipmentCable = that.planMigrationSession.Data.AdditionalEquipment.filter(function (el, idx) { return el.ServiceName.toUpperCase().indexOf('INTERNET') > -1 }),
                   additionalEquipmentTelephony = that.planMigrationSession.Data.AdditionalEquipment.filter(function (el, idx) { return el.ServiceName.toUpperCase().indexOf('TELEFONIA') > -1 || el.ServiceName.toUpperCase().indexOf('TELEFONÍA') > -1 }),
                   additionalEquipmentInternet = that.planMigrationSession.Data.AdditionalEquipment.filter(function (el, idx) { return el.ServiceName.toUpperCase().indexOf('CABLE') > -1 }),
                additionalEquipmentCurrent = additionalEquipmentCable.concat(additionalEquipmentTelephony).concat(additionalEquipmentInternet);
                $.each(additionalEquipmentCurrent, function (i, serv) {
                    markup += string.format('<b> {0} | {1}  Costo S/.  {2}  </b>  <br />', serv.ServiceName, serv.ServiceDescription, that.priceFormat(parseFloat(serv.FixedCharge) * parseFloat(aplicaIGV)));
                });
            }
            markup += '<br />';
            markup += string.format(' <b>Actual Cargo Fijo:</b> S/. {0}  <br />', that.priceFormat($("#spnPackageCost").html()));

            /******/

            var servicesCore = that.planMigrationSession.Current.ServicesCore;
            /*var additionalServicesInternet = that.planMigrationSession.Current.AdditionalServices.filter(function (el, idx) { return el.ServiceType == 'Internet' }),
                additionalServicesTelephony = that.planMigrationSession.Current.AdditionalServices.filter(function (el, idx) { return (el.ServiceType == 'Telefonía' || el.ServiceType == 'Telefonia') && parseFloat(el.Price) > 0.00 }),
                additionalServicesCable = that.planMigrationSession.Current.AdditionalServices.filter(function (el, idx) { return el.ServiceType == 'Cable' }),
                additionalServices = additionalServicesCable.concat(additionalServicesTelephony).concat(additionalServicesInternet);*/
            var additionalServicesInternet = that.planMigrationSession.Current.AdditionalServices.filter(function (el, idx) { return el.ServiceType.toUpperCase().indexOf('INTERNET') > -1 }),
                additionalServicesTelephony = that.planMigrationSession.Current.AdditionalServices.filter(function (el, idx) { return (el.ServiceType.toUpperCase().indexOf('TELEFONIA') > -1 || el.ServiceType.toUpperCase().indexOf('TELEFONÍA') > -1) && parseFloat(el.Price) > 0.00 }),
                additionalServicesCable = that.planMigrationSession.Current.AdditionalServices.filter(function (el, idx) { return el.ServiceType.toUpperCase().indexOf('CABLE') > -1 }),
                additionalServices = additionalServicesCable.concat(additionalServicesTelephony).concat(additionalServicesInternet);
            markup += '<br />';
            markup += '<b>----------------NUEVO PLAN----------------</b><br />';

            markup += string.format('<b>Campaña:</b>{0} <br />', that.planMigrationSession.Current.Plan.CampaignDescription);
            markup += string.format('<b>Servicio:</b>{0}<br />', that.planMigrationSession.Current.Plan.SolutionDescription);
            markup += string.format('<b>Combinación:</b> {0}<br />', that.planMigrationSession.Current.Plan.PlanDescription);

            $.each(servicesCore, function (i, serv) {
                markup += string.format('<b> {0} | {1}  Costo S/.  {2}  </b>  <br />', serv.ServiceType.toUpperCase(), serv.ServiceDescription, serv.Price);
            });

            $.each(additionalServices, function (i, eq) {
                markup += string.format('<b> {0} | {1}  Costo S/.  {2}  </b>  <br />', eq.ServiceType.toUpperCase(), eq.desc, eq.Price);
            });

            var additionalEquipment = that.planMigrationSession.Current.AdditionalEquipment
                .map(function (item) {
                    return {
                        ServiceDescription: $.string.capitalize(item.ServiceDescription),
                        ServiceType: item.ServiceType,
                        Price: item.Price,
                        Total: item.cantidad

                    };
                }),
                equipments = $.array.unique(additionalEquipment, 'ServiceDescription')


            var cantidad = 0;
            var descripcion = '';
            $.each(equipments, function (index, value) {
                descripcion = value.ServiceDescription.toUpperCase();


                cantidad = 0;
                $.each(additionalEquipment, function (index, value) {
                    if (value.ServiceDescription.toUpperCase() == descripcion) {
                        cantidad += 1;
                    }
                });
                if (cantidad > 0) {
                    markup += string.format('<b> {0} | {1}  Costo S/.  {2}  </b>  <br />', value.ServiceType, value.ServiceDescription, value.Price);
                }

            });

            /*--------------*/
            markup += '<br />';
            markup += string.format(' <b>Nuevo Cargo Fijo:</b>  {0}  <br />', controls.newFixedCharge.text());
            markup += '<br />';

            markup += '<b>--------TIPO DE TRABAJO A REALIZAR--------</b><br />';
            markup += string.format('{0}  <br />', $("#ddlWorkType option:selected").html() == undefined ? '' : $("#ddlWorkType option:selected").html());

            markup += string.format('Anotaciones: {0} <br />', that.planMigrationSession.Data.VisitaTecnica.anotaciones == null ? '' : that.planMigrationSession.Data.VisitaTecnica.anotaciones);

            if (that.planMigrationSession.Data.VisitaTecnica.flagVisitaTecnica != '0') {
                markup += '* CON VISITA';
            }
            markup += '<br />';
            $("#resumeContent").empty();
            $("#resumeContent").append(markup);


            markup = '';
            markup += String.format(' {0},  (Sr. o Sra.), mencionarle en que su siguiente factura, percibirá un cobro, <br />', that.planMigrationSession.Data.CustomerInformation.CustomerName);
            markup += String.format(' con un monto aproximado de <b> {0} </b> <br />', controls.nextReceiptApportionment.text());
            markup += String.format(' que será por única vez debido a la migración realizada. <br /> <br />', controls.newFixedCharge.text());
            markup += String.format(' En adelante su cargo mensual se mantiene en <b> {0}</b> <br />', controls.newFixedCharge.text());
            if (that.planMigrationSession.Data.VisitaTecnica.flagVisitaTecnica != '0') {
                markup += String.format('   * Sólo recordarle que el plazo de atención de su solicitud es al día <b> {0} </b> y que recibirá la visita técnica para la instalación de los equipos. <br />', controls.txtCalendar.val());
            } else {
                markup += String.format('   * Sólo recordarle que el plazo de atención de su solicitud es al día <b> {0} </b> y se atenderá por sistemas. <br />', that.getFechaActualMas1());
            }
            markup += '    Tiene alguna duda con respecto a la información brindada.<br />  <br />  ';
            markup += String.format('     <b>APROX. RECIBE: {0} </b> <br /> ', ''); //24 de enero del 2020
            markup += String.format('  <b> {0} </b> ', controls.newFixedCharge.text());

            $("#comments").empty();
            $("#comments").append(markup);




        },

        /* Metodos Generales */

        calculateCost: function (tables, elements) {

            var sum = 0,
                that = this;

            tables.find('td[data-price]').each(function (idx, el) {
                sum = sum + Number($(this).attr('data-price'));
            });

            $.each(elements, function (idx, el) {
                el.empty().text(string.format('S/ {0}', that.priceFormat(sum)));
            });

        },

        loadInformApportionment: function () {
            var that = this,
                controls = this.getControls();
            var reciboSiguienteProrrateo = that.priceFormat($('#spnPackageCost').html());
            $('#fixedChargeCurrent').html(string.format('S/ {0}', that.priceFormat($('#spnPackageCost').html())));
            $('#fixedChargeNew').html($('#TotalPrice').html());
            $('#fixedChargePromotional').html($('#TotalAdditionalPrice').html());

            debugger;
            var fecAgendamiento = that.planMigrationSession.Data.VisitaTecnica.flagVisitaTecnica != '0' ? controls.txtCalendar.val() : that.getFechaActual();
            var fecCambioPlan = new Date(fecAgendamiento.substr(6, 4) + "/" + fecAgendamiento.substr(3, 2) + "/" + fecAgendamiento.substr(0, 2));
            var cicloFacturacion = that.planMigrationSession.Data.CustomerInformation.BillingCycle;
            var fecCicloFacturacion = new Date(that.getFechaActual().split('/')[2] + "/" + that.getFechaActual().split('/')[1] + "/" + cicloFacturacion);


            if (fecCambioPlan >= fecCicloFacturacion) {// ciclo:18/05 ***  20/5-- >18/06  || 12/06 --> 18/06
                fecCicloFacturacion = new Date(fecCicloFacturacion.setMonth(fecCicloFacturacion.getMonth() + 1));
            }

            var oneDay = 24 * 60 * 60 * 1000;
            var diffDays = Math.round(Math.abs((fecCambioPlan.getTime() - fecCicloFacturacion.getTime()) / (oneDay)));
            if (fecCambioPlan < fecCicloFacturacion) {
                var cantDiasMes = !$.string.isEmptyOrNull(that.planMigrationSession.Data.CustomerInformation.cantDiasProxCiclo) ? Math.abs(that.planMigrationSession.Data.CustomerInformation.cantDiasProxCiclo) : $.monthDays(); // $.monthDays();//---EAI
                var totalDiasSuspension = !$.string.isEmptyOrNull(that.planMigrationSession.Data.CustomerInformation.cantDiasSuspendidosCiclo) ? that.planMigrationSession.Data.CustomerInformation.cantDiasSuspendidosCiclo : 0;//---EAI
                var costoReconexion = !$.string.isEmptyOrNull(that.planMigrationSession.Data.CustomerInformation.cargoReconexion) ? that.planMigrationSession.Data.CustomerInformation.cargoReconexion : 0;//---EAI
                var costoinstalacion = 0.00;
                //
                var cargoFijoActual = that.priceFormat($('#spnPackageCost').html());
                var nuevoCargoFijo = $('#fixedChargeNew').html().substring(3);
                var cantDiasCambioPlan = diffDays;
                /**/
                //Se tiene que hacer el calculo de Días desde la Fecha CP hasta la próxima fecha de ciclo                         
                var devolPlanActual = that.priceFormat((cargoFijoActual * cantDiasCambioPlan)) / that.priceFormat(cantDiasMes) * -1;
                var cargoNuevoPlan = that.priceFormat((nuevoCargoFijo * cantDiasCambioPlan)) / that.priceFormat(cantDiasMes);
                var devolSuspension = that.priceFormat((cargoFijoActual * totalDiasSuspension)) / that.priceFormat(cantDiasMes) * -1;

                console.log('CALCULO:   ');
                console.log('cicloFacturacion: ' + cicloFacturacion);
                console.log('cantDiasCambioPlan: ' + cantDiasCambioPlan);
                console.log('nuevoCargoFijo: ' + nuevoCargoFijo);
                console.log('devolPlanActual: ' + devolPlanActual);
                console.log('cargoNuevoPlan: ' + cargoNuevoPlan);
                console.log('devolSuspension: ' + devolSuspension);
                console.log('costoReconexion: ' + costoReconexion);
                console.log('costoinstalacion: ' + costoinstalacion);

                reciboSiguienteProrrateo = 0.00;
                reciboSiguienteProrrateo += parseFloat(that.priceFormat(nuevoCargoFijo));
                reciboSiguienteProrrateo += parseFloat(that.priceFormat(devolPlanActual));
                reciboSiguienteProrrateo += parseFloat(that.priceFormat(cargoNuevoPlan));
                reciboSiguienteProrrateo += parseFloat(that.priceFormat(devolSuspension));
                reciboSiguienteProrrateo += parseFloat(that.priceFormat(costoReconexion));
                reciboSiguienteProrrateo += parseFloat(that.priceFormat(costoinstalacion));

            }
            $('#nextReceiptApportionment').html(string.format('S/ {0}', that.priceFormat(reciboSiguienteProrrateo)))
            console.log('reciboSiguienteProrrateo: ' + reciboSiguienteProrrateo);
        },

        priceFormat: function (value) {
            return parseFloat(value).toFixed(2);
        },

        /* Navegación y Validaciones */

        navigateTabs: function () {

            var that = this,
                controls = this.getControls();

            var $activeTab = $('.step.tab-pane.active');
            var stepValidation = $activeTab.attr('data-validation');

            if (typeof stepValidation !== 'undefined' && stepValidation !== '') {
                if (that[stepValidation]()) { navigateTabs(event) }
            }
            else {
                navigateTabs(event);
            }
        },

        navigateIcons: function () {

            var that = this,
                controls = this.getControls();

            event.stopImmediatePropagation();

            var $activeTab = $('.step.tab-pane.active');
            var $previousButton = $(string.format('button[href="#{0}"]', $activeTab.attr('id')));
            var $currentButton = event.target ? $(event.target) : $(event.srcElement);
            var target = string.format('#{0}', $currentButton.attr('id'));

            while ($previousButton.attr('index') < $currentButton.attr('index')) {

                var stepValidation = $activeTab.attr('data-validation');

                if (typeof stepValidation !== 'undefined' && stepValidation !== '') {

                    if (!that[stepValidation]()) {
                        target = string.format('#{0}', $previousButton.attr('id'));
                        $previousButton = $currentButton;
                    }
                    else {
                        $activeTab = $activeTab.next('.tab-pane');
                        $previousButton = $(string.format('button[href="#{0}"]', $activeTab.attr('id')));
                    }
                }
                else {
                    $activeTab = $activeTab.next('.tab-pane');
                    $previousButton = $(string.format('button[href="#{0}"]', $activeTab.attr('id')));
                }

            }

            navigateIcons(target);
        },

        getNameTagVisitaTecnica: function (n) {
            switch (n) {
                case "LineID":  //case "idServicio":
                    return "TRSV_IDSERVICIO_SISACT"
                    break;
                case "codTipoEquipo":
                    return "TRSV_CODTIPEQU"
                    break;
                case "tipequ":
                    return "TRSV_TIPEQU"
                    break;
                case "ServiceDescription":
                    return "TRSV_DSCSRV"
                    break;
                case "idGrupoPrincipal":
                    return "TRSV_IDGRUPO_PRINCIPAL"
                    break;
                case "idGrupo":
                    return "TRSV_IDGRUPO"
                    break;
                case "banwid":
                    return "TRSN_BANWID"
                    break;
                case "unidadcapacidad":
                    return "TRSV_UNIDAD_CAP"
                    break;
                case "codigoExterno":
                    return "TRSV_CODIGO_EXT"
                    break;
                case "descEquipo":
                    return "TRSV_DSCEQU"
                    break;
                case "CoreAdicional":
                    return "TRSV_COREADICIONAL"
                    break;
                default:
                    return ""
            }


        },

        VisitaTecnica: function () {
            var that = this,
                controls = this.getControls();
            that.getLoadingPage();


            //debugger;
            var datos = that.planMigrationSession.Current.AdditionalServices == undefined ? [] : that.planMigrationSession.Current.AdditionalServices; // [{ "idServicio": 2436, "codTipoEquipo": 34, "tipequ": 2, "id": "1075", "desc": "Casilla de Correo 10GB-3 Play", "img": "/Content/Images/SUFija/ico_internet.svg" }, { "idServicio": 2438, "id": "1077", "desc": "Puerto 25", "img": "/Content/Images/SUFija/ico_internet.svg" }]
            var datosPrincipales = that.planMigrationSession.Current.ServicesCore == undefined ? [] : that.planMigrationSession.Current.ServicesCore;
            var datosEquipos = that.planMigrationSession.Current.AdditionalEquipment == undefined ? [] : that.planMigrationSession.Current.AdditionalEquipment;


            datos = datos.concat(datosPrincipales);
            datos = datos.concat(datosEquipos);

            var tramavisita = "";

            that.planMigrationSession.Current.Plan;
            that.planMigrationSession.Current.AdditionalPoints;
            that.planMigrationSession.Current.AdditionalServices;




            var xdata = [{ "SERVICIO": "", "CODTIEQU": "", "TIEQU": "" }];
            var xjsonTramaVisitaTecnica = {
                "listaTrama": []

            };

            datos.forEach(function (items) {
                var keys = Object.keys(items);
                var x = { "lista": [] };

                keys.forEach(function (key) {
                    var tag = that.getNameTagVisitaTecnica(key);
                    /**/
                    var provi = items[key];
                    var arrProvi = [];
                    if (tag == "TRSN_BANWID") {
                        arrProvi = (provi + ';').split(';');
                        provi = arrProvi[0];
                    }
                    if (tag == "TRSV_UNIDAD_CAP") {

                        arrProvi = (provi + ';').split(';');
                        provi = arrProvi[0];
                    }
                    var feed = {
                        nombre: tag,// key == 'ServiceDescription' ? "SERVICIO" : key == 'codTipoEquipo' ? "CODTIEQU" : key == 'tipequ' ? "TIEQU" : "",
                        valor: provi
                    };
                    if (tag.length > 0) {
                        x.lista.push(feed);
                    }

                });


                x.lista.push({
                    "nombre": "TRSV_IP",
                    "valor": that.planMigrationSession.Data.AuditRequest.idApplication
                });
                x.lista.push({
                    "nombre": "TRSV_USUARIO",
                    "valor": Session.SessionParams.USERACCESS.login
                });
                xjsonTramaVisitaTecnica.listaTrama.push(x);
            });



            var objLoadParameters = {
                ContratoId: Session.SessionParams.DATACUSTOMER.ContractID,
                customerId: Session.SessionParams.DATACUSTOMER.CustomerID,
                listaTrama: xjsonTramaVisitaTecnica.listaTrama
            };



            $.app.ajax({
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                url: '/PlanMigration/Home/GetDatosVisitaTecnica',
                data: JSON.stringify(objLoadParameters),
                success: function (response) {
                    controls.sectionScheduling.hide();
                    that.planMigrationSession.Data.VisitaTecnica = {};
                    if (response.dataVisitaTecnica != null) {
                        if (!$.string.isEmptyOrNull(response.dataVisitaTecnica.CodMotot) || !$.string.isEmptyOrNull(response.dataVisitaTecnica.tipTrabajo)) {
                            that.planMigrationSession.Data.VisitaTecnica = response.dataVisitaTecnica
                            that.planMigrationSession.Configuration.Constants.CodMotot = response.dataVisitaTecnica.CodMotot;
                            that.planMigrationSession.Data.VisitaTecnica.anotaciones = $.string.isEmptyOrNull(response.dataVisitaTecnica.anotaciones) ? '' : response.dataVisitaTecnica.anotaciones;
                            if (that.planMigrationSession.Data.VisitaTecnica.flagVisitaTecnica != '0') {
                                controls.sectionScheduling.show();
                                that.GetTipoTrabajo("3", "3");
                            }
                            else {
                                controls.sectionScheduling.hide();
                                $.unblockUI();
                            }
                        }
                        else {
                            alert("Ocurrió un error al validar la visita técnica, no se obtuvo el motivo/Tipo de trabajo. Por favor, reintente nuevamente más tarde.", 'Alerta', function () {
                                $.unblockUI();
                                parent.window.close();
                            });
                        }

                    } else {
                        alert("Ocurrió un error al validar la visita técnica. Por favor, reintente nuevamente más tarde.", 'Alerta', function () {
                            $.unblockUI();
                            parent.window.close();
                        });
                    }
                },
                error: function (ex) {
                    alert("Ocurrió un error al validar la visita técnica. Por favor, reintente nuevamente más tarde.", 'Alerta', function () {
                        $.unblockUI();
                        parent.window.close();
                    });
                }
            });
        },

        getRequestGeneral: function (idTransaccion, idproceso) {
            var that = this, oRequest = {},
                controls = that.getControls();

            var tipoTrabajo = '';
            /*  if (that.planMigrationSession.Data.VisitaTecnica.tipTrabajo == '') {
                  tipoTrabajo = that.planMigrationSession.Configuration.Constants.Technology == '9' ? '1054' : '695';
  
              }
              else {*/
            tipoTrabajo = that.planMigrationSession.Data.VisitaTecnica.tipTrabajo;
            /* }*/


            return oRequest = {
                IdTransaccion: idTransaccion,
                IdProceso: idproceso,
                TipTra: tipoTrabajo,
                tecnologia: that.planMigrationSession.Configuration.Constants.Technology,
                IdProducto: that.planMigrationSession.Configuration.Constants.Technology,
                ContratoId: Session.SessionParams.DATACUSTOMER.ContractID,

                origen: that.planMigrationSession.Configuration.Constants.Constantes_Origen,
                idPlano: that.planMigrationSession.Data.Instalacion.CodPlano,
                ubigeo: that.planMigrationSession.Data.Instalacion.Ubigeo,
                tipoServicio: that.planMigrationSession.Configuration.Constants.Trama_TipoServicio,
                cantDeco: '0'
            };

        },

        GetPlanFijaServicio: function (tmcode) {
            var that = this,
                controls = that.getControls();
            var oRequest = {};
            oRequest.ContratoId = Session.SessionParams.DATACUSTOMER.ContractID;
            oRequest.IdTransaccion = that.planMigrationSession.Data.idTransactionFront;//"1";
            oRequest.IdProceso = "2";
            oRequest.tecnologia = Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT === 'TOBE' ? that.planMigrationSession.Configuration.Constants.Technology : '5';
            //oRequest.tecnologia = '5';//that.planMigrationSession.Configuration.Constants.Technology; //"5" //PILOTO
            oRequest.plan = tmcode;
            oRequest.coIdPub = Session.SessionParams.DATACUSTOMER.coIdPub;
            oRequest.tipo = "";


            var urlBase = '/PlanMigration/Home/GetPlanFijaServicio';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                async: false,
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(oRequest),
                url: urlBase,
                success: function (response) {
                    console.log('response.data.ListPlanFijaServicio:')
                    console.log(response.data.ListPlanFijaServicio);

                    that.planMigrationSession.Data.FixedPlanDetail = response.data.ListPlanFijaServicio.map(function (item) {
                        return {
                            CodeGroup: item.CodeGroup,
                            FixedCharge: item.FixedCharge == '' || item.FixedCharge == null ?//Igv
                                         item.FixedCharge = '0' : (parseFloat(item.FixedCharge) * parseFloat("1." + that.planMigrationSession.Data.Configuration.Constantes_Igv)).toFixed(2),//FixedCharge,
                            Group: item.Group,
                            LineID: item.LineID,
                            PlanCode: item.PlanCode,
                            ServiceDescription: item.ServiceDescription,
                            ServiceEquiptment: item.ServiceEquiptment,
                            ServiceType: item.ServiceType,
                            cantidad: item.cantidad,
                            capacidad: item.capacidad,
                            cargoFijoPromocion: item.cargoFijoPromocion == '' || item.cargoFijoPromocion == null ?
                                         item.cargoFijoPromocion = '0' : parseFloat(item.cargoFijoPromocion) * parseFloat("1." + that.planMigrationSession.Data.Configuration.Constantes_Igv),//FixedCharge,
                            codigoExterno: item.codigoExterno,
                            codigoTipEqu: item.codigoTipEqu,
                            coreAdicional: item.coreAdicional,
                            descEquipo: item.descEquipo,
                            descExterno: item.descExterno,
                            grupoPadre: item.grupoPadre,
                            idDet: item.idDet,
                            idEquipo: item.idEquipo,
                            sncode: item.sncode,
                            spCode: item.spCode,
                            tipEqu: item.tipEqu,
                            tipoEquipo: item.tipoEquipo,
                            unidadCapacidad: item.unidadCapacidad,
                            po: item.po,
                            poType: item.poType,
                            idProducto: item.idProducto,
                            umbCons: item.umbCons,
                            tipoLimCred: item.tipoLimCred,
                            familia: item.familia,
                            pop1: item.pop1,
                            pop2: item.pop2
                        };
                    })

					that.planMigrationSession.Data.FixedPlanDetail = that.planMigrationSession.Data.FixedPlanDetail.filter(function (el) { return el.CodeGroup.indexOf('FALTA CONFIG') == -1 });
                    //

                }
            });

        },


        GetTipoTrabajo: function () {
            var that = this,
                controls = that.getControls();
            var oRequest = {};


            //oRequest = that.getRequestGeneral("1", "3");
            oRequest = that.getRequestGeneral(that.planMigrationSession.Data.idTransactionFront, "3");

            var urlBase = '/PlanMigration/Home/GetTiposDeTrabajo';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(oRequest),
                url: urlBase,
                success: function (response) {
                    //debugger;
                    controls.ddlWorkType.empty();
                    controls.ddlWorkType.append($('<option>', { value: '', html: '-Seleccionar-' }));
                    $.each(response.SelectListTipoTrabajo, function (index, value) {
                        //compara valuecode con  la lista de trabajo que retonró en aplica visita tecnica
                        if (value.Code == that.planMigrationSession.Data.VisitaTecnica.tipTrabajo) { // "1018") {
                            controls.ddlWorkType.append($('<option>', { value: value.Code, html: value.Description, selected: true }));
                        }
                        else {
                            controls.ddlWorkType.removeAttr("disabled");
                            controls.ddlWorkType.append($('<option>', { value: value.Code, html: value.Description }));
                        }

                    });
                    that.GetSubWorkType(response);


                    that.planMigrationSession.Data.ValidaEta = response.listValidaEta;
                    if (that.planMigrationSession.Data.ValidaEta.FlagIndica == null || that.planMigrationSession.Data.ValidaEta.FlagIndica == '0') {
                        alert("No aplica agendamiento en línea, favor de continuar con la operación.", "Alerta");
                        that.planMigrationSession.Data.ValidaEta.FlagIndica = '0';
                    }



                    $.unblockUI();
                }
            });

        },



        GetDatosAdicionales: function (idTransaccion, idProceso) {
            var that = this,
                controls = this.getControls();
            //debugger;
            //that.getLoadingPage();

            var objLoadParameters = {
                strIdSession: Session.UrlParams.IdSession,
                idTransaccion: idTransaccion,
                idProceso: idProceso,
                idProducto: '9',// that.TransferSession.Data.Technology,
                //codPais = "51";
                //idTipoUrba = "0";
                contratoId: Session.SessionParams.DATACUSTOMER.ContractID,
                //idTipoInt = tipoInterior;
                //idCodVia = "0";
            };

            $.app.ajax({
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                url: '/PlanMigration/Home/GetDatosAdicionales',
                data: JSON.stringify(objLoadParameters),
                success: function (response) {

                    //debugger;
                    console.log(response);
                    //that.planMigrationSession.Data.ValidaEta = response.listValidaEta;
                    that.GetWorkType(response);
                    that.GetSubWorkType(response);
                    $.unblockUI();
                },
                error: function (ex) {

                }
            }
            );
        },

        ///Carga de TipoTrabajo
        GetWorkType: function (response) {
            var that = this,
                controls = that.getControls();

            //response
            var oRequest = {};

            controls.ddlWorkType.append($('<option>', { value: '', html: '-Seleccionar-' }));
            $.each(response.SelectListTipoTrabajo, function (index, value) {
                if (1 == 1) { // "1018") {
                    controls.ddlWorkType.append($('<option>', { value: value.Code, html: value.Description, selected: true }));
                }
                else {
                    controls.ddlWorkType.append($('<option>', { value: value.Code, html: value.Description }));
                }

            });

            that.planMigrationSession.Data.ValidaEta = response.listValidaEta;
            if (that.planMigrationSession.Data.ValidaEta.FlagIndica == null || that.planMigrationSession.Data.ValidaEta.FlagIndica == '0') {
                alert("No aplica agendamiento en línea, favor de continuar con la operación.", "Alerta");
                that.planMigrationSession.Data.ValidaEta.FlagIndica = '0';
            }


        },

        ///Sub Tipo de Trabajo
        GetSubWorkType: function (response) {
            var that = this;
            var controls = this.getControls();

            //response
            controls.ddlSubWorkType.empty();
            var flg = false;
            //debugger;
            controls.ddlSubWorkType.append($('<option>', { value: '', html: '-Seleccionar-' }));
            $.each(response.SelectListSubTipoTrabajo, function (index, value) {
                if (value.Code == that.planMigrationSession.Data.VisitaTecnica.subTipTrabajo) {// flag defecto                     
                    //Disabled
                    controls.ddlSubWorkType.append('<option   selected="selected"    codTipoOrden = "' + value.Group + '" CodTipoSubOrden = "' + value.Type + '"   idTipoServicio = "' + value.Code2 + '" disponibilidad = "' + value.Description2 + '" value  = "' + value.Code + '" >' + value.Description + '</option>');
                    flg = true;
                    //controls.ddlSubWorkType.attr('disabled', true);
                }
                else {
                    //controls.ddlSubWorkType.attr('disabled', false);
                    controls.ddlSubWorkType.removeAttr("disabled");
                    controls.ddlSubWorkType.append('<option codTipoOrden = "' + value.Group + '" CodTipoSubOrden = "' + value.Type + '"  idTipoServicio = "' + value.Code2 + '" disponibilidad = "' + value.Description2 + '" value  = "' + value.Code + '" >' + value.Description + '</option>');
                }

                if (flg) {
                    controls.ddlSubWorkType.attr('disabled', true);
                }

            });

        },
        planSelectionValidation: function () {

            var that = this;


            var that = this,
                controls = this.getControls(),
                errMessage = '', unSelected = [];

            $.each(controls.cboCoreServices, function (idx, cboCore) {

                if (controls.txtSolucion.val() == '') {
                    errMessage = 'Debe seleccionar un plan.';
                    return false;
                }
                else {
                    var $selected = $(cboCore).find('option:selected')
                    var optionsLength = $(cboCore).find('option').length

                    if ((typeof $selected.val() == 'undefined' || $selected.val() == '') && optionsLength > 1) {
                        unSelected.push($selected.closest('div').parent().find('label').text());
                    }
                }
            });

            if (unSelected.length > 0) {
                alert(string.format('No ha seleccionado {0} de {1}.', unSelected.length > 1 ? 'los servicios' : 'el servicio', unSelected.join(', ')));
                return false;
            }
            else {
                if (errMessage.length > 0) {
                    alert(errMessage);
                    return false;
                }
            }

            // Show / Hide WhitePages Publication
            if (controls.cboCoreTelephonyServices.find('option:selected').val() !== '') {
                controls.whitePagesCheck.closest('div').show();
            }
            else {
                controls.whitePagesCheck.closest('div').hide();
            }

            // Load Information for Schedule and TechnicalData
            if (controls.sectionScheduling.length > 0) that.loadSchedulingInformation();
            if (controls.sectionTechnicalData.length > 0) that.loadTechnicalDataInformation();


            //Valida - Visita Tecnica
            that.VisitaTecnica()
            //
            return true;
        },

        ddlWorkType_Click: function () {
            var controls = this.getControls();
            controls.ddlWorkType.closest('.form-control').removeClass('has-error');
            controls.WorkTypeErrorMessage.text('');
        },
        ddlSubWorkType_Click: function () {
            var controls = this.getControls();
            controls.ddlSubWorkType.closest('.form-control').removeClass('has-error');
            controls.subWorkTypeErrorMessage.text('');
        },
        ddlCenterofAttention_Click: function () {
            var controls = this.getControls();
            controls.ddlCenterofAttention.closest('.form-control').removeClass('has-error');
            controls.centroAtencionZoneErrorMessage.text('');
        },
        schedulingValidation: function () {
            //debugger;
            var that = this, res = true,
                controls = this.getControls();

            //AQUI PARA MOSTRAR LA SECCION DE APLICA VISITA TECNICA
            if (controls.sectionScheduling.length > 0) {
                //res = false;
            }

            //SI APLICA VISITA TÉCNICA, ENTONCES VALIDAMOS LOS DATOS 
            if (that.planMigrationSession.Data.VisitaTecnica.flagVisitaTecnica != '0') {

                if (controls.txtCalendar.val().length <= 0) {
                    controls.txtCalendar.closest('.form-control').addClass('has-error');
                    controls.calendarErrorMessage.text('Ingrese una fecha válida');
                    alert('Ingrese una fecha válida');
                    controls.txtCalendar.focus();
                    return false;
                }


                if ($("#ddlWorkType option:selected").html() == '-Seleccionar-') {
                    controls.ddlWorkType.closest('.form-control').addClass('has-error');
                    controls.WorkTypeErrorMessage.text('Seleccione un Tipo de Trabajo válido');
                    alert('Seleccione un Tipo de Trabajo válido');
                    controls.ddlWorkType.focus();
                    return false;
                }



                if ($("#ddlSubWorkType option:selected").html() == '-Seleccionar-') {
                    controls.ddlSubWorkType.closest('.form-control').addClass('has-error');
                    controls.subWorkTypeErrorMessage.text('Seleccione un Sub Tipo de Trabajo válido');
                    alert('Seleccione un Sub Tipo de Trabajo válido');
                    controls.ddlSubWorkType.focus();
                    return false;
                }

                if ($("#ddlTimeZone option:selected").html() == 'Seleccionar') {
                    controls.ddlTimeZone.closest('.form-control').addClass('has-error');
                    controls.timeZoneErrorMessage.text('Seleccione un Horario válido');
                    alert('Seleccione un Horario válido');
                    controls.ddlTimeZone.focus();
                    return false;
                }

            }


            if (controls.sectionTechnicalData.length > 0) {

                if (!that.onFocusoutEmail()) {
                    alert('Ingrese una dirección de correo válida.');
                    return false;
                }
            }

            if ($("#ddlCenterofAttention option:selected").html() == '-Seleccionar-') {
                controls.ddlCenterofAttention.closest('.form-control').addClass('has-error');
                controls.centroAtencionZoneErrorMessage.text('Seleccione un Centro de Atención válido');
                alert('Seleccione un Centro de Atención válido');
                controls.ddlCenterofAttention.focus();
                return false;
            }

            that.loadInformApportionment();
            that.generatePlanDetail();

            return true;
        },
        Constancy_click: function () {
            var params = ['height=600',
                'width=750',
                'resizable=yes',
                'location=yes'
            ].join(',');

            var strIdSession = Session.UrlParams.IdSession;
            window.open('/PlanMigration/Home/ShowRecordSharedFile' + "?&strIdSession=" + strIdSession, "_blank", params);
        },
        stopCountDown: false,

        Save_click: function () {
            var that = this;
            confirm("¿Esta seguro de guardar los cambios?", null, function () {
                try {
                    that.stopCountDown = true;
                    $('#countdown').css('display', 'none');

                    that.GuardarDatos();

                }
                catch (ex) {
                    alert("No se pudo ejecutar la transacción. Informe o vuelva a intentar. " + ex, "Alerta");
                }
            });
        },

        ///####################################Transversal####################################///
        GuardarDatos: function () {
            var that = this,
                controls = that.getControls();
            that.getLoadingPage();

            debugger;

            var servicios = [
                {
                    "servicio": "Cliente",
                    "parametros": [
                        {
                            "parametro": "phone",
                            "valor": that.planMigrationSession.Configuration.Constants.Tipificacion_KeyCustomerInteract + that.planMigrationSession.Data.CustomerInformation.CustomerID
                        },
                        {
                            "parametro": "usuario",
                            "valor": Session.SessionParams.USERACCESS.login
                        },
                        {
                            "parametro": "nombres",
                            "valor": that.planMigrationSession.Data.CustomerInformation.CustomerName
                        },
                        {
                            "parametro": "apellidos",
                            "valor": that.planMigrationSession.Data.CustomerInformation.CustomerName
                        },
                        {
                            "parametro": "razonsocial",
                            "valor": that.planMigrationSession.Data.CustomerInformation.LegalRepresentative
                        },
                        {
                            "parametro": "tipoDoc",
                            "valor": that.planMigrationSession.Data.CustomerInformation.LegalRepresentativeDocument
                        },
                        {
                            "parametro": "numDoc",
                            "valor": that.planMigrationSession.Data.CustomerInformation.DocumentNumber
                        },
                        {
                            "parametro": "domicilio",
                            "valor": that.planMigrationSession.Data.Instalacion.Direccion//that.planMigrationSession.Data.Instalation.Direccion
                        },
                        {
                            "parametro": "distrito",
                            "valor": that.planMigrationSession.Data.CustomerInformation.BillingDistrict
                        },
                        {
                            "parametro": "departamento",
                            "valor": that.planMigrationSession.Data.CustomerInformation.BillingDepartament
                        },
                        {
                            "parametro": "provincia",
                            "valor": that.planMigrationSession.Data.CustomerInformation.BillingProvince
                        },
                        {
                            "parametro": "modalidad",
                            "valor": that.planMigrationSession.Configuration.Constants.Tipificacion_Modalidad
                        }
                    ]
                },
                {
                    "servicio": "Tipificacion",
                    "parametros": [
                        {
                            "parametro": "coid",
                            "valor": that.planMigrationSession.Data.CustomerInformation.ContractNumber,
                        },
                        {
                            "parametro": "customer_id",
                            "valor": that.planMigrationSession.Data.CustomerInformation.CustomerID,
                        },
                        {
                            "parametro": "Phone",
                            "valor": that.planMigrationSession.Configuration.Constants.Tipificacion_KeyCustomerInteract + that.planMigrationSession.Data.CustomerInformation.CustomerID
                        },
                        {
                            "parametro": "flagReg",
                            "valor": that.planMigrationSession.Configuration.Constants.Tipificacion_FlagReg
                        },
                        {
                            "parametro": "contingenciaClarify",
                            "valor": that.planMigrationSession.Configuration.Constants.Tipificacion_ContingenciaClarify
                        },
                        {
                            "parametro": "tipo",
                            "valor": that.planMigrationSession.Data.Tipificacion[0].Tipo  //that.planMigrationSession.Configuration.Constants.Tipo
                        },
                        {
                            "parametro": "clase",
                            "valor": that.planMigrationSession.Data.Tipificacion[0].Clase //that.planMigrationSession.Configuration.Constants.Clase
                        },
                        {
                            "parametro": "SubClase",
                            "valor": that.planMigrationSession.Data.Tipificacion[0].SubClase //that.planMigrationSession.Configuration.Constants.SubClase
                        },
                        {
                            "parametro": "metodoContacto",
                            "valor": that.planMigrationSession.Configuration.Constants.Tipificacion_MetodoContacto
                        },
                        {
                            "parametro": "tipoTipificacion",
                            "valor": that.planMigrationSession.Configuration.Constants.Tipificacion_TipoTipificacion
                        },
                        {
                            "parametro": "agente",
                            "valor": Session.SessionParams.USERACCESS.login
                        },
                        {
                            "parametro": "usrProceso",
                            "valor": that.planMigrationSession.Configuration.Constants.Constantes_UsrAplicacion//that.planMigrationSession.Configuration.Constants.USRAPLICACION
                        },
                        {
                            "parametro": "hechoEnUno",
                            "valor": that.planMigrationSession.Configuration.Constants.Tipificacion_HechoDeUno
                        },
                        {
                            "parametro": "Notas",
                            "valor": $.string.isEmptyOrNull(controls.txtNote.val()) ? '-' : controls.txtNote.val().replace(/\n/g, "\\n")
                        },
                        {
                            "parametro": "flagCaso",
                            "valor": that.planMigrationSession.Configuration.Constants.Tipificacion_FlagCaso
                        },
                        {
                            "parametro": "resultado",
                            "valor": that.planMigrationSession.Configuration.Constants.Tipificacion_Resultado
                        },
                        {
                            "parametro": "tipoInter",
                            "valor": that.planMigrationSession.Configuration.Constants.Tipificacion_TipoInter
                        }
                    ]
                },
                {
                    "servicio": "Plantilla",
                    "parametros": [
                        {
                            "parametro": "nroIteraccion",
                            "valor": ""
                        },
                        {
                            "parametro": "xinter1",
                            "valor": Session.SessionParams.DATACUSTOMER.objPostDataAccount.BillingCycle //that.planMigrationSession.Data.CustomerInformation.BillingCycle //'SessionPMHFC.DATACUSTOMER.objPostDataAccount.BillingCycle'
                        },
                        {
                            "parametro": "xinter3",
                            "valor": that.planMigrationSession.Data.CustomerInformation.ActivationDate //'SessionPMHFC.DATACUSTOMER.ActivationDate'
                        },
                        {
                            "parametro": "inter4",
                            "valor": Session.SessionParams.DATASERVICE.TermContract // "SessionPMHFC.DATASERVICE.TermContract"
                        },
                        {
                            "parametro": "inter5",
                            "valor": Session.SessionParams.DATASERVICE.StateLine // "SessionPMHFC.DATASERVICE.StateLine"
                        },
                        {
                            "parametro": "inter6",
                            "valor": Session.SessionParams.DATACUSTOMER.objPostDataAccount.ExpirationDate  //"SessionPMHFC.DATACUSTOMER.objPostDataAccount.ExpirationDate"
                        },
                        {
                            "parametro": "inter7",
                            "valor": Session.SessionParams.DATACUSTOMER.OfficeAddress //"SessionPMHFC.DATACUSTOMER.OfficeAddress"
                        },
                        {
                            "parametro": "inter8",
                            "valor": Math.ceil($("#spnPackageCost").html())
                        },
                        {
                            "parametro": "inter15",
                            "valor": $("#ddlCenterofAttention option:selected").html()
                        },
                        {
                            "parametro": "inter16",
                            "valor": that.planMigrationSession.Data.Instalacion.Departamento    //"SessionPMHFC.DATACUSTOMER.LegalDepartament" //that.planMigrationSession.Data.CustomerInformation.BillingDistrict
                        },
                        {
                            "parametro": "inter17",
                            "valor": that.planMigrationSession.Data.Instalacion.Distrito //"SessionPMHFC.DATACUSTOMER.LegalDistrict"
                        },

                        {
                            "parametro": "inter18",
                            "valor": that.planMigrationSession.Data.Instalacion.Pais //"SessionPMHFC.DATACUSTOMER.LegalCountry"
                        },

                        {
                            "parametro": "inter19",
                            "valor": that.planMigrationSession.Data.Instalacion.Provincia //"SessionPMHFC.DATACUSTOMER.LegalProvince"
                        },
                        {
                            "parametro": "inter20",
                            "valor": that.planMigrationSession.Data.Instalacion.CodPlano     //"SessionPMHFC.DATACUSTOMER.PlaneCodeInstallation"
                        },
                        {
                            "parametro": "inter21",
                            "valor": that.planMigrationSession.Current.Plan.PlanDescription //controls.txtSolucion.val() //" listParamConstancyPDF[11]"  //$("#lblPlanNuevo").text() // controls.ddlNoteCenterPopulated.val()
                        },
                        {
                            "parametro": "inter30",
                            "valor": (that.planMigrationSession.Data.VisitaTecnica.anotaciones == null ? ' ' : that.planMigrationSession.Data.VisitaTecnica.anotaciones) + '\\n' + controls.txtNote.val().replace(/\n/g, "\\n")
                        },

                        {
                            "parametro": "P_AMOUNT_UNIT",
                            "valor": Session.SessionParams.DATACUSTOMER.LegalUrbanization  //that.planMigrationSession.Data.Instalacion.Direccion //"SessionPMHFC.DATACUSTOMER.LegalUrbanization"
                        },
                        {
                            "parametro": "P_BIRTHDAY",
                            "valor": that.getFechaActual() //"enviar fecha actual ," // Session.SessionParams.BirthDate  public const string dateDefaultFormat = "ddMMyyyy";
                        },

                        {
                            "parametro": "P_CLARO_LDN1",
                            "valor": that.planMigrationSession.Data.CustomerInformation.DocumentNumber
                        },
                        {
                            "parametro": "P_FIRST_NAME",
                            "valor": that.planMigrationSession.Data.CustomerInformation.CustomerName
                        },

                        {
                            "parametro": "P_NAME_LEGAL_REP",
                            "valor": that.planMigrationSession.Data.CustomerInformation.LegalRepresentative //"SessionPMHFC.DATACUSTOMER.LegalAgent"
                        },
                        {
                            "parametro": "P_OLD_CLARO_LDN2",
                            "valor": $("#newFixedCharge").text() // multiplicar x 1.18  mas igv //"listParamConstancyPDF[13]"
                        },
                        {
                            "parametro": "P_OLD_CLARO_LDN3",
                            "valor": "0"//controls.chkPresuscrito.is(":checked")  ?   "1" : "0" // "chkPresuscrito ? 1 : 0" pag. amarillas
                        },
                        {
                            "parametro": "P_OLD_CLARO_LDN4",
                            "valor": "" //===> "controls.txtNroCarta.val()"
                        },
                        {
                            "parametro": "P_OLD_CLAROLOCAL1",
                            "valor": "AMERICA MOVIL DEL PERU SAC"
                        },
                        {
                            "parametro": "P_OLD_CLAROLOCAL2",
                            "valor": $("#chkWhitePages").prop("checked") ? "1" : "0"
                        },
                        {
                            "parametro": "P_OLD_CLAROLOCAL3",
                            "valor": "0.0"  //==>> "controls.txtReintegro.val()" --> se cae SIAC_HFC
                        },
                        {
                            "parametro": "P_OLD_CLAROLOCAL4",
                            "valor": "0.0"//"controls.txtMontoFideliza.val()" //paso 2 --> se cae SIAC_HFC
                        },
                        {
                            "parametro": "P_OLD_CLAROLOCAL5",
                            "valor": ""  //==>> "controls.txtTotalPenalidad.val()"
                        },
                        {
                            "parametro": "P_OLD_CLAROLOCAL6",
                            "valor": "0"//controls.chkFideliza.is(":checked") ? "1" :"0"  //"chkFideliza ? 1 : 0"
                        },
                        {
                            "parametro": "P_OLD_FIRST_NAME",
                            "valor": "" //==>> "SessionPMHFC.hdnCheckOCCFinal"
                        },
                        {
                            "parametro": "P_OTHER_PHONE",
                            "valor": that.planMigrationSession.Data.CustomerInformation.LegalRepresentativeDocument
                        },
                        {
                            "parametro": "P_PHONE_LEGAL_REP",
                            "valor": that.planMigrationSession.Data.ValidaEta == undefined ? '0' : that.planMigrationSession.Data.ValidaEta.FlagIndica
                        },
                        {
                            "parametro": "P_REFERENCE_PHONE",
                            "valor": "" //==>"controls.txtTotalPenalidad.val(),"
                        },
                        {
                            "parametro": "P_REASON",
                            "valor": Session.SessionParams.DATACUSTOMER.BusinessName
                        },
                        {
                            "parametro": "P_REGISTRATION_REASON",
                            "valor": that.planMigrationSession.Data.CustomerInformation.ContractNumber
                        },
                        {
                            "parametro": "P_BASKET",
                            "valor": Session.SessionParams.DATASERVICE.Plan
                        },
                        {
                            "parametro": "P_EXPIRE_DATE",
                            "valor": that.getFechaActual()
                        },
                        {
                            "parametro": "P_CITY",
                            "valor": that.getFechaActual()
                        },
                        {
                            "parametro": "P_OCCUPATION",
                            "valor": controls.cboCoreTelephonyServices.find('option:selected').val() !== '' ? "1" : "0"  //   "si el plan a cambiar es telefono de  combo de abajo entonces enviar valor  1 "
                        },
                        {
                            "parametro": "P_POSITION",
                            "valor": $("#txtCalendar").val()
                        },
                        {
                            "parametro": "P_TYPE_DOCUMENT",
                            "valor": that.planMigrationSession.Data.CustomerInformation.CustomerType
                        },
                        {
                            "parametro": "P_ZIPCODE",
                            "valor": $("#newFixedCharge").text()
                        },
                        {
                            "parametro": "P_OPERATION_TYPE",
                            "valor": Session.SessionParams.DATASERVICE.Campaign
                        },
                        {
                            "parametro": "P_ADJUSTMENT_REASON",
                            "valor": that.planMigrationSession.Current.Plan.CampaignDescription
                        }
                    ]
                },
                        {
                            "servicio": "RegistroServicioTipificacion",
                            "parametros": [

                                {
                                    "parametro": "listaServicio",
                                    "valor": JSON.stringify(that.getListaTipificacionTransversal())
                                },


                            ]
                        },

                {
                    "servicio": "registrarServiciosFacturados",
                    "parametros": [

                        {
                            "parametro": "idinter",
                            "valor": '@idInteraccion'
                        },
                        {
                            "parametro": "coIdPub",
                            "valor": Session.SessionParams.DATACUSTOMER.coIdPub
                        },
                        {
                            "parametro": "codTecnologia",
                            "valor": that.planMigrationSession.Configuration.Constants.Technology
                        },
                        {
                            "parametro": "cscode",
                            "valor": Session.SessionParams.DATACUSTOMER.Account
                        }
                    ]
                },

                {
                    "servicio": "Tramas", /*(Generacion de SOT)*/
                    "parametros": [
                        {
                            "parametro": "Trama_Ventas",
                            "valor": that.getXMLTramaVenta()
                        },
                        {
                            "parametro": "Trama_Servicios",
                            "valor": that.getXMLTramaServicios()
                        },


                    ]
                },

                {
                    "servicio": "Contrato",
                    "parametros": [
                        {
                            "parametro": "idTransaccion",
                            "valor": Session.UrlParams.IdTransaction
                        },
                        {
                            "parametro": "ipAplicacion",
                            "valor": that.planMigrationSession.Data.AuditRequest.idApplication//AuditRequest.idApplication
                        },
                        {
                            "parametro": "tipoPostpago",
                            "valor": "HFC"//that.planMigrationSession.Configuration.Constants.Contrato_TipoPostpago//PILOTO
                        },
                        {
                            "parametro": "customerId",
                            "valor": that.planMigrationSession.Data.CustomerInformation.CustomerID
                        },
                        {
                            "parametro": "planTarifario",
                            "valor": that.planMigrationSession.Current.Plan.TMCode//"1494",//that.planMigrationSession.Current.Plan.PlanCode //"1494"//PILOTO
                        },
                        {
                            "parametro": "idSubMercado",
                            "valor": that.planMigrationSession.Configuration.Constants.Contrato_IdSubMercado //3
                        },
                        {
                            "parametro": "idMercado",
                            "valor": that.planMigrationSession.Configuration.Constants.Contrato_IdMercado //"6"
                        },
                        {
                            "parametro": "red",
                            "valor": that.planMigrationSession.Configuration.Constants.Contrato_Red //"1000"
                        },
                        {
                            "parametro": "estadoUmbral",
                            "valor": that.planMigrationSession.Configuration.Constants.Contrato_EstadoUmbral  //"true"
                        },
                        {
                            "parametro": "cantidadUmbral",
                            "valor": that.planMigrationSession.Configuration.Constants.Contrato_CantidadUmbral //"0"
                        },
                        {
                            "parametro": "archivoLlamadas",
                            "valor": that.planMigrationSession.Configuration.Constants.Contrato_ArchivoLlamada //"true"
                        },

                        {
                            "parametro": "listaServicios",
                            "valor": that.getXMLTramaListaServiciosContrato()
                        },

                        {
                            "parametro": "razon",
                            "valor": that.planMigrationSession.Configuration.Constants.Contrato_Razon
                        },
                        {
                            "parametro": "indice",
                            "valor": that.planMigrationSession.Configuration.Constants.Contrato_Indice
                        },
                        {
                            "parametro": "contratotipo",//tipo",
                            "valor": "1"//that.planMigrationSession.Configuration.Constants.Contrato_TipoContrato//PILOTO
                        },
                        {
                            "parametro": "valorindice",
                            "valor": that.planMigrationSession.Configuration.Constants.Contrato_PrefijoCodigoPlan + that.planMigrationSession.Current.Plan.PlanCode //"CVV9647"
                        }

                    ]
                },

                {
                    "servicio": "Constancia",
                    "parametros": [

                        {
                            "parametro": "DRIVE_CONSTANCIA",
                            "valor": that.getXMLTramaConstancia()
                        },


                    ]
                },
                {
                    "servicio": "Correo",
                    "parametros": [
                        {
                            "parametro": "remitente",
                            "valor": that.planMigrationSession.Configuration.Constants.Correo_remitente
                        },
                        {
                            "parametro": "destinatario",
                            "valor": controls.mailText.val()
                        },
                        {
                            "parametro": "asunto",
                            "valor": that.planMigrationSession.Configuration.Constants.Correo_asunto
                        },
                        {
                            "parametro": "htmlFlag",
                            "valor": that.planMigrationSession.Configuration.Constants.Correo_htmlFlag
                        },
                        {
                            "parametro": "driver/fileName",
                            "valor": that.planMigrationSession.Configuration.Constants.Correo_driver
                        },
                        {
                            "parametro": "formatoConstancia",
                            "valor": that.planMigrationSession.Configuration.Constants.Correo_formatoConstancia
                        },
                        {
                            "parametro": "directory",
                            "valor": that.planMigrationSession.Configuration.Constants.Correo_directory
                        },
                        {
                            "parametro": "fileName",
                            //"valor": "@idInteraccion_@p_fecha_CAMBIO_PLAN@extension" //that.planMigrationSession.Configuration.Constants.Constantes_fileName
                            "valor": "@idInteraccion_@p_fecha_" + that.planMigrationSession.Configuration.Constants.Correo_fileName + "@extension" //that.planMigrationSession.Configuration.Constants.Constantes_fileName
                        },
                        //that.planMigrationSession.Configuration.Constants.fileName 
                        {
                            "parametro": "p_fecha",
                            "valor": "dd_MM_yyyy"
                        },
                        {
                            "parametro": "mensaje",
                            "valor": that.planMigrationSession.Configuration.Constants.Correo_mensaje
                        },
                    ]
                },
                {
                    "servicio": "Auditoria",
                    "parametros": [
                        {
                            "parametro": "ipcliente",
                            "valor": that.planMigrationSession.Data.AuditRequest.idApplication// "172.19.91.216" //System.Web.HttpContext.Current.Request.UserHostAddress;
                        },
                        {
                            "parametro": "nombrecliente",
                            "valor": that.planMigrationSession.Data.CustomerInformation.CustomerName
                        },
                        {
                            "parametro": "ipservidor",
                            "valor": that.planMigrationSession.Data.AuditRequest.IPAddress// that.planMigrationSession.Data.AuditRequest.IPAddress// "172.19.91.216" //audit.ipAddress,
                        },
                        {
                            "parametro": "nombreservidor",
                            "valor": that.planMigrationSession.Data.AuditRequest.ApplicationName // that.planMigrationSession.Data.AuditRequest.ApplicationName//"SIAC_UNICO" //audit.applicationName
                        },
                        {
                            "parametro": "cuentausuario",
                            "valor": Session.SessionParams.USERACCESS.login
                        },
                        {
                            "parametro": "monto",
                            "valor": that.planMigrationSession.Configuration.Constants.Constantes_Monto //that.planMigrationSession.Configuration.Constants.Monto
                        },
                        {
                            "parametro": "texto",
                            "valor": string.format("/Ip Cliente: {0}/Usuario:  {1}/Opcion: {2}/Fecha y Hora: {3} {4}", that.planMigrationSession.Data.AuditRequest.idApplication, Session.SessionParams.USERACCESS.login, "Migración Plan", that.getFechaActual(), that.getHoraActual())
                        },
                        {
                            "parametro": "telefono",
                            "valor": that.planMigrationSession.Data.CustomerInformation.CustomerID
                        },
                        {
                            "parametro": "TRANSACCION_DESCRIPCION",
                            "valor": that.planMigrationSession.Configuration.Constants.Constancia_TransaccionDescripcion
                        }
                    ]
                },
                {
                    "servicio": "Trazabilidad",
                    "parametros": [
                        {
                            "parametro": "tipoTransaccion",
                            "valor": that.planMigrationSession.Configuration.Constants.Constancia_FormatoTransaccion
                        },
                        {
                            "parametro": "tarea",
                            "valor": "generaConstancia"
                        },
                        {
                            "parametro": "fechaRegistro",
                            "valor": that.getFechaActual()
                        },
                        {
                            "parametro": "descripcion",
                            "valor": "Trazabilidad generada desde SIACUNICO"
                        }
                    ]
                }
            ];


            var objLoadParameters = {};
            objLoadParameters.idFlujo = '';
            objLoadParameters.servicios = servicios;
            objLoadParameters.stridSession = Session.UrlParams.IdSession;
            objLoadParameters.TransactionID = that.planMigrationSession.Data.idTransactionFront;
            var urlBase = '/PlanMigration/Home/postGeneraTransaccion';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(objLoadParameters),
                url: urlBase,
                success: function (response) {
                    //debugger;
                    if (response != null) {

                        if (response.data != null && response.data.MessageResponse != null) {
                            if ((response.data.MessageResponse.Body.numeroSOT === "") || (response.data.MessageResponse.Body.numeroSOT === null)) {
                                alert('No se pudo ejecutar la transacción. Informe o vuelva a intentar');

                            }
                            else {

                                if (controls.hidFlagCampaniaColab == 1) {
                                    that.intCampania = 0;
                                    that.ConsultCampaign();
                                    if (that.intCampania == 1) {
                                        that.RegisterCampaign(that.planMigrationSession.Current.Plan);
                                    }
                                }

                                var nroSot = response.data.MessageResponse.Body.numeroSOT;
                                alert('La transacción se ha grabado satisfactoriamente.<br/>- Nro. SOT: ' + nroSot);
                                controls.btnConstancy.show();
                                controls.btnPrevStep.hide();
                                controls.btnSave.hide();
                                controls.divFooterInfoSot.show();
                                controls.divFooterInfoSot.prepend('Nro. SOT: ' + nroSot + ' </p>');
                                $('.transaction-button-Steps').attr('disabled', true);
                            }
                        }
                        else {
                            alert('No se pudo ejecutar la transacción. Informe o vuelva a intentar')

                        }
                    }
                    else {
                        alert('No se pudo ejecutar la transacción. Informe o vuelva a intentar')
                    }
                    $.unblockUI();
                },
                error: function (ex) {
                    alert('No se pudo ejecutar la transacción. Informe o vuelva a intentar.')
                    $.unblockUI();
                }
            });
        },


        getXMLTramaConstancia: function () {

            var that = this,
                controls = that.getControls();

            //debugger;

            var datosPrincipales = that.planMigrationSession.Current.ServicesCore == undefined ? [] : that.planMigrationSession.Current.ServicesCore;
            var datosAdicionales = that.planMigrationSession.Current.AdditionalServices == undefined ? [] : that.planMigrationSession.Current.AdditionalServices; // [{ "idServicio": 2436, "codTipoEquipo": 34, "tipequ": 2, "id": "1075", "desc": "Casilla de Correo 10GB-3 Play", "img": "/Content/Images/SUFija/ico_internet.svg" }, { "idServicio": 2438, "id": "1077", "desc": "Puerto 25", "img": "/Content/Images/SUFija/ico_internet.svg" }]
            var datosEquipos = that.planMigrationSession.Current.AdditionalEquipment == undefined ? [] : that.planMigrationSession.Current.AdditionalEquipment;

            var predata = datosAdicionales.concat(datosPrincipales);
            var data = datosEquipos.concat(predata)


            var detailXML = "";
            var feed = "";
            feed += "<FORMATO_TRANSACCION>{0}</FORMATO_TRANSACCION>";
            feed += "<CENTRO_ATENCION_AREA>{1}</CENTRO_ATENCION_AREA>";
            feed += "<REPRES_LEGAL>{2}</REPRES_LEGAL>";
            feed += "<TITULAR_CLIENTE>{3}</TITULAR_CLIENTE>";


            feed += "<TIPO_DOC_IDENTIDAD>{4}</TIPO_DOC_IDENTIDAD>";
            feed += "<PLAN_ACTUAL>{5}</PLAN_ACTUAL>";
            feed += "<CICLO_FACTURACION>{6}</CICLO_FACTURACION>";



            feed += "<FECHA_TRANSACCION_PROGRAM>{7}</FECHA_TRANSACCION_PROGRAM>";
            feed += "<CASO_INTER>{8}</CASO_INTER>";
            feed += "<NRO_SERVICIO>{9}</NRO_SERVICIO>";

            feed += "<NRO_DOC_IDENTIDAD>{10}</NRO_DOC_IDENTIDAD>";
            feed += "<NUEVO_PLAN>{11}</NUEVO_PLAN>";
            feed += "<SOLUCION>{12}</SOLUCION>";
            feed += "<CF_TOTAL_NUEVO>{13}</CF_TOTAL_NUEVO>";
            feed += "<FECHA_VISITA>{14}</FECHA_VISITA>";
            feed += "<PENALIDAD>{15}</PENALIDAD>";
            feed += "<SOT>{16}</SOT>";
            feed += "<CONTRATO>{17}</CONTRATO>";
            feed += "<CONTRATO_CLIENTE>{18}</CONTRATO_CLIENTE>";

            feed = string.format(feed,
                that.planMigrationSession.Configuration.Constants.Constancia_FormatoTransaccion,
                $("#ddlCenterofAttention option:selected").html(),
                that.planMigrationSession.Data.CustomerInformation.LegalRepresentative == null ? "" : that.planMigrationSession.Data.CustomerInformation.LegalRepresentative,
                that.planMigrationSession.Data.CustomerInformation.CustomerName,
                that.planMigrationSession.Data.CustomerInformation.LegalRepresentativeDocument,
                Session.SessionParams.DATASERVICE.Plan,
                that.planMigrationSession.Data.CustomerInformation.BillingCycle,
                that.getFechaActual(),
                "@idInteraccion",
                "",
                that.planMigrationSession.Data.CustomerInformation.DocumentNumber,
                that.planMigrationSession.Current.Plan.PlanDescription,
                that.planMigrationSession.Current.Plan.SolutionDescription,
                $("#newFixedCharge").text(),
                $("#txtCalendar").val(),
                "",
                "@codSolot",
                Session.SessionParams.DATACUSTOMER.ContractID,
                Session.SessionParams.DATACUSTOMER.ContractID
            )
            var XMLServicios = "";
            data.forEach(function (select, idx) {



                detailXML = "<NOMBRE_SERVICIO>{0}</NOMBRE_SERVICIO>";
                detailXML += "<TIPO_SERVICIO>{1}</TIPO_SERVICIO>";
                detailXML += "<GRUPO_SERVICIO>{2}</GRUPO_SERVICIO>";
                detailXML += "<CF_TOTAL_IGV>{3}</CF_TOTAL_IGV>";
                XMLServicios += string.format(detailXML,
                    select.ServiceDescription,
                    select.ServiceType,
                    select.GroupName,
                    select.Price
                )




            });

            feed += XMLServicios;
            feed += "<PRESUSCRITO>{0}</PRESUSCRITO>";
            feed += "<NRO_CARTA>{1}</NRO_CARTA>";
            feed += "<NOM_OPERADOR>{2}</NOM_OPERADOR>";
            feed += "<PUB_NT_PA>{3}</PUB_NT_PA>";
            feed += "<CAMPANA_DESTINO>{4}</CAMPANA_DESTINO>";
            feed += "<CAMPANA_ORIGEN>{5}</CAMPANA_ORIGEN>";
            feed += "<CONTENIDO_COMERCIAL2>{6}</CONTENIDO_COMERCIAL2>";
            feed = string.format(feed,
                "0",
                "",
                "AMERICA MOVIL DEL PERU SAC",
                "0",
                that.planMigrationSession.Current.Plan.CampaignDescription,
                Session.SessionParams.DATASERVICE.Campaign,
                that.planMigrationSession.Configuration.Constants.Constancia_ContenidoComercial
            )
            return "<PLANTILLA>" + feed + "</PLANTILLA>";
        },

        getXMLTramaListaServiciosContrato: function () {

            var that = this,
                controls = that.getControls();

            debugger;

            //var datosPrincipalesCable = that.planMigrationSession.Current.ServicesCore == undefined ? [] :
            // that.planMigrationSession.Current.ServicesCore.filter(function (el, idx) { return el.ServiceType == 'Cable' });
            var datosPrincipalesCable = that.planMigrationSession.Current.ServicesCore == undefined ? [] :
                                       that.planMigrationSession.Current.ServicesCore.filter(function (el) { return el.ServiceType.toUpperCase().indexOf('CABLE') > -1 });

            datosPrincipalesCable = $.array.unique(datosPrincipalesCable, 'ServiceDescription');

            // var datosPrincipalesInternet = that.planMigrationSession.Current.ServicesCore == undefined ? [] :
            //                            that.planMigrationSession.Current.ServicesCore.filter(function (el, idx) { return el.ServiceType == 'Internet' });
            var datosPrincipalesInternet = that.planMigrationSession.Current.ServicesCore == undefined ? [] :
                                        that.planMigrationSession.Current.ServicesCore.filter(function (el, idx) { return el.ServiceType.toUpperCase().indexOf('INTERNET') > -1 });
            datosPrincipalesInternet = $.array.unique(datosPrincipalesInternet, 'ServiceDescription');

            //var datosPrincipalesTelefonia = that.planMigrationSession.Current.ServicesCore == undefined ? [] :
            //                            that.planMigrationSession.Current.ServicesCore.filter(function (el, idx) { return el.ServiceType == 'Telefonia' || el.ServiceType == 'Telefonía' });

            var datosPrincipalesTelefonia = that.planMigrationSession.Current.ServicesCore == undefined ? [] :
                                        that.planMigrationSession.Current.ServicesCore.filter(function (el, idx) { return el.ServiceType.toUpperCase().indexOf('TELEFONIA') > -1 || el.ServiceType.toUpperCase().indexOf('TELEFONÍA') > -1 });

            datosPrincipalesTelefonia = $.array.unique(datosPrincipalesTelefonia, 'ServiceDescription');

            var datosAdicionales = that.planMigrationSession.Current.AdditionalServices == undefined ? [] : that.planMigrationSession.Current.AdditionalServices;
            var datosEquipos = that.planMigrationSession.Current.AdditionalEquipment == undefined ? [] : that.planMigrationSession.Current.AdditionalEquipment;

            var datosPrincipales = datosPrincipalesCable.concat(datosPrincipalesInternet).concat(datosPrincipalesTelefonia);
            var predata = datosAdicionales.concat(datosPrincipales);
            var data = datosEquipos.concat(predata)

            var detailXML = "";
            var feed = "";
            data.forEach(function (select, idx) {
                feed = "";
                feed += "<act:coId>{0}</act:coId>";
                feed += "<act:snCode>{1}</act:snCode>";
                feed += "<act:spCode>{2}</act:spCode>";
                feed += "<act:profileId>{3}</act:profileId>";

                feed += "<act:camposAdicionalesDcto>";
                feed += "<act:tipoCostoServicioAvanzado>{4}</act:tipoCostoServicioAvanzado>";
                feed += "<act:costoServicioAvanzado>{5}</act:costoServicioAvanzado>";
                feed += "<act:periodoCostoServicioAvanzado>{6}</act:periodoCostoServicioAvanzado>";
                feed += "</act:camposAdicionalesDcto>";

                feed += "<act:camposAdicionalesCargo>";
                feed += "<act:tipoCostoServicio>{7}</act:tipoCostoServicio>";
                feed += "<act:costoServicio>{8}</act:costoServicio>";
                feed += "<act:periodoCostoServicio>{9}</act:periodoCostoServicio>";
                feed += "</act:camposAdicionalesCargo>";
                feed += "<act:listaNumerosDirectorio/>";

                var PrecioSinIGV = (parseFloat(select.Price) / parseFloat("1." + that.planMigrationSession.Data.Configuration.Constantes_Igv)).toFixed(2);
                var XMLDetailService = string.format(feed,
                    that.planMigrationSession.Configuration.Constants.Contrato_CoId,
                    select.idServicio,
                    select.spcode,
                    that.planMigrationSession.Configuration.Constants.Contrato_ProfileId,
                    that.planMigrationSession.Configuration.Constants.Contrato_TipoCostoServicioAvanzado,
                    PrecioSinIGV,
                    that.planMigrationSession.Configuration.Constants.Contrato_PeriodoCostoServicioAvanzado,
                    that.planMigrationSession.Configuration.Constants.Contrato_TipoCostoServicio,
                    PrecioSinIGV,
                    that.planMigrationSession.Configuration.Constants.Contrato_PeriodoCostoServicio
                )

                detailXML += "<act:servicio>" + XMLDetailService + "</act:servicio>";
            });
            return detailXML;
        },

        getXMLTramaVenta: function () {

            var that = this,
                controls = that.getControls();

            //debugger;
            var markup = string.format('<b>Campaña:</b>{0} <br />', controls.txtSolucion.text());
            markup += string.format('<b>Ciclo de Facturación:</b>{0} <br />', that.planMigrationSession.Data.CustomerInformation.BillingCycle);
            markup += string.format('<b>Servicio:</b>{0}<br />', that.planMigrationSession.Data.CustomerInformation.PackageDescription);
            markup += string.format('<b>Combinación:</b> {0}<br />', Session.SessionParams.DATASERVICE.Plan);
            markup += string.format('<b>Calidad:</b>  {0}<br />', '');

            var feed = "";
            feed += "<BODY><CUSTOMER_ID>{0}</CUSTOMER_ID>";
            feed += "<CODID_OLD>{1}</CODID_OLD>";
            feed += "<TIPO_PRODUCTO>{2}</TIPO_PRODUCTO>";
            feed += "<TIPO_TRANS>{3}</TIPO_TRANS>";
            feed += "<TIPOSERVICIO>{4}</TIPOSERVICIO>";
            feed += "<TIPTRA>{5}</TIPTRA>";
            feed += "<FECPROG>{6}</FECPROG>";
            feed += "<OBSERVACION>{7}</OBSERVACION>";
            feed += "<CODMOTOT>{8}</CODMOTOT>";
            feed += "<CODPLAN>{9}</CODPLAN>";
            feed += "<FRANJA>{10}</FRANJA>";
            feed += "<FRANJA_HOR>{11}</FRANJA_HOR>";
            feed += "<SUBTIPO_ORDEN>{12}</SUBTIPO_ORDEN>";
            feed += "<ID_BUCKET>{13}</ID_BUCKET>";
            feed += "<USUREG>{14}</USUREG>";
            feed += "<COD_INTERCASO>{15}</COD_INTERCASO>";
            feed += "<ANOTACION_TOA>{16}</ANOTACION_TOA>";
            feed += "<NODOPOSTVENTA>{17}</NODOPOSTVENTA>";
            feed += "<TELREFERENCIA>{18}</TELREFERENCIA>";
            feed += "<PLATF_FACTURADOR>{19}</PLATF_FACTURADOR>";
            feed += "<PO_BASICA>{20}</PO_BASICA>";
            feed += "<CAMPANA_DESC>{21}</CAMPANA_DESC>";
            feed += "</BODY>";
            return string.format(
                feed,
                that.planMigrationSession.Data.CustomerInformation.CustomerID,
                that.planMigrationSession.Data.CustomerInformation.ContractNumber,
                that.planMigrationSession.Configuration.Constants.Trama_TipoProducto,
                that.planMigrationSession.Configuration.Constants.Trama_TipoTransVenta,
                that.planMigrationSession.Configuration.Constants.Trama_TipoServicio,
                //that.planMigrationSession.Data.ValidaEta == undefined ? that.planMigrationSession.Data.VisitaTecnica.tipTrabajo : controls.ddlWorkType.val(),
                that.planMigrationSession.Data.VisitaTecnica.flagVisitaTecnica == '0' ? that.planMigrationSession.Data.VisitaTecnica.tipTrabajo : controls.ddlWorkType.val(),
                controls.txtCalendar.val(),
                (that.planMigrationSession.Data.VisitaTecnica.anotaciones == null) ? '' : (that.planMigrationSession.Data.VisitaTecnica.anotaciones) + '\\n' + controls.txtNote.val().replace(/\n/g, "\\n"),
                that.planMigrationSession.Configuration.Constants.CodMotot,
                that.planMigrationSession.Current.Plan.PlanCode,
                $("#ddlTimeZone option:selected").attr('Franja') == undefined ? '' : $("#ddlTimeZone option:selected").attr('Franja'),
                $("#ddlTimeZone option:selected").attr('idHorario') == undefined ? '' : $("#ddlTimeZone option:selected").attr('idHorario'),
                $("#ddlSubWorkType option:selected").attr('CodTipoSubOrden') == undefined ? '' : $("#ddlSubWorkType option:selected").attr('CodTipoSubOrden'),
                $("#ddlTimeZone option:selected").attr('idBucket') == undefined ? '' : $("#ddlTimeZone option:selected").attr('idBucket'),
                Session.SessionParams.USERACCESS.login,
                "@idInteraccion",
                (that.planMigrationSession.Data.VisitaTecnica.anotaciones == null) ? '' : that.planMigrationSession.Data.VisitaTecnica.anotaciones,
                'Nodo ' + $("#spnNode").text(),
                controls.txtReferencePhone.val(),
                that.planMigrationSession.Configuration.Constants.Plataforma_Facturador,
                Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT === 'TOBE' ? that.planMigrationSession.Current.Plan.TMCode : '',
                that.planMigrationSession.Current.Plan.CampaignDescription
            );

        },

        getXMLTramaServicios: function () {

            var that = this,
                controls = that.getControls();

            var datosPrincipales = that.planMigrationSession.Current.ServicesCore == undefined ? [] : that.planMigrationSession.Current.ServicesCore;
            var datosAdicionales = that.planMigrationSession.Current.AdditionalServices == undefined ? [] : that.planMigrationSession.Current.AdditionalServices; // [{ "idServicio": 2436, "codTipoEquipo": 34, "tipequ": 2, "id": "1075", "desc": "Casilla de Correo 10GB-3 Play", "img": "/Content/Images/SUFija/ico_internet.svg" }, { "idServicio": 2438, "id": "1077", "desc": "Puerto 25", "img": "/Content/Images/SUFija/ico_internet.svg" }]
            debugger;
            var datosEquipos = that.planMigrationSession.Current.AdditionalEquipment == undefined ? [] : that.planMigrationSession.Current.AdditionalEquipment;

            var predata = datosAdicionales.concat(datosPrincipales);
            var data = datosEquipos.concat(predata)
            //var data = datos;

            var detailXML = "";
            data.forEach(function (select, idx) {
                var feed = "<ITEM>";
                feed += "<SERVICIO>{0}</SERVICIO>";
                feed += "<IDGRUPO_PRINCIPAL>{1}</IDGRUPO_PRINCIPAL>";
                feed += "<IDGRUPO>{2}</IDGRUPO>";
                feed += "<CANTIDAD_INSTANCIA>{3}</CANTIDAD_INSTANCIA>";
                feed += "<DSCSRV>{4}</DSCSRV>";
                feed += "<BANWID>{5}</BANWID>";
                feed += "<FLAG_LC>{6}</FLAG_LC>";
                feed += "<CANTIDAD_IDLINEA>{7}</CANTIDAD_IDLINEA>";
                feed += "<TIPEQU>{8}</TIPEQU>";
                feed += "<CODTIPEQU>{9}</CODTIPEQU>";
                feed += "<CANTIDAD>{10}</CANTIDAD>";
                feed += "<DSCEQU>{11}</DSCEQU>";
                feed += "<CODIGO_EXT>{12}</CODIGO_EXT>";
                feed += "<CARGOFIJO>{13}</CARGOFIJO>";
                feed += "<COREADICIONAL>{14}</COREADICIONAL>";
                feed += "<SNCODE>{15}</SNCODE>";
                feed += "<SPCODE>{16}</SPCODE>";
                /**/
                feed += "<POID>{17}</POID>";
                feed += "<POTYPE>{18}</POTYPE>";
                feed += "<IDPRODUCTOCBIO>{19}</IDPRODUCTOCBIO>";
                feed += "<TIPOLIMCRED>{20}</TIPOLIMCRED>";
                feed += "<UMBCONS>{21}</UMBCONS>";
                feed += "<FAMILIA>{22}</FAMILIA>";
                feed += "<POP1>{23}</POP1>";
                feed += "<POP2>{24}</POP2>";
                //var nuevoPrecio = Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT !== 'TOBE' ? select.Price.toString().replace(".", ",") : that.priceFormat(parseFloat(select.Price) * parseFloat('1.' + that.planMigrationSession.Data.Configuration.Constantes_Igv)).replace(".", ",");
                var nuevoPrecio = select.Price.toString().replace(".", ",");
                var arrBanwid = (select.banwid + ';').split(';');
                var XMLDetailService = string.format(feed,
                    select.LineID, // Cod. Servicio (PVUDB) 
                   (Session.SessionParams.DATACUSTOMER.objPostDataAccount.plataformaAT === 'TOBE' && (select.ServiceType == 'ALQUILER EQUIPOS' || select.ServiceType == 'ALQUILER EQUIPOS IPTV')) ? select.idGrupo : select.idGrupoPrincipal,
                    select.idGrupo,
                    select.cantidad == null ? 1 : select.cantidad, //CANTIDAD_INSTANCIA
                    select.ServiceDescription,
                    arrBanwid[0],//select.banwid,
                    '', //FLG_LC,
                    1, //CANTIDAD_ID_LINEA
                    select.tipequ,
                    select.codTipoEquipo,
                    1, //CANTIDAD
                    select.descEquipo,
                    select.codigoExterno,
                    nuevoPrecio,
                    select.CoreAdicional,
                    $.string.isEmptyOrNull(select.idServicio) ? '' : select.idServicio,
                    $.string.isEmptyOrNull(select.spcode) ? '' : select.spcode,
                    $.string.isEmptyOrNull(select.po) ? '' : select.po,
                    $.string.isEmptyOrNull(select.poType) ? '' : select.poType,
                    $.string.isEmptyOrNull(select.idProducto) ? '' : select.idProducto,
                    $.string.isEmptyOrNull(select.umbCons) ? '' : select.umbCons,
                    $.string.isEmptyOrNull(select.tipoLimCred) ? '' : select.tipoLimCred,
                    $.string.isEmptyOrNull(select.familia) ? '' : select.familia,
                    $.string.isEmptyOrNull(select.pop1) ? '' : select.pop1,
                    $.string.isEmptyOrNull(select.pop2) ? '' : select.pop2
                    )
                debugger;
                detailXML += XMLDetailService + "</ITEM>";


            });


            return "<BODY>" + detailXML + "</BODY>";

        },
        getListaTipificacionTransversal: function () {

            debugger;
            var that = this, controls = this.getControls();

            var datosPrincipales = that.planMigrationSession.Current.ServicesCore == undefined ? [] : that.planMigrationSession.Current.ServicesCore;
            var datosAdicionales = that.planMigrationSession.Current.AdditionalServices == undefined ? [] : that.planMigrationSession.Current.AdditionalServices; // [{ "idServicio": 2436, "codTipoEquipo": 34, "tipequ": 2, "id": "1075", "desc": "Casilla de Correo 10GB-3 Play", "img": "/Content/Images/SUFija/ico_internet.svg" }, { "idServicio": 2438, "id": "1077", "desc": "Puerto 25", "img": "/Content/Images/SUFija/ico_internet.svg" }]
            var datosEquipos = that.planMigrationSession.Current.AdditionalEquipment == undefined ? [] : that.planMigrationSession.Current.AdditionalEquipment;

            var predata = datosAdicionales.concat(datosPrincipales);
            var data = datosEquipos.concat(predata)


            var xjsonTrama = {
                "listaTrama": []
            };

            $.each(data, function (idx, service) {

                var x = {
                    "codInter": "@idInteraccion",
                    "serv": service.ServiceDescription == null ? "" : service.ServiceDescription,
                    "tipServ": service.ServiceType == null ? "" : service.ServiceType,
                    "grupServ": service.GroupName == null ? "" : service.GroupName,
                    "cf": service.Price == null ? "" : service.Price,
                    "equipo": "",
                    "cantidad": ""
                };

                xjsonTrama.listaTrama.push(x);

            });

            return xjsonTrama.listaTrama;

        },

        getJSONServicios: function () {

            //debugger;
            var datos = that.planMigrationSession.Current.AdditionalServices; // [{ "idServicio": 2436, "codTipoEquipo": 34, "tipequ": 2, "id": "1075", "desc": "Casilla de Correo 10GB-3 Play", "img": "/Content/Images/SUFija/ico_internet.svg" }, { "idServicio": 2438, "id": "1077", "desc": "Puerto 25", "img": "/Content/Images/SUFija/ico_internet.svg" }]
            var tramavisita = "";
            $.each(datos, function (idx, select) {
                tramavisita += select.idservicio + "|" + select.codTipoEquipo + ";" + select.tipequ + ";"
            });

            var jsonTramaTransversal = {
                "body": {
                    "item": []
                }
            };


            data.forEach(function (idx, select) {
                var feed = {
                    "SERVICIO": select.idServicio,
                    "IDGRUPO_PRINCIPAL": "001",
                    "IDGRUPO": "001",
                    "CANTIDAD_INSTANCIA": 1,
                    "DSCSRV": select.desc,
                    "BANWID": 1,
                    "FLAG_LC": "",
                    "CANTIDAD_IDLINEA": 1,
                    "TIPEQU": select.codTipoEquipo,
                    "CODTIPEQU": select.tipequ,
                    "CANTIDAD": 1,
                    "CODIGO_EXT": "",
                    "CARGOFIJO": ""
                };
                var x = { "item": [] };
                x.item.push(feed);
                jsonTramaTransversal.body.item.push(x);

            });

            return jsonTramaTransversal;

        },


        PadLeft: function (num, length) {
            while (num.length < length) {
                num = '0' + num;
            }
            return num;
        },

        ReservaTOA: function (nroOrden) {
            var that = this,
                controls = that.getControls();

            var objLoadParameters = {};
            objLoadParameters.flagValidaETA = that.planMigrationSession.Data.ValidaEta.FlagIndica;//that.TransferSession.Data.ValidaEta.FlagReserva;
            objLoadParameters.tiptra = controls.ddlWorkType.val();
            objLoadParameters.tipSrv = $("#ddlSubWorkType option:selected").attr("idtiposervicio");
            objLoadParameters.nroOrden = nroOrden;
            objLoadParameters.fechaReserva = controls.txtCalendar.val();
            objLoadParameters.idBucket = $("#ddlTimeZone option:selected").attr('idBucket') == undefined ? '' : $("#ddlTimeZone option:selected").attr('idBucket');
            objLoadParameters.codZona = that.planMigrationSession.Data.ValidaEta.CodigoZona, //that.planMigrationSession.Data.Instalacion.Zona;//"400";
                objLoadParameters.idPlano = that.planMigrationSession.Data.Instalacion.CodPlano;
            objLoadParameters.tipoOrden = $("#ddlSubWorkType option:selected").attr('codtipoorden');
            objLoadParameters.codSubTipoOrden = controls.ddlSubWorkType.val()
            objLoadParameters.idConsulta = $("#ddlTimeZone option:selected").attr('idConsulta') == undefined ? '' : $("#ddlTimeZone option:selected").attr('idConsulta');
            objLoadParameters.franjaHoraria = $("#ddlTimeZone option:selected").attr('franja') == undefined ? '' : $("#ddlTimeZone option:selected").attr('franja');// "PM2";
            objLoadParameters.duracion = $("#ddlTimeZone option:selected").attr('disponibilidad');//20;


            var urlBase = '/PlanMigration/Home/GestionarReservaTOA';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(objLoadParameters),
                url: urlBase,
                success: function (response) {

                    if (response != null) {
                        that.planMigrationSession.Configuration.Constants.nroOrdenTOA = response.oDataResponse.nroOrden;
                        that.countdown(response.oDataResponse.nroOrden)
                    }
                    else {
                        alert('No se pudo ejecutar la reseva del horario. Por favor vuelva a intentar')
                    }
                    ///$.unblockUI();
                }

            });


        },
        CancelarTOA: function (nroOrden) {
            var that = this,
                controls = that.getControls();

            var objLoadParameters = {};
            objLoadParameters.nroOrden = nroOrden;
            var urlBase = '/PlanMigration/Home/GestionarCancelarTOA';
            $.app.ajax({
                type: 'POST',
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(objLoadParameters),
                url: urlBase,
                success: function (response) {

                    if (response != null) {

                    }

                }
            });


        },


        countdown: function (nroOrden) {
            var that = this;
            var controls = this.getControls();

            var STR_TIMER_FRANJA = parseInt(that.planMigrationSession.Configuration.Constants.Constantes_TimerFranjaHorario);//that.planMigrationSession.Configuration.Constants.TimerFranjaHorario;//that.TransferSession.Configuration.Constants.TimerFranjaHorario; //Configurable
            $('#countdown').show();
            var momentOfTime = new Date();
            var myTimeSpan = STR_TIMER_FRANJA * 60 * 1000;
            momentOfTime.setTime(momentOfTime.getTime() + myTimeSpan);
            var countDownDate = momentOfTime;

            var finalize = false;
            //clearInterval(x);
            var x = setInterval(function () {
                var now = new Date().getTime();
                var distance = countDownDate - now;
                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                $("#countdown p").html(minutes + "m " + seconds + "s ");
                if (that.stopCountDown) clearInterval(x);
                if (distance < 0) {
                    //  clearInterval(x);
                    $("#countdown p").html("Tiempo expirado");
                    //Cuando se expira el tiempo cancelamos la reserva TOA anterior
                    finalize = true;
                    alert("El tiempo de la reserva del horario ha expirado. Por favor seleccione un nuevo horario", "Alerta");

                    ///INICIO DE LINEAS AGREGADAS 
                    //MIGUEL ANTON
                    if (finalize) {
                        //CANCELAMOS LA RESERVA TOA
                        that.CancelarTOA(nroOrden);
                        //FINALIZAMOS LA SALIDA DEL TIMER. ANTES DE QUEDABA CICLADO :O
                        clearInterval(x)


                        var fechaSeleccionada = controls.txtCalendar.val();
                        var ActivityCapacity = [
                            { "nombre": "XA_Map", "valor": that.PadLeft(that.planMigrationSession.Data.Instalacion.CodPlano, 10) },
                            { "nombre": "XA_WorkOrderSubtype", "valor": controls.ddlSubWorkType.val() },// HFCPTI01
                            { "nombre": "XA_Zone", "valor": that.planMigrationSession.Data.ValidaEta.CodigoZona }//3133
                        ]

                        that.getLoadingPage();
                        that.loadCargaFranjaHorario(
                            that.planMigrationSession.Data.ValidaEta.FlagIndica,//flagValidaEta
                            controls.ddlWorkType.val(),
                            fechaSeleccionada,//fechaAgenda
                            that.planMigrationSession.Configuration.Constants.Constantes_Origen, //that.planMigrationSession.Configuration.Constants.Origen,//origen
                            that.planMigrationSession.Data.Instalacion.CodPlano, // "LAMO088-F", 
                            that.planMigrationSession.Data.Instalacion.Ubigeo, //"150114", 
                            "Post-Venta",//$("#ddlSubWorkType option:selected").attr("idtiposervicio"), //"Post-Venta",//$("#ddlSubWorkType option:selected").attr("typeservice"); //"Post-Venta"- 0062
                            $("#ddlSubWorkType option:selected").attr('codtipoorden'),//"FTTHTE"
                            controls.ddlSubWorkType.val(),//controls.ddlSubWorkType.val(), //controls.ddlSubWorkType.val(),//subtipoOrden -$("#ddlSubWorkType 
                            that.planMigrationSession.Data.ValidaEta.CodigoZona, //that.planMigrationSession.Data.Instalacion.Zona,//"4000",//that.planMigrationSession.Data.ValidaEta.CodigoZona, 
                            Session.SessionParams.DATACUSTOMER.CustomerID,
                            Session.SessionParams.DATACUSTOMER.ContractID,
                            that.planMigrationSession.Configuration.Constants.Constantes_ReglaValidacion, // that.planMigrationSession.Configuration.Constants.ReglaValidacion,
                            ActivityCapacity
                        );

                        $.unblockUI();
                    }
                    //FIN DE LINEAS AGREGADAS
                    //MIGUEL ANTON


                }
            }, 1000);


        },

        ddlTimeZone_Click: function () {
            var that = this,
                controls = that.getControls();
            //debugger;
            //Reserva TOA
            //FlagReserva=>> SI APLICA RESERVA O NO EL AGENDAMIENTO
            //FlagIndica=>>SI APLICA  ETA TRAE CAPACIDAD DESDE TOA, SI NO DESDE UN XML


            if (that.planMigrationSession.Data.ValidaEta.FlagReserva != '0') {
                that.ReservaTOA(that.planMigrationSession.Configuration.Constants.nroOrdenTOA);
                //that.countdown();    
            }

            controls.ddlTimeZone.closest('.form-control').removeClass('has-error');
            controls.timeZoneErrorMessage.text('');
        },

        getPlanMigrationSessionDataFixedPlanDetail: function (Group, ServiceEquiptment) {
            /*
             Servicios Core : Group:'PRINCIPAL' - ServiceEquiptment:'SERVICIO'
             Equipos Adicionales : Group:'EQUIPO_ALQUILER' - ServiceEquiptment:'EQUIPO'
            */
            var that = this,
                arrFixedPlanDetail = that.planMigrationSession.Data.FixedPlanDetail.filter(function (item) {
                    return item.PlanCode == that.planMigrationSession.Current.Plan.PlanCode &&
                    item.Group == Group &&
                    item.ServiceEquiptment == ServiceEquiptment
                });
            return arrFixedPlanDetail;
        },

        ValidateNumbers_Click: function (e) {
            if (e.keyCode == 46 || e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 27 || e.keyCode == 13 ||
                (e.keyCode == 65 && e.ctrlKey === true) || (e.keyCode >= 35 && e.keyCode <= 39))
                return;
            else
                if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105) || e.KeyCode == 187 || e.KeyCode == 186 || e.KeyCode == 192)
                    e.preventDefault();

        },

        ConsultCampaign: function () {
            var that = this,
               controls = that.getControls(),
                objParam = {
                    MessageRequest: {
                        Body: {
                            consultarCampaniaRequest: {
                                consultaCampania: {
                                    tipoDoc: Session.SessionParams.DATACUSTOMER.DocumentType,
                                    nroDoc: Session.SessionParams.DATACUSTOMER.DNIRUC,
                                    coId: Session.SessionParams.DATACUSTOMER.ContractID,
                                    tipoPrdCod: ((Session.UrlParams.SUREDIRECT == 'HFC') ? '05' : '08')
                                }
                            }
                        }
                    },
                    strIdSession: Session.IdSession
                };

            $.app.ajax({
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                async: false,
                url: '/PlanMigration/Home/GetConsultCampaign',
                data: JSON.stringify(objParam),

                success: function (response) {
                    if (response != null) {
                        if (response.MessageResponse != null) {
                            if (response.MessageResponse.Header.HeaderResponse.Status.Code == '0') {
                                if (response.MessageResponse.Body != null) {
                                    if (response.MessageResponse.Body.consultarCampaniaResponse != null) {
                                        if (response.MessageResponse.Body.consultarCampaniaResponse.auditResponse.codigoRespuesta == '0') {
                                            if (response.MessageResponse.Body.consultarCampaniaResponse.consultarCursor != null) {
                                                if (response.MessageResponse.Body.consultarCampaniaResponse.consultarCursor.cursor != null) {
                                                    if (response.MessageResponse.Body.consultarCampaniaResponse.consultarCursor.cursor[0].campaniaCodigo != "") {
                                                        var ArrayCampColab = controls.hidCodCampaniaColab.split("|");
                                                        var i = ArrayCampColab.length;
                                                        while (i--) {
                                                            if (ArrayCampColab[i] == response.MessageResponse.Body.consultarCampaniaResponse.consultarCursor.cursor[0].campaniaCodigo) {
                                                                that.intCampania = 1;
                                                            }
                                                        }
                                                        return;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            } else {
                                alert(controls.hidMsgErrorConsultCam, 'Alerta');
                            }
                        }
                    }
                    return;
                },

                error: function () {
                    alert(controls.hidMsgErrorConsultCam, 'Alerta');
                    return;
                }
            });
        },

        RegisterCampaign: function (item) {
            var that = this,
               controls = that.getControls(),
                objParam = {
                    MessageRequest: {
                        Body: {
                            registrarCampaniaRequest: {
                                registrarCampania: {
                                    tipoDocumento: Session.SessionParams.DATACUSTOMER.DocumentType,
                                    nroDocumento: Session.SessionParams.DATACUSTOMER.DNIRUC,
                                    nroLinea: ((Session.SessionParams.DATACUSTOMER.Telephone == '') ? '111111111' : Session.SessionParams.DATACUSTOMER.Telephone),
                                    tmCode: item.TMCode,
                                    planCodigo: item.PlanCode,
                                    planDescripcion: item.PlanDescription,
                                    tipoPrdCodigo: ((Session.UrlParams.SUREDIRECT == 'HFC') ? '05' : '08'),
                                    tipoPrdDescripcion: item.Product,
                                    campaniaCodigo: item.CampaignCode,
                                    campaniaDescripcion: item.CampaignDescription,
                                    coId: Session.SessionParams.DATACUSTOMER.ContractID,
                                    usuarioCrea: Session.SessionParams.USERACCESS.login,
                                }
                            }
                        }
                    },
                    strIdSession: Session.IdSession
                };

            $.app.ajax({
                type: 'POST',
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                async: false,
                url: '/PlanMigration/Home/PostRegisterCampaign',
                data: JSON.stringify(objParam),

                success: function (response) {
                    if (response != null) {
                        if (response.MessageResponse != null) {
                            if (response.MessageResponse.Body != null) {
                                if (response.MessageResponse.Body.registrarCampaniaResponse != null) {
                                    if (response.MessageResponse.Body.registrarCampaniaResponse.auditResponse != null) {
                                        if (response.MessageResponse.Body.registrarCampaniaResponse.auditResponse.codigoRespuesta == "0") {
                                            return;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return;
                },

                error: function () {
                    return;
                }
            });
        }
    },

        $.fn.PlanMigration = function () {
            var option = arguments[0],
                args = arguments,
                value,
                allowedMethods = [];

            this.each(function () {
                var $this = $(this),
                    data = $this.data('PlanMigration'),
                    options = $.extend({}, $.fn.PlanMigration.defaults,
                        $this.data(), typeof option === 'object' && option);

                if (!data) {
                    data = new Form($this, options);
                    $this.data('PlanMigration', data);
                }

                if (typeof option === 'string') {
                    if ($.inArray(option, allowedMethods) < 0) {
                        throw "Unknown method: " + option;
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

    $.fn.PlanMigration.defaults = {}

    $('#divIndex').PlanMigration();

})(jQuery, null);