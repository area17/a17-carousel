/*

  A17

*/

// --------------------------------------------------------------------------------------------------------------

// set up a master object
var a17 = window.a17 || {};

// set up some objects within the master one, to hold my Helpers and behaviors
a17.Behaviors = {
}
a17.Helpers = {
}
a17.Functions = {
}

// look through the document (or ajax'd in content if "context" is defined) to look for "data-behavior" attributes.
// Initialize a new instance of the method if found, passing through the element that had the attribute
// So in this example it will find 'data-behavior="show_articles"' and run the show_articles method.
a17.LoadBehavior = function(context){
  if(context === undefined){
    context = document;
  }
  var all = context.querySelectorAll("[data-behavior]");
  var i = -1;
  while (all[++i]) {
    var currentElement = all[i];
    var behaviors = currentElement.getAttribute("data-behavior");
    var splitted_behaviors = behaviors.split(" ");
    for (var j = 0, k = splitted_behaviors.length; j < k; j++) {
      var thisBehavior = a17.Behaviors[splitted_behaviors[j]];
      if(typeof thisBehavior !== "undefined") {
        thisBehavior.call(currentElement,currentElement);
      }
    }
  }
};

// set up and trigger looking for the behaviors on DOM ready
a17.onReady = function(){
  a17.LoadBehavior();
};

document.addEventListener('DOMContentLoaded', function(){
  // go go go
  a17.onReady();
});

// make console.log safe
if (typeof console === "undefined") {
  console = {
    log: function () {
      return;
    }
  };
}