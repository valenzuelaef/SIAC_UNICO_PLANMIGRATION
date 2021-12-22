using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.CampaignCollaborator
{
    public class ConsultCampaignCollabResponse
    {
        [DataMember(Name = "MessageResponse")]
        public ConsultCampaignMessageResponse MessageResponse { get; set; }
    }

    [DataContract(Name = "MessageResponse")]
    public class ConsultCampaignMessageResponse
    {
        [DataMember(Name = "Header")]
        public DataPower.HeaderRes Header { get; set; }
        [DataMember(Name = "Body")]
        public ConsultCampaignBodyResponse Body { get; set; }
    }

    [DataContract(Name = "Body")]
    public class ConsultCampaignBodyResponse
    {
        [DataMember(Name = "consultarCampaniaResponse")]
        public ConsultCampaignResponse consultarCampaniaResponse { get; set; }
    }

    [DataContract(Name = "consultarCampaniaResponse")]
    public class ConsultCampaignResponse
    {
        [DataMember(Name = "auditResponse")]
        public ConsultCampaignAuditResponse auditResponse { get; set; }

        [DataMember(Name = "consultarCursor")]
        public ConsultCampaignConsultCursor consultarCursor { get; set; }
    }

    [DataContract(Name = "auditResponse")]
    public class ConsultCampaignAuditResponse
    {
        [DataMember(Name = "codigoRespuesta")]
        public string codigoRespuesta { get; set; }

        [DataMember(Name = "idTransaccion")]
        public string idTransaccion { get; set; }

        [DataMember(Name = "nroOrden")]
        public string nroOrden { get; set; }

        [DataMember(Name = "mensajeRespuesta")]
        public string mensajeRespuesta { get; set; }
    }

    [DataContract(Name = "consultarCursor")]
    public class ConsultCampaignConsultCursor
    {
        [DataMember(Name = "cursor")]
        public List<ConsultCampaignCursor> cursor { get; set; }
    }

    [DataContract(Name = "cursor")]
    public class ConsultCampaignCursor
    {
        [DataMember(Name = "tipoDocumento")]
        public string tipoDocumento { get; set; }

        [DataMember(Name = "nroDocumento")]
        public string nroDocumento { get; set; }

        [DataMember(Name = "nroLinea")]
        public string nroLinea { get; set; }

        [DataMember(Name = "nroSec")]
        public string nroSec { get; set; }

        [DataMember(Name = "nroPed")]
        public string nroPed { get; set; }

        [DataMember(Name = "planCodigo")]
        public string planCodigo { get; set; }

        [DataMember(Name = "planDescripcion")]
        public string planDescripcion { get; set; }

        [DataMember(Name = "tipoPrdCodigo")]
        public string tipoPrdCodigo { get; set; }

        [DataMember(Name = "tipoPrdDescripcion")]
        public string tipoPrdDescripcion { get; set; }

        [DataMember(Name = "campaniaCodigo")]
        public string campaniaCodigo { get; set; }

        [DataMember(Name = "campaniaDescripcion")]
        public string campaniaDescripcion { get; set; }

        [DataMember(Name = "coId")]
        public string coId { get; set; }

        [DataMember(Name = "tipoOpeCodigo")]
        public string tipoOpeCodigo { get; set; }

        [DataMember(Name = "tipoOpeDescripcion")]
        public string tipoOpeDescripcion { get; set; }

        [DataMember(Name = "estado")]
        public string estado { get; set; }

        [DataMember(Name = "usuarioCrea")]
        public string usuarioCrea { get; set; }

        [DataMember(Name = "fechaCrea")]
        public string fechaCrea { get; set; }

        [DataMember(Name = "usuarioModifica")]
        public string usuarioModifica { get; set; }

        [DataMember(Name = "fechaModifica")]
        public string fechaModifica { get; set; }
    }
}