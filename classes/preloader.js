define([
    "jquery",
    "lodash",
    "collections/children",
    "collections/metrics",
    "collections/clients",
    "collections/markets",
    "util/appstate",
    "util/atp",
    "helper/datascreen/datascreen/atpfs",
    "helper/datascreen/datascreen/fs"
], function ($, _, ChildrenCollection, MetricsCollection, AdvertisersCollection, MarketsCollection, AppState, ATP, AtpFs, Fs) {
    //
    "use strict";
    /*
    *
    *
    **/
    var Preloader = function () {
        //
        this.runningProcs = 0;

        AtpFs.fsInitJournal();

        AtpFs.fsUpdateFromTimeout();
    };

    Preloader.prototype.onReady = function (advertiser, callback, callbackScope) {
        //
        AtpFs.fsReadGenCollectionsAvailable(advertiser, callback, callbackScope);
    };

    Preloader.prototype.preloadChildren = function (advertiser) {
        //
        this.metadataTypePreload(advertiser, "children", AtpFs.hasChildren(advertiser), "setChildren", ChildrenCollection);
        
        return this;
    };

    Preloader.prototype.preloadUMetrics = function (advertiser) {

        this.metadataTypePreload(advertiser, "umetrics", AtpFs.hasUMetrics(advertiser), "setUMetrics", MetricsCollection);
    
        return this;
    };

    Preloader.prototype.done = function (callback, callbackScope) {
        //
        var chkInt = setInterval(_.bind(function () {

            if (this.runningProcs === 0) {
                
                clearInterval(chkInt);

                callback.call(callbackScope);
            }
        }, this), 200);

        return this;
    };

    Preloader.prototype.preloadAdvertisers = function (callback, callbackScope) {

        var self = this,
            advertisers =null;// AppState.getState("api", "advertisers");

        if (!advertisers || advertisers === null || !advertisers.length) {

            // get advertisers from api back end
            var advertisersCollection = new AdvertisersCollection();

            advertisersCollection.addParam("sid", AppState.getState("api", "sid"));

            advertisersCollection.fetch({
                error: function (data, response, options) {
                    
                    if (response.status === 401) {
                        ATP.Event.trigger("app:logout");
                    }
                },
                success: function (data) {

                    advertisers = [];

                    advertisersCollection.each(function (advertiserModel) {
                        //
                        advertisers.push({
                            id : advertiserModel.get("advertiserID"),
                            name : advertiserModel.get("advertiserName"),
                            logo : advertiserModel.get("logo")
                        });
                    });

                    AppState.setState("api", "advertisers", advertisers);

                    self.prepareAvertisersFolders(advertisers, callback, callbackScope);
                }
            });

        } else {
            self.prepareAvertisersFolders(advertisers, callback, callbackScope);
        }
    };

    Preloader.prototype.prepareAvertisersFolders = function (advertisers, cb, cbScope) {
        //
        var fsParsedAdvertisers = 0,
            useChromeFS = AtpFs.hasChromeFS();
                    
        _.each(advertisers, _.bind(function (advertiser, i) {

            if (useChromeFS) {

                Fs.hasDirectory("/" + advertiser.id, "no", function () {
                    //
                    fsParsedAdvertisers++;
                    Fs.createDirectory("/" + advertiser.id);
                }, Fs);
            } else {
                //
                fsParsedAdvertisers++;
            }
            
        }, this));

        _.each(advertisers, _.bind(function (advertiser, i) {

            Fs.hasDirectory("/" + advertiser.id, "yes", function () {
                fsParsedAdvertisers++;
            }, this);
        }, this));
        
        var intCheck = setInterval(_.bind(function () {
            //
            if (fsParsedAdvertisers === advertisers.length) {

                cb.call(cbScope, advertisers);
                clearInterval(intCheck);
            }
        }, this), 500);
    };

    Preloader.prototype.preloadMarkets = function (advertiser, onMarketLoaded) {
        //
        ATP.ilog("M - Preloader :: preloadMarkets - for adv " + advertiser)

        var markets;
        
        if (AppState.hasStateMarkets(advertiser)) {
            //
            markets = AppState.getStateMarkets(advertiser);

            this.prepareAppForAdvertiserMarkets(advertiser, markets, onMarketLoaded);
        } else {

            markets = new MarketsCollection();

            markets.addParam("sid", AppState.getState("api", "sid"));
            markets.addParam("advertiser", advertiser);

            markets.fetch({
                error : function (data, response, options) {
                    //
                    var strResponseStatus;

                    strResponseStatus = response.status + "";

                    if (strResponseStatus === "401") {

                        ATP.Event.trigger("app:logout");
                    } else if (strResponseStatus === "404") {
                        
                        require(["views/widget/notification"], function (NotifyHelper) {
                            var notify = new NotifyHelper({
                                type : "error",
                                msg : "Sorry, advertiser data not found"
                            });

                            notify.render().show(true);
                        });
                    }
                },
                success : _.bind(function (data) {
                    //
                    //AppState.setState("api", "markets", markets.toJSON());
                    AppState.setStateMarkets(advertiser, markets.toJSON());
                    //
                    this.prepareAppForAdvertiserMarkets(advertiser, markets.toJSON(), onMarketLoaded);
                }, this)
            });    
        }
        
    };

    Preloader.prototype.prepareAppForAdvertiserMarkets = function (advertiser, markets, onMarketLoaded, callback, callbackScope, onPrepareError) {
        //
        var fsParsedMarkets = 0,
            mlen,
            useChromeFS = AtpFs.hasChromeFS();

        if (!advertiser) {
            advertiser = AppState.getState("api", "advertiser");
        }
        
        if (!markets) {
            //
            var marketIDstr;

            marketIDstr = AtpFs.buildmarketStr(AppState.getState("api", "market"));

            markets = [{
                Market_ID : marketIDstr
            }];
        }

        mlen = markets.length;

        _.each(markets, _.bind(function (market, i) {

            if (useChromeFS) {

                Fs.hasDirectory("/" + advertiser + "/" + market.Market_ID, "no", function () {
                    
                        Fs.createDirectory("/" + advertiser, function () {
                            
                            if (market.Market_ID) {
                            
                                Fs.createDirectory("/" + advertiser + "/" + market.Market_ID, function () {
                                    fsParsedMarkets++;
                                    return false;
                                });
                            }
                        });
                    
                    }, Fs);
                    //
                Fs.hasDirectory("/" + advertiser + "/" + market.Market_ID, "yes", function () {

                    fsParsedMarkets++;
                }, this);
            } else {

                fsParsedMarkets++;
            }
        }, this));

        var chkLimit = ATP.MAX_INT_CHECK,
            chkCurrent = 0,
            intCheck = setInterval(_.bind(function () {

                chkCurrent++;

                if (chkCurrent > chkLimit) {
                    //
                    clearInterval(intCheck);
                    //
                    onPrepareError.call(callbackScope);
                }

                if (fsParsedMarkets === mlen) {
                    //
                    clearInterval(intCheck);
                    //
                    onMarketLoaded.call();
                }

            }, this), 500);

        markets = null;
    };

    Preloader.prototype.metadataTypePreload = function (advertiser, metaType, hasFsRawMeta, fsRawSetMetaFunction, MetaCollection) {
        //
        //
        var useChromeFS;

        if (advertiser === null) {
            //
            return this;
        }

        useChromeFS = AtpFs.hasChromeFS();

        this.runningProcs++;

        if (hasFsRawMeta) {
            
            // kill this process and let the preloader / caller continue bootstrap
            this.runningProcs--;

        } else if (useChromeFS && AtpFs.fsHasGenCollectionAvailable(metaType, advertiser)) {

            AtpFs.fsGetGenCollection("/" + advertiser + "/" + metaType, function (result) {

                AtpFs[fsRawSetMetaFunction](advertiser, result);
                
                this.runningProcs--;
            }, this);

        } else {

            var metaCollection = new MetaCollection();

            metaCollection.addParam("advertiser", advertiser);
            metaCollection.addParam("sid", AppState.getState("api", "sid"));
            metaCollection.setFetchType("TYPEPOST");

            metaCollection.fetch({
                type: "POST",
                data : metaCollection.getParamsString(),
                error: _.bind(function (data, response, options) {

                    this.runningProcs--;

                    if (response.status === 401) {
                        ATP.Event.trigger("app:logout");
                    }
                }, this),
                success : _.bind(function (data) {
                        //
                        if (data.at(0).get("result") === false) {
                            this.runningProcs--;
                            return false;
                        }

                        if (useChromeFS) {
                            //
                            AtpFs.fsAddGenCollection("/" + advertiser + "/" + metaType, metaCollection);
                            //
                            AtpFs.fsAddJournalEntry(metaType, false, advertiser);
                        }

                        AtpFs[fsRawSetMetaFunction](advertiser, metaCollection.toJSON()[0]);

                        this.runningProcs--;
                    }, this)
            });
        }
    }

    return Preloader;
});
