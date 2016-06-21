// definiting the base constructor for all classes, which will execute the final class prototype's initialize method if exists
var Class = function() {
    this.initialize && this.initialize.apply(this, arguments);
};
Class.extend = function(childPrototype) { // defining a static method 'extend'
    var parent = this;
    var child = function() { // the child constructor is a call to its parent's
        return parent.apply(this, arguments);
    };
    child.extend = parent.extend; // adding the extend method to the child class
    var Surrogate = function() {}; // surrogate "trick" as seen previously
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;
    for(var key in childPrototype){
        child.prototype[key] = childPrototype[key];
    }
    return child; // returning the child class
};



var Widget = Class.extend({
    initialize : function(id) { // initialize is called by constructor at instanciation.
        this.id = id;
        this.title = "widget title";
        this.content = "widget content";
    },
    display : function() {
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
    getTitle: function() {
        return this.title;
    },
    getContent: function() {
    	return this.content;
    }
});
