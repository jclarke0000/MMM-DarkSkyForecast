/*********************************

  Magic Mirror Module:
  MMM-DarkSkyForecast
  https://github.com/jclarke0000/MMM-DarkSkyForecast

  Icons in use by this module:

  Skycons - Animated icon set by Dark Sky
  http://darkskyapp.github.io/skycons/
  (using the fork created by Maxime Warner
  that allows individual details of the icons
  to be coloured
  https://github.com/maxdow/skycons)

  Climacons by Adam Whitcroft
  http://adamwhitcroft.com/climacons/

  Free Weather Icons by Svilen Petrov
  https://www.behance.net/gallery/12410195/Free-Weather-Icons

  Weather Icons by Thom
  (Designed for DuckDuckGo)
  https://dribbble.com/shots/1832162-Weather-Icons

  Sets 4 and 5 were found on Graphberry, but I couldn't find
  the original artists.
  https://www.graphberry.com/item/weather-icons
  https://www.graphberry.com/item/weathera-weather-forecast-icons

  Some of the icons were modified to better work with the module's
  structure and aesthetic.

  Weather data provided by Dark Sky

  By Jeff Clarke
  MIT Licensed

*********************************/

Module.register("MMM-DarkSkyForecast", {

  /*
    This module uses the Nunjucks templating system introduced in
    version 2.2.0 of MagicMirror.  If you're seeing nothing on your
    display where you expect this module to appear, make sure your
    MagicMirror version is at least 2.2.0.
  */
  requiresVersion: "2.2.0",

  defaults: {
    apikey: "",
    latitude: "",
    longitude: "",
    updateInterval: 10, // minutes
    requestDelay: 0,
    units: config.units,
    showCurrentConditions: true,
    showExtraCurrentConditions: true,
    showSummary: true,
    forecastHeaderText: "",
    showForecastTableColumnHeaderIcons: true,
    showHourlyForecast: true,
    hourlyForecastInterval: 3,
    maxHourliesToShow: 3,
    showDailyForecast: true,
    maxDailiesToShow: 3,
    showPrecipitation: true,
    concise: true,
    showWind: true,
    language: config.language,
    iconset: "1c",
    useAnimatedIcons: true,
    animateMainIconOnly: true,
    colored: true,
    forecastLayout: "tiled",
    showInlineIcons: true,
    mainIconSize: 100,
    forecastTiledIconSize: 70,
    forecastTableIconSize: 30,
    updateFadeSpeed: 500,
    label_maximum: "max",
    label_high: "H",
    label_low: "L",
    label_timeFormat: "h a",
    label_days: ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"],
    label_ordinals: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"],
    moduleTimestampIdPrefix: "OPENWEATHER_ONE_CALL_TIMESTAMP_"
  },

  validUnits: ["imperial", "metric", ""],
  validLayouts: ["tiled", "table"],

  getScripts: function() {
    return ["moment.js", this.file("skycons.js")];
  },

  getStyles: function () {
    return ["MMM-DarkSkyForecast.css"];
  },

  getTemplate: function () {
    return "mmm-darksky-forecast.njk";
  },

  /*
    Data object provided to the Nunjucks template. The template does not
    do any data minipulation; the strings provided here are displayed as-is.
    The only logic in the template are conditional blocks that determine if
    a certain section should be displayed, and simple loops for the hourly
    and daily forecast.
   */
  getTemplateData: function () {
    return {
      phrases: {
        loading: this.translate("LOADING")
      },
      loading: this.formattedWeatherData == null ? true : false,
      config: this.config,
      forecast: this.formattedWeatherData,
      inlineIcons : {
        rain: this.generateIconSrc("i-rain"),
        wind: this.generateIconSrc("i-wind")
      },
      animatedIconSizes : {
        main: this.config.mainIconSize,
        forecast: this.config.forecastLayout == "tiled" ? this.config.forecastTiledIconSize : this.config.forecastTableIconSize
      },
      moduleTimestampIdPrefix: this.config.moduleTimestampIdPrefix,
      identifier: this.identifier,
      timeStamp: this.dataRefreshTimeStamp
    };
  },

  start: function() {

    Log.info("Starting module: " + this.name);

    this.weatherData = null;
    this.iconIdCounter = 0;
    this.formattedWeatherData = null;
    this.animatedIconDrawTimer = null;

    /*
      Optionally, Dark Sky's Skycons animated icon
      set can be used.  If so, it is drawn to the DOM
      and animated on demand as opposed to being
      contained in animated images such as GIFs or SVGs.
      This initializes the colours for the icons to use.
     */
    if (this.config.useAnimatedIcons) {
      this.skycons = new Skycons({
        "monochrome": false,
        "colors" : {
          "main" : "#FFFFFF",
          "moon" : this.config.colored ? "#FFFDC2" : "#FFFFFF",
          "fog" : "#FFFFFF",
          "fogbank" : "#FFFFFF",
          "cloud" : this.config.colored ? "#BEBEBE" : "#999999",
          "snow" : "#FFFFFF",
          "leaf" : this.config.colored ? "#98D24D" : "#FFFFFF",
          "rain" : this.config.colored ? "#7CD5FF" : "#FFFFFF",
          "sun" : this.config.colored ? "#FFD550" : "#FFFFFF"
        }
      });
    }

    //sanitize optional parameters
    if (this.validUnits.indexOf(this.config.units) == -1) {
      this.config.units = "imperial";
    }
    if (this.validLayouts.indexOf(this.config.forecastLayout) == -1) {
      this.config.forecastLayout = "tiled";
    }
    if (this.iconsets[this.config.iconset] == null) {
      this.config.iconset = "1c";
    }
    this.sanitizeNumbers([
      "updateInterval",
      "requestDelay",
      "hourlyForecastInterval",
      "maxHourliesToShow",
      "maxDailiesToShow",
      "mainIconSize",
      "forecastIconSize",
      "updateFadeSpeed",
      "animatedIconPlayDelay"
    ]);

    //force icon set to mono version whern config.coloured = false
    if (this.config.colored == false) {
      this.config.iconset = this.config.iconset.replace("c","m");
    }

    //start data poll
    var self = this;
    setTimeout(function() {

      //first data pull is delayed by config
      self.getData();

      setInterval(function() {
        self.getData();
      }, self.config.updateInterval * 60 * 1000); //convert to milliseconds

    }, this.config.requestDelay);
  },

  getData: function() {
    this.sendSocketNotification("OPENWEATHER_ONE_CALL_FORECAST_GET", {
      apikey: this.config.apikey,
      latitude: this.config.latitude,
      longitude: this.config.longitude,
      units: this.config.units,
      language: this.config.language,
      instanceId: this.identifier,
      requestDelay: this.config.requestDelay
    });

  },

  socketNotificationReceived: function(notification, payload) {

    if (notification === "OPENWEATHER_ONE_CALL_FORECAST_DATA" && payload.instanceId === this.identifier) {

      //clear animated icon cache
      if (this.config.useAnimatedIcons) {
        this.clearIcons();
      }

      //process weather data
      this.dataRefreshTimeStamp = moment().format("x");
      this.weatherData = payload;
      this.formattedWeatherData = this.processWeatherData();

      this.updateDom(this.config.updateFadeSpeed);

      //broadcast weather update
      this.sendNotification("OPENWEATHER_ONE_CALL_FORECAST_WEATHER_UPDATE", payload);

      /*
        Start icon playback. We need to wait until the DOM update
        is complete before drawing and starting the icons.

        The DOM object has a timestamp embedded that we will look
        for.  If the timestamp can be found then the DOM has been
        fully updated.
      */
      if (this.config.useAnimatedIcons) {
        var self = this;
        this.animatedIconDrawTimer = setInterval(function() {
          var elToTest = document.getElementById(self.config.moduleTimestampIdPrefix + self.identifier);
          if (elToTest != null && elToTest.getAttribute("data-timestamp") == self.dataRefreshTimeStamp) {
            clearInterval(self.animatedIconDrawTimer);
            self.playIcons(self);
          }
        }, 100);
      }

    }


  },

  /*
    This prepares the data to be used by the Nunjucks template.  The template does not do any logic other
    if statements to determine if a certain section should be displayed, and a simple loop to go through
    the houly / daily forecast items.
  */
  processWeatherData: function() {

    var summary;
    if (this.config.concise) {
      summary = this.weatherData.hourly ? this.weatherData.hourly[0].weather[0].description : this.weatherData.current.weather[0].description;
    } else {
      summary = (this.weatherData.current.weather[0].description + ".") + " " +
        (this.weatherData.hourly ? this.weatherData.hourly[0].weather[0].description + " " : "") +
        (this.weatherData.daily ? this.weatherData.daily[0].weather[0].description : "");
    }

    var hourlies = [];
    if (this.config.showHourlyForecast) {

      var displayCounter = 0;
      var currentIndex = this.config.hourlyForecastInterval;
      while (displayCounter < this.config.maxHourliesToShow) {
        if (this.weatherData.hourly[currentIndex] == null) {
          break;
        }

        hourlies.push(this.forecastItemFactory(this.weatherData.hourly[currentIndex], "hourly"));

        currentIndex += this.config.hourlyForecastInterval;
        displayCounter++;

      }

    }

    var dailies = [];
    if (this.config.showDailyForecast) {

      for (var i = 1; i <= this.config.maxDailiesToShow; i++) {
        if (this.weatherData.daily[i] == null) {
          break;
        }

        dailies.push(this.forecastItemFactory(this.weatherData.daily[i], "daily"));
      }

    }


    return {
      "currently" : {
        temperature: Math.round(this.weatherData.current.temp) + "°",
        animatedIconId: this.config.useAnimatedIcons ? this.getAnimatedIconId() : null,
        animatedIconName: this.convertOpenWeatherIdToIcon(this.weatherData.current.weather[0].id, this.weatherData.current.weather[0].icon),
        iconPath: this.generateIconSrc(this.convertOpenWeatherIdToIcon(this.weatherData.current.weather[0].id, this.weatherData.current.weather[0].icon)),
        tempRange: this.formatHiLowTemperature(this.weatherData.daily[0].temp.max, this.weatherData.daily[0].temp.min),
        precipitation: this.formatPrecipitation(this.weatherData.current.rain, this.weatherData.current.snow),
        wind: this.formatWind(this.weatherData.current.wind_speed, this.weatherData.current.wind_deg, this.weatherData.current.wind_gust),

      },
      "summary" : summary,
      "hourly" : hourlies,
      "daily" : dailies,
    };
  },


  /*
    Hourly and Daily forecast items are very similar.  So one routine builds the data
    objects for both.
   */
  forecastItemFactory: function(fData, type) {

    var fItem = new Object();

    // --------- Date / Time Display ---------
    if (type == "daily") {

      //day name (e.g.: "MON")
      fItem.day = this.config.label_days[moment(fData.dt * 1000).format("d")];

    } else { //hourly

      //time (e.g.: "5 PM")
      fItem.time = moment(fData.dt * 1000).format(this.config.label_timeFormat);
    }

    // --------- Icon ---------
    if (this.config.useAnimatedIcons && !this.config.animateMainIconOnly) {
      fItem.animatedIconId = this.getAnimatedIconId();
      fItem.animatedIconName = this.convertOpenWeatherIdToIcon(fData.weather[0].id, fData.weather[0].icon);
    }
    fItem.iconPath = this.generateIconSrc(this.convertOpenWeatherIdToIcon(fData.weather[0].id, fData.weather[0].icon));

    // --------- Temperature ---------

    if (type == "hourly") { //just display projected temperature for that hour
      fItem.temperature = Math.round(fData.temp) + "°";
    } else { //display High / Low temperatures
      fItem.tempRange = this.formatHiLowTemperature(fData.temp.max, fData.temp.min);
    }

    // --------- Precipitation ---------
    fItem.precipitation = this.formatPrecipitation(fData.rain, fData.snow);

    // --------- Wind ---------
    fItem.wind = (this.formatWind(fData.wind_speed, fData.wind_deg, fData.wind_gust));

    return fItem;
  },

  /*
    Returns a formatted data object for High / Low temperature range
   */
  formatHiLowTemperature: function(h,l) {
    return {
      high: (!this.config.concise ? this.config.label_high + " " : "") + Math.round(h) + "°",
      low: (!this.config.concise ? this.config.label_low + " " : "") + Math.round(l) + "°"
    };
  },

  /*
    Returns a formatted data object for precipitation
   */
  formatPrecipitation: function(rainAccumulation, snowAccumulation) {

    var accumulation = null;

    //accumulation
    if (snowAccumulation) {
      if (typeof snowAccumulation === "number") {
        accumulation = Math.round(snowAccumulation) + " " + this.getUnit("accumulationSnow");
      } else if (typeof snowAccumulation === "object" && snowAccumulation["1h"]) {
        accumulation = Math.round(snowAccumulation["1h"]) + " " + this.getUnit("accumulationSnow");
      }
    } else if (rainAccumulation) {
      if (typeof rainAccumulation === "number") {
        accumulation = Math.round(rainAccumulation) + " " + this.getUnit("accumulationRain");
      } else if (typeof rainAccumulation === "object" && rainAccumulation["1h"]) {
        accumulation = Math.round(rainAccumulation["1h"]) + " " + this.getUnit("accumulationRain");
      }
    }

    return {
      accumulation: accumulation
    };

  },

  /*
    Returns a formatted data object for wind conditions
   */
  formatWind: function(speed, bearing, gust) {

    //wind gust
    var windGust = null;
    if (!this.config.concise && gust) {
      windGust = " (" + this.config.label_maximum + " " + Math.round(gust) + " " + this.getUnit("windSpeed") + ")";
    }

    return {
      windSpeed: Math.round(speed) + " " + this.getUnit("windSpeed") + (!this.config.concise ? " " + this.getOrdinal(bearing) : ""),
      windGust: windGust
    };
  },

  /*
    Returns the units in use for the data pull from OpenWeather
   */
  getUnit: function(metric) {
    return this.units[metric][this.config.units];
  },

  /*
    Formats the wind direction into common ordinals (e.g.: NE, WSW, etc.)
    Wind direction is provided in degress from North in the data feed.
   */
  getOrdinal: function(bearing) {
    return this.config.label_ordinals[Math.round(bearing * 16 / 360) % 16];
  },

  /*
    Some display items need the unit beside them.  This returns the correct
    unit for the given metric based on the unit set in use.
   */
  units: {
    accumulationRain: {
      imperial: "mm",
      metric: "mm",
      "": "mm"
    },
    accumulationSnow: {
      imperial: "mm",
      metric: "mm",
      "": "mm"
    },
    windSpeed: {
      imperial: "mph",
      metric: "m/s",
      "": "m/s"
    }
  },

  /*
    Icon sets can be added here.  The path is relative to
    MagicMirror/modules/MMM-DarkSky/icons, and the format
    is specified here so that you can use icons in any format
    that works for you.

    Dark Sky currently specifies one of ten icons for weather
    conditions:

      clear-day
      clear-night
      cloudy
      fog
      partly-cloudy-day
      partly-cloudy-night
      rain
      sleet
      snow
      wind

    All of the icon sets below support these ten plus an
    additional three in anticipation of Dark Sky enabling
    a few more:

      hail,
      thunderstorm,
      tornado

    Lastly, the icons also contain two icons for use as inline
    indicators beside precipitation and wind conditions. These
    ones look best if designed to a 24px X 24px artboard.

      i-rain
      i-wind

   */
  iconsets: {
    "1m": {path:"1m", format:"svg"},
    "1c": {path:"1c", format:"svg"},
    "2m": {path:"2m", format:"svg"},
    "2c": {path:"2c", format:"svg"},
    "3m": {path:"3m", format:"svg"},
    "3c": {path:"3c", format:"svg"},
    "4m": {path:"4m", format:"svg"},
    "4c": {path:"4c", format:"svg"},
    "5m": {path:"5m", format:"svg"},
    "5c": {path:"5c", format:"svg"},
  },

  /*
    This converts OpenWeather icon names to DarkSky icon names
  */
  convertOpenWeatherIdToIcon: function(id, openweather_icon) {
    if (id >= 200 && id < 300) {
      // Thunderstorm
      return "thunderstorm";
    } else if (id >= 300 && id < 400) {
      // Drizzle
      return "rain";
    } else if (id === 511) {
      // Rain - freezing rain
      return "sleet";
    } else if (id >= 500 && id < 600) {
      // Rain
      return "rain";
    } else if (id >= 610 && id < 620) {
      // Snow - sleet or with rain
      return "sleet";
    } else if (id >= 600 && id < 700) {
      // Snow
      return "snow";
    } else if (id === 781) {
      // Atmosphere - tornado
      return "tornado";
    } else if (id >= 700 && id < 800) {
      // Atmosphere
      return "fog";
    } else if (id >= 800 && id < 810) {
      var isDay = openweather_icon.slice(-1) === "d";

      if (id === 800) {
        // Clear
        if (isDay) {
          return "clear-day";
        } else {
          return "clear-night";
        }
      } else if (id === 801 || id == 802) {
        // Clouds - few or scattered
        if (isDay) {
          return "partly-cloudy-day";
        } else {
          return "partly-cloudy-night";
        }
      } else if (id === 803 || id === 804) {
        // Clouds - broken or overcast
        return "cloudy";
      }
    }
  },

  /*
    This generates a URL to the icon file
   */
  generateIconSrc: function(icon) {
    return this.file("icons/" + this.iconsets[this.config.iconset].path + "/" +
        icon + "." + this.iconsets[this.config.iconset].format);

  },

  /*
    When the Skycons animated set is in use, the icons need
    to be rebuilt with each data refresh.  This traverses the
    DOM to find all of the current animated icon canvas elements
    and removes them by id from the skycons object.
   */
  clearIcons: function() {
    this.skycons.pause();
    var self = this;
    var animatedIconCanvases = document.querySelectorAll(".skycon-" + this.identifier);
    animatedIconCanvases.forEach(function(icon) {
      self.skycons.remove(icon.id);
    });
    this.iconIdCounter = 0;
  },

  /*
    When the Skycons animated set is in use, the icons need
    to be rebuilt with each data refresh.  This returns a
    unique id that will be assigned the icon's canvas element.
   */
  getAnimatedIconId: function() {

    //id to use for the canvas element
    var iconId = "skycon_" + this.identifier + "_" + this.iconIdCounter;
    this.iconIdCounter++;
    return iconId;
  },

  /*
    For use with the Skycons animated icon set. Once the
    DOM is updated, the icons are built and set to animate.
    Name is a bit misleading. We needed to wait until
    the canvas elements got added to the DOM, which doesn't
    happen until after updateDom() finishes executing
    before actually drawing the icons.

    This routine traverses the DOM for all canavas elements
    prepared for an animated icon, and adds the icon to the
    skycons object.  Then the icons are played.
  */
  playIcons: function(inst) {
    var animatedIconCanvases = document.querySelectorAll(".skycon-" + inst.identifier);
    animatedIconCanvases.forEach(function(icon) {
      inst.skycons.add(icon.id, icon.getAttribute("data-animated-icon-name"));
    });
    inst.skycons.play();
  },

  /*
    For any config parameters that are expected as integers, this
    routine ensures they are numbers, and if they cannot be
    converted to integers, then the module defaults are used.
   */
  sanitizeNumbers: function(keys) {
    var self = this;
    keys.forEach(function(key) {
      if (isNaN(parseInt(self.config[key]))) {
        self.config[key] = self.defaults[key];
      } else {
        self.config[key] = parseInt(self.config[key]);
      }
    });
  }
});
