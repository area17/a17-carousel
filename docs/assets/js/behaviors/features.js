a17.Behaviors.features = function(container) {
  var features_slider;
  var starting_position = 1;

  function init_slider() {
    features_slider = new a17_slider({
      sliderContainer: container,
      sliderInner: container.querySelectorAll("ul.slider")[0],
      paginator: container.querySelectorAll("ul.paginator")[0],
      currentSet: starting_position
    });
  }

  document.getElementById("destroy").addEventListener("click",function(event){
    event.preventDefault();
    if (features_slider !== undefined) {
      features_slider.destroy();
    }
  },false);

  document.getElementById("next").addEventListener("click",function(event){
    event.preventDefault();
    features_slider.move("right");
  },false);

  document.getElementById("show3rd").addEventListener("click",function(event){
    event.preventDefault();
    features_slider.move(3);
  },false);

  document.getElementById("alert").addEventListener("click",function(event){
    event.preventDefault();
    alert(features_slider.currentSet());
  },false);

  document.getElementById("reinit").addEventListener("click",function(event){
    event.preventDefault();
    if (features_slider.destroy === undefined) {
      init_slider();
    }
  },false);

  container.addEventListener("slider_setup_complete",function(event){
    console.log("slider_setup_complete",event.data);
  });
  container.addEventListener("slider_moving",function(event){
    console.log("slider_moving",event.data);
  });
  container.addEventListener("slider_moved",function(event){
    console.log("slider_moved",event.data);
  });
  container.addEventListener("slider_destroyed",function(event){
    console.log("slider_destroyed",event.data);
    starting_position = event.data.currentSet;
  });

  init_slider();
};