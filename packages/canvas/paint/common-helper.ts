function windowToCanvas(canvas, x, y) {
  const bbox = canvas.getBoundingClientRect();
  return { x: x - bbox.left * (canvas.width / bbox.width), y: y - bbox.top * (canvas.height / bbox.height) };
}

function drawGrid(context, color, stepx, stepy) {
  context.save();

  context.strokeStyle = color;
  context.fillStyle = '#ffffff';
  context.lineWidth = 0.5;
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  context.globalAlpha = 0.1;

  context.beginPath();
  for (let i = stepx + 0.5; i < context.canvas.width; i += stepx) {
    context.moveTo(i, 0);
    context.lineTo(i, context.canvas.height);
  }
  context.stroke();

  context.beginPath();
  for (let i = stepy + 0.5; i < context.canvas.height; i += stepy) {
    context.moveTo(0, i);
    context.lineTo(context.canvas.width, i);
  }
  context.stroke();

  context.restore();
}

// Guidewires
function drawHorizontalLine(y, drawingContext, drawingCanvas) {
  drawingContext.beginPath();
  drawingContext.moveTo(0, y + 0.5);
  drawingContext.lineTo(drawingCanvas.width, y + 0.5);
  drawingContext.stroke();
}

function drawVerticalLine(x, drawingContext, drawingCanvas) {
  drawingContext.beginPath();
  drawingContext.moveTo(x + 0.5, 0);
  drawingContext.lineTo(x + 0.5, drawingCanvas.height);
  drawingContext.stroke();
}

function drawGuidewires(x, y, drawingContext, drawingCanvas) {
  drawingContext.save();
  drawingContext.strokeStyle = 'rgba(0,0,230,0.4)';
  drawingContext.lineWidth = 0.5;
  drawVerticalLine(x, drawingContext, drawingCanvas);
  drawHorizontalLine(y, drawingContext, drawingCanvas);
  drawingContext.restore();
}

const CommonCanvasHelpers = {
  windowToCanvas,
  drawGrid,
  drawGuidewires,
};
