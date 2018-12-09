# MMM-DarkSkyForecast

This a module for <strong>MagicMirror</strong><br>
https://magicmirror.builders/<br>
https://github.com/MichMich/MagicMirror

![Screenshot](/../screenshots/MMM-DarkSkyForecast.png?raw=true "Screenshot")

A weather module that displays current, hourly and daily forecast information
using data from the Dark Sky API. This is a replacement module for MMM-MyWeather, now that Weather Underground no longer allows free API access.  This a complete rewrite from scratch but maintains
much of the same functionality.

**NOTE:** This module uses the Nunjucks templating system introduced in version 2.2.0 of MagicMirror.  If you're seeing nothing on your display where you expect this module to appear, make sure your MagicMirror version is at least 2.2.0.


## Installation

1. Navigate into your MagicMirror `modules` folder and execute<br>
`git clone https://github.com/jclarke0000/MMM-DarkSkyForecast.git`.
2. Enter the new `MMM-DarkSkyForecast` directory and execute `npm install`.



## Configuration

At a minimum you need to supply the following required configuration parameters:

* `apikey`
* `latitude`
* `longitude`

You can request an API key to access Dark Sky data here:
`https://darksky.net/dev`.

Free tier is fine -- this module will not make any where near 1000 request on one day.

Find out your latitude and longitude here:
`https://www.latlong.net/`.

### Other optional parameters

<table>
  <thead>
    <tr>
      <th>Option</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>updateInterval</code></td>
      <td>How frequently, in minutes, to poll for data. Be careful not to set this too frequent so that you don't exceed Dark Sky's 1000 free requests per day cap.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>10</code></td>
    </tr>
    <tr>
      <td><code>requestDelay</code></td>
      <td>In milliseconds, how long to delay the request.  If you have multiple instances of the module running, set one of them to a delay of a second or two to keep the API calls from being too close together.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>250</code></td>
    </tr>
    <tr>
      <td><code>updateFadeSpeed</code></td>
      <td>How quickly in milliseconds to fade the module out and in upon data refresh.  Set this to <code>0</code> for no fade.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>500</code> (i.e.: 1/2 second).</td>
    </tr>
    <tr>
      <td><code>language</code></td>
      <td>The language to be used for display.<br><br><strong>Type</strong> <code>String</code><br>Defaults to the language set for Magic Mirror, but can be overridden with any of the language codes listed here: https://darksky.net/dev/docs#request-parameters.</td>
    </tr>
    <tr>
      <td><code>colored</code></td>
      <td>Whether to present module in colour or black-and-white.  Note, if set to <code>false</code>, the monochramtic version of your chosen icon set will be forced.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>units</code></td>
      <td>One of the following: <code>si</code>, <code>ca</code>, <code>uk2</code>, or <code>us</code>.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>ca</code><br />See https://darksky.net/dev/docs#request-parameters for details on units.</td>
    </tr>
    <tr>
      <td><code>showCurrentConditions</code></td>
      <td>Whether to show current temperaure and current conditions icon.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showExtraCurrentConditions</code></td>
      <td>Whether to show additional current conditions such as high/low temperatures, precipitation and wind speed.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showSummary</code></td>
      <td>Whether to show the forecast summary.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>forecastHeaderText</code></td>
      <td>Show a header above the forecast display.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>""</code></td>
    </tr>
    <tr>
      <td><code>showForecastTableColumnHeaderIcons</code></td>
      <td>Whether to show icons column headers on the forecast table.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showHourlyForecast</code></td>
      <td>Whether to show hourly forecast information. when set to <code>true</code> it works with the <code>hourlyForecastInterval</code> and <code>maxHourliesToShow</code> parameters.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>hourlyForecastInterval</code></td>
      <td>How many hours apart each listed hourly forecast is.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>3</code></td>
    </tr>
    <tr>
      <td><code>maxHourliesToShow</code></td>
      <td>How many hourly forecasts to list.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>3</code></td>
    </tr>
    <tr>
      <td><code>showDailyForecast</code></td>
      <td>Whether to show daily forecast information. when set to <code>true</code> it works with the <code>maxDailiesToShow</code> parameter.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>maxDailiesToShow</code></td>
      <td>How many daily forecasts to list.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>3</code></td>
    </tr>
    <tr>
      <td><code>showPrecipitation</code></td>
      <td>Whether to show precipitation information. This affects current conditions, hourly and daily forecasts<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showWind</code></td>
      <td>Whether to show wind information. This affects current conditions, hourly and daily forecasts<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>concise</code></td>
      <td>When set to <code>true</code>, this presents less information.  (e.g.: shorter summary, no precipitation accumulation, no wind gusts, etc.)<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>iconset</code></td>
      <td>Which icon set to use.  See below for previews of the icon sets.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>1c</code></td>
    </tr>
    <tr>
      <td><code>useAnimatedIcons</code></td>
      <td>Whether to use the Dark Sky's own animated icon set.  When set to true, this will override your choice for <code>iconset</code>. However, flat icons will still be used in some instances.  For example if you set the <code>animateMainIconOnly</code> parameter to true, daily and hourly forecasts will not be animated and instead will use your choice for <code>iconset</code>.  Inline icons (i.e. used to prefix precipitation and wind information) will always be flat.  A good <code>iconset</code> match for the animated set is <code>1c</code>.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>animateMainIconOnly</code></td>
      <td>When set to <code>true</code>, only the main current conditions icon is animated. The rest use your choice for <code>iconset</code> (<code>1c</code> is a good match for the animated icon).  If you are running on a low-powered device like a Raspberry Pi, performance may suffer if you set this to <code>false</code>.  In my testing on a Pi 3b, enabling this ramped up CPU temperature by 15° - 20°, and fade transitions were not smooth.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showInlineIcons</code></td>
      <td>Whether to prefix wind and precipitation information with an icon.  Only affects the <code>tiled</code> layout.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>forecastLayout</code></td>
      <td>Can be set to <code>tiled</code> or <code>table</code>. How to display hourly and forecast information.  See below for screenshot examples of each.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>tiled</code></td>
    </tr>
    <tr>
      <td><code>label_maximum</code></td>
      <td>The label you wish to display for prefixing wind gusts.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"max"</code>.</td>
    </tr>
    <tr>
      <td><code>label_high</code></td>
      <td>The label you wish to display for prefixing high temperature.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"H"</code>.</td>
    </tr>
    <tr>
      <td><code>label_low</code></td>
      <td>The label you wish to display for prefixing low temperature.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"L"</code>.</td>
    </tr>
    <tr>
      <td><code>label_timeFormat</code></td>
      <td>How you want the time formatted for hourly forecast display.  Accepts any valid moment.js format (https://momentjs.com/docs/#/displaying/format/). For example, specify short 24h format with <code>"k[h]"</code> (e.g.: <code>14h</code>)<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>"h a"</code> (e.g.: <code>9 am</code>)</td>
    </tr>
    <tr>
      <td><code>label_days</code></td>
      <td>How you would like the days of the week displayed for daily forecasts.  Assumes index <code>0</code> is Sunday.<br><br><strong>Type</strong> <code>Array of Strings</code><br>Defaults to <code>["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"]</code></td>
    </tr>
    <tr>
      <td><code>label_ordinals</code></td>
      <td>How you would like wind direction to be displayed.  Assumes index <code>0</code> is North and proceeds clockwise.<br><br><strong>Type</strong> <code>Array of Strings</code><br>Defaults to <code>["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]</code></td>
    </tr>


  </tbody>
</table>

## Sample Configuration

```
{
  module: "MMM-DarkSkyForecast",
  header: "Weather",
  position: "top_right",
  classes: "default everyone",
  disabled: false,
  config: {
    apikey: "SUPER SECRET!!!",
    latitude: "51.506130",
    longitude: "-0.090270",      
    iconset: "4c",
    concise: false,
    forecastLayout: "table"
  }
},
```

## Icon Sets

![Icon Sets](icons/iconsets.png?raw=true "Icon Sets")


## Layouts

![Layouts](/../screenshots/forecast-layouts.png?raw=true "Layouts")


## Styling

This module is set to be 300px wide by default.  If you wish to override it, you can add the following to your `custom.css` file:

```
.MMM-DarkSkyForecast .module-content {
  width: 500px; /* adjust this to taste */
}
```

Most important elements of this module have one or more class names applied. Examine the `MMM-DarkSkyForecast.css` or inspect elements directly with your browser of choice to determine what class you would like to override.


## For Module Developers

This module broadcasts a notification when it recieves a weather update.  The notification is `DARK_SKY_FORECAST_WEATHER_UPDATE` and the payload contains Dark Sky's JSON weather forecast object.  For details on the weather object, see https://darksky.net/dev/docs.


## Attributions

**Skycons - Animated icon set by Dark Sky**<br />
http://darkskyapp.github.io/skycons/<br />
(using the fork created by Maxime Warner
that allows individual details of the icons
to be coloured<br />
https://github.com/maxdow/skycons)

**Climacons by Adam Whitcroft**<br />
http://adamwhitcroft.com/climacons/

**Free Weather Icons by Svilen Petrov**<br />
https://www.behance.net/gallery/12410195/Free-Weather-Icons

**Weather Icons by Thom**<br />
(Designed for DuckDuckGo)<br />
https://dribbble.com/shots/1832162-Weather-Icons

Sets 4 and 5 were found on Graphberry, but I couldn't find
the original artists.<br />
https://www.graphberry.com/item/weather-icons<br />
https://www.graphberry.com/item/weathera-weather-forecast-icons

Some of the icons were modified to better work with the module's
structure and aesthetic.

**Weather data provided by Dark Sky**<br />
https://darksky.net/

