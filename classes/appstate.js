define([
    "util/atp",
    "jquery",
    "jqcookie"
], function (ATP, $) {

    "use strict";
    //
    var instance = null,
        storageEngine,
        atpVersion = window.atp_v_cb;

    function AppState() {
        //
        if (instance !== null) {
            throw new Error("Cannot instantiate more than one ATP object");
        }

        if (localStorage === null) {

            storageEngine = {
                storage : {},
                getItem : function (item) {
                    //
                    return this.storage[item];
                },
                setItem: function (item, value) {
                    //
                    this.storage[item] = value;
                }
            };
        } else {
            storageEngine = localStorage;
        }

        this.initialize();
    }

    AppState.prototype.initialize = function () {
        
        this.allStatesSetup();

        this.state = this.retrieve();

        if (!this.state) {
            this.forgetAll();
        } else {
            // delete state markets, force fetch once
            // to avoid new clients being skipped from cache
            this.state.api.markets = {};
        }
    };
    
    AppState.prototype.dumpstate = function () {
        //
        return this.state;
    };

    AppState.prototype.allStatesSetup = function () {
        //
        this.allStates = {
            atp: null,
            aa : {
                agg : {
                    separate : false,
                    concatenate : false,
                    index : 0
                },
                api : {
                    markets : {},
                    market : null,
                    advertisers : null,
                    advertiser : null,
                    sid : null
                },
                metrics : {
                    orderType : null,
                    model : null,
                    currchart : null
                },
                daterange : {
                    from : null,
                    to : null,
                    label : null,
                    armonth : null
                },
                screenvar : {
                    reportname : null
                }
            },
            at : {
                agg : {
                    separate : false,
                    concatenate : false,
                    index : 0
                },
                api : {
                    markets : {},
                    market : null,
                    advertisers : null,
                    advertiser : null,
                    sid : null
                },
                metrics : {
                    orderType : null,
                    model : null,
                    currchart : null
                },
                daterange : {
                    from : null,
                    to : null,
                    label : null,
                    armonth : null
                },
                screenvar : {
                    reportname : null
                }
            }
        };
    };

    AppState.prototype.forgetAll = function () {
        //
        this.allStatesSetup();

        this.state = this.allStates[ATP.App.appname];
        
        this.store();
    };

    AppState.prototype.checkVersion = function () {
        //
        if (storageEngine.getItem("atpv") !== atpVersion) {
            //
            this.forgetAll();
        }
    };

    AppState.prototype.setState = function (area, item, val) {
        //
        if (!this.state.hasOwnProperty(area)) {
            //
            this.state[area] = {};
        }

        this.state[area][item] = val;

        this.store();

        return val;
    };

    AppState.prototype.setStateMarkets = function (advertiser, val) {
        //
        if (!this.state.hasOwnProperty("api")) {
            //
            this.state.api = {};
            this.state.api.markets = {};

        }
        if (this.state.api.markets === null) {
            this.state.api.markets = {};
        }

        this.state.api.markets[advertiser] = val;

        this.store();

        return val;
    };

    AppState.prototype.getStateMarkets = function (advertiser) {
        //
        return this.state.api.markets[advertiser];
    };

    AppState.prototype.hasStateMarkets = function (advertiser) {
        //
        return this.state.api.markets[advertiser] && this.state.api.markets[advertiser] !== null  ;
    };


    AppState.prototype.setStateArea = function (area, obj) {
        //
        this.state[area] = obj;

        this.store();

        return obj;
    };

    AppState.prototype.getState = function (area, item) {
        //
        this.retrieve();

        if (!this.state.hasOwnProperty(area)) {
            //
            return null;
        }

        return item ? this.state[area][item] : this.state[area];
    };

    AppState.prototype.store = function () {
        //
        this.allStates[ATP.App.appname] = this.state;

        storageEngine.setItem("appstate", JSON.stringify(this.allStates));

        storageEngine.setItem("atpv", atpVersion);
    };

    AppState.prototype.retrieve = function () {
        //
        var appstate = $.parseJSON(storageEngine.getItem("appstate"));

        if (appstate) {

            return appstate[ATP.App.appname];
        }

        return false;
    };

    AppState.prototype.cookieToState = function (area, item) {
        //
        this.setState(area, item, $.cookie(item));
    };

    AppState.prototype.hasCookie = function (item) {
        //
        return $.cookie()[item] || undefined;
        //return $.cookie(item) || undefined;
    };
    //
    AppState.getInstance = function () {

        if (instance === null) {
            instance = new AppState();
        }

        return instance;
    };

    return AppState.getInstance();
});