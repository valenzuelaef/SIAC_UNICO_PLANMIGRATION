using System.Runtime.Serialization;

namespace Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.Audit
{
    [DataContract(Name = "auditResponse")]
    public class AuditResponse
    {
        [DataMember(Name = "idTransaccion")]
        public string strIDTransaction { get; set; }
        [DataMember(Name = "codigoRespuesta")]
        public string strResponseCode { get; set; }
        [DataMember(Name = "mensajeRespuesta")]
        public string strResponseMsg { get; set; }
    }
}