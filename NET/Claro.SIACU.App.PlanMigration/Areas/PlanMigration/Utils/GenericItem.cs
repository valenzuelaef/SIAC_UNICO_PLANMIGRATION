using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Utils
{
    public class GenericItem
    {
        public GenericItem() { }

        public GenericItem(string vCode, string vDescription)
        {
            Code = vCode;
            Description = vDescription;
        }
        public GenericItem(string vCode, string vCode2, string vDescription)
        {
            Code = vCode;
            Code2 = vCode2;
            Description = vDescription;
        }

        public string Code { get; set; }
        public string Description { get; set; }
        public string Code2 { get; set; }
        public string Code3 { get; set; }
        public string Description2 { get; set; }
        public string Number { get; set; }
        public string State { get; set; }
        public string Date { get; set; }
        public int CodeTypeService { get; set; }
        public string IdMotive { get; set; }
        public string Type { get; set; }
        public string Group { get; set; }
        public string Condition { get; set; }
        public string Estado { get; set; }
    }
}