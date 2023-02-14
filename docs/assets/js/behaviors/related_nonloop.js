a17.Behaviors.related_nonloop = function(container) {
  var related_slider = new a17_slider({
    sliderContainer: container,
    sliderInner: container.querySelectorAll("ul.slider")[0],
    paginator: container.querySelectorAll("ul.pager")[0],
    itemsVisible: 4,
    scrollBySet: true,
    keyControls: false,
    paginatorClassname: "pager",
    looping: false,
  });
};
