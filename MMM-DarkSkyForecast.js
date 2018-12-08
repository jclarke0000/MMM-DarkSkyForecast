Module.register("MMM-DarkSkyForecast", {

  defaults: {
    apikey: "",
    latitude: "",
    longitude: "",
    updateInterval: 10, // minutes
    requestDelay: 0,
    units: "ca",
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
    forecastIconSize: 70,
    updateFadeSpeed: 500,
    label_maximum: "max",
    label_high: "H",
    label_low: "L",
    label_timeFormat: "h a",
    label_days: ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"],
    label_ordinals: ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"],
  },

  getScripts: function() {
    return ["moment.js", this.file("skycons.js")];
  },

  getStyles: function () {
    return ["MMM-DarkSkyForecast.css"];
  },

  getTemplate: function () {
    return "mmm-darksky-forecast.njk"
  },

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
        forecast: this.config.forecastIconSize
      }

    }
  },

  validUnits: ["ca","si","uk2","us"],
  validLayouts: ["tiled", "table"],

  start: function() {

    Log.info("Starting module: " + this.name);

    this.weatherData = null;
    this.iconCache = [];
    this.iconIdCounter = 0;
    this.formattedWeatherData = null;

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
      this.config.units = "ca";
    } 
    if (this.validLayouts.indexOf(this.config.forecastLayout) == -1) {
      this.config.forecastLayout = "tiled";
    } 
    if (this.iconsets[this.config.iconset] == null) {
      this.config.iconset = "1c";
    } 

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
    this.sendSocketNotification("DARK_SKY_FORECAST_GET", {
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

    if (notification == "DARK_SKY_FORECAST_DATA" && payload.instanceId == this.identifier) {

      //clear animated icon cache
      if (this.config.useAnimatedIcons) {
        this.clearIcons();
      }

      //process weather data
      this.weatherData = payload;
      this.formattedWeatherData = this.processWeatherData();

      this.updateDom(this.config.updateFadeSpeed);

      //broadcast weather update
      this.sendNotification("DARK_SKY_FORECAST_WEATHER_UPDATE", payload);

      //start icon playback
      if (this.config.useAnimatedIcons) {
        var self = this;
        setTimeout(function() {
          self.playIcons(self);
        }, this.config.updateFadeSpeed);
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
      summary = this.weatherData.hourly ? this.weatherData.hourly.summary : this.weatherData.currently.summary;
    } else {
      summary = (this.weatherData.minutely ? this.weatherData.minutely.summary : this.weatherData.currently.summary + ".") + " " +
        (this.weatherData.hourly ? this.weatherData.hourly.summary + " " : "") +
        (this.weatherData.daily ? this.weatherData.daily.summary : "");
    }

    var hourlies = [];
    if (this.config.showHourlyForecast) {

      var displayCounter = 0;
      var currentIndex = this.config.hourlyForecastInterval;
      while (displayCounter < this.config.maxHourliesToShow) {
        if (this.weatherData.hourly.data[currentIndex] == null) {
          break;
        }

        hourlies.push(this.forecastItemFactory(this.weatherData.hourly.data[currentIndex], "hourly"));

        currentIndex += this.config.hourlyForecastInterval;
        displayCounter++;

      }

    }

    var dailies = [];
    if (this.config.showDailyForecast) {

      for (var i = 1; i <= this.config.maxDailiesToShow; i++) {
        if (this.weatherData.daily.data[i] == null) {
          break;
        }

        dailies.push(this.forecastItemFactory(this.weatherData.daily.data[i], "daily"));
      }

    }


    return {
      "currently" : {
        temperature: Math.round(this.weatherData.currently.temperature) + "°",
        animatedIconId: this.config.useAnimatedIcons ? this.addIcon(this.weatherData.currently.icon) : null,
        iconPath: this.generateIconSrc(this.weatherData.currently.icon),
        tempRange: this.formatHiLowTemperature(this.weatherData.daily.data[0].temperatureMax,this.weatherData.daily.data[0].temperatureMin),
        precipitation: this.formatPrecipitation(this.weatherData.currently.precipProbability, this.weatherData.currently.precipAccumulation, this.weatherData.currently.precipIntensityMax, this.weatherData.currently.precipIntensity),
        wind: this.formatWind(this.weatherData.currently.windSpeed, this.weatherData.currently.windBearing, this.weatherData.currently.windGust),

      },
      "summary" : summary,
      "hourly" : hourlies,
      "daily" : dailies,
    };
  },  


  forecastItemFactory: function(fData, type) {

    var fItem = new Object();

    // --------- Date / Time Display ---------
    if (type == "daily") {

      //day name (e.g.: "MON")
      fItem.day = this.config.label_days[moment(fData.time * 1000).format("d")];

    } else { //hourly

      //time (e.g.: "5 PM")
      fItem.time = moment(fData.time * 1000).format(this.config.label_timeFormat);
    }

    // --------- Icon ---------
    if (this.config.useAnimatedIcons && !this.config.animateMainIconOnly) {
      fItem.animatedIconId = this.addIcon(fData.icon, this.config.forecastIconSize);
    }
    fItem.iconPath = this.generateIconSrc(fData.icon);

    // --------- Temperature ---------

    if (type == "hourly") { //just display projected temperature for that hour
      fItem.temperature = Math.round(fData.temperature) + "°";
    } else { //display High / Low temperatures
      fItem.tempRange = this.formatHiLowTemperature(fData.temperatureMax,fData.temperatureMin);
    }

    // --------- Precipitation ---------
    fItem.precipitation = this.formatPrecipitation(fData.precipProbability,fData.precipAccumulation,fData.precipIntensityMax,fData.precipIntensity);

    // --------- Wind ---------
    fItem.wind = (this.formatWind(fData.windSpeed, fData.windBearing, fData.windGust));

    return fItem;
  },

  formatHiLowTemperature: function(h,l) {
    return {
      high: (!this.config.concise ? this.config.label_high + " " : "") + Math.round(h) + "°",
      low: (!this.config.concise ? this.config.label_low + " " : "") + Math.round(l) + "°"
    };
  },

  formatPrecipitation: function(percentChance, snowAccumulation, rainIntensityMax, rainIntensity) {

    var accumulation = null;

    //accumulation
    if (!this.config.concise && percentChance > 0) {
      if (snowAccumulation) { //snow
        accumulation = Math.round(snowAccumulation) + " " + this.getUnit("accumulationSnow");
      } else if (rainIntensityMax){ //max rate for the day
        accumulation = (Math.round(rainIntensityMax * 10) / 10) + " " + this.getUnit("accumulationRain");
      } else { //rate for the hour
        accumulation = (Math.round(rainIntensity * 10) / 10) + " " + this.getUnit("accumulationRain");
      }
      accumulation = "(" + accumulation + ")";
    }

    return {
      pop: Math.round(percentChance * 100) + "%",
      accumulation: accumulation
    };

  },

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

  getUnit: function(metric) {
    return this.units[metric][this.weatherData.flags.units];
  },

  getOrdinal: function(bearing) {
    return this.config.label_ordinals[Math.round(bearing * 16 / 360) % 16];
  },

  units: {
    accumulationRain: {
      si: "mm",
      ca: "mm",
      uk2: "mm",
      us: "in"
    },
    accumulationSnow: {
      si: "cm",
      ca: "cm",
      uk2: "cm",
      us: "in"
    },
    windSpeed: {
      si: "m/s",
      ca: "km/h",
      uk2: "mph",
      us: "mph"
    }
  },

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

  generateIconSrc: function(icon) {
    return this.file("icons/" + this.iconsets[this.config.iconset].path + "/" +
        icon + "." + this.iconsets[this.config.iconset].format);

  },

  clearIcons: function() {
    this.skycons.pause();
    var self = this;
    this.iconCache.forEach(function(icon) {
      self.skycons.remove(icon.id);
    });
    this.iconCache = [];
    this.iconIdCounter = 0;
  },

  addIcon: function(icon) {

    //id to use for the canvas element
    var iconId = "skycon_" + this.iconCache.length;

    //add id and icon name to cache
    this.iconCache.push({
      "id" : iconId,
      "icon" : icon
    });

    console.log(this.iconCache.length + " icons");
    return iconId;
  },

  playIcons: function(inst) {
    /*
      name is a bit misleading. We needed to wait until
      the canvas elements got added to the Dom, which doesn't
      happen until after updateDom() finishes executing.
    */
    console.log("playing " + inst.iconCache.length + " icons.")
    inst.iconCache.forEach(function(icon) {
      inst.skycons.add(icon.id, icon.icon);
    });
    inst.skycons.play();

  }




});
