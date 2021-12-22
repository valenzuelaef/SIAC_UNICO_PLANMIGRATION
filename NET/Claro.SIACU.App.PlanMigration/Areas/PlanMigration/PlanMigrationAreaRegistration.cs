using System.Web.Mvc;
using System.Web.Optimization;

namespace Claro.SIACU.App.PlanMigration.Areas.PlanMigration
{
    public class PlanMigrationAreaRegistration : AreaRegistration 
    {
        public override string AreaName 
        {
            get 
            {
                return "PlanMigration";
            }
        }

        public override void RegisterArea(AreaRegistrationContext context) 
        {
            context.MapRoute(
                "PlanMigration_default",
                "PlanMigration/{controller}/{action}/{id}",
                new { action = "Index", id = UrlParameter.Optional }
            );

            RegisterBundles(BundleTable.Bundles);
        }

        private void RegisterBundles(BundleCollection bundles)
        {
            Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Utils.BundleConfig.RegisterBundles(BundleTable.Bundles);
        }
    }
}