# MMM-DarkSkyForecast

This a module for <strong>MagicMirror</strong><br>
https://magicmirror.builders/<br>
https://github.com/MichMich/MagicMirror

![Screenshot](/../screenshots/MMM-DarkSkyForecast.png?raw=true "Screenshot")

A weather module that displays current, hourly and daily forecast information
using data from the Dark Sky API. This is a replacement module for MMM-MyWeather, now that Weather Undergroiund no longer allows free API access.  This a complete rewrite from scratch but maintains
much of the same functionality.


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
      <td><code>updateFadeSpeed</code></td>
      <td>How quickly in milliseconds to fade the module out and in upon data refresh.  Set this to `0` for no fade.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>500</code> (i.e.: 1/2 second).</td>
    </tr>
    <tr>
      <td><code>language</code></td>
      <td>The language to be used for display.<br><br><strong>Type</strong> <code>String</code><br>Defaults to the language set for Magic Mirror, but can be overridden with any of the language codes listed here: `https://darksky.net/dev/docs#request-parameters`.</td>
    </tr>
    <tr>
      <td><code>colored</code></td>
      <td>Whether to present module in colour or black-and-white.  Note, if set to `false`, the monochramtic version of your chosen icon set will be forced.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>units</code></td>
      <td>One of the following: <code>si</code>, <code>ca</code>, <code>uk2</code>, or <code>us</code>.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>ca</code><br />See `https://darksky.net/dev/docs#request-parameters` for details on units.</td>
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
      <td><code>showHourlyForecast</code></td>
      <td>Whether to show hourly forecast information. when set to `true` it works with the `hourlyForecastInterval` and `maxHourliesToShow` parameters.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>hourlyForecastInterval</code></td>
      <td>How many hours apart each listed hourly forecast is.<br><br><strong>Type</strong> <code>Number</code><br>Defaults to <code>3</code></td>
    </tr>
    <tr>
      <td><code>maxHourliesToShow</code></td>
      <td>How many hourly forecasts to list.</code><br>Defaults to <code>3</code></td>
    </tr>
    <tr>
      <td><code>showDailyForecast</code></td>
      <td>Whether to show daily forecast information. when set to `true` it works with the `maxDailiesToShow` parameter.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
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
      <td>Whether to show information information. This affects current conditions, hourly and daily forecasts<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>concise</code></td>
      <td>When set to true, this presents less information.  (e.g.: shorter summary, no precipitation accumulation, no wind gusts, etc.)<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>iconset</code></td>
      <td>Which icon set to use.  See below for previews of the icon sets.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>1c</code></td>
    </tr>
    <tr>
      <td><code>useAnimatedIcons</code></td>
      <td>Whether to use the Dark Sky's own animated icon set.  When set to true, this will override your choice for `iconset`. However, flat icons will still be used in some instances.  For example if you set the `animateMainIconOnly` parameter to true, daily and hourly forecasts will not be animated.  Inline icons (i.e. used to prefix precipitation and wind ifnormation) will always be flat.  A good `iconset` match for the animated set is `1c`.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>animateMainIconOnly</code></td>
      <td>When set to true, only the main current conditions icon is animated. The rest use your choice for `iconset` (`1c` is a good match for the animated icon).  If you are running on a Raspberry Pi, performance may suffer if you set this to false.  In my testing on a Pi 3b, enabling this ramped up CPU temperature by 15° - 20°, and fade transitions were not smooth.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>showInlineIcons</code></td>
      <td>Whether to prefix wind and precipitation information with an icon.  Only affects the `tiled` layout.<br><br><strong>Type</strong> <code>Boolean</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>forecastLayout</code></td>
      <td>can be set to `tiled` or `table`. How to display hourly and forecast information.  See below for screenshot examples of each.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>forecastLayout</code></td>
      <td>can be set to `tiled` or `table`. How to display hourly and forecast information.  See below for screenshot examples of each.<br><br><strong>Type</strong> <code>String</code><br>Defaults to <code>true</code></td>
    </tr>
    <tr>
      <td><code>label_maximum</code></td>
      <td>The label you wish to display for prefixing wind gusts.<br><br><strong>Type</strong> <code>String</code><br>Defaults to `"max"`.</td>
    </tr>
    <tr>
      <td><code>label_high</code></td>
      <td>The label you wish to display for prefixing high temperature.<br><br><strong>Type</strong> <code>String</code><br>Defaults to `"H"`.</td>
    </tr>
    <tr>
      <td><code>label_low</code></td>
      <td>The label you wish to display for prefixing low temperature.<br><br><strong>Type</strong> <code>String</code><br>Defaults to `"L"`.</td>
    </tr>
    <tr>
      <td><code>label_timeFormat</code></td>
      <td>How you want the time formatted for hourly forecast display.  Accepts any valid moment.js format (`https://momentjs.com/docs/#/displaying/format/`).<br><br><strong>Type</strong> <code>String</code><br>Defaults to `"h a"` (e.g.: `9 am`)</td>
    </tr>
    <tr>
      <td><code>label_days</code></td>
      <td>How you would like the days of the week displayed for daily forecasts.  Assumes index `0` is Sunday.<br><br><strong>Type</strong> <code>Array of Strings</code><br>Defaults to `["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"]`</td>
    </tr>
    <tr>
      <td><code>label_ordinals</code></td>
      <td>How you would like wind direction to be displayed.  Assumes index `0` is North and proceeds clockwise.<br><br><strong>Type</strong> <code>Array of Strings</code><br>Defaults to `["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]`</td>
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