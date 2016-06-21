var DateWidget = Widget.extend({
    dayNames : ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    monthNames : ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    display : function() {
        this.currentdate = new Date();

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
        var hours = this.currentdate.getHours();
        var minutes = this.currentdate.getMinutes();

        if (hours < 10) {
            hours   = "0"+hours;
        }
        if (minutes < 10) {
            minutes = "0"+minutes;
        }

        return hours + ":" + minutes;
    },
    getContent : function() {
        var day = this.dayNames[this.currentdate.getDay()];
        var month = this.monthNames[this.currentdate.getMonth()];

        return day + " " + this.currentdate.getDate() + " " + month;
    }
});
