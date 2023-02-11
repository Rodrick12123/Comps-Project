//sets initial conditions for canvas
const canvas = new fabric.Canvas("canvas")
canvas.isDrawingMode = true;
canvas.freeDrawingBrush.color = 'black';
canvas.freeDrawingBrush.width = 5;
canvas.backgroundColor = "white";
canvas.renderAll();
canvas.on('object:added',function(){
  if(!isRedoing){
    h = [];
  }
  isRedoing = false;
});

var isRedoing = false;
var h = [];
function undo(){
  if(canvas._objects.length>0){
   h.push(canvas._objects.pop());
   canvas.renderAll();
  }
}
function redo(){
  
  if(h.length>0){
    isRedoing = true;
   canvas.add(h.pop());
  }
}

function rebuildCanvas() {
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush.color = 'black';
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

function clearCanvas() {
  canvas.clear();
  rebuildCanvas();
}
