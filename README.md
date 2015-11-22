# JS snippets

### About
This repo contains a few classes and underscore template files, as an example set taken from a large data dashboard javascript application.
The app deals with large volumes of data and employs several strategies for user data management and metadata cross referencing.
Followin a brief walk through detailing the purpose of some of the classes and examples of how they are used within the app
## Javascript Classes
### /helper/datascreen/datascreen/fs.js
* The Fs class is a singleton class which provides a set of methods to access a low level api which gives access to Chrome-only permanent storage feature (set in this case at 1GB on the host machine)
* Other classes (one in particular meant as a data hub) can use the methods from the Fs class to store, retrieve, or delete data
* Examples of usage

    	require([
      		"helper/datascreen/datascreen/fs",
    	], function (Fs) {
    	
    	...
    
    	var journalEntryPath = "/journal/" + advertiser + "." + market + "." + fsFileName + "." + timestamp;

    	Fs.writeFile(journalEntryPath, atpVersion, function () {
      		this.fsJournal.push({
        		name : fsFileName,
        		advertiser : advertiser,
        		market : market,
        		timestamp : timestamp,
        		atpVersion : atpVersion
      		});
    	}, this);
    	
### /helper/bootstrap/preloader.js
* The Preloader class acts as an entry point following user login
* It employs several data managers and fetchers (collections, local storage manager, Chrome fs manager, application state manager) to make sure all the metadata is available for the user (given her login permission details) to start using the application and fetching data
* It is managed itself by the application router, which employs it to aid with establishing if the available stored metadata is enough for the app to work fully, or more needs to be fetched
* It deals with all main app meta types - having a strong coupling to app metadata logic
* Examples of usage
		
		require([
      		"/helper/bootstrap/preloader",
    	], function (Fs) {
    	
    	...
    	
		var preloader = new Preloader();
		
		...
		
		preloader.preloadAdvertisers(function (advertisers) {

			var loadedAdvMarkets = 0;

			_.each(advertisers, function (advertiser) {
				//
				if (AtpFs.hasChromeFS()) {
				
					preloader.onReady(advertiser.id, function () {
						runAdvertiser(advertiser);
					}, self);
						
				} else {
						runAdvertiser(advertiser);
				}

			});
				
		...
		
		preloader.preloadChildren(advertiser.id)
					.preloadUMetrics(advertiser.id)
					.done(function () {
						// now should be ok to build the menu
						// as the models n otypes have been loaded
						// (either from FS or api)
								

						preloader.preloadMarkets(advertiser.id, function () {

							loadedAdvMarkets++;
						});
					}, self);
					
### /util/appstate.js
* Appstate is a simple (but crucial) Singleton class which leverages on the html5 LocalStorage api to provide api metadata information to most parts of the  application
* It knows about how certain meta types need to be managed / formatted too, other then just exposing get and set functionality
* Examples of usage
		
		require([
      		"/util/appstate",
    	], function (AppState) {
    	
    	...
    	
		this.range = AppState.getState("daterange");
		
		...
		
		custDaterange = AppState.getState("daterange").from + " to " + AppState.getState("daterange").to;
		
		...
		
		AppState.setState("metrics", options.target, options.val);

### /views/helper/graphing/svg/chart/areaplotter.js
* The AreaPlotter class extends a base plotting class (with access to several previously instantiated d3 domain / range objects) to provide the functionality required by the last stage of data plotting (setting the  values on the svg dom elements)
* Employs domains logic, redrawing (with animation) logic, and in general is the last assembler within the plotting chain
* Examples of usage
		
		require([
      		"/views/helper/graphing/svg/chart/areaplotter",
    	], function (AppState) {
    	
    	...
    	
		areaplotter = new AreaPlotter({
            options : options,
            locdata : this.data,
            name : "area"
        });
        
        ...
        
        this.graphview.setPlotters({
            area : areaplotter,
            stack : stackplotter,
            stream : streamplotter,
            line: lineplotter,
            highlight : highlightplotter
    	});

### /views/helper/graphing/svg/chart/stackplotter.js
* Same approach as the above class (inherits from same base plotter) - but instead of plotting area charts, it plots stacked charts

### /views/widget/selector/market.js
* The advertiser is a view class. It extends a base Selector class to provide logic specific to outputting a market dropdown selector
* It expects among the rest a handler object with instruction for callbacks to invoke on user selection (built within a parent class with more app logic responsibilities and couplings)
* Examples of usage
		
		require([
      		"/views/widget/selector/market",
    	], function (AppState) {
    	
    	...
    	
		this.marketSelector = new MarketSelectorView({
            listID : "app-menu-markets",
            el : "#marketselectdropdown",
            handler : {
                callback: function (target, val) {
                    AppState.setState("api", "market", val);
                    ATP.Event.trigger("marketSelector:update", {target : target, val : val});
                },
                scope : this
            }
        });
        
### /util/dataformatter
* A simple utility class to format units and values returned in raw format by api calls

### /views/helper/graphing/tooltip.js
* A simple view class used to display data tooltips as the user moves the mouse around different svg plots
## Underscore Templates
* Some of the numerous underscore templates used by the application to display data and information to the user
* filterlist-row.html - markup used by a set of filter classes to present users with a UI to filter down data sets
* menu-item.html - a row within a selector view
* notification.html - modal template with close functionality, to notify users
* paginator.html - base template to paginate large sets of table dat
