var Point = (function () {

  function Point(x, y) {
    this.x = x || 0;
    this.y = y || 0;
  }

  Point.prototype = {
    clone: function () {
      return new Point(this.x, this.y);
    }
  };

  return Point;

}());

var CanvasHelper = (function () {

  function CanvasHelper($canvas) {
    this.canvas = $canvas;
    this.width = this.canvas[0].width;
    this.height = this.canvas[0].height;
    this.ctx = this.canvas[0].getContext("2d");
    this.pointMapper = function (point) {
      return point.clone();
    };
  }

  CanvasHelper.prototype = {
    clear: function () {
      this.ctx.clearRect(0, 0, this.width, this.height);
    },
    line: function (from, to, lineDash) {
      from = this.pointMapper(from);
      to = this.pointMapper(to);

      this.ctx.save();
      this.ctx.beginPath();
      if (lineDash) {
        this.ctx.setLineDash(lineDash);
      }
      this.ctx.moveTo(from.x, from.y);
      this.ctx.lineTo(to.x, to.y);
      this.ctx.stroke();
      this.ctx.restore();
    },
    point: function (center, radius) {
      center = this.pointMapper(center);

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI, false);
      this.ctx.fillStyle = "black";
      this.ctx.fill();
      this.ctx.restore();
    },
    rectangle: function (from, sizeX, sizeY) {
      from = this.pointMapper(from);

      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(from.x, from.y, sizeX, sizeY);
      this.ctx.fillStyle = "black";
      this.ctx.fill();
      this.ctx.restore();
    }
  };

  return CanvasHelper;

}());

var DragHandler = (function () {

  function DragHandler($elem, $container) {
    this.elem = $elem;
    this.container = $container || $(document);

    this.onChange = function (dx, dy) {};
    this._onDown = $.proxy(this.onDown, this);
    this._onMove = $.proxy(this.onMove, this);
    this._onUp = $.proxy(this.onUp, this);

    this.lastX = null;
    this.lastY = null;
    this.isEngaged = false;
  }

  DragHandler.prototype = {
    attach: function () {
      this.elem.on("mousedown", this._onDown);
      this.container.on("mousemove", this._onMove);
      this.container.on("mouseup mouseleave", this._onUp);

      this.elem.on("touchstart", this._onDown);
      this.container.on("touchmove", this._onMove);
      this.container.on("touchend touchcancel", this._onUp);
    },
    detach: function () {
      this.elem.off("mousedown", this._onDown);
      this.container.off("mousemove", this._onMove);
      this.container.off("mouseup mouseleave", this._onUp);

      this.elem.off("touchstart", this._onDown);
      this.container.off("touchmove", this._onMove);
      this.container.off("touchend touchcancel", this._onUp);
    },
    pointerEventToXY: function (e) {
      var out = {x: 0, y: 0};
      if (e.type === "touchstart" || e.type === "touchmove" || e.type === "touchend" || e.type === "touchcancel") {
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        out.x = touch.pageX;
        out.y = touch.pageY;
      } else if (e.type === "mousedown" || e.type === "mouseup" || e.type === "mousemove" || e.type === "mouseover" || e.type === "mouseout" || e.type === "mouseenter" || e.type === "mouseleave") {
        out.x = e.pageX;
        out.y = e.pageY;
      }
      return out;
    },
    onDown: function (e) {
      e.preventDefault();
      var eventXY = this.pointerEventToXY(e);
      this.lastX = eventXY.x;
      this.lastY = eventXY.y;
      this.isEngaged = true;
    },
    onMove: function (e) {
      if (!this.isEngaged) {
        return;
      }
      e.preventDefault();
      var eventXY = this.pointerEventToXY(e);
      var currX = eventXY.x;
      var currY = eventXY.y;
      var dx = currX - this.lastX;
      var dy = currY - this.lastY;

      if (this.onChange) {
        this.onChange(dx, dy);
      }

      this.lastX = currX;
      this.lastY = currY;
    },
    onUp: function (e) {
      if (!this.isEngaged) {
        return;
      }
      e.preventDefault();
      this.isEngaged = false;
    }
  };

  return DragHandler;

}());

var ClassUtil = (function () {

  function ClassUtil() {

  }

  ClassUtil.prototype = {
    extend: function (subClass, superClass) {
      var subClassPrototype;

      subClassPrototype = {};
      this.extendPrototype(subClassPrototype, superClass.prototype);
      this.extendPrototype(subClassPrototype, subClass.prototype);
      subClassPrototype.constructor = subClass;

      subClass.prototype = subClassPrototype;
    },
    extendPrototype: function (targetPrototype, objectPrototype) {
      var descriptor, getter, setter;

      for (var key in objectPrototype) {
        if (objectPrototype.hasOwnProperty(key)) {
          descriptor = Object.getOwnPropertyDescriptor(objectPrototype, key);
          getter = descriptor.get;
          setter = descriptor.set;
          if (getter || setter) {
            Object.defineProperty(targetPrototype, key, {
              get: getter,
              set: setter,
              enumerable: true
            });
          } else {
            targetPrototype[key] = objectPrototype[key];
          }
        }
      }
    }

  };

  return new ClassUtil();

}());

var Lens = (function () {
  function Lens() {
    this.lensFocus;
    this.arrowX;
  }

  Lens.prototype = {
    drawPrincipleRays: function (canvasHelper) {

    },
    drawPrincipalRay2: function () {
      // arrow through lens center
      // y = (-h/a) x
      var x = this.width;
      var y = (-this.arrowHeight / this.arrowX) * x;
      this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(x, y));

      // virtual ray
      var x = -this.width;
      var y = (-this.arrowHeight / this.arrowX) * x;
      this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(x, y), [5]);
    },
    getCoordinates: function () {

    }

  };
  return Lens;
}());

var OpticsExperiment = (function () {
  function OpticsExperiment() {

    this.canvas = $("#myCanvas");
    this.container = $("#container");
    this.realArrow = $("#real_arrow");
    this.imageArrow = $("#image_arrow");
    this.lens = $("#lens");

    this.height = this.canvas[0].height;
    this.width = this.canvas[0].width;
    this.arrowWidth = this.realArrow.width();
    this.arrowHeight = this.realArrow.height();
    this.mirrorWidth = this.lens.width();
    this.mirrorHeight = this.lens.height();

    this.container.css({width: this.width, height: this.height});
    this.canvas.css({width: this.width, height: this.height});

    this.halfWidth = this.width / 2;
    this.halfHeight = this.height / 2;

    // center mirror on screen
    this.lens.css({top: this.halfHeight});
    this.lens.css({left: this.halfWidth});

    this.lensFocus;
    this.arrowX;
    this.clickConvex = false;
    this.clickConcave = false;
    this.clickConcaveMirror = false;
    this.clickConvexMirror = false;
    this.canvasHelper;
    this.lensq;
    this.lensDragHandler;
    this.arrowDragHandler;
  }

  OpticsExperiment.prototype = {
    initialize: function () {
      this.lensFocus = 100;
      this.arrowX = 200;

      $("#image_arrow").hide();

      this.canvasHelper = new CanvasHelper(this.canvas);
      this.lensq = new Lens();
      this.canvasHelper.pointMapper = $.proxy(this.toAbsoluteCoordinates, this);

      this.updatePhysics();
      this.controls();
      this.attachDragHandlers();
      this.attachFocusChangeHandlers();

      this.arrowHeightProperties(new Point(this.arrowX + this.arrowWidth / 2, 0).x, new Point(0, 4).y);
      this.createDiv(new Point(0, 0).x, new Point(0, -4).y);
      this.arrowDistanceProperties(new Point(0, 0).x, new Point(0, -30).y);

    },
    updatePhysics: function () {
      this.positionArrow();

      // clear canvas
      this.canvasHelper.clear();

      // draw focus points
      this.canvasHelper.point(new Point(-this.lensFocus, 0), 3);
      this.canvasHelper.point(new Point(this.lensFocus, 0), 3);

      // draw center point
      this.canvasHelper.point(new Point(0, 0), 3);

      if (this.clickConvex) {
        this.convexLens();
      }
      if (this.clickConcave) {
        this.concaveLens();
      }
      if (this.clickConcaveMirror) {
        this.concaveMirror();
      }
      if (this.clickConvexMirror) {
        this.convexMirror();
      }
    },
    convexLens: function () {
      this.drawPrincipalRay1();
      this.drawPrincipalRay2();
      this.drawPrincipalRay3();
      this.drawIntersectionPoint();
      this.updateImageArrow();
    },
    concaveLens: function () {
      this.drawConcaveRay1();
      this.drawPrincipalRay2();
      this.concaveUpdateImageArrow();
      this.drawConcaveIntersectionPoint();
    },
    concaveMirror: function () {
      this.drawConcaveMirrorRay1();
      this.drawConcaveMirrorRay2();
      this.drawConcaveMirrorIntersectionPoint();
      this.concaveMirrorUpdateImageArrow();
    },
    convexMirror: function () {
      this.drawConvexMirrorRay1();
      this.drawConvexMirrorRay2();
      this.drawConvexMirrorIntersectionPoint();
      this.convexMirrorUpdateImageArror();
    },
    toAbsoluteCoordinates: function (point) {
      var canvasPoint = point.clone();
      canvasPoint.x += this.halfWidth;
      canvasPoint.y += this.halfHeight;
      canvasPoint.y = this.height - canvasPoint.y;
      return canvasPoint;
    },
    positionArrow: function () {
      var arrowPos = this.toAbsoluteCoordinates(new Point(-this.arrowX, 0));

      this.realArrow.css({
        bottom: arrowPos.y,
        left: arrowPos.x
      });
      
      $("#arrowx_slider").css({
        left:arrowPos.x
      });
    },
    drawConvexMirrorRay1: function () {
      this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(0, this.arrowHeight));

      x = -this.width;
      y = -((this.arrowHeight / this.lensFocus) * x) + this.arrowHeight;
      this.canvasHelper.line(new Point(0, this.arrowHeight), new Point(x, y));
      //y = -(h/f)*x+h
      x = this.width;
      y = -((this.arrowHeight / this.lensFocus) * x) + this.arrowHeight;
      this.canvasHelper.line(new Point(0, this.arrowHeight), new Point(x, y), [5]);
    },
    drawConvexMirrorRay2: function () {
      this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(0, 0));

      //y = -(-h/a)*x
      var x = -this.width;
      var y = -(-this.arrowHeight / this.arrowX) * x;
      this.canvasHelper.line(new Point(0.0), new Point(-x, -y), [5]);

      this.canvasHelper.line(new Point(0.0), new Point(x, y));
    },
    drawConvexMirrorIntersectionPoint: function () {
      var x = (this.arrowX * this.lensFocus) / (this.arrowX + this.lensFocus);
      var y = (this.arrowHeight * -this.lensFocus) / -(this.arrowX + this.lensFocus);
      this.canvasHelper.point(new Point(x, y), 3);
    },
    drawConcaveMirrorRay1: function () {
      // arrow to lens, parallel
      this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(0, this.arrowHeight));

      // lens through focus
      // y = (h/f) x  + h
      x = -this.width;
      y = ((this.arrowHeight / this.lensFocus) * x) + this.arrowHeight;
      this.canvasHelper.line(new Point(0, this.arrowHeight), new Point(x, y));

      x = this.width;
      y = ((this.arrowHeight / this.lensFocus) * x) + this.arrowHeight;
      this.canvasHelper.line(new Point(0, this.arrowHeight), new Point(x, y), [5]);
    },
    drawConcaveMirrorRay2: function () {
      // arrow through focus to lens
      // y = (-h/(a-f)) x - (h f)/(a-f)
      var y = -(this.arrowHeight * this.lensFocus) / (this.arrowX - this.lensFocus);
      this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(0, y));

      if (this.arrowX < this.lensFocus) {
        this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(-this.lensFocus, 0), [5]);
      }

      // lens parallel
      this.canvasHelper.line(new Point(0, y), new Point(-this.width, y));

      this.canvasHelper.line(new Point(0, y), new Point(this.width, y), [5]);
    },
    drawConcaveMirrorIntersectionPoint: function () {
      var x = -(this.arrowX * this.lensFocus) / (this.arrowX - this.lensFocus);
      var y = (this.arrowHeight * this.lensFocus) / -(this.arrowX - this.lensFocus);
      this.canvasHelper.point(new Point(x, y), 3);
    },
    drawConcaveRay1: function () {
      // arrow to lens, parallel
      this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(0, this.arrowHeight));

      // lens through focus
      // y = (h/f) x  + h
      var x = this.width;
      var y = ((this.arrowHeight / this.lensFocus) * x) + this.arrowHeight;
      this.canvasHelper.line(new Point(0, this.arrowHeight), new Point(x, y));

      // virtural ray
      x = -this.width;
      y = ((this.arrowHeight / this.lensFocus) * x) + this.arrowHeight;
      this.canvasHelper.line(new Point(0, this.arrowHeight), new Point(x, y), [5]);
    },
    drawConcaveIntersectionPoint: function () {
      var x = -(this.arrowX * this.lensFocus) / (this.arrowX + this.lensFocus);
      var y = (this.arrowHeight * this.lensFocus) / (this.arrowX + this.lensFocus);
      this.canvasHelper.point(new Point(x, y), 3);
    },
    drawPrincipalRay1: function () {
      // arrow to lens, parallel
      this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(0, this.arrowHeight));

      if (this.arrowX < this.lensFocus) {
        this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(-this.lensFocus, 0), [5]);
      }
      // lens through focus
      // y = (-h/f) x  + h
      var x = this.width;
      var y = ((-this.arrowHeight / this.lensFocus) * x) + this.arrowHeight;
      this.canvasHelper.line(new Point(0, this.arrowHeight), new Point(x, y));

      // virtural ray
      x = -this.width;
      y = ((-this.arrowHeight / this.lensFocus) * x) + this.arrowHeight;
      this.canvasHelper.line(new Point(0, this.arrowHeight), new Point(x, y), [5]);
    },
    drawPrincipalRay2: function () {
      // arrow through lens center
      // y = (-h/a) x
      var x = this.width;
      var y = (-this.arrowHeight / this.arrowX) * x;
      this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(x, y));

      // virtual ray
      var x = -this.width;
      var y = (-this.arrowHeight / this.arrowX) * x;
      this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(x, y), [5]);
    },
    drawPrincipalRay3: function () {
      // arrow through focus to lens
      // y = (-h/(a-f)) x - (h f)/(a-f)
      var y = -(this.arrowHeight * this.lensFocus) / (this.arrowX - this.lensFocus);
      this.canvasHelper.line(new Point(-this.arrowX, this.arrowHeight), new Point(0, y));

      // lens parallel
      this.canvasHelper.line(new Point(0, y), new Point(this.width, y));

      // virtual ray
      this.canvasHelper.line(new Point(0, y), new Point(-this.width, y), [5]);
    },
    drawIntersectionPoint: function () {
      var x = (this.arrowX * this.lensFocus) / (this.arrowX - this.lensFocus);
      var y = -(this.arrowHeight * this.lensFocus) / (this.arrowX - this.lensFocus);
      this.canvasHelper.point(new Point(x, y), 3);
    },
    updateImageArrow: function () {
      var x = (this.arrowX * this.lensFocus) / (this.arrowX - this.lensFocus);
      var y = -(this.arrowHeight * this.lensFocus) / (this.arrowX - this.lensFocus);
      var scale = y / this.arrowHeight;

      var arrowPos = this.toAbsoluteCoordinates(new Point(x, 0));

      this.imageArrow.css({
        bottom: arrowPos.y,
        left: arrowPos.x,
        transform: "scale(" + scale.toFixed(2) + ")",
        opacity: 0.5
      });
    },
    concaveUpdateImageArrow: function () {
      var x = -(this.arrowX * this.lensFocus) / (this.arrowX + this.lensFocus);
      var y = (this.arrowHeight * this.lensFocus) / (this.arrowX + this.lensFocus);

      var scale = y / this.arrowHeight;

      var arrowPos = this.toAbsoluteCoordinates(new Point(x, 0));

      this.imageArrow.css({
        bottom: arrowPos.y,
        left: arrowPos.x,
        transform: "scale(" + scale.toFixed(2) + ")",
        opacity: 0.5
      });
    },
    concaveMirrorUpdateImageArrow: function () {
      var x = -(this.arrowX * this.lensFocus) / (this.arrowX - this.lensFocus);
      var y = (this.arrowHeight * this.lensFocus) / -(this.arrowX - this.lensFocus);

      var scale = y / this.arrowHeight;

      var arrowPos = this.toAbsoluteCoordinates(new Point(x, 0));

      this.imageArrow.css({
        bottom: arrowPos.y,
        left: arrowPos.x,
        transform: "scale(" + scale.toFixed(2) + ")",
        opacity: 0.5
      });
    },
    convexMirrorUpdateImageArror: function () {
      var x = (this.arrowX * this.lensFocus) / (this.arrowX + this.lensFocus);
      var y = (this.arrowHeight * -this.lensFocus) / -(this.arrowX + this.lensFocus);

      var scale = y / this.arrowHeight;

      var arrowPos = this.toAbsoluteCoordinates(new Point(x, 0));

      this.imageArrow.css({
        bottom: arrowPos.y,
        left: arrowPos.x,
        transform: "scale(" + scale.toFixed(2) + ")",
        opacity: 0.5
      });
    },
    attachDragHandlers: function () {
      this.arrowDragHandler = new DragHandler(this.realArrow, this.container);
      this.arrowDragHandler.onChange = $.proxy(function (dx, dy) {
        this.arrowX -= dx;
        this.arrowX = Math.min(Math.max(this.arrowX, 0), this.halfWidth);
        this.updatePhysics();

        var arrowheight = $("#arrowHeight");
        var arrowh = $("#arrowh");
        var arrow = $("#arrowDistance");
        var arrowd = $("#arrowD");

        var arrowPosBar = this.toAbsoluteCoordinates(new Point(this.arrowX + 30, 0));

        this.arrowHeightPosition(arrowheight, arrowh, arrowPosBar.x);

        this.arrowDistance(arrow, arrowd);

      }, this);
      this.arrowDragHandler.attach();
      
      this.arrowDragHandler = new DragHandler($("#arrowx_slider"), $("#slider"));
      this.arrowDragHandler.onChange = $.proxy(function (dx, dy) {
        this.arrowX -= dx;
        this.arrowX = Math.min(Math.max(this.arrowX, 0), this.halfWidth);
        this.updatePhysics();

        var arrowheight = $("#arrowHeight");
        var arrowh = $("#arrowh");
        var arrow = $("#arrowDistance");
        var arrowd = $("#arrowD");

        var arrowPosBar = this.toAbsoluteCoordinates(new Point(this.arrowX + 30, 0));

        this.arrowHeightPosition(arrowheight, arrowh, arrowPosBar.x);

        this.arrowDistance(arrow, arrowd);

      }, this);
      this.arrowDragHandler.attach();
    },
    attachFocusChangeHandlers: function () {
      this.lensDragHandler = new DragHandler(this.lens, this.container);
      this.lensDragHandler.onChange = $.proxy(function (dx, dy) {
        this.lensFocus -= dx;
        this.lensFocus = Math.min(Math.max(this.lensFocus, 0), this.halfWidth);

        var fractionBar = $("#fraction_bar");
        var fraction_left = $("#fraction_left");
        var fractionBarRight = $("#fraction_bar_Right");
        var fraction_right = $("#fraction_right");

        this.fractionsOptions(fractionBar, fraction_left);
        this.fractionsOptions(fractionBarRight, fraction_right);

        this.updatePhysics();
      }, this);
      this.lensDragHandler.attach();
      
       this.lensDragHandler = new DragHandler($("#fractionX_slider"), $("#slider2"));
      this.lensDragHandler.onChange = $.proxy(function (dx, dy) {
        this.lensFocus -= dx;
        this.lensFocus = Math.min(Math.max(this.lensFocus, 0), this.halfWidth);

        var fractionBar = $("#fraction_bar");
        var fraction_left = $("#fraction_left");
        var fractionBarRight = $("#fraction_bar_Right");
        var fraction_right = $("#fraction_right");

        this.fractionsOptions(fractionBar, fraction_left);
        this.fractionsOptions(fractionBarRight, fraction_right);

        this.updatePhysics();
      }, this);
           
      this.lensDragHandler.attach();
      
    },
    controls: function () {
      $("#kalinkenarli").click($.proxy(function () {
        this.clickConvex = true;
        this.clickConcave = false;
        this.clickConcaveMirror = false;
        this.clickConvexMirror = false;
        this.lens.css("background-image", "url(IMG/aynalar_1.png)");
        $("#image_arrow").show();
        $("#kalinkenarli").addClass("active");
        $("#incekenarli").removeClass("active");
        $("#cukurayna").removeClass("active");
        $("#tumsekayna").removeClass("active");
        this.updatePhysics();

      }, this));

      $("#incekenarli").click($.proxy(function () {
        this.clickConcave = true;
        this.clickConvex = false;
        this.clickConcaveMirror = false;
        this.clickConvexMirror = false;
        this.lens.css("background-image", "url(IMG/aynalar_3.png)");
        $("#image_arrow").show();
        $("#incekenarli").addClass("active");
        $("#kalinkenarli").removeClass("active");
        $("#cukurayna").removeClass("active");
        $("#tumsekayna").removeClass("active");
        this.updatePhysics();
      }, this));

      $("#cukurayna").click($.proxy(function () {
        this.clickConcaveMirror = true;
        this.clickConvexMirror = false;
        this.clickConcave = false;
        this.clickConvex = false;
        this.lens.css("background-image", "url(IMG/aynalar_2.png)");
        $("#image_arrow").show();
        $("#cukurayna").addClass("active");
        $("#incekenarli").removeClass("active");
        $("#kalinkenarli").removeClass("active");
        $("#tumsekayna").removeClass("active");
        this.updatePhysics();
      }, this));

      $("#tumsekayna").click($.proxy(function () {
        this.clickConvexMirror = true;
        this.clickConcaveMirror = false;
        this.clickConcave = false;
        this.clickConvex = false;
        this.lens.css("background-image", "url(IMG/aynalar_4.png)");
        $("#image_arrow").show();
        $("#tumsekayna").addClass("active");
        $("#incekenarli").removeClass("active");
        $("#kalinkenarli").removeClass("active");
        $("#cukurayna").removeClass("active");
        this.updatePhysics();
      }, this));
    },
    createDiv: function (positionX, positionY) {

      var fractionBar = $("#fraction_bar");
      var fraction_left = $("#fraction_left");
      var fractionBarRight = $("#fraction_bar_Right");
      var fraction_right = $("#fraction_right");

      var arrowPosBar = this.toAbsoluteCoordinates(new Point(positionX, positionY));

      this.fractionsProperties(fractionBar, fraction_left, arrowPosBar.x, arrowPosBar.y, "right");
      this.fractionsProperties(fractionBarRight, fraction_right, arrowPosBar.x, arrowPosBar.y, "left");
    },
    fractionsOptions: function (fraction, fraction_point) {

      fraction.css({
        width: this.lensFocus - 2
      });

      fraction_point.css({
        left: fraction.width() / 2
      });
    },
    fractionsProperties: function (fraction, fraction_point, posX, posY, side) {

      fraction.css({
        top: posY,
        width: this.lensFocus - 2,
        height: 10
      });

      if (side === "right") {
        fraction.css({
          right: posX
        });
      } else {
        fraction.css({
          left: posX
        });
      }
      fraction_point.css({
        top: 10,
        left: fraction.width() / 2
      });
    },
    arrowHeightProperties: function (posX, posY) {
      var arrowheight = $("#arrowHeight");
      var arrowh = $("#arrowh");

      var arrowPosBar = this.toAbsoluteCoordinates(new Point(posX, posY));

      arrowheight.css({
        width: 10,
        height: this.arrowHeight,
        right: arrowPosBar.x - 10,
        bottom: arrowPosBar.y + 5
      });

      this.arrowHeightPosition(arrowheight, arrowh, arrowPosBar.x, this.arrowHeight);
    },
    arrowHeightPosition: function (arrowheight, arrowh, posX, height) {
      arrowheight.css({
        height: height,
        right: posX - 10
      });

      arrowh.css({
        top: (arrowheight.height() / 2) - 5,
        left: -15
      });
    },
    arrowDistanceProperties: function (positionX, positionY) {
      var arrowDistance = $("#arrowDistance");
      var arrowD = $("#arrowD");

      var arrowPosBar = this.toAbsoluteCoordinates(new Point(positionX, positionY));

      this.arrowDistanceOptions(arrowDistance, arrowD, arrowPosBar.x, arrowPosBar.y);
    },
    arrowDistance: function (arrow, arrowd) {
      arrow.css({
        width: this.arrowX
      });
      arrowd.css({
        left: arrow.width() / 2
      });
    },
    arrowDistanceOptions: function (arrow, arrowd, posX, posY) {

      arrow.css({
        top: posY,
        width: this.arrowX,
        height: 10,
        right: posX
      });

      arrowd.css({
        top: 10,
        left: arrow.width() / 2
      });
    }
  };

  return OpticsExperiment;

}());

var opticsExperiment;
$(function () {
  opticsExperiment = new OpticsExperiment();
  opticsExperiment.initialize();
});
