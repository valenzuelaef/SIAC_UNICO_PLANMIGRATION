using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.CampaignCollaborator
{
    public class ConsultCampaignCollabRequest : Tools.Entity.Request
    {
        [DataMember(Name = "MessageRequest")]
        public ConsultCampaignMessageRequest MessageRequest { get; set; }
    }

    [DataContract(Name = "MessageRequest")]
    public class ConsultCampaignMessageRequest
    {
        [DataMember(Name = "Header")]
        public DataPower.HeaderReq Header { get; set; }

        [DataMember(Name = "Body")]
        public ConsultCampaignBodyRequest Body { get; set; }
    }

    [DataContract(Name = "Body")]
    public class ConsultCampaignBodyRequest
    {
        [DataMember(Name = "consultarCampaniaRequest")]
        public ConsultCampaignRequest consultarCampaniaRequest { get; set; }
    }

    [DataContract(Name = "consultarCampaniaRequest")]
    public class ConsultCampaignRequest
    {
        [DataMember(Name = "auditRequest")]
        public ConsultCampaignAuditRequest auditRequest { get; set; }

        [DataMember(Name = "consultaCampania")]
        public ConsultCampaign consultaCampania { get; set; }
    }

    [DataContract(Name = "auditRequest")]
    public class ConsultCampaignAuditRequest
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

    [DataContract(Name = "consultaCampania")]
    public class ConsultCampaign
    {
        [DataMember(Name = "numLinea")]
        public string numLinea { get; set; }

        [DataMember(Name = "tipoDoc")]
        public string tipoDoc { get; set; }

        [DataMember(Name = "nroDoc")]
        public string nroDoc { get; set; }

        [DataMember(Name = "coId")]
        public string coId { get; set; }

        [DataMember(Name = "nroPed")]
        public string nroPed { get; set; }

        [DataMember(Name = "nroPedDet")]
        public string nroPedDet { get; set; }

        [DataMember(Name = "nroCont")]
        public string nroCont { get; set; }

        [DataMember(Name = "nroContDet")]
        public string nroContDet { get; set; }

        [DataMember(Name = "tipoPrdCod")]
        public string tipoPrdCod { get; set; }
    }
}