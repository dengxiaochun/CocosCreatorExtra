window.__require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var b = o.split("/");
        b = b[b.length - 1];
        if (!t[b]) {
          var a = "function" == typeof __require && __require;
          if (!u && a) return a(b, !0);
          if (i) return i(b, !0);
          throw new Error("Cannot find module '" + o + "'");
        }
      }
      var f = n[o] = {
        exports: {}
      };
      t[o][0].call(f.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, f, f.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof __require && __require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  Main: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "02120KqhY5Ep4P34ojfwAck", "Main");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property;
    var Main = function(_super) {
      __extends(Main, _super);
      function Main() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.scenelist = [];
        return _this;
      }
      Main.prototype.getSceneName = function(search) {
        var scene = "";
        var reg = /\?scene=(\w+)/;
        reg.test(search) && (scene = reg.exec(search)[1]);
        return scene;
      };
      Main.prototype.start = function() {
        var scene = this.getSceneName(document.location.search);
        scene && cc.director.loadScene(scene);
      };
      __decorate([ property(String) ], Main.prototype, "scenelist", void 0);
      Main = __decorate([ ccclass ], Main);
      return Main;
    }(cc.Component);
    exports.default = Main;
    cc._RF.pop();
  }, {} ],
  ScrollViewExtra: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c7b94eoVSFBLbC4iEe5d+bZ", "ScrollViewExtra");
    Object.defineProperty(exports, "__esModule", {
      value: true
    });
    var _a = cc._decorator, ccclass = _a.ccclass, property = _a.property, requireComponent = _a.requireComponent;
    var ScrollViewExtra = function(_super) {
      __extends(ScrollViewExtra, _super);
      function ScrollViewExtra() {
        var _this = null !== _super && _super.apply(this, arguments) || this;
        _this.extraScrollChildIndex = true;
        _this.extraScrollBar = true;
        _this.nowOffsetY = 0;
        _this.selectChildren = [];
        _this.selectChildIndex = 0;
        return _this;
      }
      ScrollViewExtra.prototype.newEventHandler = function(target, component, handler) {
        var e = new cc.Component.EventHandler();
        e.target = target;
        e.component = component;
        e.handler = handler;
        return e;
      };
      ScrollViewExtra.prototype.addScrollChildIndex = function() {
        this.node.off(cc.Node.EventType.MOUSE_WHEEL);
        var scroll = this.node.getComponent(cc.ScrollView);
        scroll.scrollEvents.push(this.newEventHandler(this.node, "ScrollViewExtra", "onScrollEvent"));
        this.nowOffsetY = scroll.getScrollOffset().y;
        var children = scroll.content.children;
        for (var i = 1; i < children.length - 1; i++) this.selectChildren[i - 1] = children[i];
        cc.log(this.selectChildren);
        this.setSelectChildIndex(0);
      };
      ScrollViewExtra.prototype.addScrollBarExtra = function() {
        var _this = this;
        var scroll = this.node.getComponent(cc.ScrollView);
        var scrollnode = this.node;
        scrollnode._bubblingListeners = scrollnode._capturingListeners;
        scrollnode._capturingListeners = void 0;
        var scrollbar = scroll.verticalScrollBar;
        var touching = false;
        var handlenode = scrollbar.handle.node;
        function getMoveInterval(node, parent) {
          var handlesize = node.getContentSize();
          var parentSize = parent.getContentSize();
          var maxY = 0, minY = 0;
          if (parentSize.height > handlesize.height) {
            maxY = parentSize.height / 2 - handlesize.height;
            minY = -parentSize.height / 2;
          }
          return {
            minY: minY,
            maxY: maxY
          };
        }
        handlenode.on(cc.Node.EventType.TOUCH_START, function(e) {
          touching = true;
          e.stopPropagation();
        });
        handlenode.on(cc.Node.EventType.TOUCH_MOVE, function(e) {
          var node = e.target;
          var _a = getMoveInterval(node, node.parent), minY = _a.minY, maxY = _a.maxY;
          node.y += e.getDelta().y;
          node.y > maxY ? node.y = maxY : node.y < minY && (node.y = minY);
          e.stopPropagation();
          var p = (node.y - minY) / (maxY - minY);
          scroll.scrollToPercentVertical(p);
          _this.extraScrollChildIndex && _this.scrolling(scroll);
        });
        handlenode.on(cc.Node.EventType.TOUCH_END, function(e) {
          touching = false;
          e.stopPropagation();
          _this.extraScrollChildIndex && _this.scrollToOffset(scroll);
        });
        handlenode.on(cc.Node.EventType.TOUCH_CANCEL, function(e) {
          touching = false;
          e.stopPropagation();
          _this.extraScrollChildIndex && _this.scrollToOffset(scroll);
        });
      };
      ScrollViewExtra.prototype.start = function() {
        this.extraScrollChildIndex && this.addScrollChildIndex();
        this.extraScrollBar && this.addScrollBarExtra();
      };
      ScrollViewExtra.prototype.getScrollChildOffset = function(scroll) {
        var height = 33;
        var maxoffset = scroll.getMaxScrollOffset().y;
        var offset = scroll.getScrollOffset().y;
        if (offset < 0) return 0;
        if (offset > maxoffset) return maxoffset;
        var o = 0;
        var o2 = height;
        var i = 0;
        while (true) {
          if (Math.abs(o - offset) < Math.abs(o2 - offset)) {
            this.selectChildIndex = i;
            return o;
          }
          o += height;
          o2 += height;
          i++;
        }
      };
      ScrollViewExtra.prototype.setSelectChildIndex = function(idx) {
        for (var i = 0; i < this.selectChildren.length; i++) this.selectChildren[i].opacity = idx === i ? 255 : 76.5;
      };
      ScrollViewExtra.prototype.scrolling = function(scroll) {
        var height = 33;
        var maxoffset = scroll.getMaxScrollOffset().y;
        var offset = scroll.getScrollOffset().y;
        if (offset <= 0) return this.setSelectChildIndex(0);
        if (offset >= maxoffset) return this.setSelectChildIndex(this.selectChildren.length - 1);
        var o = 0;
        var o2 = height;
        var i = 0;
        while (true) {
          if (offset >= o && offset < o2) {
            var op = (offset - o) / height;
            this.selectChildren[i].opacity = 255 * Math.max(1 - op, .3);
            this.selectChildren[i + 1].opacity = 255 * Math.max(op, .3);
            return;
          }
          o += height;
          o2 += height;
          i++;
        }
      };
      ScrollViewExtra.prototype.onScrollEvent = function(scroll, scrollType) {
        scrollType === cc.ScrollView.EventType.SCROLL_ENDED ? this.scrollToOffset(scroll) : scrollType === cc.ScrollView.EventType.SCROLLING && this.scrolling(scroll);
      };
      ScrollViewExtra.prototype.scrollToOffset = function(scroll) {
        var offset = this.getScrollChildOffset(scroll);
        var scrollOffset = scroll.getScrollOffset();
        if (Math.abs(this.nowOffsetY - scrollOffset.y) < .01) return this.setSelectChildIndex(this.selectChildIndex);
        this.nowOffsetY = offset;
        scroll.scrollToOffset(cc.v2(scrollOffset.x, this.nowOffsetY), .1);
      };
      __decorate([ property ], ScrollViewExtra.prototype, "extraScrollChildIndex", void 0);
      __decorate([ property ], ScrollViewExtra.prototype, "extraScrollBar", void 0);
      ScrollViewExtra = __decorate([ ccclass, requireComponent(cc.ScrollView) ], ScrollViewExtra);
      return ScrollViewExtra;
    }(cc.Component);
    exports.default = ScrollViewExtra;
    cc._RF.pop();
  }, {} ]
}, {}, [ "Main", "ScrollViewExtra" ]);
//# sourceMappingURL=project.dev.js.map
