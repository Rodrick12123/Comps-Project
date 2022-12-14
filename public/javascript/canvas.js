//sets initial conditions for canvas
const canvas = new fabric.Canvas("canvas")
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush.color = 'blue';
  canvas.freeDrawingBrush.width = 5;
  canvas.backgroundColor = "white";

//changes brush color
function changeColor() {
  canvas.freeDrawingBrush.color = document.getElementById("colorpicker").value;
}

//changes brush size
function changeSize() {
  canvas.freeDrawingBrush.width = document.getElementById("sizepicker").value;
}

function saveCanvas() {
  var canvasInput = canvas.toJSON();
  alert(canvas.loadFromJSON(canvasInput))
}

