var mat = [];
var canvas;
var ctx;
var cell_size;
var selected = [-1, -1];
var selection = new Image();
var turn = false;
var dirNorm = [[1, -1], [1, 1]];
var dirKing = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
var availableMoves = [];
var jumpMoves = [];
var move;
var surrender;
var nextTurn;
var player;
var moved = false;
var moving = false;
var finished = false;
selection.src = "resources/selection.png"

$(document).ready(function() {
  initialize();
});

function initialize() {
  canvas = document.getElementById("board");
  move = document.getElementById("move");
  surrender = document.getElementById("surrender");
  nextTurn = document.getElementById("turn");
  player = document.getElementById("player");
  ctx = canvas.getContext("2d");
  for(var i = 0; i < 8; i++){
    mat[i] = [];
    for(var j = 0; j < 8; j++){
      mat[i][j] = (i + j) % 2 == 0 ? 0 : (i < 3 ? 1 : (i > 4 ? 2 : 0))
    }
  }
  window.addEventListener('resize', drawEvent, false);
  canvas.addEventListener('click', clickEvent, false);
  move.addEventListener('click', moveEvent, false);
  surrender.addEventListener('click', surrenderEvent, false);
  nextTurn.addEventListener('click', turnEvent, false);
  drawEvent();
  turnEvent();
}

function surrenderEvent(event){
  nextTurn.disabled = true;
  move.disabled = true;
  surrender.disabled = true;
  player.innerHTML = turn ? "Black" : "Red";
  player.style.color = player.innerHTML;
  player.innerHTML += " Wins!";
  finished = true;
}

function moveEvent(event){
  if(mat[selected[0]][selected[1]] % 2 == turn && mat[selected[0]][selected[1]]){
    getAvailableMoves(false);
    if(moved && availableMoves.length == 0)
      nextTurn.disabled = false;
    drawEvent();
  }
}

function turnEvent(event){
  turn = !turn;
  nextTurn.disabled = true;
  move.disabled = false;
  player.innerHTML = turn ? "Red" : "Black";
  player.style.color = player.innerHTML;
  moved = false;
  moving = false;
}

function clickEvent(event){
  if(!finished){
    var new_selected = getCell(getMouse(event));
    if(availableMoves.exists(new_selected)){
      moving = true;
      move.disabled = true;
      mat[new_selected[0]][new_selected[1]] = mat[selected[0]][selected[1]];
      mat[selected[0]][selected[1]] = 0;
      selected = new_selected;
      if((selected[0] == 0 || selected[0] == 7) && mat[selected[0]][selected[1]] < 3)
        mat[selected[0]][selected[1]] += 2;
      if(jumpMoves[availableMoves.indexOf(selected)][0]){
        if(mat[jumpMoves[availableMoves.indexOf(selected)][1][0]][jumpMoves[availableMoves.indexOf(selected)][1][1]] % 2 != mat[selected[0]][selected[1]] % 2){
          mat[jumpMoves[availableMoves.indexOf(selected)][1][0]][jumpMoves[availableMoves.indexOf(selected)][1][1]] = 0;
        }
        getAvailableMoves(true);
        if(availableMoves.length == 0){
          nextTurn.disabled = false;
        }
      }
      else{
        clearMoves();
        nextTurn.disabled = false;
      }
    }
    else if(!moving){
      clearMoves();
      selected = new_selected
    }
    drawEvent();
  }
}

function drawEvent(event) {
  canvas.height = window.innerHeight / 2;
  canvas.width = window.innerHeight / 2;
  canvas.style.top = window.innerHeight / 100 * 30 + 'px';
  canvas.style.left = (window.innerWidth - canvas.width) / 2 + 'px';

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  cell_size = canvas.width / 8;

  for(var i = 0; i < 8; i++){
    for(var j = 0; j < 8; j++){
      draw_rect(i, j, (i + j) % 2 ? "#ffffff" : "#000000");
      if(mat[i][j] != 0){
        var img = new Image();
        img.src = "resources/checker" + mat[i][j] + ".png";
        draw_image(i, j, img);
      }
    }
  }

  draw_image(selected[0], selected[1], selection);

  for(var i = 0; i < availableMoves.length; i++){
    var img = new Image();
    img.src = "resources/target.png";
    draw_image(availableMoves[i][0], availableMoves[i][1], img);
  }
}

function getAvailableMoves(jumped){
  clearMoves();
  moves = mat[selected[0]][selected[1]] < 3 ? dirNorm : dirKing;
  dir = mat[selected[0]][selected[1]] % 2 == 0 ? -1 : 1
  for(var i = 0; i < moves.length; i++){
    try{
      if(mat[selected[0] + dir * moves[i][0]][selected[1] + dir * moves[i][1]] && !mat[selected[0] + dir * 2 * moves[i][0]][selected[1] + dir * 2 * moves[i][1]]){
        availableMoves.push([selected[0] + dir * 2 * moves[i][0], selected[1] + dir * 2 * moves[i][1]]);
        jumpMoves.push([true, [selected[0] + dir * moves[i][0], selected[1] + dir * moves[i][1]]]);
        if(availableMoves.last()[0] < 0 || availableMoves.last()[1] < 0 ||
           availableMoves.last()[0] > 7 || availableMoves.last()[1] > 7){
          availableMoves.pop();
          jumpMoves.pop();
        }
      }
      else if (!mat[selected[0] + dir * moves[i][0]][selected[1] + dir * moves[i][1]] && !jumped){
        availableMoves.push([selected[0] + dir * moves[i][0], selected[1] + dir * moves[i][1]]);
        jumpMoves.push([false, [-1, -1]]);
        if(availableMoves.last()[0] < 0 || availableMoves.last()[1] < 0 ||
           availableMoves.last()[0] > 7 || availableMoves.last()[1] > 7){
          availableMoves.pop();
          jumpMoves.pop();
        }
      }
    }catch(e){

    }
  }
}

function clearMoves(){
  availableMoves = [];
  jumpMoves = [];
}

function getCell(mouse){
  return[Math.floor(mouse[0] / cell_size), Math.floor(mouse[1] / cell_size)]
}

function getMouse(e){
  var x;
  var y;
  if (e.pageX || e.pageY) {
    x = e.pageX;
    y = e.pageY;
  }
  else {
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  return [x, y];
}

function draw_rect(i, j, color){
  ctx.fillStyle = color;
  ctx.fillRect(i * cell_size, j * cell_size, cell_size, cell_size)
}

function draw_image(i, j, img){
  if (img.complete) {
    ctx.drawImage(img, i * cell_size, j * cell_size, cell_size, cell_size)
  } else {
      img.onload = function () {
        ctx.drawImage(img, i * cell_size, j * cell_size, cell_size, cell_size)
      };
  }
}

if (!Array.prototype.last){
  Array.prototype.last = function(){
    return this[this.length - 1];
  };
}

if (!Array.prototype.exists){
  Array.prototype.exists = function(obj){
    var found = false;
    for(var i = 0; i < this.length; i++) {
      if (typeof this[i] === "object" && typeof obj === "object"){
        if (this[i].equals(obj)) {
          found = true;
          break;
        }
      }
      else if(typeof this[i] != "object" && typeof obj != "object"){
        if (this[i] == obj ) {
          found = true;
          break;
        }
      }
    }
    return found;
  };
}

Array.prototype.indexOf = function(obj){
  var index = -1;
  for(var i = 0; i < this.length; i++) {
    if (typeof this[i] === "object" && typeof obj === "object"){
      if (this[i].equals(obj)) {
        index = i;
        break;
      }
    }
    else if(typeof this[i] != "object" && typeof obj != "object"){
      if (this[i] == obj ) {
        index = i;
        break;
      }
    }
  }
  return index;
};

if (!Array.prototype.equals){
  Array.prototype.equals = function(other){
    return this === other || (
        this !== null && other !== null &&
        this.length === other.length &&
        this
            .map(function (val, idx) { return val === other[idx]; })
            .reduce(function (prev, cur) { return prev && cur; }, true)
    );
  };
};
