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

        console.log(moment().format("h:mm") +  " DarkSky URL = " + url);

        request({url: url, methid: "GET"}, function( error, response, body) {

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