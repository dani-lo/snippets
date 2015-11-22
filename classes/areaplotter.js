define([
    "jquery",
    "lodash",
    "backbone",
    "util/atp",
    "views/helper/graphing/svg/chart/plotter"
], function ($, _, Backbone, ATP, Plotter) {

    "use strict";

    var SvgAreaPlotter = Plotter.extend({

        plot: function (newdata) {
            
            this.prepare(newdata).render();

            return this;
        },

        prepare : function (newdata) {
            
            var usedata, forcedomain, self;

            self = this;

            if (newdata) {

                forcedomain = true;
                usedata = newdata;
            } else {

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

            usedata = _.sortBy(usedata, function (item) {
                return -item.maxCount;
            });


            this.t = this.setRequests();

            if (!this.plotdomain.useZoom) {
                if (forcedomain) {
                    //
                    this.forceDomainMax(d3.max(usedata.map(function (d) {
                        return d.maxCount + (d.maxCount / 5);
                    })));

                } else {
                    //
                    this.setDomainMax(d3.max(usedata.map(function (d) {
                        return d.maxCount + (d.maxCount / 5);
                    })));
                }

                this.y.domain([0, this.getDomainMax()]).range([this.plotheight, 0]);
            }

            this.area.y0(this.plotheight).y1(_.bind(function (d) {

                return this.y(d.count);
            }, this));

            return this;
        },
        //
        render : function () {

            this.t.selectAll("path.area")
                            .style("fill-opacity", 0.5)
                            .attr("d", _.bind(function (d) {
                                return this.area(d.values);
                            }, this));
            
            if (this.postrender) {
                this.postrender();
            }
            
            return this;
        }
    });

    return SvgAreaPlotter;
});
