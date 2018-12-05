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

  validUnits: ["ca","si","uk2","us"],
  validLayouts: ["tiled", "table"],

  start: function() {

    Log.info("Starting module: " + this.name);

    this.weatherData = null;
    this.iconCache = [];
    this.iconIdCounter = 0;

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


      //render weather data
      this.weatherData = payload;

      if (this.config.useAnimatedIcons) {
        this.clearIcons();
      }
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
    Generate the module display
   */
  getDom: function() {

    var wrapper = document.createElement("div");
    wrapper.className = "wrapper " + this.config.forecastLayout + 
      " icon-set-" + this.config.iconset +
      (this.config.colored ? " colored" : "") +
      (this.config.showInlineIcons ? " inline-icons" : "") +
      (this.config.forecastHeaderText != "" ? " with-forecast-header" : "");
    
    if (this.weatherData == null) {
      var loading = document.createElement("div");
      loading.innerHTML = this.translate("LOADING");
      loading.className = "dimmed light small";
      wrapper.appendChild(loading);
      return wrapper;
    }


    //current conditions
    if (this.config.showCurrentConditions) {

      var currentConditionsWrapper = document.createElement("div");
      currentConditionsWrapper.classList.add("current-conditions-wrapper");

      var currentConditionsIcon;

      if (this.config.useAnimatedIcons) {
        currentConditionsIcon = this.addIcon(this.weatherData.currently.icon, this.config.mainIconSize);
      } else {
        currentConditionsIcon = document.createElement("img");
        currentConditionsIcon.src = this.generateIconSrc(this.weatherData.currently.icon);
      }

      currentConditionsIcon.className = "current icon current";
      currentConditionsWrapper.appendChild(currentConditionsIcon);

      var currentTemp = document.createElement("span");
      currentTemp.className = "current temperature bright large light";
      currentTemp.innerHTML = Math.round(this.weatherData.currently.temperature) + "°";
      currentConditionsWrapper.appendChild(currentTemp);


      wrapper.appendChild(currentConditionsWrapper);
    }

    //extra current conditions
    if (this.config.showExtraCurrentConditions) {
      var extraCurrentConditionsWrapper = document.createElement("div");
      extraCurrentConditionsWrapper.className = "extra-current-conditions-wrapper small bright";

      extraCurrentConditionsWrapper.appendChild(this.formatHiLowTemperature(this.weatherData.daily.data[0].temperatureMax,this.weatherData.daily.data[0].temperatureMin));


      //precipitation
      if (this.config.showPrecipitation) {
        extraCurrentConditionsWrapper.appendChild(this.formatPrecipitation(this.weatherData.currently.precipProbability, this.weatherData.currently.precipAccumulation, this.weatherData.currently.precipIntensityMax, this.weatherData.currently.precipIntensity, this.config.showInlineIcons));
      }

      //wind
      if (this.config.showWind) {        
        extraCurrentConditionsWrapper.appendChild(this.formatWind(this.weatherData.currently.windSpeed, this.weatherData.currently.windBearing, this.weatherData.currently.windGust, this.config.showInlineIcons));
      }

      wrapper.appendChild(extraCurrentConditionsWrapper);

    }

    //summary
    if (this.config.showSummary) {

      var summaryWrapper = document.createElement("div");
      summaryWrapper.className = "summary-wrapper small";

      var summary = document.createElement("div");
      summary.classList.add("summary");

      if (this.config.concise) {
        summary.innerHTML = this.weatherData.hourly ? this.weatherData.hourly.summary : this.weatherData.currently.summary;
      } else {
        summary.innerHTML = (this.weatherData.minutely ? this.weatherData.minutely.summary : this.weatherData.currently.summary + ".") + " " +
          (this.weatherData.hourly ? this.weatherData.hourly.summary + " " : "") +
          (this.weatherData.daily ? this.weatherData.daily.summary : "");
      }

      summaryWrapper.appendChild(summary);

      wrapper.appendChild(summaryWrapper);
    }
    
    //forecastHeaderText
    if (this.config.forecastHeaderText != "" && (this.config.showHourlyForecast || this.config.showDailyForecast)) {
      var forecastHeader = document.createElement("header");
      forecastHeader.className = "module-header forecast-header";
      forecastHeader.innerHTML = this.config.forecastHeaderText;
      wrapper.appendChild(forecastHeader);
    }

    var forecastWrapper;
    if (this.config.showHourlyForecast || this.config.showDailyForecast) {
      forecastWrapper = document.createElement("div");
      forecastWrapper.className = "forecast-container";

      if (this.config.forecastLayout == "table" && this.config.showForecastTableColumnHeaderIcons) {
        var headerRow = document.createElement("div");
        headerRow.className = "header-row";

        var hTime = document.createElement("span");
        hTime.className = "date-time-header";
        hTime.innerHTML = "&nbsp;";
        headerRow.appendChild(hTime);

        var hIcon = document.createElement("span");
        hIcon.innerHTML = "&nbsp;";
        headerRow.appendChild(hIcon);

        var htemp = document.createElement("span");
        htemp.innerHTML = "&nbsp;";
        headerRow.appendChild(htemp);

        if (this.config.showPrecipitation) {
          var hPrecip = document.createElement("span");
          var hdrRainIcon = document.createElement("img");
          hdrRainIcon.className = "inline-icon rain";
          hdrRainIcon.src = this.generateIconSrc("i-rain");
          hPrecip.appendChild(hdrRainIcon);          
          headerRow.appendChild(hPrecip);
        }

        if (this.config.showWind) {
          var hdrWind = document.createElement("span");
          var hdrWindIcon = document.createElement("img");
          hdrWindIcon.className = "inline-icon wind-icon";
          hdrWindIcon.src = this.generateIconSrc("i-wind");
          hdrWind.appendChild(hdrWindIcon);          
          headerRow.appendChild(hdrWind);
        }

        forecastWrapper.appendChild(headerRow);
      } 

    }

    //hourly forecast
    if (this.config.showHourlyForecast) {

      var displayCounter = 0;
      var currentIndex = this.config.hourlyForecastInterval;
      while (displayCounter < this.config.maxHourliesToShow) {
        if (this.weatherData.hourly.data[currentIndex] == null) {
          break;
        }

        forecastWrapper.appendChild(this.forecastItemFactory(this.weatherData.hourly.data[currentIndex], "hourly"));

        currentIndex += this.config.hourlyForecastInterval;
        displayCounter++;

      }

    }

    //daily forecast
    if (this.config.showDailyForecast) {

      for (var i = 1; i <= this.config.maxDailiesToShow; i++) {
        if (this.weatherData.daily.data[i] == null) {
          break;
        }

        forecastWrapper.appendChild(this.forecastItemFactory(this.weatherData.daily.data[i], "daily"));
      }

    }

    if (this.config.showHourlyForecast || this.config.showDailyForecast) {
      wrapper.appendChild(forecastWrapper);
    }

    return wrapper;


  },

  forecastItemFactory: function(fData, type) {

    // console.log("generating " + type + " forecast item");
    var fItem = document.createElement("div");
    fItem.className = "forecast-item " + type;


    // --------- Date / Time Display ---------
    if (type == "daily") {

      //day name (e.g.: "MON")
      var day = document.createElement("span");
      day.className = "day-name bright small";
      day.innerHTML = this.config.label_days[moment(fData.time * 1000).format("d")];
      fItem.appendChild(day);

    } else { //hourly

      //time (e.g.: "5 PM")
      var time = document.createElement("span");
      time.className = "time small bright";
      time.innerHTML = moment(fData.time * 1000).format(this.config.label_timeFormat);
      fItem.appendChild(time);
    }

    // --------- Icon ---------
    var icon;
    if (this.config.useAnimatedIcons && !this.config.animateMainIconOnly) {
      icon = this.addIcon(fData.icon, this.config.forecastIconSize);
    } else {
      icon = document.createElement("img");
      icon.src = this.generateIconSrc(fData.icon);
    }    
    icon.className = "forecast-icon";

    var iconContainer = document.createElement("span");
    iconContainer.className = "forecast-icon-container";
    iconContainer.appendChild(icon);
    fItem.appendChild(iconContainer);


    // --------- Temperature ---------

    if (type == "hourly") { //just display projected temperature for that hour

      var temp = document.createElement("span");
      temp.className = "temperature small";
      temp.innerHTML = Math.round(fData.temperature) + "°";
      fItem.appendChild(temp);

    } else { //display High / Low temperatures

      fItem.appendChild(this.formatHiLowTemperature(fData.temperatureMax,fData.temperatureMin));

    }


    // --------- Precipitation ---------
    if (this.config.showPrecipitation) {
      fItem.appendChild(this.formatPrecipitation(fData.precipProbability,fData.precipAccumulation,fData.precipIntensityMax,fData.precipIntensity));          
    }

    // --------- Wind ---------
    if (this.config.showWind) {
      fItem.appendChild(this.formatWind(fData.windSpeed, fData.windBearing, fData.windGust));
    }

    return fItem;
  },

  formatHiLowTemperature: function(h,l) {

    var tempContainer = document.createElement("span");
    tempContainer.className = "temperature-container small";

    //high temperature
    var hiTemp = document.createElement("span");
    hiTemp.className = "high-temperature";
    hiTemp.innerHTML = (!this.config.concise ? this.config.label_high + " " : "") + Math.round(h) + "°";
    tempContainer.appendChild(hiTemp);

    //separator
    var tempSeparator = document.createElement("span");
    tempSeparator.className = "temperature-separator dimmed";
    tempSeparator.innerHTML = " / ";
    tempContainer.appendChild(tempSeparator);

    //low temperature
    var loTemp = document.createElement("span");
    loTemp.className = "low-temperature";
    loTemp.innerHTML = (!this.config.concise ? this.config.label_low + " " : "") + Math.round(l) + "°";
    tempContainer.appendChild(loTemp);

    return tempContainer;
  },

  formatPrecipitation: function(percentChance, snowAccumulation, rainIntensityMax, rainIntensity, forceIcon) {

    var precipContainer = document.createElement("span");
    precipContainer.className = "precipitation-container small";

    //inline icon
    if (forceIcon || (this.config.showInlineIcons && this.config.forecastLayout == "tiled")) {
      var rainIcon = document.createElement("img");
      rainIcon.className = "inline-icon rain";
      rainIcon.src = this.generateIconSrc("i-rain");
      precipContainer.appendChild(rainIcon);          
    } 

    //POP
    var pop = document.createElement("span");
    pop.className = "pop";
    pop.innerHTML = Math.round(percentChance * 100) + "%";
    precipContainer.appendChild(pop);

    //accumulation
    if (!this.config.concise && percentChance > 0) {
      var accumulation = document.createElement("span");
      accumulation.className = "accumulation";

      var accumulationHTML;
      if (snowAccumulation) { //snow
        accumulationHTML = Math.round(snowAccumulation) + " " + this.getUnit("accumulationSnow");
      } else if (rainIntensityMax){ //max rate for the day
        accumulationHTML = (Math.round(rainIntensityMax * 10) / 10) + " " + this.getUnit("accumulationRain");
      } else { //rate for the hour
        accumulationHTML = (Math.round(rainIntensity * 10) / 10) + " " + this.getUnit("accumulationRain");
      }
      accumulation.innerHTML = "(" + accumulationHTML + ")";

      precipContainer.appendChild(accumulation);
    }

    return precipContainer;

  },

  formatWind: function(speed, bearing, gust, forceIcon) {

    var windContainer = document.createElement("span");
    windContainer.className = "wind-container";

    //inline icon
    if (forceIcon || (this.config.showInlineIcons && this.config.forecastLayout == "tiled")) {
      var windIcon = document.createElement("img");
      windIcon.className = "inline-icon wind-icon";
      windIcon.src = this.generateIconSrc("i-wind");
      windContainer.appendChild(windIcon);          
    } 

    //wind speed
    var windSpeed = document.createElement("span");
    windSpeed.className = "wind-speed";
    windSpeed.innerHTML = Math.round(speed) + " " + this.getUnit("windSpeed") + (!this.config.concise ? " " + this.getOrdinal(bearing) : "");
    windContainer.appendChild(windSpeed);

    //wind gust
    if (!this.config.concise && gust) {
      var windGust = document.createElement("span");
      windGust.className = "wind-gusts";
      windGust.innerHTML = " (" + this.config.label_maximum + " " + Math.round(gust) + " " + this.getUnit("windSpeed") + ")";
      windContainer.appendChild(windGust);
    }    

    return windContainer;
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

  addIcon: function(icon, size) {

    //id to use for the canvas element
    var iconId = "skycon_" + this.iconIdCounter;

    //add id and icon name to cache
    this.iconCache.push({
      "id" : iconId,
      "icon" : icon
    });

    //build canvas elemenet
    var iconElem = document.createElement("canvas");
    iconElem.id = iconId;
    iconElem.width = size;
    iconElem.height = size;        
    this.iconIdCounter++; 

    return iconElem;
  },

  playIcons: function(inst) {
    /*
      name is a bit misleading. We needed to wait until
      the canvas elements got added to the Dom, which doesn't
      happen until after getDom finishes executing.
    */
    inst.iconCache.forEach(function(icon) {
      inst.skycons.add(icon.id, icon.icon);
    });
    inst.skycons.play();

  }


});
