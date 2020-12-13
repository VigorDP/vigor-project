const ICON_BACKGROUND_STYLE = '#eeeeee';
const ICON_BORDER_STROKE_STYLE = 'rgba(100, 140, 230, 0.5)';
const ICON_STROKE_STYLE = 'rgb(100, 140, 230)';
const ICON_FILL_STYLE = '#dddddd';
const SHADOW_COLOR = 'rgba(0,0,0,0.7)';
const TEXT_ICON_FILL_STYLE = 'rgba(100, 140, 230, 0.5)';
const TEXT_ICON_TEXT = 'T';
const CIRCLE_ICON_RADIUS = 20;

const ERASER_ICON_GRID_COLOR = 'rgb(0, 0, 200)';
const ERASER_ICON_CIRCLE_COLOR = 'rgba(100, 140, 200, 0.5)';
const ERASER_ICON_RADIUS = 20;

enum ICONS {
  LINE_ICON = 0, // 直线
  RECTANGLE_ICON = 1, // 矩形
  CIRCLE_ICON = 2, // 圆形
  OPEN_PATH_ICON = 3, // 非闭合路径
  CLOSED_PATH_ICON = 4, // 闭合路径
  CURVE_ICON = 5, // 贝塞尔曲线
  TEXT_ICON = 6, // 文本
  ERASER_ICON = 7, // 橡皮擦
}

const ICON_RECTANGLES = [
  { x: 13.5, y: 18.5, w: 48, h: 48 },
  { x: 13.5, y: 78.5, w: 48, h: 48 },
  { x: 13.5, y: 138.5, w: 48, h: 48 },
  { x: 13.5, y: 198.5, w: 48, h: 48 },
  { x: 13.5, y: 258.5, w: 48, h: 48 },
  { x: 13.5, y: 318.5, w: 48, h: 48 },
  { x: 13.5, y: 378.5, w: 48, h: 48 },
  { x: 13.5, y: 508.5, w: 48, h: 48 },
];

let selectedRect;
let selectedFunction;
let doFill;

const IconCanvasUtils = {
  setIconCanvasContext,
  listenEvent,
  drawIcons,
  selectedRect,
  selectedFunction,
  doFill,
};

function drawIcons(iconContext, iconCanvas) {
  iconContext.clearRect(0, 0, iconCanvas.width, iconCanvas.height);

  ICON_RECTANGLES.forEach(function (rect) {
    iconContext.save();

    if (selectedRect === rect) setSelectedIconShadow(iconContext);
    else setIconShadow(iconContext);

    iconContext.fillStyle = ICON_BACKGROUND_STYLE;
    iconContext.fillRect(rect.x, rect.y, rect.w, rect.h);

    iconContext.restore();

    drawIcon(rect, iconContext);
  });
}

function drawIcon(rect, iconContext: CanvasRenderingContext2D) {
  iconContext.save();

  iconContext.strokeStyle = ICON_BORDER_STROKE_STYLE;
  iconContext.strokeRect(rect.x, rect.y, rect.w, rect.h);
  iconContext.strokeStyle = ICON_STROKE_STYLE;

  if (rect.y === ICON_RECTANGLES[ICONS.LINE_ICON].y) drawLineIcon(rect, iconContext);
  else if (rect.y === ICON_RECTANGLES[ICONS.RECTANGLE_ICON].y) drawRectIcon(rect, iconContext);
  else if (rect.y === ICON_RECTANGLES[ICONS.CIRCLE_ICON].y) drawCircleIcon(rect, iconContext);
  else if (rect.y === ICON_RECTANGLES[ICONS.OPEN_PATH_ICON].y) drawOpenPathIcon(rect, iconContext);
  else if (rect.y === ICON_RECTANGLES[ICONS.CLOSED_PATH_ICON].y) drawClosedPathIcon(rect, iconContext);
  else if (rect.y === ICON_RECTANGLES[ICONS.TEXT_ICON].y) drawTextIcon(rect, iconContext);
  else if (rect.y === ICON_RECTANGLES[ICONS.CURVE_ICON].y) drawCurveIcon(rect, iconContext);
  else if (rect.y === ICON_RECTANGLES[ICONS.ERASER_ICON].y) drawEraserIcon(rect, iconContext);
  iconContext.restore();
}

function drawLineIcon(rect, iconContext: CanvasRenderingContext2D) {
  iconContext.beginPath();
  iconContext.moveTo(rect.x + 5, rect.y + 5);
  iconContext.lineTo(rect.x + rect.w - 5, rect.y + rect.h - 5);
  iconContext.stroke();
}

function drawRectIcon(rect, iconContext: CanvasRenderingContext2D) {
  fillIconLowerRight(rect, iconContext);
  iconContext.strokeRect(rect.x + 5, rect.y + 5, rect.w - 10, rect.h - 10);
}

function drawCircleIcon(rect, iconContext: CanvasRenderingContext2D) {
  fillIconLowerRight(rect, iconContext);
  iconContext.beginPath();
  iconContext.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, CIRCLE_ICON_RADIUS, 0, Math.PI * 2, false);
  iconContext.stroke();
}

function drawOpenPathIcon(rect, iconContext: CanvasRenderingContext2D) {
  iconContext.beginPath();
  drawOpenPathIconLines(rect, iconContext);
  iconContext.stroke();
}

function drawClosedPathIcon(rect, iconContext: CanvasRenderingContext2D) {
  fillIconLowerRight(rect, iconContext);
  iconContext.beginPath();
  drawOpenPathIconLines(rect, iconContext);
  iconContext.closePath();
  iconContext.stroke();
}

function drawCurveIcon(rect, iconContext: CanvasRenderingContext2D) {
  fillIconLowerRight(rect, iconContext);
  iconContext.beginPath();
  iconContext.moveTo(rect.x + rect.w - 10, rect.y + 5);
  iconContext.quadraticCurveTo(rect.x - 10, rect.y + 40, rect.x + rect.w - 10, rect.y + rect.h - 5);
  iconContext.stroke();
}

function drawTextIcon(rect, iconContext: CanvasRenderingContext2D) {
  const text = TEXT_ICON_TEXT;

  fillIconLowerRight(rect, iconContext);
  iconContext.fillStyle = TEXT_ICON_FILL_STYLE;
  iconContext.fillText(text, rect.x + rect.w / 2, rect.y + rect.h / 2 + 5);
  iconContext.strokeText(text, rect.x + rect.w / 2, rect.y + rect.h / 2 + 5);
}

function drawEraserIcon(rect, iconContext: CanvasRenderingContext2D) {
  iconContext.save();

  iconContext.beginPath();
  iconContext.arc(rect.x + rect.w / 2, rect.y + rect.h / 2, ERASER_ICON_RADIUS, 0, Math.PI * 2, false);

  iconContext.strokeStyle = ERASER_ICON_CIRCLE_COLOR;
  iconContext.stroke();

  iconContext.clip(); // restrict CommonCanvasHelpers.() to the circle

  CommonCanvasHelpers.drawGrid(iconContext, ERASER_ICON_GRID_COLOR, 5, 5);

  iconContext.restore();
}

function drawOpenPathIconLines(rect, iconContext: CanvasRenderingContext2D) {
  iconContext.lineTo(rect.x + 13, rect.y + 19);
  iconContext.lineTo(rect.x + 15, rect.y + 17);
  iconContext.lineTo(rect.x + 25, rect.y + 12);
  iconContext.lineTo(rect.x + 35, rect.y + 13);
  iconContext.lineTo(rect.x + 38, rect.y + 15);
  iconContext.lineTo(rect.x + 40, rect.y + 17);
  iconContext.lineTo(rect.x + 39, rect.y + 23);
  iconContext.lineTo(rect.x + 36, rect.y + 25);
  iconContext.lineTo(rect.x + 32, rect.y + 27);
  iconContext.lineTo(rect.x + 28, rect.y + 29);
  iconContext.lineTo(rect.x + 26, rect.y + 31);
  iconContext.lineTo(rect.x + 24, rect.y + 33);
  iconContext.lineTo(rect.x + 22, rect.y + 35);
  iconContext.lineTo(rect.x + 20, rect.y + 37);
  iconContext.lineTo(rect.x + 18, rect.y + 39);
  iconContext.lineTo(rect.x + 16, rect.y + 39);
  iconContext.lineTo(rect.x + 13, rect.y + 36);
  iconContext.lineTo(rect.x + 11, rect.y + 34);
}

function fillIconLowerRight(rect, iconContext: CanvasRenderingContext2D) {
  iconContext.beginPath();
  iconContext.moveTo(rect.x + rect.w, rect.y);
  iconContext.lineTo(rect.x + rect.w, rect.y + rect.h);
  iconContext.lineTo(rect.x, rect.y + rect.h);
  iconContext.closePath();
  iconContext.fill();
}

function setSelectedIconShadow(iconContext: CanvasRenderingContext2D) {
  iconContext.shadowColor = SHADOW_COLOR;
  iconContext.shadowOffsetX = 4;
  iconContext.shadowOffsetY = 4;
  iconContext.shadowBlur = 5;
}

function setIconShadow(iconContext: CanvasRenderingContext2D) {
  iconContext.shadowColor = SHADOW_COLOR;
  iconContext.shadowOffsetX = 1;
  iconContext.shadowOffsetY = 1;
  iconContext.shadowBlur = 2;
}

function setIconCanvasContext(iconContext: CanvasRenderingContext2D) {
  iconContext.strokeStyle = ICON_STROKE_STYLE;
  iconContext.fillStyle = ICON_FILL_STYLE;
  iconContext.font = '48px Palatino';
  iconContext.textAlign = 'center';
  iconContext.textBaseline = 'middle';
}

function listenEvent(iconContext, iconCanvas) {
  iconCanvas.onmousedown = function (e) {
    const x = e.x || e.clientX;
    const y = e.y || e.clientY;
    const loc = CommonCanvasHelpers.windowToCanvas(iconCanvas, x, y);
    e.preventDefault();
    handleMouseDownEvent(loc, iconContext, iconCanvas);
  };
}

function handleMouseDownEvent(loc, iconContext, iconCanvas) {
  // if (editingText) {
  //   editingText = false;
  //   eraseTextCursor();
  //   hideKeyboard();
  // } else if (editingCurve) {
  //   editingCurve = false;
  //   restoreDrawingSurface();
  // }

  ICON_RECTANGLES.forEach(function (rect) {
    iconContext.beginPath();

    iconContext.rect(rect.x, rect.y, rect.w, rect.h);
    if (iconContext.isPointInPath(loc.x, loc.y)) {
      selectIcon(rect, iconContext, iconCanvas);
      IconCanvasUtils.selectedFunction = getIconFunction(iconContext, rect, loc);
    }
  });
}

function selectIcon(rect, iconContext: CanvasRenderingContext2D, iconCanvas) {
  selectedRect = rect;
  drawIcons(iconContext, iconCanvas);
}

function getIconFunction(iconContext, rect, loc) {
  let action;

  if (rect.y === ICON_RECTANGLES[ICONS.LINE_ICON].y) action = 'line';
  else if (rect.y === ICON_RECTANGLES[ICONS.RECTANGLE_ICON].y) action = 'rectangle';
  else if (rect.y === ICON_RECTANGLES[ICONS.CIRCLE_ICON].y) action = 'circle';
  else if (rect.y === ICON_RECTANGLES[ICONS.OPEN_PATH_ICON].y) action = 'path';
  else if (rect.y === ICON_RECTANGLES[ICONS.CLOSED_PATH_ICON].y) action = 'pathClosed';
  else if (rect.y === ICON_RECTANGLES[ICONS.CURVE_ICON].y) action = 'curve';
  else if (rect.y === ICON_RECTANGLES[ICONS.TEXT_ICON].y) action = 'text';
  else if (rect.y === ICON_RECTANGLES[ICONS.ERASER_ICON].y) action = 'erase';

  if (
    action === 'rectangle' ||
    action === 'circle' ||
    action === 'pathClosed' ||
    action === 'text' ||
    action === 'curve'
  ) {
    doFill = isPointInIconLowerRight(iconContext, rect, loc.x, loc.y);
  }

  return action;
}

function isPointInIconLowerRight(iconContext, rect, x, y) {
  iconContext.beginPath();
  iconContext.moveTo(rect.x + rect.w, rect.y);
  iconContext.lineTo(rect.x + rect.w, rect.y + rect.h);
  iconContext.lineTo(rect.x, rect.y + rect.h);

  return iconContext.isPointInPath(x, y);
}
