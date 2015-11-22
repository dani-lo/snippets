define([
    "lodash"
], function (_) {

    "use strict";

    var instance = null;

    function errorHandler(e) {

        var msg = "Unknown Error";

        return msg;
    }
 
    function Fs() {
        //
        if (instance !== null) {

            throw new Error("Cannot instantiate more than one Fs");
        }
        
        this.initialize();
    }
    /**
    *
    *
    */
    Fs.prototype = {
        /**
        *
        *
        */
        initialize : function () {
            //
            this.fs = null;

            this.requestFs();
        },
        /**
        *
        *
        */
        readFile : function (filepath, callback, callbackScope, onReadFileError) {

            if (!onReadFileError) {
                onReadFileError = errorHandler;
            }
            if (this.fs !== null) {

                this.fs.root.getFile(filepath, {}, function (fileEntry) {

                    // Get a File object representing the file,
                    // then use FileReader to read its contents.
                    fileEntry.file(function (file) {

                        var reader = new FileReader();

                        reader.onloadend = function (e) {
                            //
                            callback.call(callbackScope, this.result);
                        };
                        //
                        reader.readAsText(file);
                    }, errorHandler);

                }, onReadFileError);
            }
        },
        /**
        *
        *
        */
        writeFile : function (filepath, filecontents, callback, callbackScope) {
            //
            if (this.fs !== null) {
                
                this.fs.root.getFile(filepath, {create: true}, function (fileEntry) {

                    // Create a FileWriter object for our FileEntry (log.txt).
                    fileEntry.createWriter(function (fileWriter) {

                        fileWriter.onwriteend = function (e) {

                            if (callback) {
                                callback.call(callbackScope);
                            }
                        };

                        fileWriter.onerror = function (e) {
                            //
                        };

                        var blob = new Blob([filecontents], {type: "text/plain"});

                        fileWriter.write(blob);

                    }, errorHandler);

                }, errorHandler);

            }
        },
        /**
        *
        *
        */
        removeFile : function (filepath, callback, callbackScope) {
            //
            if (this.fs !== null) {

                this.fs.root.getFile(filepath, {create: false}, function (fileEntry) {

                    fileEntry.remove(function () {

                        callback.call(callbackScope);

                    }, errorHandler);

                }, errorHandler);
            }
        },
        /**
        *
        *
        */
        createDirectory : function (dirname, callback, callbackScope) {
            //
            if (this.fs !== null) {

                this.fs.root.getDirectory(dirname, {create: true}, function (dirEntry) {

                    if (callback) {
                        callback.call(callbackScope);
                    }
                }, errorHandler);
            }
        },
        /**
        *
        *
        */
        removeDirectory : function (dirname) {
            //
            if (this.fs !== null) {

                this.fs.root.getDirectory(dirname, {}, function (dirEntry) {

                    dirEntry.remove(function () {
                        //
                    }, function (e) {});

                }, function (e) {});
            }
        },
        /**
        *
        *
        */
        createSubDirectory : function (superdirname, dirname) {
            //

            if (this.fs !== null) {

                this.hasDirectory(superdirname, "no", function () {

                    this.createDirectory(superdirname + "/" + dirname);

                }, this);
            }
        },
        /**
        *
        *
        */
        hasDirectory: function (path, executeIf, callback, callbackScope) {
            //
            if (this.fs !== null) {

                this.fs.root.getDirectory(path, {}, function (dirEntry) {
                    //
                    if (executeIf === "yes") {
                        callback.call(callbackScope);
                    }
                },  function (e) {
                    //
                    if (executeIf === "no") {
                        callback.call(callbackScope);
                    }
                });
            }
        },
        /**
        *
        *
        */
        hasFile: function (path, executeIf, callback, callbackScope) {
            //
            if (this.fs !== null) {

                this.fs.root.getFile(path, {},
                    function (dirEntry) {
                        //
                        if (executeIf === "yes") {
                            callback.call(callbackScope);
                        }
                    },  function (e) {
                        //
                        if (executeIf === "no") {
                            callback.call(callbackScope);
                        }
                    });
            }
        },
        /**
        *
        *
        */
        requestFs : function () {
            //            
            if (window.webkitStorageInfo) {

                window.webkitStorageInfo.requestQuota(window.PERSISTENT, 1024 * 1024 * 1024, _.bind(function (grantedBytes) {
                    //
                    window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, _.bind(this.onRequestFsSuccess, this), this.onRequestFsError);
                }, this), function (e) {

                });
            }
        },
        /**
        *
        *
        */
        readDirectoryFiles : function (dirname, callback, callbackScope, callbackerror) {

            var filesList = [];

            if (this.fs !== null) {

                this.fs.root.getDirectory(dirname, {}, function (dirEntry) {

                    var dirReader = dirEntry.createReader();

                    dirReader.readEntries(function (entries) {

                        for (var i = 0; i < entries.length; i++) {
                            //
                            var entry = entries[i];

                            if (entry.isFile) {
                            //
                                filesList.push(entry.name);
                            }
                        }

                        if (callback) {
                            callback.call(callbackScope, filesList);
                        }

                    }, function (e) {
                        //
                    });
                }, function (e) {
                    //
                    if (callbackerror) {
                        callbackerror.call(callbackScope, filesList);
                    }
                });
            }
        },
        /**
        *
        *
        */
        onRequestFsSuccess : function (fs) {
            //
            this.fs = fs;
        },
        /**
        *
        *
        */
        onRequestFsError : function (e) {
            
            var msg = "Unknown Error";
            /*
            switch (e.code) {

                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = "QUOTA_EXCEEDED_ERR";
                    break;
                case FileError.NOT_FOUND_ERR:
                    msg = "NOT_FOUND_ERR";
                    break;
                case FileError.SECURITY_ERR:
                    msg = "SECURITY_ERR";
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = "INVALID_MODIFICATION_ERR";
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = "INVALID_STATE_ERR";
                    break;
                default:
                    msg = "Unknown Error";
                    break;
            }
            */
            return msg;
        }
    };
    //
    Fs.getInstance = function () {
        // 
        if (instance === null) {
            //
            instance = new Fs();
        }
        //
        return instance;
    };
    //
    return Fs.getInstance();
});