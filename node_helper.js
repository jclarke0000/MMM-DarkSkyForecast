/*********************************

  Node Helper for MMM-DarkSkyForecast.

  This helper is responsible for the DarkSky-compatible data pull from OpenWeather.
  At a minimum the API key, Latitude and Longitude parameters
  must be provided.  If any of these are missing, the request
  to OpenWeather will not be executed, and instead an error
  will be output the the MagicMirror log.

  Additional, this module supplies two optional parameters:

    units - one of "metric", "imperial", or "" (blank)
    lang - Any of the languages OpenWeather supports, as listed here: https://openweathermap.org/api/one-call-api#multi

  The DarkSky-compatible API request looks like this:

    https://api.openweathermap.org/data/2.5/onecall?lat=LATITUDE&lon=LONGITUDE&units=XXX&lang=YY&appid=API_KEY

*********************************/

var NodeHelper = require("node_helper");
var request = require("request");
var moment = require("moment");

module.exports = NodeHelper.create({

  start: function() {
    console.log("====================== Starting node_helper for module [" + this.name + "]");
  },

  socketNotificationReceived: function(notification, payload){
    if (notification === "OPENWEATHER_ONE_CALL_FORECAST_GET") {

      var self = this;

      if (payload.apikey == null || payload.apikey == "") {
        console.log( "[MMM-DarkSkyForecast] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** No API key configured. Get an API key at https://openweathermap.org/api/one-call-api" );
      } else if (payload.latitude == null || payload.latitude == "" || payload.longitude == null || payload.longitude == "") {
        console.log( "[MMM-DarkSkyForecast] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** Latitude and/or longitude not provided." );
      } else {

        //make request to OpenWeather onecall API
        var url = "https://api.openweathermap.org/data/2.5/onecall" +
          "?appid=" + payload.apikey +
          "&lat=" + payload.latitude +
          "&lon=" + payload.longitude +
          (payload.units !== "" ? "&units=" + payload.units : "") +
          "&lang=" + payload.language;
          // "&exclude=minutely"

        // console.log("[MMM-DarkSkyForecast] Getting data: " + url);
        request({url: url, method: "GET"}, function( error, response, body) {

          if(!error && response.statusCode == 200) {

            //Good response
            var resp = JSON.parse(body);
            resp.instanceId = payload.instanceId;
            self.sendSocketNotification("OPENWEATHER_ONE_CALL_FORECAST_DATA", resp);

          } else {
            console.log( "[MMM-DarkSkyForecast] " + moment().format("D-MMM-YY HH:mm") + " ** ERROR ** " + error );
          }

        });

      }
    }
  },


});
