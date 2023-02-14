a17.Behaviors.breakpoints = function(container) {
  var related_slider, width, timer, itemsVisible, quickLinks;

  function init_slider(w) {
    width = w;

    switch (width) {
      case 960:
        itemsVisible = 4;
        quickLinks = true;
        break;
      case 720:
        itemsVisible = 3;
        quickLinks = true;
        break;
      case 480:
        itemsVisible = 2;
        quickLinks = true;
        break;
      default:
        itemsVisible = 1;
        quickLinks = false;
    }

    related_slider = new a17_slider({
      sliderContainer: document.querySelectorAll(".related")[0],
      sliderInner: document.querySelectorAll(".related > .slider")[0],
      paginator: document.querySelectorAll(".related > .pager")[0],
      itemsVisible: itemsVisible,
      scrollBySet: true,
      quickLinks: quickLinks
    });
  }

  function reinit_slider() {
    var new_width = container.offsetWidth;
    if (new_width != width) {
      related_slider.destroy();
      init_slider(new_width);
    }
  }

  window.addEventListener("resize",function(){
    clearTimeout(timer);
    timer = setTimeout(function(){
      reinit_slider();
    },250);
  },false);

  init_slider(container.offsetWidth);
};