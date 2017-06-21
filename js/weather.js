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
    // directionMap : {
    //     "E": "&#8594;",
    //     "NE": "&#8599;",
    //     "N": "&#8593;",
    //     "NO": "&#8598;",
    //     "O": "&#8592;",
    //     "SO": "&#8601;",
    //     "S": "&#8595;",
    //     "SE": "&#8600;"
    // },
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
    forecastUri : "/forecast/daily",
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

            currentWeather.humidity = '<i class="wi wi-humidity"></i> ' + (data.main.humidity) + '%';
            currentWeather.temp = Math.round(data.main.temp) + '°';
            currentWeather.description = data.weather[0].description;
            currentWeather.icon = _self.iconMap[data.weather[0].icon];
            currentWeather.windChill = Math.round(_self.getWindChill(data.main.temp, data.wind.speed * 3.6)) + "°";
            currentWeather.wind = '<i class="wi wi-strong-wind"></i> ' + Math.round(data.wind.speed * 3.6) + "km/h ";

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

                var obj = {};
                
                obj.date = new Date(item.dt * 1000);
                obj.tempMax = Math.round(item.temp.max) + '°';
                obj.tempMin = Math.round(item.temp.min) + '°';
                obj.icon = _self.iconMap[item.weather[0].icon];

                forecastWeather.push(obj);
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
        var title = this.currentWeather.temp;

        if (this.currentWeather.windChill != this.currentWeather.temp) {
            title += '<sub>' + this.currentWeather.windChill + '</sub>';
        }

        title += this.formatIcon(this.currentWeather.icon);

        return title;
    },
    getContent : function() {
        return this.currentWeather.description + "<br>" +
            this.currentWeather.wind + " " + this.currentWeather.humidity + "<br>" +
            this.formatForecast();
    },
    formatIcon: function(icon) {
        return '<span class="wi weathericon ' + icon + '"></span>'
    },
    formatForecast : function() {
        var result = '<div class="forecast-item">';

        var first = true;
        for(var i in this.forecastWeather) {
            var item = this.forecastWeather[i];

            if (first) {
                first = false;
            } else {
                result += '</div><div class="forecast-item">';
            }

            result += this.dayNames[item.date.getDay()] + '<br>';

            result += this.formatIcon(item.icon) + '<br>';
            result += item.tempMax + '<br>';
            result += '<span class="temp-min">' + item.tempMin + '</span><br>';
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
    },
    // getDirectionByDegree : function (degree) {
    //     if (degree <= 22.5) return 'e';
    //     if (degree <= 67.5) return 'ne';
    //     if (degree <= 112.5) return 'n';
    //     if (degree <= 157.5) return 'nw';
    //     if (degree <= 202.5) return 'w';
    //     if (degree <= 247.5) return 'sw';
    //     if (degree <= 292.5) return 's;';
    //     if (degree <= 337.5) return 'se';
    //     if (degree > 337.5) return 'e';
    // },
    // getDirection : function (degree) {
    //     return '<i class="wi wi-wind wi-towards-w' + this.getDirectionByDegree(degree) + '"></i>';
    // },
    // @see https://fr.wikipedia.org/wiki/Refroidissement_%C3%A9olien
    getWindChill : function (Tc, Vkmh) {
        if (Tc >= 10)
            return Tc;

        var Rc;

        if (Vkmh >= 4.8 && Vkmh <= 177) {
            Rc = 13.12 + 0.6215*Tc + (0.3965*Tc - 11.37) * Math.pow(Vkmh, 0.16);
        } else if (Vkmh < 4.8) {
            Rc = Tc + 0.2 * (0.1345*Tc - 1.59) * Vkmh;
        } else {
            Rc = Tc;
        }

        return Rc;
    }
});