﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Models.DataPower
{
    [DataContract]
    public class HeaderRes
    {
        [DataMember(Name = "HeaderResponse")]
        public HeaderResponse HeaderResponse { get; set; }
    }
}