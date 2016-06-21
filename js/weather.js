var WeatherWidget = Widget.extend({
   iconMap : {
        "01d": "wi-day-sunny",
        "02d": "wi-day-cloudy",
        "03d": "wi-cloudy",
        "04d": "wi-cloudy-windy",
        "09d": "wi-showers",
        "10d": "wi-rain",
        "11d": "wi-thunderstorm",
        "13d": "wi-snow",
        "50d": "wi-fog",
        "01n": "wi-night-clear",
        "02n": "wi-night-cloudy",
        "03n": "wi-night-cloudy",
        "04n": "wi-night-cloudy",
        "09n": "wi-night-showers",
        "10n": "wi-night-rain",
        "11n": "wi-night-thunderstorm",
        "13n": "wi-night-snow",
        "50n": "wi-night-alt-cloudy-windy"
    },
    openweathermap : {
        key: "01513e263be62641a0e3fc76d04334ca",
        city: "paris",
        country: "fr", // ISO 3166 country code
        language: "fr",
        units: "metric" // or "imperial"
    },
    url : "http://api.openweathermap.org",
    baseUri : "/data/2.5",
    currentWeatherUri : "/weather",
    forecastUri : "/forecast",
    dayNames : ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
    initialize : function(id, city, country) {
        Widget.prototype.initialize(id);

        this.openweathermap.city = city;
        this.openweathermap.country = country;
    },
    display : function() {
        var _self = this;
        var promiseCurrent = this.getCurrentWeather();
        var promiseForecast = this.getForecast();

        var flagCurrent = false;
        var flagForecast = false;

        promiseCurrent.then(function(data) {
            var currentWeather = {};

            currentWeather.humidity = '<i class="fa fa-umbrella"></i> ' + data.main.humidity + '%';
            currentWeather.temp = Math.round(data.main.temp*10)/10 + '°';
            currentWeather.tempMin = Math.round(data.main.temp_min*10)/10 + '°';
            currentWeather.tempMax = Math.round(data.main.temp_max*10)/10 + '°';
            currentWeather.description = data.weather[0].description;
            currentWeather.icon = _self.iconMap[data.weather[0].icon];

            // http://openweathermap.org/weather-conditions
            // "Group : " + data.weather[0].main + " " + data.weather[0].description + ", id : " + data.weather[0].id;

            _self.currentWeather = currentWeather;

            flagCurrent = true;

            if (flagCurrent && flagForecast)
                _self.refresh();
        });

        promiseForecast.then(function(data) {
            var forecastWeather = [];
            for(var i in data.list) {
                var item = data.list[i];
                var date = new Date(item.dt_txt);

                var obj = {};
                if (date.getHours() == 9 || date.getHours() == 18) { // forecast for 9:00 and 15:00
                    obj.date = date;
                    obj.temp = Math.round(item.main.temp) + '°';
                    obj.icon = _self.iconMap[item.weather[0].icon];
                    forecastWeather.push(obj);
                }
            }

            _self.forecastWeather = forecastWeather;

            flagForecast = true;

            if (flagCurrent && flagForecast)
                _self.refresh();
        });
    },
    refresh : function() {
        $(this.id).html('');

        $('<div>', {
            class: "title",
            html: this.getTitle()
        }).appendTo(this.id);

        $('<div>', {
            class: "content",
            html: this.getContent()
        }).appendTo(this.id);
    },
    getTitle : function() {
        return this.currentWeather.temp + " " + this.formatIcon(this.currentWeather.icon);
    },
    getContent : function() {
        return this.currentWeather.description + "<br>" + this.currentWeather.humidity + "<br>" + this.formatForecast();
    },
    formatIcon: function(icon) {
        return '<span class="wi weathericon ' + icon + '"></span>'
    },
    formatForecast : function() {
        var result = '<div class="forecast-item">';
        result += this.dayNames[this.forecastWeather[0].date.getDay()] + '<br>';

        var date = false;
        for(var i in this.forecastWeather) {
            var item = this.forecastWeather[i];

            item.date;
            item.temp;
            item.icon;

            if (date && date.getDate() != item.date.getDate()) {
                result += '</div><div class="forecast-item">';
                result += this.dayNames[item.date.getDay()] + '<br>';
            }
            date = item.date;

            result += this.formatIcon(item.icon) + '<br>';
            result += item.temp + '<br>';
        }
        result += '</div>';

        return result;
    },
    getCurrentWeather : function() {
        var _self = this;

        return $.get(this.url + this.baseUri + this.currentWeatherUri, {
            q: this.openweathermap.city + "," + this.openweathermap.country,
            APPID: this.openweathermap.key,
            lang: this.openweathermap.language,
            units: this.openweathermap.units
        });
    },
    getForecast : function() {
        return $.get(this.url + this.baseUri + this.forecastUri, {
            q: this.openweathermap.city + "," + this.openweathermap.country,
            APPID: this.openweathermap.key,
            lang: this.openweathermap.language,
            units: this.openweathermap.units
        });
    }
});