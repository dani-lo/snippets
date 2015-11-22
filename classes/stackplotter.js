define([
    "jquery",
    "lodash",
    "backbone",
    "util/atp",
    "views/helper/graphing/svg/chart/plotter"
], function ($, _, Backbone, ATP, Plotter) {

    "use strict";

    var SvgStackPlotter = Plotter.extend({
        
        plot: function (newdata) {
            this.prepare(newdata).render();

            return this;
        },

        prepare : function (newdata) {
            
            var usedata, forcedomain;

            if (newdata) {

                forcedomain = true;
                usedata = newdata;
            } else {
                //
                if (this.removedItemsKeys.length > 0) {
                    //
                    forcedomain = true;
                    usedata = this.refine();
                } else {
                    //
                    forcedomain = false;
                    usedata = this.locdata;
                }
            }

            this.stack.offset("zero");
                        
            this.stack(usedata);

            this.t = this.setRequests();

            if (forcedomain) {
                //
                this.forceDomainMax(d3.max(usedata[0].values.map(function (d) {
                    return d.count0 + d.count + (d.count / 5);
                })));

            } else {
                //
                this.setDomainMax(d3.max(usedata[0].values.map(function (d) {
                    return d.count0 + d.count + (d.count / 5);
                })));
            }
                       
            this.y.domain([this.getDomainMin(), this.getDomainMax()]).range([this.plotheight, 0]);

            this.area.y0(_.bind(function (d) {
                    //console.log(d)
                        return this.y(d.count0);
                    }, this))
                     .y1(_.bind(function (d) {
                        return this.y(d.count0 + d.count);
                    }, this));

            return this;
        },

        render : function () {
            
            var path = this.t.select("path.area")[0];

            this.t.select("path.area")
                .style("fill-opacity", 1.0)
                .attr("d", _.bind(function (d) {
                    return this.area(d.values);
                }, this));

            if (this.postrender) {
                this.postrender();
            }

            return this;
        }
    });

    return SvgStackPlotter;
});