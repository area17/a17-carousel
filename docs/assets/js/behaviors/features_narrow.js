a17.Behaviors.features_narrow = function(container) {
  var features_slider = new a17_slider({
    sliderContainer: container,
    sliderInner: container.querySelectorAll("ul.slider")[0],
    paginator: container.querySelectorAll("ul.paginator")[0],
    slideAmount: 720,
    keyControls: false,
    automate: false
  });
};