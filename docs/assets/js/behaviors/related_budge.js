a17.Behaviors.related_budge = function(container) {
  var related_slider = new a17_slider({
    sliderContainer: container,
    sliderInner: container.querySelectorAll("ul.slider")[0],
    paginator: container.querySelectorAll("ul.paginator")[0],
    slideAmount: 480,
    itemsVisible: 2,
    scrollBySet: true,
    keyControls: false,
    cloneAll: true,
    budge: 240
  });
};