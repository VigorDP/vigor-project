var GRID_HORIZONTAL_SPACING = 10;
var GRID_VERTICAL_SPACING = 10;
var GRID_LINE_COLOR = 'rgb(0, 0, 200)';
var ERASER_LINE_WIDTH = 1;
var ERASER_SHADOW_STYLE = 'blue';
var ERASER_STROKE_STYLE = 'rgba(0,0,255,0.6)';
var ERASER_SHADOW_OFFSET = -5;
var ERASER_SHADOW_BLUR = 20;
var ERASER_RADIUS = 40;
var RUBBERBAND_LINE_WIDTH = 1;
var RUBBERBAND_STROKE_STYLE = 'green';
var drawingSurfaceImageData; // 暂存 canvas 绘制数据
var dragging = false; // 是否正在拖动鼠标
var editingText = false; // 是否正在编辑文本
var editingCurve = false; // 是否正在编辑贝塞尔曲线
var draggingControlPoint = false; // 是否正在编辑贝塞尔曲线控制点
var mousedown = {
    x: 0,
    y: 0
};
var lastX, lastY;
var lastRect = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
};
var rubberbandW = 0;
var rubberbandH = 0;
var rubberbandUlhc = { x: 0, y: 0 };
function saveDrawingSurface(drawingContext, drawingCanvas) {
    drawingSurfaceImageData = drawingContext.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
}
function restoreDrawingSurface(drawingContext) {
    drawingContext.putImageData(drawingSurfaceImageData, 0, 0);
}
function setIconCanvasContext2(drawingContext, strokeStyleSelect, fillStyleSelect, lineWidthSelect) {
    drawingContext.font = '48px Palatino';
    drawingContext.textBaseline = 'bottom';
    drawingContext.strokeStyle = strokeStyleSelect.value;
    drawingContext.fillStyle = fillStyleSelect.value;
    drawingContext.lineWidth = lineWidthSelect.value;
}
function drawBackground(context, color, stepx, stepy) {
    var backgroundContext = document.createElement('canvas').getContext('2d');
    backgroundContext.canvas.width = context.canvas.width;
    backgroundContext.canvas.height = context.canvas.height;
    CommonCanvasHelpers.drawGrid(context, color, stepx, stepy);
}
function listenEvent2(drawingContext, drawingCanvas) {
    drawingCanvas.onmousedown = function (e) {
        var x = e.x || e.clientX;
        var y = e.y || e.clientY;
        var loc = CommonCanvasHelpers.windowToCanvas(drawingCanvas, x, y);
        e.preventDefault();
        mouseDownInDrawingCanvas(loc, drawingContext, drawingCanvas);
    };
    drawingCanvas.onmousemove = function (e) {
        var x = e.x || e.clientX;
        var y = e.y || e.clientY;
        var loc = CommonCanvasHelpers.windowToCanvas(drawingCanvas, x, y);
        e.preventDefault();
        mouseMoveInDrawingCanvas(loc, drawingContext, drawingCanvas);
    };
    drawingCanvas.onmouseup = function (e) {
        var x = e.x || e.clientX;
        var y = e.y || e.clientY;
        var loc = CommonCanvasHelpers.windowToCanvas(drawingCanvas, x, y);
        e.preventDefault();
        mouseUpInDrawingCanvas(loc, drawingContext);
    };
}
function mouseDownInDrawingCanvas(loc, drawingContext, drawingCanvas) {
    dragging = true;
    if (editingCurve) {
        if (drawingContext.isPointInPath(loc.x, loc.y)) {
            draggingControlPoint = true;
        }
        else {
            restoreDrawingSurface(drawingContext);
        }
        editingCurve = false;
    }
    if (!draggingControlPoint) {
        saveDrawingSurface(drawingContext, drawingCanvas);
        mousedown.x = loc.x;
        mousedown.y = loc.y;
        if (IconCanvasUtils.selectedFunction === 'path' || IconCanvasUtils.selectedFunction === 'pathClosed') {
            drawingContext.beginPath();
            drawingContext.moveTo(loc.x, loc.y);
        }
        lastX = loc.x;
        lastY = loc.y;
    }
}
function mouseMoveInDrawingCanvas(loc, drawingContext, drawingCanvas) {
    if (dragging) {
        if (IconCanvasUtils.selectedFunction === 'erase') {
            eraseLast(drawingContext);
            drawEraser(loc, drawingContext);
        }
        else if (IconCanvasUtils.selectedFunction === 'path' || IconCanvasUtils.selectedFunction === 'pathClosed') {
            drawingContext.lineTo(loc.x, loc.y);
            drawingContext.stroke();
        }
        else {
            // For lines, circles, rectangles, and curves, draw rubberbands
            restoreDrawingSurface(drawingContext);
            updateRubberbandRectangle(loc);
            drawRubberband(loc, drawingContext);
        }
        lastX = loc.x;
        lastY = loc.y;
        lastRect.w = rubberbandW;
        lastRect.h = rubberbandH;
        if (IconCanvasUtils.selectedFunction === 'line' ||
            IconCanvasUtils.selectedFunction === 'rectangle' ||
            IconCanvasUtils.selectedFunction === 'circle') {
            CommonCanvasHelpers.drawGuidewires(loc.x, loc.y, drawingContext, drawingCanvas);
        }
    }
}
function mouseUpInDrawingCanvas(loc, drawingContext) {
    if (IconCanvasUtils.selectedFunction !== 'erase') {
        restoreDrawingSurface(drawingContext);
    }
    if (dragging) {
        if (IconCanvasUtils.selectedFunction === 'erase') {
            eraseLast(drawingContext);
        }
        else if (IconCanvasUtils.selectedFunction === 'path' || IconCanvasUtils.selectedFunction === 'pathClosed') {
            endPath(loc, drawingContext);
        }
        else {
            if (IconCanvasUtils.selectedFunction === 'line')
                finishDrawingLine(loc, drawingContext);
            else if (IconCanvasUtils.selectedFunction === 'rectangle')
                finishDrawingRectangle(drawingContext);
            else if (IconCanvasUtils.selectedFunction === 'circle')
                finishDrawingCircle(loc, drawingContext);
            // else if (IconCanvasUtils.selectedFunction === 'curve') startEditingCurve(loc,drawingContext);
        }
    }
    dragging = false;
}
// Eraser
function eraseLast(drawingContext) {
    var x = lastX - ERASER_RADIUS - ERASER_LINE_WIDTH, y = lastY - ERASER_RADIUS - ERASER_LINE_WIDTH, w = ERASER_RADIUS * 2 + ERASER_LINE_WIDTH * 2, h = w;
    var cw = drawingContext.canvas.width, ch = drawingContext.canvas.height;
    drawingContext.save();
    setPathForEraser(drawingContext);
    drawingContext.clip();
    if (x + w > cw)
        w = cw - x;
    if (y + h > ch)
        h = ch - y;
    if (x < 0) {
        x = 0;
    }
    if (y < 0) {
        y = 0;
    }
    drawingContext.clearRect(0, 0, drawingContext.canvas.width, drawingContext.canvas.height);
    CommonCanvasHelpers.drawGrid(drawingContext, GRID_LINE_COLOR, 10, 10);
    // drawingContext.drawImage(drawingContext.canvas, x, y, w, h, x, y, w, h);
    drawingContext.restore();
}
function setEraserAttributes(drawingContext) {
    drawingContext.lineWidth = ERASER_LINE_WIDTH;
    drawingContext.shadowColor = ERASER_SHADOW_STYLE;
    drawingContext.shadowOffsetX = ERASER_SHADOW_OFFSET;
    drawingContext.shadowOffsetY = ERASER_SHADOW_OFFSET;
    drawingContext.shadowBlur = ERASER_SHADOW_BLUR;
    drawingContext.strokeStyle = ERASER_STROKE_STYLE;
}
function setPathForEraser(drawingContext) {
    drawingContext.beginPath();
    drawingContext.moveTo(lastX, lastY);
    drawingContext.arc(lastX, lastY, ERASER_RADIUS + ERASER_LINE_WIDTH, 0, Math.PI * 2, false);
}
function drawEraser(loc, drawingContext) {
    drawingContext.save();
    setEraserAttributes(drawingContext);
    drawingContext.beginPath();
    drawingContext.arc(loc.x, loc.y, ERASER_RADIUS, 0, Math.PI * 2, false);
    drawingContext.clip();
    drawingContext.stroke();
    drawingContext.restore();
}
// RubberBandRectangle
function updateRubberbandRectangle(loc) {
    rubberbandW = Math.abs(loc.x - mousedown.x);
    rubberbandH = Math.abs(loc.y - mousedown.y);
    if (loc.x > mousedown.x)
        rubberbandUlhc.x = mousedown.x;
    else
        rubberbandUlhc.x = loc.x;
    if (loc.y > mousedown.y)
        rubberbandUlhc.y = mousedown.y;
    else
        rubberbandUlhc.y = loc.y;
}
function drawRubberbandRectangle(drawingContext) {
    drawingContext.strokeRect(rubberbandUlhc.x, rubberbandUlhc.y, rubberbandW, rubberbandH);
}
function drawRubberbandLine(loc, drawingContext) {
    drawingContext.beginPath();
    drawingContext.moveTo(mousedown.x, mousedown.y);
    drawingContext.lineTo(loc.x, loc.y);
    drawingContext.stroke();
}
function drawRubberbandCircle(loc, drawingContext) {
    var angle = Math.atan(rubberbandH / rubberbandW);
    var radius = rubberbandH / Math.sin(angle);
    if (mousedown.y === loc.y) {
        radius = Math.abs(loc.x - mousedown.x);
    }
    drawingContext.beginPath();
    drawingContext.arc(mousedown.x, mousedown.y, radius, 0, Math.PI * 2, false);
    drawingContext.stroke();
}
function drawRubberband(loc, drawingContext) {
    drawingContext.save();
    drawingContext.strokeStyle = RUBBERBAND_STROKE_STYLE;
    drawingContext.lineWidth = RUBBERBAND_LINE_WIDTH;
    if (IconCanvasUtils.selectedFunction === 'rectangle') {
        drawRubberbandRectangle(drawingContext);
    }
    else if (IconCanvasUtils.selectedFunction === 'line' || IconCanvasUtils.selectedFunction === 'curve') {
        drawRubberbandLine(loc, drawingContext);
    }
    else if (IconCanvasUtils.selectedFunction === 'circle') {
        drawRubberbandCircle(loc, drawingContext);
    }
    drawingContext.restore();
}
function endPath(loc, drawingContext) {
    drawingContext.lineTo(loc.x, loc.y);
    drawingContext.stroke();
    if (IconCanvasUtils.selectedFunction === 'pathClosed') {
        drawingContext.closePath();
        if (doFill) {
            drawingContext.fill();
        }
        drawingContext.stroke();
    }
}
function finishDrawingLine(loc, drawingContext) {
    drawingContext.beginPath();
    drawingContext.moveTo(mousedown.x, mousedown.y);
    drawingContext.lineTo(loc.x, loc.y);
    drawingContext.stroke();
}
function finishDrawingCircle(loc, drawingContext) {
    var angle = Math.atan(rubberbandH / rubberbandW);
    var radius = rubberbandH / Math.sin(angle);
    if (mousedown.y === loc.y) {
        radius = Math.abs(loc.x - mousedown.x);
    }
    drawingContext.beginPath();
    drawingContext.arc(mousedown.x, mousedown.y, radius, 0, Math.PI * 2, false);
    if (doFill) {
        drawingContext.fill();
    }
    drawingContext.stroke();
}
function finishDrawingRectangle(drawingContext) {
    if (rubberbandW > 0 && rubberbandH > 0) {
        if (doFill) {
            drawingContext.fillRect(rubberbandUlhc.x, rubberbandUlhc.y, rubberbandW, rubberbandH);
        }
        drawingContext.strokeRect(rubberbandUlhc.x, rubberbandUlhc.y, rubberbandW, rubberbandH);
    }
}
var DrawCanvasUtils = {
    setIconCanvasContext: setIconCanvasContext2,
    drawBackground: drawBackground,
    listenEvent: listenEvent2,
    saveDrawingSurface: saveDrawingSurface
};
