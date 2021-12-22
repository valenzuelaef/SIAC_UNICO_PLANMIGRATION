using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.CampaignCollaborator
{
    public class RegisterCampaignCollabRequest : Tools.Entity.Request
    {
        [DataMember(Name = "MessageRequest")]
        public RegisterCampaignMessageRequest MessageRequest { get; set; }
    }

    [DataContract(Name = "MessageRequest")]
    public class RegisterCampaignMessageRequest
    {
        [DataMember(Name = "Header")]
        public DataPower.HeaderReq Header { get; set; }
        [DataMember(Name = "Body")]
        public RegisterCampaignBodyRequest Body { get; set; }
    }

    [DataContract(Name = "Body")]
    public class RegisterCampaignBodyRequest
    {
        [DataMember(Name = "registrarCampaniaRequest")]
        public RegisterCampaignRequest registrarCampaniaRequest { get; set; }
    }


    [DataContract(Name = "registrarCampaniaRequest")]
    public class RegisterCampaignRequest
    {
        [DataMember(Name = "auditRequest")]
        public RegisterCampaignAuditRequest auditRequest { get; set; }

        [DataMember(Name = "registrarCampania")]
        public RegisterCampaign registrarCampania { get; set; }
    }

    [DataContract(Name = "auditRequest")]
    public class RegisterCampaignAuditRequest
    {
        [DataMember(Name = "idTransaccion")]
        public string idTransaccion { get; set; }

        [DataMember(Name = "ipAplicacion")]
        public string ipAplicacion { get; set; }

        [DataMember(Name = "nombreAplicacion")]
        public string nombreAplicacion { get; set; }

        [DataMember(Name = "usuarioAplicacion")]
        public string usuarioAplicacion { get; set; }
    }

    [DataContract(Name = "registrarCampania")]
    public class RegisterCampaign
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

        [DataMember(Name = "nroPedDet")]
        public string nroPedDet { get; set; }

        [DataMember(Name = "nroCont")]
        public string nroCont { get; set; }

        [DataMember(Name = "nroContDet")]
        public string nroContDet { get; set; }

        [DataMember(Name = "tmCode")]
        public string tmCode { get; set; }

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

        [DataMember(Name = "fechaActivacion")]
        public string fechaActivacion { get; set; }
    }
}