define([
    "jquery",
    "lodash",
    "backbone",
    "util/atp",
    "helper/dataformatter"
], function ($, _, Backbone, ATP, DataFormatter) {

    "use strict";
        
    var Tooltip = Backbone.View.extend({

        el: null,

        initialize: function (options) {

            this.dataformatter = new DataFormatter({
                prefixunits : true
            });
            
            this.to = null;
            
            this.$tooltip = options.$tooltip;
            
            this.charttype = options.charttype;
            
            this.skipFormat = options.skipFormat || false;
        },

        render: function () {

            var tooltipID;

            switch (ATP.PlotTarget) {

                case ".series-std":
                    tooltipID = "tooltip-std-" + ATP.CurrChartType;
                    break;

                case ".series-drilldown":
                    tooltipID = "tooltip-drilldown-" + ATP.CurrChartType;
                    break;
            }

            this.$tooltip.attr("id", tooltipID);

            return this;
        },

        update: function (name, val, date) {
            
            if (this.to) {
                clearTimeout(this.to);
            }

            this.$tooltip.find(".cluster-title").html(name);
            this.$tooltip.find(".cluster-date").html(date);
             
            if (this.skipFormat === false) {
                this.$tooltip.find(".cluster-val").html(this.dataformatter.formatVal(val));
            } else {
                this.$tooltip.find(".cluster-val").html(val);
            }

            return this;
        },

        skipFormat : function () {
            this.skipFormat = true;
        },

        show: function () {

            if ($(ATP.PlotTarget).find(".gtooltip").length) {
                
                this.$tooltip = $(ATP.PlotTarget).find(".gtooltip");
            } else {
                
                this.$tooltip = $(".gtooltip");
            }

            this.$tooltip.show();
        },

        hide: function () {
            
            this.$tooltip.hide();
        }
    });

    return Tooltip;
});