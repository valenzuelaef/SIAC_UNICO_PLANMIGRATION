using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.DatosAdicionales;
using Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.FranjaHoraria;
using Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.VisitaTecnica;
using Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.CargaInicialCustomers;
using Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.Transversal;
using Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.GestionCuadrillas;
using Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.CampaignCollaborator;
using Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Utils;


namespace Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Controllers
{
    public class HomeController : Controller
    {
        static DatosAdicionalesResponse oDatosAdi = new DatosAdicionalesResponse();
        static byte[] databytesFile;
        static List<Motivos> listMotivos   = new List<Motivos>();
        static List<ListaTiposTrabajo> listTipoTrabajo  = new List<ListaTiposTrabajo>();
        static List<ListaSubTiposTrabajo> listsubTipoTrabajo  = new List<ListaSubTiposTrabajo>();
        static ValidaEta listValidaEta      = new ValidaEta();
        static List<FixedPlan> fixPlanes = new List<FixedPlan>();
        static PlanFijaServicio fixPlanesCoreService = new PlanFijaServicio();
        static string stridSession;
        //static string strIpSession = Utils.Common.GetApplicationIp();
        static string strIpSession = "172.19.84.167";

        public ActionResult Index()
        {
            return PartialView();
        }

        public ActionResult CustomerData()
        {
            return PartialView();
        }

        public ActionResult ChoosePlan()
        {
            return PartialView("ChoosePlan");
        }

        public ActionResult RenderPartialView(string partialView)
        {
            return PartialView(partialView);
        }

        [HttpPost]
        public JsonResult GetDatosAdicionales(DatosAdicionalesBodyRequest request)
        {
            string strUrl = ConfigurationManager.AppSettings["DPGetObtenerDatosAcionales"];
            
            Models.DatosAdicionales.DatosAdicionalesRequest oDatosAcicionalesDataRequest = new Models.DatosAdicionales.DatosAdicionalesRequest();
            Models.DatosAdicionales.DatosAdicionalesResponse oDatosAcicionalesDataResponse = new Models.DatosAdicionales.DatosAdicionalesResponse();

            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

            oDatosAcicionalesDataRequest.Audit = oAuditRequest;

            oDatosAcicionalesDataRequest.MessageRequest = new Models.DatosAdicionales.DatosAdicionalesMessageRequest
            {
                Header = new Models.DataPower.HeaderReq
                {
                    HeaderRequest = new Models.DataPower.HeaderRequest
                    {
                        consumer = "TCRM",
                        country = "PERU",
                        dispositivo = "MOVIL",
                        language = "ES",
                        modulo = "OM",
                        msgType = "REQUEST",
                        operation = "obtenerDatosInicialAdicionales",
                        pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                        system = "SIACU",
                        timestamp = DateTime.Now.ToString("o"),
                        userId = Utils.Common.CurrentUser,
                        wsIp = strIpSession
                    }
                },
                Body = new Models.DatosAdicionales.DatosAdicionalesBodyRequest
                {
                    IdTransaccion = request.IdTransaccion,
                    IdProceso = request.IdProceso,
                    IdProducto = request.IdProducto == null ? "" : request.IdProducto,
                    tecnologia = request.tecnologia == null ? "" : request.tecnologia,
                    CodPais = request.CodPais == null ? "" : request.CodPais,
                    IdTipoUrba = request.IdTipoUrba == null ? "" : request.IdTipoUrba,
                    ContratoId = request.ContratoId == null ? "" : request.ContratoId,
                    IdTipoInt = request.IdTipoInt == null ? "" : request.IdTipoInt,
                    IdCodVia = request.IdCodVia == null ? "" : request.IdCodVia,
                    CodUbi = request.CodUbi == null ? "" : request.CodUbi,
                    Ubigeo = request.Ubigeo == null ? "" : request.Ubigeo,
                    IdPoblado = request.IdPoblado == null ? "" : request.IdPoblado,
                    TipTrabajo = request.TipTrabajo == null ? "" : request.TipTrabajo,
                    FlagCE = request.FlagCE == null ? "" : request.FlagCE,
                    TipoServicio = request.TipoServicio == null ? "" : request.TipoServicio,
                    TipTra = request.TipTra == null ? "" : request.TipTra,

                    Origen = request.Origen == null ? "" : request.Origen,
                    IdPlano = request.IdPlano == null ? "" : request.IdPlano,
                    customerId = request.customerId == null ? "" : request.customerId,
                    tipoPuntoVenta = request.tipoPuntoVenta == null ? "" : request.tipoPuntoVenta,
                    canal = "DAC",

                    oficina = request.oficina == null ? "" : request.oficina,
                    oficinaDefault = request.oficinaDefault == null ? "" : request.oficinaDefault,
                    oferta = request.oferta == null ? "" : request.oferta,
                    flagEjecucion = request.flagEjecucion == null ? "" : request.flagEjecucion,
                    plan = request.plan == null ? "" : request.plan,
                    tipo = request.tipo == null ? "" : request.tipo,
                    cantDeco = request.cantDeco == null ? "" : request.cantDeco,

                    FechaDesde = string.Empty,
                    FechaHasta = string.Empty,
                    Estado = string.Empty,
                    Asesor = string.Empty,
                    Cuenta = string.Empty,
                    TipoTransaccion = string.Empty,
                    CodIteraccion = string.Empty,
                    CadDac = string.Empty,
                    coIdPub = request.coIdPub == null ? "" : request.coIdPub,
                    flagConvivencia = ConfigurationManager.AppSettings["flagConvivenciaAsIsToBeReingFija"]

                }
            };
            try
            {
                Tools.Traces.Logging.Info(stridSession, oDatosAcicionalesDataRequest.Audit.Transaction, "Url: " + strUrl);
                Tools.Traces.Logging.Info(stridSession, oDatosAcicionalesDataRequest.Audit.Transaction, "Request GetDatosAdicionales DP PostMigracionPlan: " + JsonConvert.SerializeObject(oDatosAcicionalesDataRequest));
                oDatosAcicionalesDataResponse = Utils.RestService.PostInvoque<Models.DatosAdicionales.DatosAdicionalesResponse>(strUrl, oDatosAcicionalesDataRequest.Audit, oDatosAcicionalesDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDatosAcicionalesDataRequest.Audit.Transaction, "Response GetDatosAdicionales DP PostMigracionPlan: " + JsonConvert.SerializeObject(oDatosAcicionalesDataResponse));
                oDatosAdi = oDatosAcicionalesDataResponse;


            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDatosAcicionalesDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oDatosAcicionalesDataResponse = JsonConvert.DeserializeObject<Models.DatosAdicionales.DatosAdicionalesResponse>(result);
            }


            return Json(new
            {
                data = oDatosAcicionalesDataResponse,
            }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public JsonResult GetPlanFijaServicio(DatosAdicionalesBodyRequest request)
        {
            this.GetDatosAdicionales(new DatosAdicionalesBodyRequest
            {
                ContratoId = request.ContratoId,
                IdTransaccion = request.IdTransaccion,
                IdProceso = request.IdProceso,
                tecnologia = request.tecnologia,
                plan = request.plan,
                tipo = request.tipo,
                coIdPub=request.coIdPub
            });

            fixPlanesCoreService = new PlanFijaServicio();
            fixPlanesCoreService = oDatosAdi.MessageResponse.Body.servicios.PlanFijaServicioCampana;
            if (fixPlanesCoreService != null)
            {
                return Json(new { data = fixPlanesCoreService, success = true });
            }
            return Json(new { data = fixPlanesCoreService, success = false });
        }

        [HttpPost]
        public JsonResult GetPlanesMigracion(DatosAdicionalesBodyRequest request)
        {
            this.GetDatosAdicionales(new DatosAdicionalesBodyRequest
            {
                ContratoId = request.ContratoId,
                IdTransaccion = request.IdTransaccion,
                IdProceso = request.IdProceso,
                IdProducto = request.IdProducto,
                tecnologia = request.tecnologia,
                oferta = request.oferta,
                oficina = request.oficina,
                oficinaDefault = request.oficinaDefault,
                flagEjecucion = request.flagEjecucion
            });

            fixPlanes = new List<FixedPlan>();
            fixPlanes = oDatosAdi.MessageResponse.Body.servicios.FixedPlan.PlanList;
            if (fixPlanes != null)
            {
                return Json(new { data = fixPlanes, success = true });
            }
            return Json(new { data = fixPlanes, success = false });
        }

        [HttpPost]
        public JsonResult GetDatosVisitaTecnica(VisitaTecnicaBodyRequest request)
        {
            string strUrl = ConfigurationManager.AppSettings["DPGetObtenerVisitaTecnica"];
            Models.VisitaTecnica.VisitaTecnicaRequest oDataRequest = new Models.VisitaTecnica.VisitaTecnicaRequest();
            Models.VisitaTecnica.VisitaTecnicaResponse oDataResponse = new Models.VisitaTecnica.VisitaTecnicaResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

            oDataRequest.Audit = oAuditRequest;
            oDataRequest.MessageRequest = new Models.VisitaTecnica.VisitaTecnicaMessageRequest
            {
                Header = new Models.DataPower.HeaderReq
                {
                    HeaderRequest = new Models.DataPower.HeaderRequest
                    {
                        consumer = "TCRM",
                        country = "PERU",
                        dispositivo = "MOVIL",
                        language = "ES",
                        modulo = "sisact",
                        msgType = "REQUEST",
                        operation = "DatosVisitaTecnica",
                        pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                        system = "SIAC",
                        timestamp = DateTime.Now.ToString("o"),
                        userId = Utils.Common.CurrentUser,
                        wsIp = strIpSession
                    }
                },
                Body = new Models.VisitaTecnica.VisitaTecnicaBodyRequest
                {
                    ContratoId = request.ContratoId,
                   customerId = request.customerId,
                    listaTrama = request.listaTrama
                }
            };

            try
            {
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Url: " + strUrl);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Request GetDatosVisitaTecnica DP PostMigracionPlan: " + JsonConvert.SerializeObject(oDataRequest));
                oDataResponse = Utils.RestService.PostInvoque<Models.VisitaTecnica.VisitaTecnicaResponse>(strUrl, oDataRequest.Audit, oDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Response GetDatosVisitaTecnica DP PostMigracionPlan: " + JsonConvert.SerializeObject(oDataResponse));
            
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oDataResponse = JsonConvert.DeserializeObject<Models.VisitaTecnica.VisitaTecnicaResponse>(result);
            }
            return Json(new
            {
                dataVisitaTecnica = oDataResponse.MessageResponse.Body,
            }, JsonRequestBehavior.AllowGet);

        }

        [HttpPost]
        public JsonResult GetDatosFranjaHorario(FranjaHorariaBodyRequest request)
        {
            string strUrl = ConfigurationManager.AppSettings["DPGetObtenerFranjaHorario"];
            Models.FranjaHoraria.FranjaHorariaRequest oDataRequest = new Models.FranjaHoraria.FranjaHorariaRequest();
            Models.FranjaHoraria.FranjaHorariaResponse oDataResponse = new Models.FranjaHoraria.FranjaHorariaResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

            oDataRequest.Audit = oAuditRequest;

            oDataRequest.MessageRequest = new Models.FranjaHoraria.FranjaHorariaMessageRequest
            {
                Header = new Models.DataPower.HeaderReq
                {
                    HeaderRequest = new Models.DataPower.HeaderRequest
                    {
                        consumer = "TCRM",
                        country = "PERU",
                        dispositivo = "MOVIL",
                        language = "ES",
                        modulo = "sisact",
                        msgType = "REQUEST",
                        operation = "obtenerFranjaHorario",
                        pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                        system = "SIAC",
                        timestamp = DateTime.Now.ToString("o"),
                        userId = Utils.Common.CurrentUser,
                        wsIp = strIpSession
                    }
                },
                Body = new Models.FranjaHoraria.FranjaHorariaBodyRequest
                {
                    FlagValidaEta = request.FlagValidaEta,
                    Disponibilidad = request.Disponibilidad,
                    TipTra = request.TipTra,
                    TipSrv = request.TipSrv,
                    FechaAgenda = request.FechaAgenda,
                    Origen = request.Origen,
                    IdPlano = request.IdPlano,
                    Ubigeo = request.Ubigeo,
                    TipoOrden = request.TipoOrden,
                    SubtipoOrden =request.SubtipoOrden,
                    CodZona = request.CodZona,
                    Customer = request.Customer,
                    Contrato = request.Contrato,
                    ReglaValidacion = request.ReglaValidacion,
                    listaCampoActividadCapacidad = request.listaCampoActividadCapacidad
                }
            };

            try
            {
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Url: " + strUrl); 
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Request GetDatosFranjaHorario DP PostMigracionPlan: " + JsonConvert.SerializeObject(oDataRequest));
                oDataResponse = Utils.RestService.PostInvoque<Models.FranjaHoraria.FranjaHorariaResponse>(strUrl, oDataRequest.Audit, oDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Response GetDatosFranjaHorario DP PostMigracionPlan: " + JsonConvert.SerializeObject(oDataResponse));


            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oDataResponse = JsonConvert.DeserializeObject<Models.FranjaHoraria.FranjaHorariaResponse>(result);
            }
            return Json(new
            {
                dataCapacity = oDataResponse,
            }, JsonRequestBehavior.AllowGet);

        }

        public JsonResult GetTiposDeTrabajo(DatosAdicionalesBodyRequest orequest)
        {





            List<Utils.GenericItem> SelectListMotivos = new List<Utils.GenericItem>();
            List<Utils.GenericItem> SelectListTipoTrabajo = new List<Utils.GenericItem>();
            List<Utils.GenericItem> SelectListSubTipoTrabajo = new List<Utils.GenericItem>();


            try
            {
                this.GetDatosAdicionales(orequest);
                var oDatos = oDatosAdi.MessageResponse.Body.servicios;

                listTipoTrabajo = oDatos.tipostrabajo_consultarTipoTrabajo.codigoRespuesta == "0" ?
                    oDatos.tipostrabajo_consultarTipoTrabajo.listatipotrabajo.ToList() : null;
                listsubTipoTrabajo = oDatos.consultasubtipo.CodigoRespuesta == "0" ?
                    oDatos.consultasubtipo.listaSubTipo.ToList() : null;

                listValidaEta = oDatos.franjahorario_validaEta.ValidaEta;

                if (listMotivos != null)
                {
                    foreach (var item in listMotivos)
                    {

                        SelectListMotivos.Add(new Utils.GenericItem()
                        {

                            Code = item.CodMotivo,
                            Description = item.Descripcion
                        });
                    }

                }

                if (listTipoTrabajo != null)
                {
                    foreach (var item in listTipoTrabajo)
                    {
                        SelectListTipoTrabajo.Add(new Utils.GenericItem()
                        {

                            Code = item.TipoTrabajo,
                            Code2 = item.FlagFranja,
                            Description = item.Descripcion
                        });
                    }

                }

                if (listsubTipoTrabajo != null)
                {
                    foreach (var item in listsubTipoTrabajo)
                    {

                        SelectListSubTipoTrabajo.Add(new Utils.GenericItem()
                        {

                            Code = item.CodSubTipoOrden,
                            Code2 = item.TipoServicio,
                            Code3 = item.flagDefecto,
                            Group = item.CodTipoOrden,
                            Description = item.Descripcion,
                            Description2 = item.tiempoMin,
                            Type = item.IdSubTipoOrden
                        });
                    }
                }

                return Json(new
                {
                    succes = true,
                    SelectListTipoTrabajo,
                    SelectListSubTipoTrabajo,
                    listValidaEta
                });
            }
            catch (Exception ex)
            {
                return Json(new { succes = false, mensaje = ex.Message.ToString() });
            }

        }

        [HttpPost]
        public JsonResult GetInitialConfiguration(Models.InitialData.InitialDataBodyRequest oBodyRequest, string SessionID, string TransactionID)
        {

            oDatosAdi = new DatosAdicionalesResponse();
            Models.InitialData.InitialDataRequest oInitialDataRequest = new Models.InitialData.InitialDataRequest();
            Models.InitialData.AdditionalFixedDataRequest oDatosAdicionalesDataRequest = new Models.InitialData.AdditionalFixedDataRequest();
            Models.InitialData.InitialDataResponse oInitialDataResponse = new Models.InitialData.InitialDataResponse();
            Models.InitialData.AdditionalFixedDataResponse oAdditionalFixedDataResponse = new Models.InitialData.AdditionalFixedDataResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(SessionID);
            Dictionary<string, string> oConfiguraciones = new Dictionary<string, string>();
            stridSession = SessionID;

            try
            {


                    string strUrl = ConfigurationManager.AppSettings["DPGetCargaDatosClienteFija"];
            oInitialDataRequest.Audit = oAuditRequest;
            oInitialDataRequest.MessageRequest = new Models.InitialData.InitialDataMessageRequest
            {
                Header = new Models.DataPower.HeaderReq
                {
                    HeaderRequest = new Models.DataPower.HeaderRequest
                    {
                        consumer = "SIACU",
                        country = "PE",
                        dispositivo = "MOVIL",
                        language = "ES",
                        modulo = "siacu",
                        msgType = "Request",
                                operation = "obtenerDatosInicial",
                        pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                        system = "SIACU",
                        timestamp = DateTime.Now.ToString("o"),
                        userId = Utils.Common.CurrentUser,
                        wsIp = strIpSession
                    }
                },
                        Body = new Models.InitialData.InitialDataBodyRequest
            {
                            ContractID = oBodyRequest.ContractID,
                            CustomerID = oBodyRequest.CustomerID,
                            UserAccount = oBodyRequest.UserAccount,
                            codeRol = oBodyRequest.codeRol,
                            codeCac = oBodyRequest.codeCac,
                            state = oBodyRequest.state,
                        Type = oBodyRequest.Type,
                        flagConvivencia =  ConfigurationManager.AppSettings["flagConvivenciaAsIsToBeReingFija"]
                        }
                    };

            Tools.Traces.Logging.Info(SessionID, oInitialDataRequest.Audit.Transaction, "Url: " + strUrl);
                Tools.Traces.Logging.Info(SessionID, oInitialDataRequest.Audit.Transaction, "Request: " + JsonConvert.SerializeObject(oInitialDataRequest));
                oInitialDataResponse = Utils.RestService.PostInvoque<Models.InitialData.InitialDataResponse>(strUrl, oInitialDataRequest.Audit, oInitialDataRequest, true);
                Tools.Traces.Logging.Info(SessionID, oInitialDataRequest.Audit.Transaction, "Response: " + JsonConvert.SerializeObject(oInitialDataResponse));

                var oPointAttention = new PuntoAtencionResponse();
                if (oInitialDataResponse.MessageResponse != null)
                {
                    if (oInitialDataResponse.MessageResponse.Body != null)
                    {
                        oPointAttention = oInitialDataResponse.MessageResponse.Body.PuntoAtencion;
                        if (oPointAttention != null)
                        {
                            if (oPointAttention.CodigoRespuesta == "0")
                            {
                                oInitialDataResponse.MessageResponse.Body.PuntoAtencion.listaRegistros = oPointAttention.listaRegistros.OrderBy(x => x.nombre).ToList();
                            }
                            }
                        }
                }

                this.GetDatosAdicionales(new DatosAdicionalesBodyRequest
            {
                    IdTransaccion = TransactionID,
                    IdProceso = Tools.Utils.Constants.NumberOneString,
                    IdProducto = oInitialDataResponse.MessageResponse.Body.CoreServices.Technology,
                    CodPais = Tools.Utils.Constants.NumberFive+  Tools.Utils.Constants.NumberOneString,
                    IdTipoUrba = Tools.Utils.Constants.NumberZeroString,
                    customerId = oBodyRequest.CustomerID,
                    ContratoId = oBodyRequest.ContractID,
                    IdTipoInt =  Tools.Utils.Constants.PresentationLayer.ALL,
                    IdCodVia = Tools.Utils.Constants.NumberZeroString,
                    CodUbi = string.Empty,
                    Ubigeo = string.Empty,
                    IdPoblado = string.Empty
                });

                if (oDatosAdi.MessageResponse.Body.servicios.configuracionesfija_obtenerConfiguraciones.ProductTransaction != null)
                {
                    foreach (var item in oDatosAdi.MessageResponse.Body.servicios.configuracionesfija_obtenerConfiguraciones.ProductTransaction.ConfigurationAttributes.Where(x => x.AttributeType == "CONFIGURACIONES"))
                    {
                        oConfiguraciones[item.AttributeName + "_" + item.AttributeIdentifier] = item.AttributeValue;
                    }
                }

            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(SessionID, oInitialDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oInitialDataResponse = JsonConvert.DeserializeObject<Models.InitialData.InitialDataResponse>(result);
            }

            return Json(new
            {
                oInitialDataResponse,
                oDatosAdi,
                oAuditRequest,
                oConfiguraciones,
            }, JsonRequestBehavior.AllowGet);
        }

        public FileContentResult ShowRecordSharedFile(string strIdSession)
        {
            Tools.Entity.AuditRequest oAuditRequest = Common.CreateAuditRequest<Tools.Entity.AuditRequest>(strIdSession);
            byte[] databytes;
            string strContenType = "application/pdf";
            try
            {
                Tools.Entity.AuditRequest oAudit = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(strIdSession);
                databytes = databytesFile;
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(strIdSession, oAuditRequest.Transaction, ex.Message);
                databytes = null;
            }

            return File(databytes, strContenType);
        }

        [HttpPost]
        public JsonResult postGeneraTransaccion(GuardarDatosDataBodyRequest request, string stridSession,string TransactionID)
        {
            request.idFlujo = TransactionID == Tools.Utils.Constants.NumberOneString ?  ConfigurationManager.AppSettings["IdFlujoMigracionPlanFTTH"]: ConfigurationManager.AppSettings["IdFlujoMigracionPlanFTTHONE"];
            string strUrl = ConfigurationManager.AppSettings["DPGetGuardarDatosAgendamiento"];
            Models.Transversal.GuardarDatosRequest oDataRequest = new Models.Transversal.GuardarDatosRequest();
            Models.Transversal.GuardarDatosResponse oDataResponse = new Models.Transversal.GuardarDatosResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

            //Encriptamos a base64 la notas -  Tipificacion
            request.Servicios.Where(m => m.Servicio == "Tipificacion")
           .Select(m => new Models.Transversal.Servicios
           {
               Servicio = m.Servicio,
               parametros = m.parametros.Where(u => u.parametro == "Notas").ToList()
           }).ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));

            //Encriptamos a base64 la inter_30 - Tipificacion
            request.Servicios.Where(m => m.Servicio == "Plantilla")
           .Select(m => new Models.Transversal.Servicios
           {
               Servicio = m.Servicio,
               parametros = m.parametros.Where(u => u.parametro == "inter30").ToList()
           }).ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));

            //Encriptamos a base64 la lista de Servicios Tipificacion
            request.Servicios.Where(m => m.Servicio == "RegistroServicioTipificacion")
           .Select(m => new Models.Transversal.Servicios
           {
               Servicio = m.Servicio,
               parametros = m.parametros.Where(u => u.parametro == "listaServicio").ToList()
           }).ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));

            
            //Encriptamos a base64 Trama_Venta
            request.Servicios.Where(m => m.Servicio == "Tramas")
               .Select(m => new Models.Transversal.Servicios
               {
                   Servicio = m.Servicio,
                   parametros = m.parametros.Where(u => u.parametro == "Trama_Ventas").ToList()
               }).ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String ( System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)) );

            //Encriptamos a base64 Trama_Servicios
            request.Servicios.Where(m => m.Servicio == "Tramas")
           .Select(m => new Models.Transversal.Servicios
           {
               Servicio = m.Servicio,
               parametros = m.parametros.Where(u => u.parametro == "Trama_Servicios").ToList()
           }).ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));


            //Encriptamos a base64 Lista_Servicios_Contratos
            request.Servicios.Where(m => m.Servicio == "Contrato")
           .Select(m => new Models.Transversal.Servicios
           {
               Servicio = m.Servicio,
               parametros = m.parametros.Where(u => u.parametro == "listaServicios").ToList()
           }).ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));

            //Encriptamos a base64 la Constancia
            request.Servicios.Where(m => m.Servicio == "Constancia")
           .Select(m => new Models.Transversal.Servicios
           {
               Servicio = m.Servicio,
               parametros = m.parametros.Where(u => u.parametro == "DRIVE_CONSTANCIA").ToList()
           }).ToList().ForEach(y => y.parametros.FirstOrDefault().valor = System.Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(y.parametros.FirstOrDefault().valor)));



            //SETEAMOS LOS NULL A VACIO
            request.Servicios.Select(m => new Models.Transversal.Servicios
            {
                Servicio = m.Servicio,
                parametros = m.parametros.Where(u => u.valor == null).ToList()
            } ).ToList().ForEach(y =>
                       {
                           foreach (var item in y.parametros)
                           {
                               item.valor = "";
                           }
                       } );


            oDataRequest.Audit = oAuditRequest;

            oDataRequest.MessageRequest = new Models.Transversal.GuardarDatosDataMessageRequest
            {
                Header = new Models.DataPower.HeaderReq
                {
                    HeaderRequest = new Models.DataPower.HeaderRequest
                    {
                        consumer = "TCRM",
                        country = "PE",
                        dispositivo = "MOVIL",
                        language = "ES",
                        modulo = "sisact",
                        msgType = "REQUEST",
                        operation = "GeneraTransaccion",
                        pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                        system = "SIACU",
                        timestamp = DateTime.Now.ToString("o"),
                        userId = Utils.Common.CurrentUser,
                        wsIp = strIpSession
                    }
                },
                Body = new Models.Transversal.GuardarDatosDataBodyRequest
                {
                    idFlujo = request.idFlujo,
                    Servicios = request.Servicios
                }
            };
            try
            {

                databytesFile = null;    
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Url: " + strUrl);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Request postGeneraTransaccion DP PostMigracionPlan: " + JsonConvert.SerializeObject(oDataRequest));
                oDataResponse = Utils.RestService.PostInvoque<Models.Transversal.GuardarDatosResponse>(strUrl, oDataRequest.Audit, oDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Response postGeneraTransaccion DP PostMigracionPlan: " + JsonConvert.SerializeObject(oDataResponse));
                databytesFile = Convert.FromBase64String(oDataResponse.MessageResponse.Body.constancia);

            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
            }

            return Json(new
            {
                data = oDataResponse,
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult GestionarCancelarTOA(CancelarTOABodyRequest oBodyRequest)
        {

            string strUrl = ConfigurationManager.AppSettings["DPGetGestionarCuadrillaCancelar"];
            CancelarTOARequest oDataRequest = new CancelarTOARequest();
            CancelarTOAResponse oDataResponse = new CancelarTOAResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

            try
            {

                oDataRequest.Audit = oAuditRequest;
                oDataRequest.MessageRequest = new CancelarTOAMessageRequest
                {
                    Header = new Models.DataPower.HeaderReq
                    {
                        HeaderRequest = new Models.DataPower.HeaderRequest
                        {
                            consumer = "SIACU",
                            country = "PE",
                            dispositivo = "MOVIL",
                            language = "ES",
                            modulo = "siacu",
                            msgType = "Request",
                            operation = "GestionarCancelarTOA",
                            pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                            system = "SIACU",
                            timestamp = DateTime.Now.ToString("o"),
                            userId = Utils.Common.CurrentUser,
                            wsIp = strIpSession
                        }
                    },
                    Body = new CancelarTOABodyRequest
                    {
                        nroOrden = oBodyRequest.nroOrden == null ? "" : oBodyRequest.nroOrden
                    }
                };

                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Url: " + strUrl);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Request GestionarCancelarTOA Cambio Plan: " + JsonConvert.SerializeObject(oDataRequest));
                oDataResponse = Utils.RestService.PostInvoque<CancelarTOAResponse>(strUrl, oDataRequest.Audit, oDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Response GestionarCancelarTOA Cambio Plan: " + JsonConvert.SerializeObject(oDataResponse));
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oDataResponse = JsonConvert.DeserializeObject<CancelarTOAResponse>(result);
            }

            return Json(new
            {
                oDataRequest
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult GestionarReservaTOA(ReservaTOABodyRequest oBodyRequest)
        {
            string strUrl = ConfigurationManager.AppSettings["DPGetGestionarCuadrillaReservar"];
            ReservaTOARequest oDataRequest = new ReservaTOARequest();
            ReservaTOAResponse oDataResponse = new ReservaTOAResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

            try
            {

                oDataRequest.Audit = oAuditRequest;
                oDataRequest.MessageRequest = new ReservaTOAMessageRequest
                {
                    Header = new Models.DataPower.HeaderReq
                    {
                        HeaderRequest = new Models.DataPower.HeaderRequest
                        {
                            consumer = "SIACU",
                            country = "PE",
                            dispositivo = "MOVIL",
                            language = "ES",
                            modulo = "siacu",
                            msgType = "Request",
                            operation = "GestionarReservaTOA",
                            pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                            system = "SIACU",
                            timestamp = DateTime.Now.ToString("o"),
                            userId = Utils.Common.CurrentUser,
                            wsIp = strIpSession
                        }
                    },
                    Body = new ReservaTOABodyRequest
                    {
                        codSubTipoOrden = oBodyRequest.codSubTipoOrden == null ? "" : oBodyRequest.codSubTipoOrden,
                        codZona = oBodyRequest.codZona == null ? "" : oBodyRequest.codZona,
                        duracion = oBodyRequest.duracion == null ? "" : oBodyRequest.duracion,
                        fechaReserva = oBodyRequest.fechaReserva == null ? "" : oBodyRequest.fechaReserva,
                        flagValidaETA = oBodyRequest.flagValidaETA == null ? "" : oBodyRequest.flagValidaETA,
                        franjaHoraria = oBodyRequest.franjaHoraria == null ? "" : oBodyRequest.franjaHoraria,
                        idBucket = oBodyRequest.idBucket == null ? "" : oBodyRequest.idBucket,
                        idConsulta = oBodyRequest.idConsulta == null ? "" : oBodyRequest.idConsulta,
                        idPlano = oBodyRequest.idPlano == null ? "" : oBodyRequest.idPlano,
                        nroOrden = oBodyRequest.nroOrden == null ? "" : oBodyRequest.nroOrden,
                        tipoOrden = oBodyRequest.tipoOrden == null ? "" : oBodyRequest.tipoOrden,
                        tipSrv = oBodyRequest.tipSrv == null ? "" : oBodyRequest.tipSrv,
                        tiptra = oBodyRequest.tiptra == null ? "" : oBodyRequest.tiptra
                    }
                };

                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Url: " + strUrl);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Request GestionarReservaTOA Cambio Plan: " + JsonConvert.SerializeObject(oDataRequest));
                oDataResponse = Utils.RestService.PostInvoque<ReservaTOAResponse>(strUrl, oDataRequest.Audit, oDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Response GestionarReservaTOA Cambio Plan: " + JsonConvert.SerializeObject(oDataResponse));
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oDataResponse = JsonConvert.DeserializeObject<ReservaTOAResponse>(result);
            }

            return Json(new
            {
                oDataResponse = oDataResponse.MessageResponse.Body.auditResponse
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult GetConsultCampaign(ConsultCampaignCollabRequest oBodyRequest, string stridSession)
        {
            string strUrl = ConfigurationManager.AppSettings["DPGetConsultarCampania"];
            ConsultCampaignCollabRequest oDataRequest = new ConsultCampaignCollabRequest();
            ConsultCampaignCollabResponse oDataResponse = new ConsultCampaignCollabResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

            try
            {
                oDataRequest.Audit = oAuditRequest;
                oDataRequest.MessageRequest = new ConsultCampaignMessageRequest
                {
                    Header = new Models.DataPower.HeaderReq
                    {
                        HeaderRequest = new Models.DataPower.HeaderRequest
                        {
                            consumer = "SIACU",
                            country = "PE",
                            dispositivo = "MOVIL",
                            language = "ES",
                            modulo = "siacu",
                            msgType = "Request",
                            operation = "GetConsultCampaign",
                            pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                            system = "SIACU",
                            timestamp = DateTime.Now.ToString("o"),
                            userId = Utils.Common.CurrentUser,
                            wsIp = strIpSession
                        }
                    },
                    Body = new ConsultCampaignBodyRequest
                    {
                        consultarCampaniaRequest = new ConsultCampaignRequest
                        {
                            auditRequest = new ConsultCampaignAuditRequest
                            {
                                idTransaccion = oAuditRequest.Transaction,
                                ipAplicacion = strIpSession,
                                nombreAplicacion = oAuditRequest.ApplicationName,
                                usuarioAplicacion = oAuditRequest.UserName
                            },
                            consultaCampania = new ConsultCampaign
                            {
                                numLinea = string.Empty,
                                tipoDoc = GetTypeDocCampaign(oBodyRequest.MessageRequest.Body.consultarCampaniaRequest.consultaCampania.tipoDoc),
                                nroDoc = oBodyRequest.MessageRequest.Body.consultarCampaniaRequest.consultaCampania.nroDoc == null ? "" : oBodyRequest.MessageRequest.Body.consultarCampaniaRequest.consultaCampania.nroDoc,
                                coId = oBodyRequest.MessageRequest.Body.consultarCampaniaRequest.consultaCampania.coId == null ? "" : oBodyRequest.MessageRequest.Body.consultarCampaniaRequest.consultaCampania.coId,
                                nroPed = string.Empty,
                                nroPedDet = string.Empty,
                                nroCont = string.Empty,
                                nroContDet = string.Empty,
                                tipoPrdCod = oBodyRequest.MessageRequest.Body.consultarCampaniaRequest.consultaCampania.tipoPrdCod == null ? "" : oBodyRequest.MessageRequest.Body.consultarCampaniaRequest.consultaCampania.tipoPrdCod
                            }
                        }
                    }
                };

                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Url: " + strUrl); 
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Request GetConsultCampaign DP PostMigracionPlan: " + JsonConvert.SerializeObject(oDataRequest));
                oDataResponse = Utils.RestService.PostInvoque<ConsultCampaignCollabResponse>(strUrl, oDataRequest.Audit, oDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Response GetConsultCampaign DP PostMigracionPlan: " + JsonConvert.SerializeObject(oDataResponse));
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
                oDataResponse = JsonConvert.DeserializeObject<ConsultCampaignCollabResponse>(result);
            }

            return Json(oDataResponse, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult PostRegisterCampaign(RegisterCampaignCollabRequest oBodyRequest, string stridSession)
        {
            string strUrl = ConfigurationManager.AppSettings["DPPostRegistrarCampania"];
            RegisterCampaignCollabRequest oDataRequest = new RegisterCampaignCollabRequest();
            RegisterCampaignCollabResponse oDataResponse = new RegisterCampaignCollabResponse();
            Tools.Entity.AuditRequest oAuditRequest = Utils.Common.CreateAuditRequest<Tools.Entity.AuditRequest>(stridSession);

            try
            {
                oDataRequest.Audit = oAuditRequest;
                oDataRequest.MessageRequest = new RegisterCampaignMessageRequest
                {
                    Header = new Models.DataPower.HeaderReq
                    {
                        HeaderRequest = new Models.DataPower.HeaderRequest
                        {
                            consumer = "SIACU",
                            country = "PE",
                            dispositivo = "MOVIL",
                            language = "ES",
                            modulo = "siacu",
                            msgType = "Request",
                            operation = "PostRegisterCampaign",
                            pid = DateTime.Now.ToString("yyyyMMddHHmmssfff"),
                            system = "SIACU",
                            timestamp = DateTime.Now.ToString("o"),
                            userId = Utils.Common.CurrentUser,
                            wsIp = strIpSession
                        }
                    },
                    Body = new RegisterCampaignBodyRequest
                    {
                        registrarCampaniaRequest = new RegisterCampaignRequest
                        {
                            auditRequest = new RegisterCampaignAuditRequest
                            {
                                idTransaccion = oAuditRequest.Transaction,
                                ipAplicacion = strIpSession,
                                nombreAplicacion = oAuditRequest.ApplicationName,
                                usuarioAplicacion = oAuditRequest.UserName
                            },
                            registrarCampania = new RegisterCampaign
                            {
                                tipoDocumento = GetTypeDocCampaign(oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.tipoDocumento),
                                nroDocumento = oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.nroDocumento == null ? "" : oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.nroDocumento,
                                nroLinea = oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.nroLinea == null ? "111111111" : oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.nroLinea,
                                nroSec = string.Empty,
                                nroPed = string.Empty,
                                nroPedDet = string.Empty,
                                nroCont = string.Empty,
                                nroContDet = string.Empty,
                                tmCode = oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.tmCode == null ? "" : oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.tmCode,
                                planCodigo = oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.planCodigo == null ? "" : oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.planCodigo,
                                planDescripcion = oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.planDescripcion == null ? "" : oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.planDescripcion,
                                tipoPrdCodigo = oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.tipoPrdCodigo == null ? "" : oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.tipoPrdCodigo,
                                tipoPrdDescripcion = oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.tipoPrdDescripcion == null ? "" : oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.tipoPrdDescripcion,
                                campaniaCodigo = oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.campaniaCodigo == null ? "" : oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.campaniaCodigo,
                                campaniaDescripcion = oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.campaniaDescripcion == null ? "" : oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.campaniaDescripcion,
                                coId = oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.coId == null ? "" : oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.coId,
                                tipoOpeCodigo = ConfigurationManager.AppSettings["strCodTipoOperacionCamp"],
                                tipoOpeDescripcion = ConfigurationManager.AppSettings["strTipoOperacion"],
                                estado = "P",
                                usuarioCrea = oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.usuarioCrea == null ? "" : oBodyRequest.MessageRequest.Body.registrarCampaniaRequest.registrarCampania.usuarioCrea,
                                fechaCrea = DateTime.Now.ToShortDateString(),
                                usuarioModifica = string.Empty,
                                fechaModifica = string.Empty,
                                fechaActivacion = DateTime.Now.ToShortDateString()
                            }
                        }
                    }
                };

                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Url: " + strUrl); 
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Request PostRegisterCampaign DP PostMigracionPlan: " + JsonConvert.SerializeObject(oDataRequest));
                oDataResponse = Utils.RestService.PostInvoque<RegisterCampaignCollabResponse>(strUrl, oDataRequest.Audit, oDataRequest, true);
                Tools.Traces.Logging.Info(stridSession, oDataRequest.Audit.Transaction, "Response PostRegisterCampaign DP PostMigracionPlan: " + JsonConvert.SerializeObject(oDataResponse));

            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error(stridSession, oDataRequest.Audit.Transaction, ex.Message);
                string sep = " - ";
                int posResponse = ex.Message.IndexOf(sep);
                string result = ex.Message.Substring(posResponse + sep.Length);
            }

            return Json(oDataResponse, JsonRequestBehavior.AllowGet);
        }

        public string GetTypeDocCampaign(string strTipoDocumento)
        {
            var strCodTipoDoc = ConfigurationManager.AppSettings["strCodTipoDocDefault"];
            try
            {
                string[] strNroDocumento = ConfigurationManager.AppSettings["strTipoDocumentoCampania"].Split('|');

                for (int i = 0; i < strNroDocumento.Length; i++)
                {
                    string[] strDoc = strNroDocumento[i].ToString().Split(',');
                    if (strDoc[0].ToString() == strTipoDocumento)
                    {
                        strCodTipoDoc = strDoc[1].ToString();
                    }
                }
            }
            catch (Exception ex)
            {
                Tools.Traces.Logging.Error("", "", "Error:" + ex.Message);
            }
            return strCodTipoDoc;
        }
    }
}