/*********************************

  Node Helper for MMM-DarkSkyForecast.

  This helper is responsible for the data pull from Dark Sky.
  At a minimum the API key, Latitude and Longitude parameters
  must be provided.  If any of these are missing, the request
  to Dark Sky will not be executed, and instead an error
  will be output the the MagicMirror log.

  Additional, this module supplies two optional parameters:

    units - one of "ca", "uk2", "us", or "si"
    lang - Any of the languages Dark Sky supports, as listed here: https://darksky.net/dev/docs#response-format

  The Dark Sky API request looks like this:

    https://api.darksky.net/forecast/API_KEY/LATITUDE,LONGITUDE?units=XXX&lang=YY

*********************************/

var NodeHelper = require("node_helper");
var request = require("request");
var moment = require("moment");

module.exports = NodeHelper.create({

  start: function() {
    console.log("====================== Starting node_helper for module [" + this.name + "]");
  },

  socketNotificationReceived: function(notification, payload){
    if (notification === "DARK_SKY_FORECAST_GET") {

      var self = this;

      if (payload.apikey == null || payload.apikey == "") {
        console.log( "[MMM-DarkSkyForecast] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** No API key configured. Get an API key at https://darksky.net" );
      } else if (payload.latitude == null || payload.latitude == "" || payload.longitude == null || payload.longitude == "") {
        console.log( "[MMM-DarkSkyForecast] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** Latitude and/or longitude not provided." );
      } else {

        //make request to Dark Sky API
        var url = "https://api.darksky.net/forecast/" +
          payload.apikey + "/" +
          payload.latitude + "," + payload.longitude +
          "?units=" + payload.units +
          "&lang=" + payload.language;
          // "&exclude=minutely"

        // console.log("[MMM-DarkSkyForecast] Getting data: " + url);
        request({url: url, method: "GET"}, function( error, response, body) {

          if(!error && response.statusCode == 200) {

            //Good response
            var resp = JSON.parse(body);
            resp.instanceId = payload.instanceId;
            self.sendSocketNotification("DARK_SKY_FORECAST_DATA", resp);

          } else {
            console.log( "[MMM-DarkSkyForecast] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** " + error );
          }

        });

      }
    }
  },


});