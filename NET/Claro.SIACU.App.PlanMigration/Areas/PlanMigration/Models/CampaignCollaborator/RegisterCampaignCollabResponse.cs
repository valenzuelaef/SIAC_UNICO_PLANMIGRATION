using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Runtime.Serialization;

namespace Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.CampaignCollaborator
{
    public class RegisterCampaignCollabResponse
    {
        [DataMember(Name = "MessageResponse")]
        public RegisterCampaignMessageResponse MessageResponse { get; set; }
    }

    [DataContract(Name = "MessageResponse")]
    public class RegisterCampaignMessageResponse
    {
        [DataMember(Name = "Header")]
        public DataPower.HeaderRes Header { get; set; }
        [DataMember(Name = "Body")]
        public RegisterCampaignBodyResponse Body { get; set; }
    }

    [DataContract(Name = "Body")]
    public class RegisterCampaignBodyResponse
    {
        [DataMember(Name = "registrarCampaniaResponse")]
        public RegisterCampaignResponse registrarCampaniaResponse { get; set; }
    }

    [DataContract(Name = "registrarCampaniaResponse")]
    public class RegisterCampaignResponse
    {
        [DataMember(Name = "auditResponse")]
        public RegisterCampaignAuditResponse auditResponse { get; set; }
    }

    [DataContract(Name = "auditResponse")]
    public class RegisterCampaignAuditResponse
    {
        [DataMember(Name = "idTransaccion")]
        public string idTransaccion { get; set; }

        [DataMember(Name = "codigoRespuesta")]
        public string codigoRespuesta { get; set; }

        [DataMember(Name = "mensajeRespuesta")]
        public string mensajeRespuesta { get; set; }
    }
}