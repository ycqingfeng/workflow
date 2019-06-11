isLRButton = function (event, type) {
    if (type.startsWith('l')) {
        return event.button == 0;
    }
    if (type.startsWith('r')) {
        return event.button == 2;
    }
};

normalLine = function (point1, point2) {
    return {
        point1: point1,
        point2: point2,
        a: point1.y - point1.y,
        b: point2.x - point2.x,
        c: point1.x * point2.y - point1.y * point2.x
    }
};

crossPoint = function (startPoint1,
                       startPoint2, endPoint1, endPoint2
) {
    var line1 = normalLine(startPoint1, startPoint2);
    var line2 = normalLine(endPoint1, endPoint2);
    var D = line1.a * line2.b - line2.a * line1.b;
    var x = (line1.b * line2.c - line2.b * line1.c) / D;
    var y = (line1.c * line2.a - line2.c * line1.a) / D;
    return {'x': x, 'y': y}
};

function SvgNode(opt) {
    var opt = opt === undefined ? {} : opt;

    this.obj = {};
    this.lineNode_effectStart = [];
    this.lineNode_effectEnd = [];
    this.maxOut = (opt.maxOut === undefined) ? 999 : opt.maxOut;
    this.maxIn = (opt.maxIn === undefined) ? 999 : opt.maxIn;
};
SvgNode.prototype.setObj = function (obj) {
    this.obj = obj;
};
SvgNode.prototype.get = function () {
    return this.obj;
};
SvgNode.prototype.canAttachStart = function () {
    return this.lineNode_effectStart.length > this.maxOut;
};
SvgNode.prototype.canAttachEnd = function () {
    return this.lineNode_effectEnd.length > this.maxIn;
};
SvgNode.prototype.left = function () {
    return this.get().x();
};
SvgNode.prototype.top = function () {
    return this.get().y();
};
SvgNode.prototype.right = function () {
    return this.get().x() + this.width;
};
SvgNode.prototype.bottom = function () {
    return this.get().y() + this.height;
};
SvgNode.prototype.centx = function () {
    return this.get().x() + this.width / 2;
};
SvgNode.prototype.centy = function () {
    return this.get().y() + this.height / 2;
};
SvgNode.prototype.beUnfocus = function () {
    this.obj.fill('#FFFFFF');
};
SvgNode.prototype.beFocus = function () {
    this.obj.fill('#eaeaea');
};
SvgNode.prototype.getAttachPoint = function (pos) {
    var sx = this.centx(), sy = this.centy();
    var tx, ty;
    var offset = 3;
    var degree = 90 - Math.atan((pos.x - sx) / (pos.y - sy)) / (Math.PI / 180) + (pos.y >= sy ? 0 : 180);
    if (degree >= 45 && degree < 155) {
        //
        tx = sx, ty = this.bottom() + offset;
    } else if (degree >= 155 && degree < 205) {
        tx = this.left() - offset, ty = sy;
    } else if (degree >= 205 && degree < 335) {
        tx = sx, ty = this.top() - offset;
    } else {
        tx = this.right() + offset, ty = sy;
    }
    return {'x': tx, 'y': ty};
};
SvgNode.prototype.move = function (pos) {
    this.obj.x(pos.x - this.width / 2).y(pos.y - this.height / 2);
};

EventNode = function (context, center, opt) {
    SvgNode.call(this, {maxIn: 1, maxOut: 1});
    var draw = context.draw;
    var x = center.x, y = center.y;
    this.width = opt.radius, this.height = opt.radius;
    this.obj = draw.nested().cx(x - this.width / 2).cy(y - this.width / 2);
    this.obj.circle(this.width).fill('#FFFFFF').stroke({color: '#5750ff', width: 2});
    if (!!opt && opt.endNode == true) {
        this.obj.circle(this.width - 20).cx(25).cy(25).fill('#5750ff').stroke({color: '#5750ff', width: 2});
    }
    context.svgPlaceHolder.after(this.obj);

    this.remove = function (silence) {
        this.obj.remove();
        if (silence !== undefined && silence == true) {
            return;
        }
        this.lineNode_effectStart.forEach(function (lineNode) {
            lineNode.remove(true);
            //todo 释放container
        });
        this.lineNode_effectEnd.forEach(function (lineNode) {
            lineNode.remove(true);
            //todo 释放container
        });
        //todo 释放container
    };
    context.svgContainer[this.obj.id()] = this;
};
EventNode.prototype = Object.create(SvgNode.prototype);
EventNode.prototype.constructor = SvgNode;

ActivityNode = function (context, center, opt) {
    SvgNode.call(this, {maxIn: 1, maxOut: 1});
    var draw = context.draw;
    var x = center.x, y = center.y;
    this.width = opt.width, this.height = opt.height;
    this.obj = draw.nested().x(x - this.width / 2).y(y - this.height / 2);
    this.obj.rect(this.width, this.height).radius(5)
        .fill('#FFFFFF').stroke({color: '#5750ff', width: 2});
    context.svgPlaceHolder.after(this.obj);

    this.remove = function (silence) {
        this.obj.remove();
        if (silence !== undefined && silence == true) {
            return;
        }
        this.lineNode_effectStart.forEach(function (lineNode) {
            lineNode.remove(true);
            //todo 释放container
        });
        this.lineNode_effectEnd.forEach(function (lineNode) {
            lineNode.remove(true);
            //todo 释放container
        });
        //todo 释放container
    };
    context.svgContainer[this.obj.id()] = this;
};
ActivityNode.prototype = Object.create(SvgNode.prototype);
ActivityNode.prototype.constructor = SvgNode;

GatewayNode = function (context, center, opt) {
    SvgNode.call(this);
    var draw = context.draw;
    var x = center.x, y = center.y;
    this.width = opt.width, this.height = opt.height;
    var outline = 'M' + (0) + ' ' + (0 + this.height / 2) + ' L' + (this.width / 2) + '  ' + (0) + ' L' + (this.width) + ' ' + (0 + this.height / 2) + ' L' + (this.width / 2) + ' ' + (this.height) + ' z';
    this.obj = draw.nested().x(x - this.width / 2).y(y - this.height / 2);
    this.obj.path(outline)
        .fill('#FFFFFF').stroke({color: '#5750ff', width: 2});
    context.svgPlaceHolder.after(this.obj);


    this.remove = function (silence) {
        this.obj.remove();
        if (silence !== undefined && silence == true) {
            return;
        }
        this.lineNode_effectStart.forEach(function (lineNode) {
            lineNode.remove(true);
            //todo 释放container
        });
        this.lineNode_effectEnd.forEach(function (lineNode) {
            lineNode.remove(true);
            //todo 释放container
        });
        //todo 释放container
    };
    context.svgContainer[this.obj.id()] = this;
};
GatewayNode.prototype = Object.create(SvgNode.prototype);
GatewayNode.prototype.constructor = SvgNode;

LineNode = function (context, start, end, opt) {
    var draw = context.draw;
    this.startNode = null, this.endNode = null;
    this.sx = start.x, this.sy = start.y, this.ex = end.x, this.ey = end.y;
    this.arrow = 'M0 0 L10 0 L5 6 z';
    this.degree = -Math.atan((this.ex - this.sx) / (this.ey - this.sy)) / (Math.PI / 180);

    this.obj = draw.nested();
    this.obj.line(this.sx, this.sy, this.ex, this.ey).stroke({width: 2, color: '#5c70ee'});
    this.obj.path(this.arrow).rotate(this.degree).cx(0).cy(0).fill({
        color: '#5c70ee'
    }).fill({color: '#5c70ee'});
    // this.obj.add(this.line).add(this.arrow);
    context.svgPlaceHolder.before(this.obj);

    this.get = function () {
        return this.obj;
    };
    this.getLineSvg = function () {
        return this.obj.children()[0]; //fixme
    };
    this.getArrowSvg = function () {
        return this.obj.children()[1]; //fixme
    };
    this.getStartFitPos = function () {
        return {'x': this.startNode.centx(), 'y': this.startNode.centy()}
    };
    this.getEndFitPos = function () {
        var startPos = {'x': this.startNode.centx(), 'y': this.startNode.centy()};
        var attachPos = this.endNode.getAttachPoint(startPos);
        return {'x': attachPos.x, 'y': attachPos.y};
    };
    this.beUnfocus = function () {
        this.obj.fill('#FFFFFF');
    };
    this.beFocus = function () {
        this.obj.fill('#eaeaea');
    };
    this.reLine = function (mousePoint) {
        var startPos = this.getStartFitPos();
        var endPos = this.endNode == null ? mousePoint : this.getEndFitPos();
        this.getLineSvg().plot(startPos.x, startPos.y, endPos.x + 1, endPos.y + 1);

        this.degree = -Math.atan((startPos.x - endPos.x) / (startPos.y - endPos.y)) / (Math.PI / 180);
        if (endPos.y < startPos.y) {
            this.degree += 180;
        }
        this.getArrowSvg().rotate(this.degree).translate(endPos.x, endPos.y);
    };
    this.remove = function (silence) {
        this.obj.remove();
        if (silence !== undefined && silence == true) {
            return;
        }
        this.startNode.remove(true);
        //todo 释放container
        this.endNode.remove(true);
        //todo 释放container
        //todo 释放container
    };
    context.svgContainer[this.obj.id()] = this;
};


Engine = function (element, opt) {
    this.$ele = document.getElementById(element), this.$popup;
    this.svgContainer = [];
    this.$$onMoveFunction = null, this.$$onUpFunction = null, this.$$onSvgUpFunction = null, this.$$onUpRightFunction = null;
    this.$$onDelButtonFunction = null;
    this.userSelectedSvgComponent = null;

    this._initEditor = function () {
        var that = this;
        this.$ele.innerHTML = '' +
            '<div style="height: 100%;width: 100%;">' +
            '   <ul id="workflow-left-panel">' +
            '      <li class="drag-shape node-event" style="user-select: none;-webkit-user-select: none;">' +
            '       <svg style="float:left;" xmlns="http://www.w3.org/2000/svg" version="1.1" height="44" width="44">\n' +
            '           <circle r="10" cx="22" cy="22" fill="#eaeaea" stroke="#5750ff" stroke-width="2"></circle>' +
            '       </svg>    ' +
            '       <div style="float: left;line-height: 44px;">开始</div> ' +
            '      </li>' +
            '      <li class="drag-shape node-end" style="user-select: none;-webkit-user-select: none;">' +
            '       <svg style="float:left;" xmlns="http://www.w3.org/2000/svg" version="1.1" height="44" width="44">\n' +
            '           <circle r="10" cx="22" cy="22" fill="#eaeaea" stroke="#5750ff" stroke-width="2"></circle>' +
            '           <circle r="6" cx="22" cy="22"  fill="#5750ff" stroke-width="2"></circle>' +
            '       </svg>    ' +
            '       <div style="float: left;line-height: 44px;">结束</div> ' +
            '      </li>' +
            '      <li class="drag-shape node-activity" style="user-select: none;-webkit-user-select: none;">' +
            '       <svg style="float:left;" xmlns="http://www.w3.org/2000/svg" version="1.1" height="44" width="44">\n' +
            '           <rect width="30" height="20" rx="5" ry="5" fill="#eaeaea" stroke="#5750ff" stroke-width="2" x="8" y="12"></rect>' +
            '       </svg>    ' +
            '       <div style="float: left;line-height: 44px;">活动</div> ' +
            '       </li>' +
            '      <li class="drag-shape node-gateway" style="user-select: none;-webkit-user-select: none;">' +
            '       <svg style="float:left;" xmlns="http://www.w3.org/2000/svg" version="1.1" height="44" width="44">\n' +
            '           <path d="M8 22 L22 8 L36 22 L22 36 z" fill="#eaeaea" stroke="#5750ff" stroke-width="2"></path>' +
            '       </svg>' +
            '       <div style="float: left;line-height: 44px;">网关</div> ' +
            '       </li>' +
            '      <li class="drag-shape line-solid-arrow" style="user-select: none;-webkit-user-select: none;">' +
            '       <svg style="float:left;" xmlns="http://www.w3.org/2000/svg" version="1.1" height="44" width="44">\n' +
            '           <svg  style="overflow: visible;">' +
            '               <line  x1="8" y1="22" x2="36" y2="22" stroke="#5c70ee" stroke-width="2"></line>' +
            '               <path  d="M30 19L30 25L36 22z " fill="#5c70ee"></path>' +
            '           </svg>' +
            '       </svg>' +
            '       <div style="float: left;line-height: 44px;">流程</div> ' +
            '       </li>' +
            '   </ul>' +
            '   <div class="" style="width: 100;padding-left: 80px;height: 100%;">' +
            '      <div id="core-panel" style="height: 100%; width: 100%; overflow: scroll;position: relative">' +
            '           <div id="core-panel-background" style="position: absolute;left: 0;top:0;height: 1000px;width: 1000px;z-index: -1"></div>' +
            '       </div>' +
            '   </div>' +
            '</div>' +
            '<div id="edit_svg_pop" style="position:fixed;width: 120px;box-shadow: 1px 1px 1px gray;background-color: white">' +
            '   <ul>' +
            '       <li id="del_svg" style="padding: 0 10px; height: 36px;line-height: 36px;user-select: none;-webkit-user-select: none;">删除</li>' +
            '   </ul>' +
            '</div>';

        var $shapes = this.$ele.getElementsByClassName('drag-shape');
        for (var i = 0; i < $shapes.length; i++) {
            var dom = $shapes[i];
            dom.addEventListener("click", function (event) {
                if (document.getElementsByClassName('helper').length > 0)
                    return;

                that.helper = this.cloneNode(true);
                that.helper.style.position = 'absolute';
                that.helper.style.class = 'helper';
                document.body.append(that.helper);

                var classAttr = this.getAttribute('class');
                if (/(node-gateway)|(node-activity)|(node-event)|(node-end)/.test(classAttr)) {
                    that.$$onMoveFunction = that.$$moveFunction_moveHelper;
                    that.$$onUpFunction = that.$$upFunction_releaseHelperAndDrawSvg;
                    that.$$onUpRightFunction = that.$$upFunction_releaseHelper;
                } else if (this.classList.contains('line-solid-arrow')) {
                    that.$$onMoveFunction = that.$$moveFunction_moveHelper;
                    that.$$onSvgUpFunction = that.$$upFunction_attachLineStartNode;
                    that.$$onUpRightFunction = that.$$upFunction_releaseHelper;
                }
            });
        }


        document.body.addEventListener('mousemove', function (event) {
            if (that.$$onMoveFunction != null) {
                that.$$onMoveFunction(event);
            }
        });
        document.body.addEventListener('mouseup', function (event) {
            if (isLRButton(event, 'l') && that.$$onUpFunction != null) {
                that.$$onUpFunction(event);
            } else if (isLRButton(event, 'r') && that.$$onUpRightFunction != null) {
                that.$$onUpRightFunction(event);
            }
        });


        this.$popup = document.getElementById('edit_svg_pop');
        this.$popup.style.left = '0px';
        this.$popup.style.top = '0px';
        this.$popup.style.display = 'none';

        this.$popup.addEventListener('mouseleave', function () {
            this.style.display = 'none';
            that.$$onDelButtonFunction = null;
        });
        this.$popup.addEventListener('click', function (event) {
            var ev = event || window.event;
            var target = ev.target || ev.srcElement;
            if (target.getAttribute('id') == 'del_svg') {
                if (!!that.$$onDelButtonFunction) {
                    var close = that.$$onDelButtonFunction(event);
                    if (close) {
                        that.$popup.style.display = 'none';
                    }
                }
            }
        });
    };

    this._draw_event = function (center, opt) {
        var event = new EventNode(this, center, {radius: 50});
        return event.get();
    };
    this._draw_end = function (center, opt) {
        var event = new EventNode(this, center, {radius: 50, endNode: true});
        return event.get();
    };
    this._draw_activity = function (center, width, height) {
        var activity = new ActivityNode(this, center, {'height': 40, 'width': 80});
        return activity.get();
    };
    this._draw_gateway = function (center, width, height) {
        var gateway = new GatewayNode(this, center, {'height': 50, 'width': 50});
        return gateway.get();
    };
    this._link_line_arrow_start = function (svgNode, xy) {
        var lineNode = new LineNode(this, {'x': svgNode.centx(), 'y': svgNode.bottom()}, {
            'x': svgNode.centx(),
            'y': svgNode.centy()
        });
        svgNode.lineNode_effectStart.push(lineNode);
        lineNode.startNode = svgNode;
        return lineNode.get();
    };
    this._link_line_arrow_move = function (pos) {
        var lineNode = this.svgContainer[this._prepareLine.id()];
        lineNode.reLine(pos);
    };
    this._link_line_arrow_end = function (svgNode) {
        var lineNode = this.svgContainer[this._prepareLine.id()];
        lineNode.endNode = svgNode;
        svgNode.lineNode_effectEnd.push(lineNode);
        lineNode.reLine();
    };
    this._moveNode = function (svgTarget, pos) {
        this.svgContainer[svgTarget.id()].move(pos);
        var circleNode = this.svgContainer[svgTarget.id()];
        circleNode.lineNode_effectStart.forEach(function (lineNode) {
            lineNode.reLine();
        });
        circleNode.lineNode_effectEnd.forEach(function (lineNode) {
            lineNode.reLine();
        });
    };
    this._calcPos = function (event, isArr) {
        var $corePanel = document.getElementById('core-panel');
        var x = event.clientX - $corePanel.offsetLeft + $corePanel.scrollLeft;
        var y = event.clientY - $corePanel.offsetTop + $corePanel.scrollTop;
        if (isArr) {
            return [x, y];
        }
        return {'x': x, 'y': y};
    };
    this._focusSvgComponent = function (svgComponent) {
        if (!!this.userSelectedSvgComponent) {
            this.svgContainer[this.userSelectedSvgComponent.id()].beUnfocus();
        }
        this.userSelectedSvgComponent = svgComponent;
        this.svgContainer[this.userSelectedSvgComponent.id()].beFocus();
    };
    this._popupEditMenu = function (event, svgComponent, silence) {
        var that = this;
        this.$popup.style.display = 'block';
        this.$popup.style.left = (event.clientX - 5) + 'px';
        this.$popup.style.top = (event.clientY - 5) + 'px';
        this.$$onDelButtonFunction = function (event) {
            if (silence !== undefined && silence == true) {
                that.svgContainer[svgComponent.id()].remove(true);
            } else {
                that.svgContainer[svgComponent.id()].remove();
            }
            return true;
        }
    }


    /* 拖动helper事件 */
    this.$$moveFunction_moveHelper = function (event) {
        this.helper.style.left = (event.clientX + 2) + 'px';
        this.helper.style.top = (event.clientY + 2) + 'px';
    };
    this.$$upFunction_releaseHelperAndDrawSvg = function (event) {
        this._releaseMouseFunction();
        if (isLRButton(event, 'l')) {
            var classAttr = this.helper.getAttribute('class').match('((gateway)|(activity)|(event)|(end))\s*$');
            var initNodeComponent = function (svgComponent) {
                var that = this;
                svgComponent.node.addEventListener('mousedown', function (event) {
                    if (isLRButton(event, 'l')) {
                        if (that.helper == null) {
                            that._activeSvgComponent = svgComponent;
                            that.$$onMoveFunction = that.$$moveFunction_moveSvg;
                            that.$$onUpFunction = that.$$upFunction_releaseActiveNode;
                        }
                    }
                });
                svgComponent.node.addEventListener('mouseup', function (event) {
                    if (isLRButton(event, 'l')) {
                        if (that.$$onSvgUpFunction != null) {
                            that.$$onSvgUpFunction(event, svgComponent.id());
                        }
                    } else if (isLRButton(event, 'r')) {
                        that._popupEditMenu(event, svgComponent);
                    }
                    that._focusSvgComponent(svgComponent);

                });

            };
            if (!!classAttr) {
                var svgComponent;
                switch (classAttr[0]) {
                    case 'event':
                        svgComponent = this._draw_event(this._calcPos(event));
                        break;
                    case 'end':
                        svgComponent = this._draw_end(this._calcPos(event));
                        break;
                    case 'activity':
                        svgComponent = this._draw_activity(this._calcPos(event));
                        break;
                    case 'gateway':
                        svgComponent = this._draw_gateway(this._calcPos(event));
                        break;
                }
                initNodeComponent.call(this, svgComponent);
            }
        } else {

        }
        this._releaseHelper();
    };


    this.$$upFunction_releaseHelper = function (event) {
        this._releaseHelper();
        this._releaseMouseFunction();
        this.$$onSvgUpFunction = null;
        this.$$onUpRightFunction = null;
    };
    /* 拖动SVG事件 */
    this.$$moveFunction_moveSvg = function (event) {
        this._moveNode(this._activeSvgComponent, this._calcPos(event));
    };
    this.$$upFunction_releaseActiveNode = function (event) {
        this._releaseMouseFunction();
        this._activeSvgComponent = null;
    };
    /* 拖动line找起点事件 */
    this.$$upFunction_attachLineStartNode = function (event, hoverNode) {
        var that = this;
        var initLineSvgMouseEvent = function (lineSvg) {
            document.getElementById(lineSvg.node.id).addEventListener('mouseup', function (event) {
                if (isLRButton(event, 'r')) {
                    that._popupEditMenu(event, lineSvg, true);
                }
            })
        };
        this._releaseMouseFunction();
        if (!!hoverNode) {
            var svgNode = this.svgContainer[hoverNode];
            var x = svgNode.centx();
            var y = svgNode.centy();
            this._prepareLine = this._link_line_arrow_start(svgNode, this._calcPos(event));
            this.$$onMoveFunction = this.$$moveFunction_plotLine;
            this.$$onSvgUpFunction = this.$$upFunction_attachLineEndNode;
            this.$$onUpRightFunction = this.$$upRightFunction_cancelLineNode;
            initLineSvgMouseEvent(this._prepareLine);
        } else {
        }
        this._releaseHelper();
    };
    this.$$upRightFunction_cancelLineNode = function (event) {
        this._releaseMouseFunction();
        this._prepareLine.remove();
        this.$$onUpRightFunction = null;
    };
    /*  */
    this.$$moveFunction_plotLine = function (event) {
        var pos = this._calcPos(event);
        this._link_line_arrow_move(pos);
    };
    this.$$upFunction_attachLineEndNode = function (event, hoverNode) {
        this._releaseMouseFunction();
        if (!!hoverNode) {
            var svgNode = this.svgContainer[hoverNode];
            this._link_line_arrow_end(svgNode, this._calcPos(event));
            this._prepareLine = null;
            this.$$onUpRightFunction = null;
        } else {
            this._prepareLine.remove();
        }
        this.$$onSvgUpFunction = null;
    };

    this._releaseHelper = function () {
        if (!!this.helper) {
            this.helper.remove();
            this.helper = null;
        }
    };

    this._releaseMouseFunction = function () {
        this.$$onMoveFunction = null;
        this.$$onUpFunction = null;
    };


    this._initEditor();
    this.draw = SVG('core-panel').size(1000, 1000);
    this.svgPlaceHolder = this.draw.circle(0.1).cx(0).cy(0);
};