/*
  a17_carousel
  v2.0.0

*/
(function () {
  'use strict';

  var a17_carousel = function(options) {

    var defaults = {
      sliderContainer: undefined,
      sliderInner: undefined,
      slideAmount: undefined,
      paginator: undefined,
      itemsVisible: 1,
      scrollBySet: false,
      cloneAll: false,
      currentSet: 1,
      budge: 0,
      centered: false,
      looping: true,
      automate: false,
      interval: 5,
      quickLinks: true,
      speed: 250,
      quickLinksChar: "bull",
      keyControls: true,
      swipable: true,
      swipeThreshold: 20,
      cursor: false,
    };

    var this_instance = this;
    var reset = false; // controlled by the function for resetting the loop
    var hovering = false;
    var sliderMoving = false;
    var dragging = false;
    var preventClicks = false;
    var automationHalted = false;
    var rtl = a17S("html[dir=rtl]",document).length == 0 ? false : true;
    var dataAttr = "data-a17_carousel-position";
    var dupeAttr = "data-a17_carousel-dupe";
    var missing_lis = 0; // if scrolling by set and total number of items isn't a multiple of how many items visible
    var this_instance_params, original_node, currentSliderPos, paginator, nextBtn, prevBtn, totalLi, maxSet, timer, slides, slidesWidths, middleItem, totalWidth, xDown, yDown, xDiff, yDiff, animationFrame;

    function init() {
      this_instance_params = defaults;
      options = options || {};
      for (var def in this_instance_params) {
        if (typeof options[def] !== 'undefined') {
            this_instance_params[def] = options[def];
        }
      }

      if (this_instance_params.sliderContainer == undefined || this_instance_params.sliderInner == undefined || this_instance_params.paginator == undefined ) {
        if (typeof console === "object") {
          console.warn("a17_carousel: no sliderContainer, sliderInner or paginator specified");
        }
        return;
      }

      original_node = this_instance_params.sliderContainer.innerHTML;
      currentSliderPos = 0;
      nextBtn = a17S("li.next a",this_instance_params.paginator);
      prevBtn = a17S("li.prev a",this_instance_params.paginator);
      totalLi = nodeCount(this_instance_params.sliderInner);
      maxSet = Math.ceil(totalLi / this_instance_params.itemsVisible);
      slides = children(this_instance_params.sliderInner);
      slidesWidths = [];
      middleItem = Math.round(totalLi / 2) - 1;
      totalWidth = 0;
      //
      // set up
      if (this_instance_params.slideAmount === undefined) {
        this_instance_params.slideAmount = this_instance_params.sliderContainer.offsetWidth;
      }
      if (this_instance_params.automate) {
        this_instance_params.looping = true;
      }
      if (this_instance_params.slideAmount == "mixed") {
        this_instance_params.looping = true;
        this_instance_params.cloneAll = true;
        this_instance_params.itemsVisible = 1;
        this_instance_params.scrollBySet = false;
      } else if (this_instance_params.slideAmount < this_instance_params.sliderContainer.offsetWidth) {
        this_instance_params.cloneAll = true;
        this_instance_params.looping = true;
      }
      if (this_instance_params.currentSet > maxSet || this_instance_params.currentSet === 0) {
        this_instance_params.currentSet = 1;
      }
      if (this_instance_params.scrollBySet && this_instance_params.itemsVisible === 1) {
        this_instance_params.scrollBySet = false;
      }
      if (this_instance_params.scrollBySet || this_instance_params.itemsVisible > 1) {
        this_instance_params.centered = false;
      }
      if (!window.requestAnimationFrame) {
        this_instance_params.swipable = false;
      }
      this_instance_params.interval = this_instance_params.interval * 1000;

      // ###############################################################
      // Determining slide amount incase not known

      if (this_instance_params.slideAmount == "mixed") {
        Array.prototype.forEach.call(slides, function(slide, i){
          var width = attr(slide,"width") * 1 || slide.offsetWidth;
          slidesWidths.push(width);
          totalWidth += width;
        });
      } else {
        Array.prototype.forEach.call(slides, function(slide, i){
          slidesWidths.push(this_instance_params.slideAmount);
        });
        totalWidth = (this_instance_params.scrollBySet) ? this_instance_params.slideAmount * maxSet : this_instance_params.slideAmount * totalLi;
      }

      // ###############################################################
      // adding helper numbers
      Array.prototype.forEach.call(slides, function(node, i){
        attr(node,dataAttr,i);
      });
      // do the required cloning to do the infinite looping trick
      if (this_instance_params.looping && this_instance_params.itemsVisible == 1 && totalLi > this_instance_params.itemsVisible && !this_instance_params.centered && !this_instance_params.cloneAll) {

        var first_child = this_instance_params.sliderInner.firstElementChild.cloneNode(true);
        var last_child = this_instance_params.sliderInner.lastElementChild.cloneNode(true);

        attr(first_child,dupeAttr,"");
        attr(last_child,dupeAttr,"");

        tabIndexMinus1(first_child);
        tabIndexMinus1(last_child);

        this_instance_params.sliderInner.appendChild(first_child);
        this_instance_params.sliderInner.insertBefore(last_child, this_instance_params.sliderInner.firstChild);

        slides = children(this_instance_params.sliderInner);

        this_instance_params.budge = this_instance_params.budge - slidesWidths[0];

      } else if (this_instance_params.looping && totalLi > this_instance_params.itemsVisible || this_instance_params.centered || this_instance_params.cloneAll) {

        calculateMissingLi();

        totalLi = slides.length;

        // get the first and last sets
        var firstSet = [];
        var lastSet = [];
        Array.prototype.forEach.call(slides, function(node, i){
          var node_dupe = node.cloneNode(true);
          if (i < this_instance_params.itemsVisible && !this_instance_params.cloneAll) {
            attr(node_dupe,dupeAttr,"");
            tabIndexMinus1(node_dupe);
            firstSet.push(node_dupe);
          }
          if (i >= totalLi - this_instance_params.itemsVisible && !this_instance_params.cloneAll) {
            attr(node_dupe,dupeAttr,"");
            tabIndexMinus1(node_dupe);
            lastSet.push(node_dupe);
          }
          if (this_instance_params.cloneAll) {
            attr(node,dupeAttr,"");
            tabIndexMinus1(node_dupe);
            firstSet.push(node_dupe);
            lastSet.push(node_dupe);
          }
        });
        //
        // concat all together
        slides = lastSet.concat(slides,firstSet);
        // generate new slider html
        var new_slide_html = "";
        Array.prototype.forEach.call(slides, function(node, i){
          new_slide_html += node.outerHTML;
        });
        // and insert it
        this_instance_params.sliderInner.innerHTML = new_slide_html;
        // update slides var
        slides = children(this_instance_params.sliderInner);
        //
        if (this_instance_params.cloneAll) {
          this_instance_params.budge = this_instance_params.budge - totalWidth;
          // adjust if there are missing LI (not a full set)
          if (missing_lis > 0) {
            this_instance_params.budge += Math.round(this_instance_params.slideAmount / (this_instance_params.itemsVisible / missing_lis));
          }
        } else {
          this_instance_params.budge = this_instance_params.budge - slidesWidths[0];
        }
      } else if (!this_instance_params.looping && totalLi > this_instance_params.itemsVisible && this_instance_params.itemsVisible > 1) {
        calculateMissingLi();
      }

      // ###############################################################
      // init lazy lazy load
      loadImages();

      // ###############################################################
      // update the initial slider position
      currentSliderPos = calcCurrentSliderPos();
      //
      updatePosition();

      // ###############################################################
      // set up to allow transitions
      toggleTransitionClass("add");

      // ###############################################################
      // if swipable, add webkit cursor for grabbing
      if (this_instance_params.swipable && this_instance_params.cursor) {
        css(this_instance_params.sliderInner,"cursor","ew-resize");
        css(this_instance_params.sliderInner,"cursor","-webkit-grab");
        css(this_instance_params.sliderInner,"cursor","-moz-grab");
        css(this_instance_params.sliderInner,"cursor","grab");
      }

      // ###############################################################
      // hide/show next/prev and draw in quicklink indicators
      setUpPaginator();

      // ###############################################################
      // go go go
      setUpInteractions();
      setTimeout(function(){
        trigger("slider_setup_complete");
      },10);
    }

    // ###############################################################
    // Internal Functions

    function a17S(s,c) {
      var r = (c || this_instance_params.sliderContainer).querySelectorAll(s || '☺');
      return (r.length == 1) ? r[0] : r;
    }

    function css(el,p,v) {
      if (typeof p === "object") {
        for (var n in p) {
          el.style[n] = p[n];
        }
        return this;
      } else {
        if (v === undefined) {
          return document.defaultView.getComputedStyle(el,null).getPropertyValue(p);
        } else {
          el.style[p] = v;
          return el;
        }
      }
    }

    function attr(el,a,v) {
      if (v === undefined) {
        return el.getAttribute(a);
      } else {
        el.setAttribute(a,v);
        return el;
      }
    }

    function addClass(el,c) {
      if (el.classList) {
        el.classList.add(c);
      } else {
        el.className += ' ' + c;
      }
    }

    function removeClass(el,c) {
      if (el.classList) {
        el.classList.remove(c);
      } else {
        el.className = el.className.replace(new RegExp('(^|\\b)' + c.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
      }
    }

    function hasClass(el,c) {
      if (el.classList) {
        return el.classList.contains(c);
      } else {
        return new RegExp('(^| )' + c + '( |$)', 'gi').test(el.className);
      }
    }

    function children(el){
      var nodes = el.childNodes;
      var nodes_arr = [];
      Array.prototype.forEach.call(nodes, function(node, i){
        if (node.nodeType === 1) {
          nodes_arr.push(node);
        }
      });
      return nodes_arr;
    }

    function nodeCount(el){
      return children(el).length;
    };

    function trigger(type){
      var event = document.createEvent('HTMLEvents');
      event.initEvent(type, true, true);
      event.data = {
        container: this_instance_params.sliderContainer,
        currentSet: this_instance_params.currentSet
      };
      event.eventName = type;
      this_instance_params.sliderContainer.dispatchEvent(event);
    }

    function calculateMissingLi() {
      // check the amount of LIs, make to a division of this_instance_params.itemsVisible
      // and then keep checking until it is
      for (var i = 1; i <= this_instance_params.itemsVisible; i++) {
        var isEvenTest = totalLi % this_instance_params.itemsVisible;
        if ((isEvenTest * 1) > 0) {
          missing_lis++;
          totalLi++;
        }
      }
    }

    function loadImages() {
      // just loops through the images and fades them in on load
      var elements = a17S("img[data-src]",this_instance_params.sliderInner);
      Array.prototype.forEach.call(elements, function(el, i){
        var newImage = new Image();
        var $this = el;
        //
        newImage.onload = function () {
          if ($this.css("opacity") == 0) {
            $this.css("opacity","1");
          }
        }
        if ($this.attr("src") == "") {
          newImage.src = $this.attr("data-src") || $this.attr("src");
        }
      });
    }

    function updatePosition(pos) {
      try{
        // stopping hangs when an updatePosition is superceeded by a later animation frame
        window.cancelAnimationFrame(animationFrame);
      } catch(err) {}
      if (pos) {
        // used while dragging
        var to = (rtl) ? pos * -1 : pos;
        animationFrame = window.requestAnimationFrame(function(){
          writeLeftPos(to);
        });
      } else {
        // regular moves
        writeLeftPos(currentSliderPos);
      }
    }

    function writeLeftPos(pos) {
      css(this_instance_params.sliderInner,{
        "-webkit-transform": "translateX("+pos+"px)",
        "-moz-transform": "translateX("+pos+"px)",
        "-ms-transform": "translateX("+pos+"px)",
        "transform": "translateX("+pos+"px)"
      });
    }

    function moveSlider(direction) {
      if (!sliderMoving) {
        this_instance_params.sliderInner.style.willChange = 'transform';
        calculateNextPosition(direction);
        sliderMoving = true;
        //
        updatePosition();
        setTimeout(function(){
          this_instance_params.sliderInner.style.willChange = 'auto';
          if (reset) {
            currentSliderPos = calcCurrentSliderPos();
            toggleTransitionClass("remove");
            updatePosition();
            toggleTransitionClass("add");
          }
          sliderMoving = false;
          trigger("slider_moved");
          if (!hovering) {
            auto();
          }
        },this_instance_params.speed + 16);
        //
        trigger("slider_moving");
        //
        updatePaginator();
      }
    }

    function calculateNextPosition(direction) {
      reset = false;
      if (direction == 'right') {
        //
        if (this_instance_params.centered) {
          currentSliderPos -= (this_instance_params.sliderContainer.offsetWidth - slidesWidths[this_instance_params.currentSet - 1])/2;
        }
        if (this_instance_params.slideAmount == "mixed") {
          currentSliderPos -= slidesWidths[this_instance_params.currentSet - 1];
        } else {
          currentSliderPos -= this_instance_params.slideAmount;
        }
        //
        if (this_instance_params.looping && this_instance_params.currentSet == maxSet) {
          reset = true;
          this_instance_params.currentSet = 1;
        } else {
          this_instance_params.currentSet++;
          if (this_instance_params.currentSet == maxSet && missing_lis > 0) {
            currentSliderPos += Math.round(this_instance_params.slideAmount / (this_instance_params.itemsVisible / missing_lis));
          }
        }
        //
        if (this_instance_params.centered) {
          currentSliderPos += (this_instance_params.sliderContainer.offsetWidth - slidesWidths[this_instance_params.currentSet - 1])/2;
        }
        //
      } else if (direction == 'left') {
        if (this_instance_params.centered) {
          currentSliderPos -= (this_instance_params.sliderContainer.offsetWidth - slidesWidths[this_instance_params.currentSet - 1])/2;
        }
        //
        if (this_instance_params.looping && this_instance_params.currentSet == 1) {
          reset = true;
          this_instance_params.currentSet = maxSet;
        } else {
          this_instance_params.currentSet--;
          if (this_instance_params.looping) {
            if (this_instance_params.currentSet == 1 && missing_lis > 0) {
            } else {
              currentSliderPos -= Math.round(this_instance_params.slideAmount / (this_instance_params.itemsVisible / missing_lis));
            }
          } else {
            if (this_instance_params.currentSet == 1 && missing_lis > 0) {
              currentSliderPos -= Math.round(this_instance_params.slideAmount / (this_instance_params.itemsVisible / missing_lis));
            }
          }
        }
        //
        if (this_instance_params.centered) {
          currentSliderPos += (this_instance_params.sliderContainer.offsetWidth - slidesWidths[this_instance_params.currentSet - 1])/2;
        }
        if (this_instance_params.slideAmount == "mixed") {
          currentSliderPos += slidesWidths[this_instance_params.currentSet - 1];
        } else {
          currentSliderPos += this_instance_params.slideAmount;
        }
        //
      } else {
        this_instance_params.currentSet = direction;
        currentSliderPos = calcCurrentSliderPos();
      }
    }

    function calcCurrentSliderPos() {
      var init_pos = 0;
      for (var i = 0; i < this_instance_params.currentSet - 1; i++) {
        init_pos += slidesWidths[i];
      }
      if (this_instance_params.currentSet === maxSet && missing_lis > 0) {
        init_pos -= Math.round(this_instance_params.slideAmount / (this_instance_params.itemsVisible / missing_lis));
      }
      if (this_instance_params.centered) {
        init_pos -= (this_instance_params.sliderContainer.offsetWidth - slidesWidths[this_instance_params.currentSet - 1])/2;
      }
      return this_instance_params.budge + (init_pos * -1);
    }


    function updatePaginator() {
      if (!this_instance_params.looping) {
        addClass(prevBtn,"disabled");
        addClass(nextBtn,"disabled");

        if (this_instance_params.currentSet > 1) {
          removeClass(prevBtn,"disabled");
        }
        if (this_instance_params.scrollBySet) {
          if (this_instance_params.currentSet < maxSet) {
            removeClass(nextBtn,"disabled");
          }
        } else {
          if (this_instance_params.currentSet + this_instance_params.itemsVisible < totalLi + 1) {
            removeClass(nextBtn,"disabled");
          }
        }
      }
      if (this_instance_params.quickLinks) {
        try {
          removeClass(a17S("li.current",this_instance_params.paginator),"current");
        } catch(err) {};
        addClass(a17S("li:nth-child("+this_instance_params.currentSet+")",this_instance_params.paginator),"current");
      }
      // sort visible class out
      Array.prototype.forEach.call(children(this_instance_params.sliderInner), function(slide, i){
        removeClass(slide,"a17s_visible");
      });

      var active_slides_search = "";
      var first_visible = (this_instance_params.currentSet - 1) * this_instance_params.itemsVisible;

      if (this_instance_params.currentSet === maxSet && missing_lis > 0) {
        first_visible -= missing_lis;
      }

      for (var i = 0; i < this_instance_params.itemsVisible; i++) {
        if (i > 0) {
          active_slides_search += ",";
        }
        active_slides_search += "li["+dataAttr+"=\""+(first_visible+i)+"\"]";
      }



      var active_slides = a17S(active_slides_search,this_instance_params.sliderInner);
      if(typeof active_slides.length === 'undefined') {
        active_slides = [active_slides];
      }
      Array.prototype.forEach.call(active_slides, function(slide, i){
        addClass(slide,"a17s_visible");
      });
    }

    function entering() {
      clearTimeout(timer);
      hovering = true;
    }

    function leaving() {
      auto();
      hovering = false;
    }

    function auto() {
      if (this_instance_params.automate && !automationHalted) {
        // if we're automating..
        clearTimeout(timer); // clear the timeout var, so it doesn't bubble itself into a mess
        timer = setTimeout(openNext, this_instance_params.interval); // set the timer again
      }
    }

    function halt_auto() {
      clearTimeout(timer);
      hovering = true;
    }

    function openNext() {
      moveSlider('right');
    }

    function setUpPaginator() {
      if (this_instance_params.currentSet == 1 && maxSet == 1) {
        nextBtn.style.display = "none";
        prevBtn.style.display = "none";
        this_instance_params.paginator.style.display = "none";
        addClass(a17S("li",this_instance_params.sliderInner),"a17s_visible");
      } else {
        if (this_instance_params.quickLinks) {
          var pages = "";
          var loopUntil = (this_instance_params.scrollBySet) ? maxSet : totalLi;
          for (var i = 0; i < loopUntil; i++) {
            if (this_instance_params.quickLinksChar == "bull") {
              pages = pages + '<li><a href="#">&bull;</a></li>';
            } else {
              pages = pages + '<li><a href="#">' + (i + 1) + '</a></li>';
            }
          }
          this_instance_params.paginator.innerHTML = pages + this_instance_params.paginator.innerHTML;
          nextBtn = a17S("li.next a",this_instance_params.paginator);
          prevBtn = a17S("li.prev a",this_instance_params.paginator);
        }
        //
        updatePaginator();
        timer = setTimeout(auto, 50); // set the automatic swap happening
      }
    }

    function setUpInteractions() {
      if (this_instance_params.currentSet == 1 && maxSet == 1) {
        return;
      }
      // ###############
      // mouse events
      // add some events to the slider buttons
      prevBtn.addEventListener("click",function(event) {
        event.preventDefault();
        if (this_instance_params.looping) {
          moveSlider('left');
        } else {
          if (!hasClass(this,"disabled")) {
            moveSlider('left');
          }
        }
      },false);
      nextBtn.addEventListener("click",function(event) {
        event.preventDefault();
        if (this_instance_params.looping) {
          moveSlider('right');
        }
        else {
          if (!hasClass(this,"disabled")) {
            moveSlider('right');
          }
        }
      },false);
      //
      if (this_instance_params.quickLinks) {
        var paginator_btns = a17S("li:not(.next):not(.prev) a",this_instance_params.paginator);
        Array.prototype.forEach.call(paginator_btns, function(a, i){
          a.addEventListener("click",function(event){
            event.preventDefault();
            if (i < maxSet && !hasClass(this.parentNode,"current")) {
              moveSlider(i + 1);
            }
          });
        });
      }
      //
      // if you hover over the slider to read the content, it stops the automatic transition
      this_instance_params.sliderContainer.addEventListener("mouseenter", entering,false);
      // and restarts it when you roll out
      this_instance_params.sliderContainer.addEventListener("mouseleave", leaving,false);
      //
      // ###############
      // add keyboard controls
      if (this_instance_params.keyControls) {
        // on left and right arrow key down, highlight the button as though mouse over
        document.addEventListener("keydown",function (event) {
          switch (event.keyCode) {
            case 37:
              // left arrow
              addClass(prevBtn,"active");
              break;
            case 39:
              // right arrow
              addClass(nextBtn,"active");
              break;
          }
        },false);
        // on left and right arrow key up, un highlight and trigger movement
        document.addEventListener("keyup",function (event) {
          switch (event.keyCode) {
            case 37:
              // move left
              removeClass(prevBtn,"active");
              if (this_instance_params.looping) {
                moveSlider('left');
              } else {
                if (!hasClass(prevBtn,"disabled")) {
                  moveSlider('left');
                }
              }
              break;
            case 39:
              // move right
              removeClass(nextBtn,"active");
              if (this_instance_params.looping) {
                moveSlider('right');
              } else {
                if (!hasClass(nextBtn,"disabled")) {
                  moveSlider('right');
                }
              }
              break;
          }
        });
      }
      //
      // ###############
      // add drag/swipes
      if (this_instance_params.swipable) {
        // mouse events
        this_instance_params.sliderInner.addEventListener("mousedown",function(event){
          event.preventDefault();
          xDown = document.all ? window.event.clientX : event.pageX;
          yDown = document.all ? window.event.clientY : event.pageY;
          onDraggingStart();
        },false);
        document.addEventListener("mousemove",function(event){
          onDragging(
            event,
            (document.all ? window.event.clientX : event.pageX),
            (document.all ? window.event.clientY : event.pageY)
          );
        },false);
        document.addEventListener("mouseup",function(event){
          onDraggingEnd();
        },false);
        this_instance_params.sliderInner.addEventListener("click",function(event){
          if (preventClicks) {
            event.preventDefault();
            event.stopPropagation();
          }
        },false);

        // touch events
        this_instance_params.sliderInner.addEventListener("touchstart",function(event){
          xDown = event.touches[0].clientX;
          yDown = event.touches[0].clientY;
          onDraggingStart();
        },false);
        this_instance_params.sliderInner.addEventListener("touchmove",function(event){
          onDragging(event,event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        });
        this_instance_params.sliderInner.addEventListener("touchend",function(event){
          onDraggingEnd();
        },false);
      }
      //
      // ###############
      // watch for focus events
      Array.prototype.forEach.call(slides, function(slide, i){
        var slide_links = slide.querySelectorAll("a");
        Array.prototype.forEach.call(slide_links, function(link, i){
          link.addEventListener("focus",function(event){
            this_instance_params.sliderContainer.scrollLeft = 0;
            // oh webkit!
            setTimeout(function() {
              this_instance_params.sliderContainer.scrollLeft = 0;
            }, 0);
            // stop automation
            clearTimeout(timer);
            // jump to focussed position
            var position_focussed = parseInt(attr(slide,dataAttr)) || -1;
            if (position_focussed) {
              if (this_instance_params.itemsVisible > 1) {
                position_focussed = Math.floor(position_focussed/this_instance_params.itemsVisible);
              }
              moveSlider(position_focussed + 1);
            }
          });
        });
      });
    }

    function toggleTransitionClass(action){
      var redraw = this_instance_params.sliderInner.offsetHeight; // bash
      if (action === "add") {
        addClass(this_instance_params.sliderInner,"a17s_transition");
      } else {
        removeClass(this_instance_params.sliderInner,"a17s_transition");
      }
      var redraw = this_instance_params.sliderInner.offsetHeight; // bash
    }

    function onDraggingStart() {
      toggleTransitionClass("remove");
      dragging = true;
      halt_auto();
      if (this_instance_params.cursor) {
        css(this_instance_params.sliderInner,"cursor","ew-resize");
        css(this_instance_params.sliderInner,"cursor","-webkit-grabbing");
        css(this_instance_params.sliderInner,"cursor","-moz-grabbing");
        css(this_instance_params.sliderInner,"cursor","grabbing");
      }
    }

    function onDragging(event,xUp,yUp) {
      if (dragging) {
        if (!xDown || !yDown) {
          return;
        }
        //
        xDiff = xDown - xUp;
        yDiff = yDown - yUp;
        // horizontal or vertical swipe */
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
          event.preventDefault();
          preventClicks = true;
          if (xDiff > 0) {
            if (hasClass(nextBtn,"disabled")) {
              xDiff = rubberBand(xDiff);
            }
            // left swipe
            updatePosition(currentSliderPos-xDiff);
          } else if (xDiff < 0) {
            if (hasClass(prevBtn,"disabled")) {
              xDiff = rubberBand(xDiff);
            }
            // right swipe
            updatePosition(currentSliderPos-xDiff);
          }
        } else {
          return;
        }
      }
    }

    function onDraggingEnd() {
      if (dragging) {
        dragging = false;
        setTimeout(function(){
          preventClicks = false;
        },10);
        toggleTransitionClass("add");
        if (this_instance_params.cursor) {
          css(this_instance_params.sliderInner,"cursor","ew-resize");
          css(this_instance_params.sliderInner,"cursor","-webkit-grab");
          css(this_instance_params.sliderInner,"cursor","-moz-grab");
          css(this_instance_params.sliderInner,"cursor","grab");
        }
        if (!xDown || !yDown || xDiff === undefined || yDiff === undefined) {
          return;
        }
        if (Math.abs(xDiff) > Math.abs(yDiff)) {
          if (Math.abs(xDiff) <= this_instance_params.swipeThreshold) {
            // didn't swipe far enough - reset
            updatePosition();
            auto();
          } else {
            if (xDiff > this_instance_params.swipeThreshold && !hasClass(nextBtn,"disabled")) {
              // left swipe beyond threshold
              moveSlider('right');
            } else if (xDiff < (this_instance_params.swipeThreshold * -1) && !hasClass(prevBtn,"disabled")) {
              // right swipe beyond threshold
              moveSlider('left');
            } else {
              // next/prev button disabled, reset
              updatePosition();
              auto();
            }
          }
        }
        resetDragVars();
      }
    }

    function resetDragVars() {
      xDown = undefined;
      yDown = undefined;
      xDiff = undefined;
      yDiff = undefined;
    }

    function tabIndexMinus1(node) {
      Array.prototype.forEach.call(node.querySelectorAll("a"), function(node, i){
        node.tabIndex = -1;
      });
    }

    function rubberBand(diff) {
      var ratio = Math.abs(diff) / 75;
      var factor = 1 / (ratio + 1);
      return diff * factor;
    }

    // ###############################################################
    // Methods
    this_instance.move = function(direction){
      moveSlider(direction);
    };
    this_instance.currentSet = function() {
      return defaults.currentSet;
    };
    this_instance.maxSet = function() {
      return maxSet;
    };
    this_instance.destroy = function() {
      this_instance_params.sliderContainer.removeEventListener("mouseenter", entering);
      this_instance_params.sliderContainer.removeEventListener("mouseleave", leaving);

      this_instance_params.sliderContainer.innerHTML = original_node;
      delete this_instance["move"];
      delete this_instance["currentSet"];
      delete this_instance["destroy"];
      trigger("slider_destroyed");
      this_instance = null;
    };
    this_instance.automationHalt = function() {
      automationHalted = true;
      halt_auto();
    }
    this_instance.automationResume = function() {
      automationHalted = false;
      auto();
    }

    init();

    return this_instance;

  };

  if (typeof exports !== 'undefined') {
    // Node.js
    module.exports = a17_carousel;
  } else {
    // Browser
    window.a17_carousel = a17_carousel;
  }

})();
