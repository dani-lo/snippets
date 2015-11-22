define([
    "jquery",
    "lodash",
    "backbone",
    "util/atp",
    "text!templates/header/partials/menu-item.html",
    "text!templates/header/partials/dropdown-simple.html",
    "text!templates/header/partials/dropdown-date.html",
    "text!templates/header/partials/dropdown-multi.html",
], function ($, _, Backbone, ATP, MenuDropdownItemPartialTemplate, MenuDropdownSimpleTemplate, MenuDropdownDateTemplate, MenuDropdownMultiTemplate) {

    "use strict";
    
    var SelectorView = Backbone.View.extend({

        el: null,

        initialize: function (options) {

            this.type = options.type;

            this.jsonData = options.jsonData || null;

            this.listID = options.listID;

            this.titleDefault = options.titleDefault || null;

            this.handler = options.handler || null;

            this.onItemSelect = options.onItemSelect || undefined;
        },

        setType : function (type) {

            this.type = type;

            switch (this.type) {

                case "simple" :
                    //
                    this.template = MenuDropdownSimpleTemplate;
                    break;

                case "date" :
                    //
                    this.template = MenuDropdownDateTemplate;
                    break;

                case "multi" :
                    //
                    this.template = MenuDropdownMultiTemplate;
                    break;
            }

            return this;
        },

        setData : function (jsonData) {
            //
            this.jsonData = jsonData;

            return this;
        },
        /*
        *
        *
        */
        render: function () {

            var htmlList = "";
            
            _.each(this.jsonData, function (datarow) {
                //
                htmlList += _.template(MenuDropdownItemPartialTemplate, datarow);
            });

            this.$el.html(_.template(this.template, {
                titleDefault : this.titleDefault,
                htmlList : htmlList,
                listID : this.listID
            }));

            this.bindings();
        },
        /*
        *
        *
        */
        syncSelectorToAppstate : function (label) {
            //
            if (label) {

                if (label.search(/\d+/) !== -1) {
                    //
                    label = "Specify Date Range";
                }

                $("#timefilterdropdownexport ul#app-menu-daterange-export li a").each(function () {
                    
                    $(this).removeClass("current");

                    if ($(this).html() === label) {
                        $(this).addClass("current");
                    }
                });
            }
        },
        /*
        *
        *
        */
        setHandler : function (callback, scope, args) {
            //
            this.handler = {
                callback : callback,
                scope : scope
            };

            return this;
        },
        /*
        *
        *
        */
        bindings: function () {

            this.$el.find(".nav__sublist a").off().on("click",
                _.bind(this.onActionItem, this)
            );

            this.$el.find(".dropdownmenu-multi-choose").off().on("click",
                _.bind(this.onActionMultiItem, this)
            );

            this.$el.find(".nav__sublist input").off().on("click",
                _.bind(this.onMultiInputClick, this)
            );

            ATP.Event.on("option:autoselect", _.bind(this.setCurrent, this));
        },

        onActionItem: function (e) {

            e.preventDefault();

            if (this.type === "multi") {
                
                this.onMultiInputClick(e);
            } else {

                var $el = $(e.currentTarget);
                var chosenText = $el.text();

                this.highlightItem(e);
                this.handler.callback.call(this.handler.scope, $el);

                if (chosenText.indexOf("ignore-label") === -1 && chosenText.indexOf("Specify Date Range") === -1) {
                    this.setTitle(chosenText);
                }
            }
        },

        onMultiInputClick: function (e, el) {
            // Once a change has been made we can activate the button
            $(e.currentTarget).closest(".nav-sublist-container").find("button").removeClass("disabled");

            var $input, $el;

            if (el) {// this is only invoked via setCUrrent, only used to check
                    // (the uncheck will be exeuted post, in refreshMulti method)
                $el = el;
                $input = $el.parent().find("input.multiselect-check");

                $el.addClass("current");
                $input.attr("checked", "checked");
                
                $el.addClass("multi-refresh");

            } else if ($(e.currentTarget).hasClass("multiselect-check")) {

                $input = $(e.currentTarget);
                $el = $input.parent().find("a");

                $el.toggleClass("current");

                return true;
            } else {

                $el = $(e.currentTarget);

                $input = $el.parent().find("input.multiselect-check");

                if ($input.is(":checked")) {
                    
                    var checkedInputs = $el.parent().parent().find(".current").length;
                    
                    if (checkedInputs > 1) {
                        // only uncheck if this is not the last checked one ..
                        $el.removeClass("current");
                        $input.removeAttr("checked");
                    }
                    
                } else {
                    $el.addClass("current");
                    $input.attr("checked", "checked");
                }

                return false;
            }
        },

        onActionMultiItem: function (e) {

            var $active = this.$el.find("a.current"),
                usetarget = "",
                useval = "",
                usename,
                $el;

            $active.each(function (i) {

                $el = $(this);

                if (usetarget === "") {

                    usetarget = $el.data("target");
                }
                if (!usename) {

                    usename = $el.data("name") || $el.html();
                }

                useval += $el.data("type");

                if (i < ($active.length - 1)) {
                    useval +=  ",";
                }
            });

            if (useval.indexOf(",") === -1) {
                this.setTitle(usename);
            } else {
                this.setTitle("Multiple");
            }

            $(".dropdownmenu-multi-choose").addClass("disabled");

            this.handler.callback.call(this.handler.scope, usetarget, useval);
        },

        highlightItem: function (e) {

            var $el;

            if (typeof(e) === "number") {
                $el = $(this.$el.find("a.filter")[e]);
            } else {
                $el = $(e.currentTarget);
            }

            if (this.type === "multi") {

                this.onMultiInputClick(null, $el);
            } else {
                
                this.$el.find(".current").removeClass("current");
                $el.addClass("current");
            }
        },

        setCurrent: function (options) {

            var listid = options.target,
                currVal = options.value || undefined,
                custDaterange = options.custDaterange || undefined;

            if (listid.replace(/\s/gi, "") === this.listID.replace(/\s/gi, "")) {
                //
                if (custDaterange) {
                    //
                    this.$(".date-filter").removeClass("current");
                    this.$(".date-filter[data-range='manual']").addClass("current");
                    this.setTitle(custDaterange);
                } else {
                    //
                    _.each(this.jsonData, _.bind(function (row, i) {
                        _.each(row.dataAttrs, _.bind(function (arrAttributes) {
                            //
                            if (currVal && currVal === arrAttributes[1]) {
                                this.highlightItem(i);
                                this.setTitle(row.text);
                            }
                        }, this));
                    }, this));

                    if (this.type === "multi") {
                        //
                        this.refreshMulti();
                    }
                }
            }
        },

        refreshMulti: function () {

            var $targets = this.$el.find("a.filter"),
                numActive = 0,
                self = this;

            $targets.each(function () {

                if (!$(this).hasClass("multi-refresh") && $(this).hasClass("current")) {

                    var $input = $(this).parent().find("input");
                    $(this).removeClass("current");
                    $input.removeAttr("checked");
                }
                
                $(this).removeClass("multi-refresh");

                if ($(this).hasClass("current")) {
                    numActive++;
                }

                if (numActive > 1) {
                    //
                    self.setTitle("Multi");
                }
            });
        },
        /*
        *
        *
        */
        setTitle: function (text) {
            this.$el.find("span.title").html(text);
        },

        destroy: function () {
            this.$el.html("");
        }
    });

    return SelectorView;
});
