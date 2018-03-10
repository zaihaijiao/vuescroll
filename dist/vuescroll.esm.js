/*
    * @name: vuescroll 3.3.16
    * @author: (c) 2018-2018 wangyi7099
    * @description: A virtual scrollbar based on vue.js 2.x
    * @license: MIT
    * @GitHub: https://github.com/wangyi7099/vuescroll
    */
   
import Vue from 'vue';

var map = {
    vertical: {
        bar: {
            size: 'height',
            opsSize: 'width',
            posName: 'top',
            page: 'pageY',
            scroll: 'scrollTop',
            scrollSize: 'scrollHeight',
            offset: 'offsetHeight',
            client: 'clientY'
        },
        axis: 'Y'
    },
    horizontal: {
        bar: {
            size: 'width',
            opsSize: 'height',
            posName: 'left',
            page: 'pageX',
            scroll: 'scrollLeft',
            scrollSize: 'scrollWidth',
            offset: 'offsetWidth',
            client: 'clientX'
        },
        axis: 'X'
    }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};



















var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * @description deepCopy a object.
 * 
 * @param {any} source 
 * @returns 
 */
function deepCopy(source, target) {
    target = (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && target || {};
    for (var key in source) {
        target[key] = _typeof(source[key]) === 'object' ? deepCopy(source[key], target[key] = {}) : source[key];
    }
    return target;
}

/**
 * 
 * @description deepMerge a object.
 * @param {any} from 
 * @param {any} to 
 */
function deepMerge(from, to) {
    to = to || {};
    for (var key in from) {
        if (_typeof(from[key]) === 'object') {
            if (!to[key]) {
                to[key] = {};
                deepCopy(from[key], to[key]);
            } else {
                deepMerge(from[key], to[key]);
            }
        } else {
            if (!to[key]) to[key] = from[key];
        }
    }
    return to;
}
/**
 * @description define a object reactive
 * @author wangyi
 * @export
 * @param {any} target 
 * @param {any} key 
 * @param {any} source 
 */
function defineReactive(target, key, source, souceKey) {
    souceKey = souceKey || key;
    Object.defineProperty(target, key, {
        get: function get$$1() {
            return source[souceKey];
        }
    });
}

var scrollBarWidth = void 0;

function getGutter() {
    if (Vue.prototype.$isServer) return 0;
    if (scrollBarWidth !== undefined) return scrollBarWidth;

    var outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.width = '100px';
    outer.style.position = 'absolute';
    outer.style.top = '-9999px';
    document.body.appendChild(outer);

    var widthNoScroll = outer.offsetWidth;
    outer.style.overflow = 'scroll';

    var inner = document.createElement('div');
    inner.style.width = '100%';
    outer.appendChild(inner);

    var widthWithScroll = inner.offsetWidth;
    outer.parentNode.removeChild(outer);
    scrollBarWidth = widthNoScroll - widthWithScroll;

    getGutter.isUsed = false;

    return scrollBarWidth;
}

/**
 * @description render bar's style
 * @author wangyi
 * @export
 * @param {any} type vertical or horizontal
 * @param {any} posValue The position value
 */
function renderTransform(type, posValue) {
    return {
        transform: 'translate' + map[type].axis + '(' + posValue + '%)',
        msTransform: 'translate' + map[type].axis + '(' + posValue + '%)',
        webkitTransform: 'translate' + map[type].axis + '(' + posValue + '%)'
    };
}
/**
 * @description 
 * @author wangyi
 * @export
 * @param {any} dom 
 * @param {any} eventName 
 * @param {any} hander 
 * @param {boolean} [capture=false] 
 */
function on(dom, eventName, hander) {
    var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    dom.addEventListener(eventName, hander, capture);
}
/**
 * @description 
 * @author wangyi
 * @export
 * @param {any} dom 
 * @param {any} eventName 
 * @param {any} hander 
 * @param {boolean} [capture=false] 
 */
function off(dom, eventName, hander) {
    var capture = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    dom.removeEventListener(eventName, hander, capture);
}

var GCF = {
    // vuescroll
    vuescroll: {
        style: {
            position: 'relative',
            height: '100%',
            width: '100%',
            overflow: 'hidden'
        },
        class: ['vueScroll']
    },
    scrollPanel: {
        initialScrollY: false,
        initialScrollX: false
    },
    // 
    scrollContent: {
        tag: 'div',
        padding: true,
        height: '100%',
        props: {},
        attrs: {}
    },
    // 
    vRail: {
        width: '5px',
        pos: 'left',
        background: "#a5d6a7",
        opacity: 0 //'0.5'
    },
    // 
    vBar: {
        width: '5px',
        pos: 'left',
        background: '#4caf50',
        deltaY: 100,
        keepShow: false,
        opacity: 1
    },
    // 
    hRail: {
        height: '5px',
        pos: 'bottom',
        background: "#a5d6a7",
        opacity: 0 //'0.5'
    },
    // 
    hBar: {
        height: '5px',
        pos: 'bottom',
        background: '#4caf50',
        keepShow: false,
        opacity: 1
    }
};

/**
 * hack the lifeCycle 
 * 
 * to merge the global data into user-define data
 */
function hackPropsData() {
    var vm = this;
    if (vm.$options.name === 'vueScroll') {
        var ops = deepMerge(GCF, {});
        vm.$options.propsData.ops = vm.$options.propsData.ops || {};
        Object.keys(vm.$options.propsData.ops).forEach(function (key) {
            defineReactive(vm.mergedOptions, key, vm.$options.propsData.ops);
        });
        // from ops to mergedOptions
        deepMerge(ops, vm.mergedOptions);
        // to sync the rail and bar
        defineReactive(vm.mergedOptions.vBar, 'pos', vm.mergedOptions.vRail);
        defineReactive(vm.mergedOptions.vBar, 'width', vm.mergedOptions.vRail);
        defineReactive(vm.mergedOptions.hBar, 'pos', vm.mergedOptions.hRail);
        defineReactive(vm.mergedOptions.hBar, 'height', vm.mergedOptions.hRail);

        var prefix = "padding-";
        if (vm.mergedOptions.scrollContent.padding) {
            Object.defineProperty(vm.mergedOptions.scrollContent, 'paddPos', {
                get: function get() {
                    return prefix + vm.mergedOptions.vRail.pos;
                }
            });
            Object.defineProperty(vm.mergedOptions.scrollContent, 'paddValue', {
                get: function get() {
                    return vm.mergedOptions.vRail.width;
                }
            });
        }
    }
}
var LifeCycleMix = {
    created: function created() {
        hackPropsData.call(this);
    }
};

var vuescrollApi = {
    methods: {
        scrollTo: function scrollTo(pos) {
            var x = pos.x || this.$refs['scrollPanel'].$el.scrollLeft;
            var y = pos.y || this.$refs['scrollPanel'].$el.scrollTop;
            this.$refs['scrollPanel'].$el.scrollTo(x, y);
        }
    }
};

var bar = {
    name: "bar",
    computed: {
        bar: function bar() {
            return map[this.type].bar;
        },
        parent: function parent() {
            return this.$parent.$refs;
        }
    },
    render: function render(h) {
        var _babelHelpers$extends;

        var style = _extends((_babelHelpers$extends = {}, defineProperty(_babelHelpers$extends, this.bar.posName, 0), defineProperty(_babelHelpers$extends, this.ops.pos, 0), defineProperty(_babelHelpers$extends, this.bar.size, this.state.size), defineProperty(_babelHelpers$extends, this.bar.opsSize, this.ops[this.bar.opsSize]), defineProperty(_babelHelpers$extends, 'background', this.ops.background), defineProperty(_babelHelpers$extends, 'opacity', this.state.opacity), defineProperty(_babelHelpers$extends, 'cursor', 'pointer'), defineProperty(_babelHelpers$extends, 'position', 'absolute'), defineProperty(_babelHelpers$extends, 'borderRadius', '4px'), defineProperty(_babelHelpers$extends, 'transition', 'opacity .5s'), defineProperty(_babelHelpers$extends, 'cursor', 'pointer'), defineProperty(_babelHelpers$extends, 'userSelect', 'none'), _babelHelpers$extends), renderTransform(this.type, this.state.posValue));
        var data = {
            style: style,
            class: this.type + 'Scrollbar',
            on: {
                mousedown: this.handleMousedown
            }
        };
        return h('div', data);
    },

    methods: {
        handleMousedown: function handleMousedown(e) {
            e.stopPropagation();
            this.axisStartPos = e[this.bar.client] - this.$el.getBoundingClientRect()[this.bar.posName];
            // tell parent that the mouse has been down.
            this.$emit("setMousedown", true);
            on(document, 'mousemove', this.handleMouseMove);
            on(document, 'mouseup', this.handleMouseUp);
        },
        handleMouseMove: function handleMouseMove(e) {
            if (!this.axisStartPos) {
                return;
            }
            var delta = e[this.bar.client] - this.parent[this.type + 'Rail'].$el.getBoundingClientRect()[this.bar.posName];
            var percent = (delta - this.axisStartPos) / this.parent[this.type + 'Rail'].$el[this.bar.offset];
            this.parent['scrollPanel'].$el[this.bar.scroll] = this.parent['scrollPanel'].$el[this.bar.scrollSize] * percent;
        },
        handleMouseUp: function handleMouseUp() {
            this.$emit("setMousedown", false);
            this.$parent.hideBar();
            this.axisStartPos = 0;
            off(document, 'mousemove', this.handleMouseMove);
            off(document, 'mouseup', this.handleMouseUp);
        }
    },
    props: {
        ops: {
            type: Object,
            required: true
        },
        state: {
            type: Object,
            required: true
        },
        type: {
            type: String,
            required: true
        }
    }
};

var rail = {
    name: "rail",
    computed: {
        bar: function bar() {
            return map[this.type].bar;
        },
        parentRef: function parentRef() {
            return this.$parent.$refs;
        }
    },
    methods: {
        handleClickTrack: function handleClickTrack(e) {
            var page = this.bar.page;
            var barOffset = this.parentRef[this.type + 'Bar'].$el[this.bar.offset];
            var percent = (e[page] - e.target.getBoundingClientRect()[this.bar.posName] - barOffset / 2) / e.target[this.bar.offset];
            this.parentRef['scrollPanel'].$el[this.bar.scroll] = this.parentRef['scrollPanel'].$el[this.bar.scrollSize] * percent;
        }
    },
    render: function render(h) {
        var _style;

        var vm = this;
        var style = (_style = {}, defineProperty(_style, vm.bar.posName, 0), defineProperty(_style, vm.ops.pos, 0), defineProperty(_style, vm.bar.size, '100%'), defineProperty(_style, vm.bar.opsSize, vm.ops[vm.bar.opsSize]), defineProperty(_style, 'background', vm.ops.background), defineProperty(_style, 'opacity', vm.ops.opacity), defineProperty(_style, 'position', 'absolute'), defineProperty(_style, 'cursor', 'pointer'), defineProperty(_style, 'borderRadius', '4px'), _style);
        var data = {
            style: style,
            class: this.type + 'Rail',
            on: {
                click: this.handleClickTrack
            }
        };
        return h('div', data);
    },

    props: {
        type: {
            required: true,
            type: String
        },
        ops: {
            required: true,
            type: Object
        },
        state: {
            required: true,
            type: Object
        }
    }
};

// scrollContent
var scrollContent = {
    name: 'scrollContent',
    render: function render(_c) {
        var vm = this;
        var style = deepMerge(vm.state.style, {});
        style.height = vm.ops.height;
        if (vm.ops.padding) {
            style[vm.ops.paddPos] = vm.ops.paddValue;
        }
        return _c(vm.ops.tag, {
            style: style,
            class: "scrollContent",
            props: vm.ops.props,
            attrs: vm.ops.attrs
        }, this.$slots.default);
    },

    props: {
        ops: {
            default: function _default() {
                /* istanbul ignore next */
                return {};
            }
        },
        state: {
            default: function _default() {
                /* istanbul ignore next */
                return {};
            }
        }
    }
};

// vueScrollPanel
var scrollPanel = {
    name: 'scrollPanel',
    methods: {
        extractScrollDistance: function extractScrollDistance(distance, scroll) {
            var number = void 0;
            if (!(number = /(\d+)%$/.exec(distance))) {
                number = distance;
            } else {
                number = number[1];
                number = this.$el[scroll] * number / 100;
            }
            return number;
        }
    },
    mounted: function mounted() {
        if (this.ops.initialScrollX) {
            var scroll = 'scrollWidth';
            var number = this.extractScrollDistance(this.ops.initialScrollX, scroll);
            this.$el['scrollLeft'] = number;
        }
        if (this.ops.initialScrollY) {
            var _scroll = 'scrollHeight';
            var _number = this.extractScrollDistance(this.ops.initialScrollY, _scroll);
            this.$el['scrollTop'] = _number;
        }
    },
    render: function render(h) {
        var gutter = getGutter();
        var style = {
            overflow: 'scroll'
        };
        if (gutter) {
            style.marginRight = -gutter + 'px';
            style.height = 'calc(100% + ' + gutter + 'px)';
            style.marginBottom = -gutter + 'px';
        } else {
            style.height = '100%';
            if (!getGutter.isUsed) {
                getGutter.isUsed = true;
                // for macOs user, the gutter will be 0,
                // so, we hide the system scrollbar
                var styleDom = document.createElement('style');
                styleDom.type = 'text/css';
                styleDom.innerHTML = ".vueScrollPanel::-webkit-scrollbar{width:0;height:0}";
                document.getElementsByTagName('HEAD').item(0).appendChild(styleDom);
            }
        }
        var data = {
            style: style
        };
        return h(
            'div',
            data,
            [[this.$slots.default]]
        );
    },

    props: {
        ops: {
            default: function _default() {
                return {};
            },

            validator: function validator(ops) {
                ops = ops || {};
                var rtn = true;
                var initialScrollY = ops['initialScrollY'];
                var initialScrollX = ops['initialScrollX'];
                if (initialScrollY && !initialScrollY.match(/\d+%$|^\d+$/)) {
                    console.error('[vuescroll]: The prop `initialScrollY` should be a percent number like 10% or an exact number like 100.');
                    rtn = false;
                }
                if (initialScrollX && !initialScrollX.match(/\d+%$|^\d+$/)) {
                    console.error('[vuescroll]: The prop `initialScrollX` should be a percent number like 10% or an exact number like 100.');
                    rtn = false;
                }
                return rtn;
            }
        }
    }
};

// vuescroll core component
// refered to: https://github.com/ElemeFE/element/blob/dev/packages/scrollbar/src/main.js
// vue-jsx: https://github.com/vuejs/babel-plugin-transform-vue-jsx/blob/master/example/example.js

// begin importing
// import lefrCycle
// import global config
// import api
// import necessary components
var vuescroll = {
    name: "vueScroll",
    mixins: [LifeCycleMix, vuescrollApi],
    data: function data() {
        return {
            scrollPanel: {
                el: ""
            },
            scrollContent: {},
            vRail: {
                state: {}
            },
            hRail: {
                state: {}
            },
            vBar: {
                state: {
                    posValue: 0,
                    size: 0,
                    opacity: 0
                }
            },
            hBar: {
                state: {
                    posValue: 0,
                    size: 0,
                    opacity: 0
                }
            },
            listeners: [],
            mousedown: false,
            mergedOptions: {
                scrollPanel: {},
                scrollContent: {},
                vRail: {},
                vBar: {},
                hRail: {},
                hBar: {}
            }
        };
    },
    render: function render(h) {
        var vm = this;
        // vuescroll data
        var vuescrollData = {
            style: GCF.vuescroll.style,
            class: GCF.vuescroll.class,
            on: {
                mouseenter: function mouseenter() {
                    vm.showBar();
                },
                mouseleave: function mouseleave() {
                    vm.hideBar();
                }
            }
            // scrollPanel data
        };var scrollPanelData = {
            ref: "scrollPanel",
            nativeOn: {
                scroll: vm.handleScroll
            },
            props: {
                ops: vm.mergedOptions.scrollPanel
            }
            // scrollContent data
        };var scrollContentData = {
            props: {
                ops: vm.mergedOptions.scrollContent
            },
            ref: "scrollContent"
            // vBar data
        };var verticalBarData = {
            props: {
                type: "vertical",
                ops: vm.mergedOptions.vBar,
                state: vm.vBar.state
            },
            on: {
                setMousedown: this.setMousedown
            },
            ref: 'verticalBar'
            // vRail data
        };var verticalRailData = {
            props: {
                type: "vertical",
                ops: vm.mergedOptions.vRail,
                state: vm.vRail.state
            },
            ref: 'verticalRail'
            // hBar data
        };var horizontalBarData = {
            props: {
                type: "horizontal",
                ops: vm.mergedOptions.hBar,
                state: vm.hBar.state
            },
            on: {
                setMousedown: this.setMousedown
            },
            ref: 'horizontalBar'
            // hRail data
        };var horizontalRailData = {
            props: {
                type: "horizontal",
                ops: vm.mergedOptions.hRail,
                state: vm.hRail.state
            },
            ref: 'horizontalRail'
        };
        return h(
            'div',
            vuescrollData,
            [h(
                'scrollPanel',
                scrollPanelData,
                [h(
                    'scrollContent',
                    scrollContentData,
                    [[vm.$slots.default]]
                )]
            ), h('rail', verticalRailData), h('bar', verticalBarData), h('rail', horizontalRailData), h('bar', horizontalBarData)]
        );
    },

    computed: {
        scrollPanelRef: function scrollPanelRef() {
            return this.$refs.scrollPanel.$el;
        }
    },
    methods: {
        handleScroll: function handleScroll() {
            this.update();
        },
        update: function update() {
            var heightPercentage = void 0,
                widthPercentage = void 0;
            var scrollPanel$$1 = this.scrollPanelRef;
            if (!scrollPanel$$1) return;

            heightPercentage = scrollPanel$$1.clientHeight * 100 / (scrollPanel$$1.scrollHeight - this.accuracy);
            widthPercentage = scrollPanel$$1.clientWidth * 100 / (scrollPanel$$1.scrollWidth - this.accuracy);

            this.vBar.state.size = heightPercentage < 100 ? heightPercentage + '%' : '';
            this.hBar.state.size = widthPercentage < 100 ? widthPercentage + '%' : '';

            this.vBar.state.posValue = scrollPanel$$1.scrollTop * 100 / scrollPanel$$1.clientHeight;
            this.hBar.state.posValue = scrollPanel$$1.scrollLeft * 100 / scrollPanel$$1.clientWidth;
        },
        showBar: function showBar() {
            this.vBar.state.opacity = this.mergedOptions.vBar.opacity;
            this.hBar.state.opacity = this.mergedOptions.hBar.opacity;
        },
        hideBar: function hideBar() {
            // add mousedown condition 
            // to prevent from hiding bar while dragging the bar 
            if (!this.mergedOptions.vBar.keepShow && !this.mousedown) {
                this.vBar.state.opacity = 0;
            }
            if (!this.mergedOptions.hBar.keepShow && !this.mousedown) {
                this.hBar.state.opacity = 0;
            }
        },
        setMousedown: function setMousedown(val) {
            this.mousedown = val;
        }
    },
    mounted: function mounted() {
        var _this = this;

        this.$nextTick(function () {
            _this.showBar();
            _this.hideBar();
        });
    },
    updated: function updated() {
        var _this2 = this;

        this.$nextTick(function () {
            _this2.update();
            _this2.showBar();
            _this2.hideBar();
        });
    },

    components: {
        bar: bar,
        rail: rail,
        scrollContent: scrollContent,
        scrollPanel: scrollPanel
    },
    props: {
        ops: {
            default: function _default() {
                return {
                    scrollPanel: {},
                    scrollContent: {},
                    vRail: {},
                    vBar: {},
                    hRail: {},
                    hBar: {}
                };
            }
        },
        accuracy: {
            default: 0,
            validator: function validator(value) {
                if (value < 0) {
                    console.error('[vuescroll]:The prop `accury` must be 0 or higher!');
                    return false;
                }
                return true;
            }
        }
    }
};

// import component
// import config
var scroll = {
    install: function install(Vue$$1) {
        if (scroll.isInstalled) {
            console.warn("[vuescroll]:You should not install the vuescroll again!");
            return;
        }
        //vueScroll
        Vue$$1.component(vuescroll.name, vuescroll);

        // registry the globe setting
        Vue$$1.prototype.$vuescrollConfig = GCF;

        scroll.isInstalled = true;
    }
};

export default scroll;