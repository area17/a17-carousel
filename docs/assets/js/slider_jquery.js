/*

	13twelve vs. jQuery

	Slider.js

	v3.4

	This wants a html structure similar to:

	<div class="discover">
		<ul class="slider">
		    <li>...</li>
		    <li>...</li>
		</ul>
		<ul class="paginator">
			<li class="prev"><a href="#">Prev</a></li>
			<li class="next"><a href="#">Next</a></li>
		</ul>
	</div>

	You can have 1 thing in a set, lots of things in a set, looping or not looping and automated or not.

	For looping it will add blank <li>'s to the slider list. The slider list class is up to you.

	It draws in paginator li's to jump to sets, to the beginning of <ul class="paginator">.
	For the current set state, it puts a class of current on the <li>.
	The paginator list needs a class of "paginator".

	Usage:

	$("#features").slider({
        sliderInner: $("#features:first .slider"),
        slideAmount: 755/mixed,
        itemsVisible: 1,
        scrollBySet: false,
        currentSet: 1,
        budge: 0,
        looping: true,
        automate: false,
        interval: false,
        direction: "ltr/rtl/ttb/btt",
        quickLinks: true,
        speed: 250,
        quickLinksChar: "roman/bull",
        selfCentering: false,
        paginatorClassname: "paginator",
        keyControls: true,
        onMoveFunction: false
	});

	v1.0    original slider js
	v2.0 +  with the capability to do right to left sites
	v3.0 +  vertical sliding as well as horizontal sliding and optional quick link indicators
	v3.2 +  variable speed of animation and choice of bullet style in the quicklinks
	v3.3 +  dont need to pass slideContainer any more, not sure why I didn't think of that sooner,
	        also auto centering option
	        slide by set or by single
	        selectable paginator class
	        keyboard controls
	        ability to pass through a function that happens on move of the slider
  v3.4 +  load images function now looks for a data-src and won't try to show images that have a src filled out
          works with things other than lists

*/

(function ($) {
  $.fn.extend({
    slider: function (options) {
      // options!
      var o = $.extend({
        sliderInner: false,
        // what you actually want to slide
        slideAmount: false,
        // how much to slide the slider by, a number or "mixed" (mixed needs images to have width/height attributes, sets scrollBySet to false)
        itemsVisible: false,
        // how many items you can see at one go
        scrollBySet: false,
        // scroll single item at a time, or by group of how many visible
        currentSet: 1,
        // start at the begining or half way through
        budge: 0,
        // budge one way or another, useful for lining up with paddings/margins/spacings
        looping: false,
        // at the end of the sequence, stop? or go back ground
        automate: false,
        // auto page? if true, will set looping to true
        interval: 5,
        // seconds
        direction: "ltr",
        // ltr, rtl, ttb or btt - left to right, right to left, top to bottom, bottom to top
        quickLinks: true,
        // whether to show the quick link paginator indicator things
        speed: 500,
        // the speed of the animation, in ms
        quickLinksChar: "roman",
        // the type of character for the quick links,
        selfCentering: false,
        // centers the middle item of the list items, will make scrollBySet, automate and looping false, works horizontally
        paginatorClassname: "paginator",
        // the class of the list that contains the next/prev buttons
        keyControls: true,
        // have the keyboard controls on or off
        onMoveFunction: false // you can also pass through a function to happen when the slider is about to move
      }, options);

      var sliderContainer = $(this);

      if (sliderContainer.length > 0 && o.sliderInner.length > 0 && o.slideAmount && o.itemsVisible) {
        // house keeping
        var currentSliderPos = 0;
        var paginator = sliderContainer.find("ul[class*=" + o.paginatorClassname + "]");
        var nextBtn = paginator.find("li.next a");
        var prevBtn = paginator.find("li.prev a");
        var totalLi = o.sliderInner.children().length;
        var maxSet = Math.ceil(totalLi / o.itemsVisible);
        var reset = false; // controlled by the function for resetting the loop
        var timer = "";
        var hovering = false;
        var rtl = $("html[dir='rtl']").length > 0 ? true : false;
        var images = o.sliderInner.find("img");
        var imageWidths = []; // widths is a bad name, on vertical slider its going to the heights
        var middleItem = Math.round(totalLi / 2) - 1;
        var totalWidth = 0;
        var tagName = o.sliderInner.children().get(0).tagName;
        // bubble
        var sliderMoving = false;
        //
        // set up
        if (o.automate) {
          o.looping = true;
        }
        o.interval = o.interval * 1000;
        //
        var loadImages = function () {
            // just loops through the images and fades them in on load
            o.sliderInner.find("img[data-src]").each(function (index) {
              var newImage = new Image();
              var $this = $(this);
              //
              newImage.onload = function () {
                if ($this.css("opacity") == 0) {
                  $this.animate({
                    opacity: 1
                  }, 250, function () {
                    $this.css({
                      display: "block"
                    })
                  });
                }
              }
              if ($this.attr("src") == "") {
                newImage.src = $(this).data("src") || $(this).attr("src");
              }
            });
          }

        var fixCenter = function () {
            function fixPos() {
              // center the current item in the page
              // 1. add up the widths of the things before the current
              // 2. add half the width of the current
              // 3. minus half the window width
              // 4. times by -1 for css positioning
              var runningTotal = 0;
              for (var i = 0; i < o.currentSet - 1; i++) {
                runningTotal += imageWidths[i];
              }
              currentSliderPos = ((runningTotal + (imageWidths[o.currentSet] / 2)) - ($(window).width() / 2)) * -1;
              o.sliderInner.css({
                left: currentSliderPos + "px"
              });
            }

            o.currentSet = middleItem;
            fixPos();

            $(window).resize(function () {
              fixPos();
            });
          }
          //
        if (o.slideAmount == "mixed") {
          o.scrollBySet = false;
          images.each(function () {
            if (o.direction == "ttb" || o.direction == "btt") {
              imageWidths.push($(this).attr("height") * 1);
              totalWidth += $(this).attr("height") * 1;
            }
            else {
              imageWidths.push($(this).attr("width") * 1);
              totalWidth += $(this).attr("width") * 1;
            }
          });
        }
        else {
          images.each(function () {
            imageWidths.push(o.slideAmount);
          });
          totalWidth = (o.scrollBySet) ? o.slideAmount * totalLi : o.slideAmount * maxSet;
        }
        if (o.selfCentering) {
          o.scrollBySet = false;
          o.looping = false;
          o.automate = false;
          o.itemsVisible = (o.itemsVisible > 1) ? o.itemsVisible / 2 : o.itemsVisible;
          fixCenter();
        }
        if (!o.selfCentering && o.budge == 0) {
          o.budge = parseFloat(o.sliderInner.css("left")) || 0;
        }
        //
        // do the required cloning to do the infinite looping trick
        if (o.looping && o.itemsVisible == 1 && totalLi > o.itemsVisible) {
          o.sliderInner.find(tagName+":first").clone().appendTo(o.sliderInner);
          o.sliderInner.find(tagName+":last").prev().clone().prependTo(o.sliderInner);
          o.budge = o.budge - o.slideAmount;
        }
        else if (o.looping && totalLi > o.itemsVisible) {
          // check the amount of LIs, make to a division of o.itemsVisible
          // and then keep checking until it is
          for (var i = 1; i <= o.itemsVisible; i++) {
            var isEvenTest = totalLi % o.itemsVisible;
            if ((isEvenTest * 1) > 0) {
              $("<"+tagName+" class='blank'></"+tagName+">").appendTo(o.sliderInner);
              totalLi = o.sliderInner.children().length;
            }
          }
          //
          var firstSet = o.sliderInner.find(tagName+":lt(" + o.itemsVisible + ")");
          var lastSet = o.sliderInner.find(tagName+":gt(" + (totalLi - o.itemsVisible - 1) + ")");
          //
          firstSet.clone().appendTo(o.sliderInner).addClass("n1");
          lastSet.clone().prependTo(o.sliderInner).addClass("n2");
          o.budge = o.budge - o.slideAmount;
        }
        //
        loadImages();
        // set the intial slider positon
        if (!o.selfCentering) {
          currentSliderPos = o.budge + ((o.currentSet - 1) * o.slideAmount * -1);
        }
        //
        if (rtl && o.direction == "ltr") {
          o.direction = "rtl";
        }
        else if (rtl && o.direction == "rtl") {
          o.direction = "ltr";
        }
        //
        if (o.direction == "ltr") {
          o.sliderInner.css({
            left: currentSliderPos
          });
        }
        else if (o.direction == "rtl") {
          o.sliderInner.css({
            right: currentSliderPos
          });
        }
        else if (o.direction == "ttb") {
          o.sliderInner.css({
            top: currentSliderPos
          });
        }
        else if (o.direction == "btt") {
          o.sliderInner.css({
            bottom: currentSliderPos
          });
        }
        // the slider functions
        var moveSlider = function (direction) {
            if (!sliderMoving) {
              calculateNextPosition(direction);
              sliderMoving = true;
              if (o.direction == "ltr") {
                o.sliderInner.animate({
                  left: currentSliderPos
                }, o.speed, function () {
                  if (reset) {
                    currentSliderPos = o.budge + ((o.currentSet - 1) * o.slideAmount * -1);
                    o.sliderInner.css({
                      left: currentSliderPos
                    });
                  }
                  sliderMoving = false;
                  if (!hovering) {
                    auto();
                  }
                });
              }
              else if (o.direction == "rtl") {
                o.sliderInner.animate({
                  right: currentSliderPos
                }, o.speed, function () {
                  if (reset) {
                    currentSliderPos = o.budge + ((o.currentSet - 1) * o.slideAmount * -1);
                    o.sliderInner.css({
                      right: currentSliderPos
                    });
                  }
                  sliderMoving = false;
                  if (!hovering) {
                    auto();
                  }
                });
              }
              else if (o.direction == "ttb") {
                o.sliderInner.animate({
                  top: currentSliderPos
                }, o.speed, function () {
                  if (reset) {
                    currentSliderPos = o.budge + ((o.currentSet - 1) * o.slideAmount * -1);
                    o.sliderInner.css({
                      top: currentSliderPos
                    });
                  }
                  sliderMoving = false;
                  if (!hovering) {
                    auto();
                  }
                });
              }
              else if (o.direction == "btt") {
                o.sliderInner.animate({
                  bottom: currentSliderPos
                }, o.speed, function () {
                  if (reset) {
                    currentSliderPos = o.budge + ((o.currentSet - 1) * o.slideAmount * -1);
                    o.sliderInner.css({
                      bottom: currentSliderPos
                    });
                  }
                  sliderMoving = false;
                  if (!hovering) {
                    auto();
                  }
                });
              }
              if (o.onMoveFunction != false) {
                o.onMoveFunction(o.currentSet);
              }
              updatePaginator();
            }
          }
          // calculate the next position of the slider
        var calculateNextPosition = function (direction) {
            if (direction == 'right') {
              if (o.slideAmount == "mixed") {
                currentSliderPos -= imageWidths[currentSet - 1];
              }
              else {
                currentSliderPos -= o.slideAmount;
              }
              if (o.looping && o.currentSet == maxSet) {
                reset = true;
                o.currentSet = 1;
              }
              else {
                o.currentSet++;
              }
            }
            else if (direction == 'left') {
              if (o.slideAmount == "mixed") {
                currentSliderPos -= imageWidths[currentSet];
              }
              else {
                currentSliderPos += o.slideAmount;
              }
              if (o.looping && o.currentSet == 1) {
                reset = true;
                o.currentSet = maxSet;
              }
              else {
                o.currentSet--;
              }
            }
            else {
              currentSliderPos = o.budge + ((direction - 1) * o.slideAmount * -1);
              o.currentSet = direction;
            }
          }

          // update paginator links
        var updatePaginator = function () {
            if (!o.looping) {
              prevBtn.addClass("disabled");
              nextBtn.addClass("disabled");

              if (o.currentSet > 1) {
                prevBtn.removeClass("disabled");
              }
              if (o.scrollBySet) {
                if (o.currentSet < maxSet) {
                  nextBtn.removeClass("disabled");
                }
              }
              else {
                if (o.currentSet + o.itemsVisible < totalLi + 1) {
                  nextBtn.removeClass("disabled");
                }
              }
            }
            if (o.quickLinks) {
              paginator.find("li.current").removeClass("current");
              paginator.find("li").eq(o.currentSet - 1).addClass("current");
            }
          }

        var auto = function () {
            if (o.automate) {
              // if we're automating..
              clearTimeout(timer); // clear the timeout var, so it doesn't bubble itself into a mess
              timer = setTimeout(openNext, o.interval); // set the timer again
            }
          }

        var openNext = function () {
            moveSlider('right');
          }

        var setUpPaginator = function () {
            if (o.currentSet == 1 && maxSet == 1) {
              nextBtn.hide();
              prevBtn.hide();
              paginator.hide();
            }
            else {
              if (o.quickLinks) {
                var pages = "";
                var loopUntil = (o.scrollBySet) ? maxSet : totalLi;
                for (i = 0; i < loopUntil; i++) {
                  if (o.quickLinksChar == "bull") {
                    pages = pages + '<li><a href="#">&bull;</a></li>';
                  }
                  else {
                    pages = pages + '<li><a href="#">' + (i + 1) + '</a></li>';
                  }
                }
                paginator.prepend(pages);
              }
              updatePaginator();
              timer = setTimeout(auto, 50); // set the automatic swap happening
              // add some events to the slider buttons
              paginator.find("li:lt(" + ((paginator.find("li").length) - 2) + ") a").click(function (e) {
                e.preventDefault();
                var index = paginator.find("li a").index(this);
                if (index < maxSet && !$(this).parent().hasClass("current")) {
                  moveSlider(index + 1);
                }
              });
              prevBtn.click(function (e) {
                e.preventDefault();
                if (o.looping) {
                  moveSlider('left');
                }
                else {
                  if (!$(this).hasClass("disabled")) {
                    moveSlider('left');
                  }
                }
              });
              nextBtn.click(function (e) {
                e.preventDefault();
                if (o.looping) {
                  moveSlider('right');
                }
                else {
                  if (!$(this).hasClass("disabled")) {
                    moveSlider('right');
                  }
                }
              });
              sliderContainer.hover(function () {
                // if you hover over an Li, say your reading the content, it stops the automatic transition
                clearTimeout(timer);
                hovering = true;
              }, function () {
                // and restarts it when you roll out
                auto();
                hovering = false;
              });
              if (o.keyControls) {
                // on left and right arrow key down, highlight the button as though mouse over
                $(document).keydown(function (e) {
                  switch (e.keyCode) {
                  case 37:
                    // left arrow
                    prevBtn.addClass("active");
                    break;
                  case 39:
                    // right arrow
                    nextBtn.addClass("active");
                    break;
                  }
                });
                // on left and right arrow key up, un highlight and trigger movement
                $(document).keyup(function (e) {
                  switch (e.keyCode) {
                  case 37:
                    // move left
                    prevBtn.removeClass("active");
                    if (o.looping) {
                      moveSlider('left');
                    }
                    else {
                      if (!prevBtn.hasClass("disabled")) {
                        moveSlider('left');
                      }
                    }
                    break;
                  case 39:
                    // move right
                    nextBtn.removeClass("active");
                    if (o.looping) {
                      moveSlider('right');
                    }
                    else {
                      if (!nextBtn.hasClass("disabled")) {
                        moveSlider('right');
                      }
                    }
                    break;
                  }
                });
              }
            }
          }();
      }
    }
  });
})(jQuery);