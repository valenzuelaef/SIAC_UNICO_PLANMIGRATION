using System.Web.Optimization;

namespace Claro.SIACU.App.PlanMigration.Areas.PlanMigration.Utils
{
    public static class BundleConfig
    {
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new StyleBundle("~/Content/PlanMigration/bootstrap-css").Include(
             "~/Content/css/fonts.css",
             "~/Content/css/bootstrap.css",
             "~/Content/css/bootstrap-theme.css",
             "~/Content/css/bootstrap-multiselect-v2.css",
             "~/Content/css/bootstrap-select.css",
             "~/Content/css/dataTables.bootstrap.min.css",
             "~/Content/css/jquery.dataTables.select.css",
             "~/Content/css/datepicker.css"));

            bundles.Add(new StyleBundle("~/bundles/PlanMigration/claro-fw-css").Include(
                "~/Content/css/claro-fw.css"));

            bundles.Add(new ScriptBundle("~/bundles/PlanMigration/jquery").Include(
                "~/Content/Lib/jquery-2.0.0.js",
                "~/Content/Lib/jquery-ui.js"));

            bundles.Add(new ScriptBundle("~/bundles/PlanMigration/bootstrap").Include(
                "~/Content/Lib/bootstrap.js"));

            bundles.Add(new ScriptBundle("~/bundles/PlanMigration/jquery-addon-siacu").Include(
                "~/Content/Lib/jquery.dataTables.min.js",
                "~/Content/Lib/jquery.dataTables.select.js",
                "~/Content/Lib/jquery.blockUI.js",
                "~/Content/Lib/jquery.numeric.js",
                "~/Content/Lib/dataTables.bootstrap.min.js",
                "~/Content/Lib/bootstrap-multiselect-v2.js",
                "~/Content/Lib/bootstrap-datepicker.js",
                "~/Content/Lib/moment.js",
                "~/Content/Lib/moment-es.js",
                "~/Content/Lib/process-steps.js"
            ));
            
            bundles.Add(new ScriptBundle("~/bundles/PlanMigration/Claro-siacu")            
                .Include("~/Content/Scripts/polyfill.js",
                         "~/Content/Scripts/ReingApp.js"));

            bundles.Add(new ScriptBundle("~/bundles/PlanMigration/Script")
             .Include("~/Areas/PlanMigration/Scripts/PlanMigration.js"));

            bundles.Add(new ScriptBundle("~/bundles/PlanMigration/Redirect")
            .Include("~/Areas/PlanMigration/Scripts/Bridge.js"));

            bundles.Add(new ScriptBundle("~/bundles/Content/Lib/BloqueoF12")
                .Include("~/Content/Lib/BloqueoF12.js"));

            BundleTable.EnableOptimizations = true;
        }
    }
}