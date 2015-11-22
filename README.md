# JS snippets

### About
This repo contains a few classes and underscore template files, as an example set taken from a large data dashboard javascript application.
The app deals with large volumes of data and employs several strategies for user data management and metadata cross referencing.
Followin a brief walk through detailing the purpose of some of the classes and examples of how they are used within the app
### /helper/datascreen/datascreen/fs.js
* The Fs class is a singleton class which provides a set of methods to access a low level api which gives access to Chrome-only permanent storage feature (set in this case at 1GB on the host machine)
* Other classes (one in particular meant as a data hub) can use the methods from the Fs class to store, retrieve, or delete data
* Examples of usage follow
* 1 Include

    	require([
      		"helper/datascreen/datascreen/fs",
    	], function (Fs) {
    
* 2 Use
    
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