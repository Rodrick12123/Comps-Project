//sets initial conditions for canvas
const canvas = new fabric.Canvas("canvas")
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush.color = 'blue';
  canvas.freeDrawingBrush.width = 5;
  canvas.backgroundColor = "white";
  canvas.renderAll();

function rebuildCanvas() {
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush.color = 'blue';
  canvas.freeDrawingBrush.width = 5;
  canvas.backgroundColor = "white";
  canvas.renderAll();
}

//changes brush color
function changeColor() {
  canvas.freeDrawingBrush.color = document.getElementById("colorpicker").value;
}

//changes brush size
function changeSize() {
  canvas.freeDrawingBrush.width = document.getElementById("sizepicker").value;
}

function saveCanvas() {
  //var canvasInput = canvas.toDataURL('png')//JSON.stringify(canvas.toJSON());
  //canvas.innerHTML = canvasInput
  //enterCanvasButtonClicked()
  //alert(canvas.loadFromJSON(canvasInput))
}

function getObject() {
  //canvas.toObject()
  //return canvasObject
}

function clearCanvas() {
  canvas.clear();
  rebuildCanvas();
}
