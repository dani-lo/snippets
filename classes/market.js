define([
	"collections/markets",
    "views/widget/selector",
    "util/appstate",
    "util/atp"
], function (MarketsCollection, SelectorView, AppState, ATP) {

	"use strict";

	var MarketSelectorView = SelectorView.extend({
        
		initialize : function (options) {
			//
			var	marketsJsonColl,
				advertiser = AppState.getState("api", "advertiser"),
				markets = AppState.getStateMarkets(advertiser),
				usedMarkets = AppState.getState("api", "market");
			
			if (usedMarkets === null) {
				usedMarkets = "";
			}

			MarketSelectorView.__super__.initialize.apply(this, arguments);

			this.setType("multi");

			this.setData();

			if (!markets || (markets && !markets.length)) {

				var marketsColl = new MarketsCollection();

				marketsColl.addParam("sid", AppState.getState("api", "sid"));
				marketsColl.addParam("advertiser", advertiser);

				marketsColl.setFetchType("TYPEPOST");
				//console.log("OK then fetch ...")
				marketsColl.fetch({
					type: "POST",
					data: marketsColl.getParamsString(),

					error : function (data, response, options) {
						//
						if (response.status === 401) {
							ATP.Event.trigger("app:logout");
						}
					},
					success : _.bind(function (data) {
						//console.log("successss")
						marketsJsonColl = _.sortBy(marketsColl.toJSON(), function (marketItem) {
							return marketItem.Market_Name;
						});
						//console.log(marketsJsonColl)
						this.prepareForRender(marketsJsonColl, usedMarkets);
					}, this)
				});
			} else {
				//
				marketsJsonColl = _.sortBy(markets, function (marketItem) {
					return marketItem.Market_Name;
				});

				this.prepareForRender(marketsJsonColl, usedMarkets);
			}
        },
        //
        prepareForRender: function (marketsJsonCollection, usedMarkets) {
			//
			var marketDropdownData = [],
				nameDefault,
				isSelected,
				allSelected = 0;

			_.each(marketsJsonCollection, _.bind(function (market, i) {
				//
				if (usedMarkets === "") {
					isSelected = i === 0;
				} else {
					isSelected = usedMarkets.indexOf(market.Market_ID) !== -1;
				}

				if (isSelected) {
					allSelected++;
				}
				//
				if (market.allowed === 1) {

					marketDropdownData.push({
						dataAttrs : [["type", market.Market_ID], ["name", market.Market_Name], ["target", "market"]],
						isdefault : isSelected,
						text : market.Market_Name,
						classname : "market-select-" + market.Market_ID
					});
					
					if (isSelected) {
						nameDefault = market.Market_Name;
					}
				}
			}, this));

			if (!nameDefault) {
				nameDefault = "Market";
			}

			this.titleDefault = nameDefault;

			if (marketDropdownData.length) {

				if (allSelected > 1) {
					//
					this.titleDefault = "Multiple";
				} else if (allSelected === 1) {
					//
					//this.titleDefault = this.$el.find(".m-checked").parent().find("a").html();
				}

				this.setData(marketDropdownData)
					.render();

				if (marketDropdownData.length > 10) {
					this.$el.find(".nav__sublist").height(300);
					this.cscrollBar();
				}
				
			}
        },
        /**
        *
        * Re-applies the custom scrollbar UI
        *
        */
        cscrollBar : function () {
          // 
            var $navInnerContainer = this.$el.find(".nav__sublist");
            
            $navInnerContainer.mCustomScrollbar({
                autoDraggerLength: false,
                advanced: {updateOnContentResize: true}
            });
        },

        refreshSelected : function () {
			//
            var title = "",
				advertiser = AppState.getState("api", "advertiser"),
				markets = AppState.getStateMarkets(advertiser),
				usedMarkets = AppState.getState("api", "market");

			this.$el.find("input").removeClass("m-checked").attr("checked", false);
			this.$el.find("a.filter").removeClass("current");

			_.each(markets, _.bind(function (market) {
				//
				if (usedMarkets.indexOf(market.Market_ID) !== -1) {
					//
					this.$el.find("a.market-select-" + market.Market_ID)
						.addClass("current")
						.parent()
						.find("input")
						.attr("checked", true)
						.addClass("m-checked");

					if (title === "") {

						title = market.Market_Name;
					} else {
						title = "Multiple";
					}
				}
				
			}, this));

			this.setTitle(title);
        }
    });
	//
    return MarketSelectorView;
});
