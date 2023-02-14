a17.Behaviors.features_start2nd = function(container) {
  var features_slider = new a17_slider({
    sliderContainer: container,
    sliderInner: container.querySelectorAll("ul.slider")[0],
    paginator: container.querySelectorAll("ul.paginator")[0],
    currentSet: 2
  });
};