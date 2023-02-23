// Sets initial conditions for canvas
const canvas = new fabric.Canvas("canvas")
canvas.isDrawingMode = true;
canvas.freeDrawingBrush.color = 'black';
canvas.freeDrawingBrush.width = 5;
canvas.backgroundColor = "white";
canvas.renderAll();

// Stack for undo and redo 
canvas.on('object:added',function(){
  if(!isRedoing){
    stack = [];
  }
  isRedoing = false;
});

var isRedoing = false;
var stack = [];
function undo(){
  if(canvas._objects.length>0){
   stack.push(canvas._objects.pop());
   canvas.renderAll();
  }
}
function redo(){
  if(stack.length>0){
    isRedoing = true;
   canvas.add(stack.pop());
  }
}

// Refreshes canvas
function rebuildCanvas() {
  canvas.isDrawingMode = true;
  canvas.freeDrawingBrush.color = 'black';
  canvas.freeDrawingBrush.width = 5;
  canvas.backgroundColor = "white";
  canvas.renderAll();
}

// Changes brush color
function changeColor() {
  canvas.freeDrawingBrush.color = document.getElementById("colorpicker").value;
}

// Changes brush size
function changeSize() {
  canvas.freeDrawingBrush.width = document.getElementById("sizepicker").value;
  sizeValue.value = document.getElementById("sizepicker").value;
}

function clearCanvas() {
  canvas.clear();
  rebuildCanvas();
}
