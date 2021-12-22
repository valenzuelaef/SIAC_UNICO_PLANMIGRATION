using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.InitialData
{
    [DataContract(Name = "consultamotivo")]
    public class ReasonResponse
    {
        [DataMember(Name = "listaMotivos")]
        public List<Reason> ReasonList { get; set; }
    }

    [DataContract(Name = "listaMotivos")]
    public class Reason
    {
        [DataMember(Name = "codMotivo")]
        public string Id { get; set; }

        [DataMember(Name = "descripcion")]
        public string Desc { get; set; }
    }
}