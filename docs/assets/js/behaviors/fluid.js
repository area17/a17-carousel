a17.Behaviors.fluid = function(container) {
  var features_slider, width, slides, timer;
  var starting_position = 1;

  function init_slider(w) {
    width = w;
    slides = container.querySelectorAll("ul.slider > li");
    Array.prototype.forEach.call(slides, function(slide, i){
      slide.style.width = width + "px";
    });
    features_slider = new a17_slider({
      sliderContainer: document.querySelectorAll(".features")[0],
      sliderInner: document.querySelectorAll(".features > .slider")[0],
      paginator: document.querySelectorAll(".features > .paginator")[0],
      slideAmount: width,
      currentSet: starting_position
    });
  }

  function reinit_slider() {
    var new_width = container.offsetWidth;
    if (new_width != width) {
      features_slider.destroy();
      init_slider(new_width);
    }
  }

  window.addEventListener("resize",function(){
    clearTimeout(timer);
    timer = setTimeout(function(){
      reinit_slider();
    },250);
  },false);

  container.addEventListener("slider_destroyed",function(event){
    starting_position = event.data.currentSet;
  });

  init_slider(container.offsetWidth);
};