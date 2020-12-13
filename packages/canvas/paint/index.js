var Paint = /** @class */ (function () {
    function Paint() {
        var _a, _b;
        this.iconCanvas = document.getElementById('iconCanvas');
        this.iconCanvasContext = (_a = this.iconCanvas) === null || _a === void 0 ? void 0 : _a.getContext('2d');
        this.drawCanvas = document.getElementById('drawCanvas');
        this.drawCanvasContext = (_b = this.drawCanvas) === null || _b === void 0 ? void 0 : _b.getContext('2d');
        this.iconCanvasContext && this.drawCanvasContext && this.init();
    }
    Paint.prototype.init = function () {
        this.listenOptionsChange();
        this.initIconCanvas();
        this.initDrawCanvas();
    };
    Paint.prototype.listenOptionsChange = function () {
        var _this = this;
        this.strokeStyleSelect = document.getElementById('strokeStyleSelect');
        this.fillStyleSelect = document.getElementById('fillStyleSelect');
        this.lineWidthSelect = document.getElementById('lineWidthSelect');
        this.eraseAllButton = document.getElementById('eraseAllButton');
        this.strokeStyleSelect.onchange = function (_) { return (_this.drawCanvasContext.strokeStyle = _this.strokeStyleSelect.value); };
        this.fillStyleSelect.onchange = function (_) { return (_this.drawCanvasContext.fillStyle = _this.fillStyleSelect.value); };
        this.lineWidthSelect.onchange = function (_) { return (_this.drawCanvasContext.lineWidth = +_this.lineWidthSelect.value); };
        this.eraseAllButton.onclick = function (_) {
            _this.drawCanvasContext.clearRect(0, 0, _this.drawCanvas.width, _this.drawCanvas.height);
            CommonCanvasHelpers.drawGrid(_this.drawCanvasContext, GRID_LINE_COLOR, 10, 10);
            DrawCanvasUtils.saveDrawingSurface(_this.drawCanvasContext, _this.drawCanvas);
            // rubberbandW = rubberbandH = 0;
        };
    };
    Paint.prototype.initIconCanvas = function () {
        IconCanvasUtils.setIconCanvasContext(this.iconCanvasContext);
        IconCanvasUtils.drawIcons(this.iconCanvasContext, this.iconCanvas);
        IconCanvasUtils.listenEvent(this.iconCanvasContext, this.iconCanvas);
    };
    Paint.prototype.initDrawCanvas = function () {
        DrawCanvasUtils.setIconCanvasContext(this.drawCanvasContext, this.strokeStyleSelect.value, this.fillStyleSelect.value, this.lineWidthSelect.value);
        DrawCanvasUtils.drawBackground(this.drawCanvasContext, GRID_LINE_COLOR, 10, 10);
        DrawCanvasUtils.listenEvent(this.drawCanvasContext, this.drawCanvas);
    };
    return Paint;
}());
new Paint();
