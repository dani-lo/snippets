define(["util/atp"], function (ATP) {
    
    "use strict";
    /*
    *
    *
    **/
    var Dataformatter = function (options) {
        //
        this.prefixunits = options.prefixunits;

        this.options = options;
    };
    /*
    *
    *
    **/
    Dataformatter.prototype.formatVal = function (val) {
      
        var formattedVal = val, units, precision;

        units = this.options.units || ATP.ChartParams.Units;

        precision = this.options.precision || ATP.ChartParams.Precision;

        // cast to num for numeric ops
        formattedVal = parseFloat(formattedVal);

        if (units === "percentage") {

            var precisionval = precision || 2;

            formattedVal = (formattedVal * 100).toFixed(precisionval - 2);
        }
      
        // cast to string for string ops
        formattedVal = formattedVal.toString();

        if (formattedVal && formattedVal.indexOf && precision !== 0 && formattedVal.indexOf(".") !== -1) {
            //
            formattedVal = formattedVal.substring(0, formattedVal.indexOf(".") + (precision + 1));
        }

        if (parseInt(formattedVal) > 999) {
            // add comma for thousands
            formattedVal = formattedVal.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }

        if (this.prefixunits) {
            //
            formattedVal += this.formatUnits();
        }

        return formattedVal;
    };
    /*
    *
    *
    **/
    Dataformatter.prototype.formatUnits = function () {
      
        var formattedUnits, units;

        units = this.options.units || ATP.ChartParams.Units;

        if (units === "none") {

            formattedUnits = "";

        } else if (units === "percentage") {

            formattedUnits = " (%)";
            
        } else if (units === "usd") {

            formattedUnits = " <span class='unit'>USD</span>";
        }
      
        return formattedUnits;
    };

    return Dataformatter;
});