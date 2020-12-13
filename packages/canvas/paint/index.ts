class Paint {
  iconCanvas: HTMLCanvasElement;
  iconCanvasContext: CanvasRenderingContext2D;
  drawCanvas: HTMLCanvasElement;
  drawCanvasContext: CanvasRenderingContext2D;

  strokeStyleSelect: HTMLSelectElement;
  fillStyleSelect: HTMLSelectElement;
  lineWidthSelect: HTMLSelectElement;
  eraseAllButton: HTMLSelectElement;
  constructor() {
    this.iconCanvas = document.getElementById('iconCanvas') as HTMLCanvasElement;
    this.iconCanvasContext = this.iconCanvas?.getContext('2d');
    this.drawCanvas = document.getElementById('drawCanvas') as HTMLCanvasElement;
    this.drawCanvasContext = this.drawCanvas?.getContext('2d');
    this.iconCanvasContext && this.drawCanvasContext && this.init();
  }
  init() {
    this.listenOptionsChange();
    this.initIconCanvas();
    this.initDrawCanvas();
  }
  listenOptionsChange() {
    this.strokeStyleSelect = document.getElementById('strokeStyleSelect') as HTMLSelectElement;
    this.fillStyleSelect = document.getElementById('fillStyleSelect') as HTMLSelectElement;
    this.lineWidthSelect = document.getElementById('lineWidthSelect') as HTMLSelectElement;
    this.eraseAllButton = document.getElementById('eraseAllButton') as HTMLSelectElement;
    this.strokeStyleSelect.onchange = _ => (this.drawCanvasContext.strokeStyle = this.strokeStyleSelect.value);
    this.fillStyleSelect.onchange = _ => (this.drawCanvasContext.fillStyle = this.fillStyleSelect.value);
    this.lineWidthSelect.onchange = _ => (this.drawCanvasContext.lineWidth = +this.lineWidthSelect.value);
    this.eraseAllButton.onclick = _ => {
      this.drawCanvasContext.clearRect(0, 0, this.drawCanvas.width, this.drawCanvas.height);
      CommonCanvasHelpers.drawGrid(this.drawCanvasContext, GRID_LINE_COLOR, 10, 10);
      DrawCanvasUtils.saveDrawingSurface(this.drawCanvasContext, this.drawCanvas);
      // rubberbandW = rubberbandH = 0;
    };
  }
  initIconCanvas() {
    IconCanvasUtils.setIconCanvasContext(this.iconCanvasContext);
    IconCanvasUtils.drawIcons(this.iconCanvasContext, this.iconCanvas);
    IconCanvasUtils.listenEvent(this.iconCanvasContext, this.iconCanvas);
  }
  initDrawCanvas() {
    DrawCanvasUtils.setIconCanvasContext(
      this.drawCanvasContext,
      this.strokeStyleSelect.value,
      this.fillStyleSelect.value,
      this.lineWidthSelect.value,
    );
    DrawCanvasUtils.drawBackground(this.drawCanvasContext, GRID_LINE_COLOR, 10, 10);
    DrawCanvasUtils.listenEvent(this.drawCanvasContext, this.drawCanvas);
  }
}

new Paint();
