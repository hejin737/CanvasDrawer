
var left = 0;
var right = 2;
function Drawer() {
    this.grid = 5;
    // this.scale = 2;
    this.x = 0;
    this.y = 0;
    this.parts_bin = [];
    this.canvas = document.getElementById("myCanvas");
    this.canvas.drawer = this;
    this.cursor_x = 0;
    this.cursor_y = 0;
    this.points = [];
    this.lines = [];
    this.preDot = null;
    this.tempLine = null;
    this.dragging = [];
    this.dotSelected = false;

    this.canvas.addEventListener('mousedown', drawer_mouse_down, false);
    this.canvas.addEventListener('mouseup', drawer_mouse_up, false);
    this.canvas.addEventListener('mousemove', drawer_mouse_move, false);
    this.canvas.addEventListener('contextmenu', context_menu, false);

}
Drawer.prototype.redraw = function() {
    var ctx = this.canvas.getContext("2d");
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.strokeStyle = 'black';
    var first_x = 0;
    var last_x = this.canvas.width ;
    var first_y = 0;
    var last_y = this.canvas.height ;
    for (var i = first_x; i < last_x; i += this.grid)
        this.drawLine(ctx, i, first_y, i, last_y, 0.1);
    for (var i = first_y; i < last_y; i += this.grid)
        this.drawLine(ctx, first_x, i, last_x, i, 0.1);
    for (var i = 0; i < this.points.length; i++) {
        if (this.points[i].selected) this.points[i].draw(ctx);
    }
    for (var i = 0; i < this.lines.length; i++) {
        this.lines[i].draw(ctx);
    }
    if (this.tempLine) {
        this.tempLine.draw(ctx);
    }
    if (this.preDot){
        this.preDot.selected = true;
        this.preDot.draw(ctx)
    }

};


Drawer.prototype.drawLine = function(c, x1, y1, x2, y2, width) {
    c.strokeStyle = 'black';
    c.lineWidth = width ;
    c.beginPath();
    c.moveTo((x1 - this.x) , (y1 - this.y) );
    c.lineTo((x2 - this.x) , (y2 - this.y) );
    c.stroke();
}

Drawer.prototype.moveTo = function(c, x, y) {
    c.moveTo((x - this.x) , (y - this.y) );
}

Drawer.prototype.lineTo = function(c, x, y) {
    c.lineTo((x - this.x) , (y - this.y) );
}

Drawer.prototype.unselect_all = function(){
  for (var i = 0; i < this.lines.length; i++) {
      this.lines[i].selected = false;
  }
  for (var i = 0; i < this.points.length; i++) {
      this.points[i].selected = false;
  }
}


function Dot(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 3;
    this.selected = false;
    this.connected = false;
    this.move_x = 0;
    this.move_y = 0;
    this.connection = [];
}

Dot.prototype.draw = function(c) {
    c.fillStyle = this.selected? 'red':'black';
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
}

Dot.prototype.select = function(x, y){
  var near = 5;
  if ((this.x >= x - near)&&(this.x <= x + near)&&(this.y >= y- near)&&(this.y <= y + near)){
    this.selected = true;
    this.moveBegin();
    return true;
  }
  return false;
}
Dot.prototype.moveBegin = function(){
  this.move_x = this.x;
  this.move_y = this.y;
}

Dot.prototype.moveTo = function(dx, dy){
  // console.log(this.y, this.move_y);
  this.x = this.move_x + dx;
  this.y = this.move_y + dy;
  // console.log(this.y, this.move_y);
}

function Line(start, end) {
    this.startDot = start;
    this.endDot = end;
    this.selected = false;
    this.box = [start.x, end.x, start.y, end.y];

}

Line.prototype.draw = function(c) {
    c.strokeStyle = this.selected ? 'red' : 'black';

    c.lineWidth = 0.5;
    c.beginPath();
    c.moveTo(this.startDot.x, this.startDot.y);
    c.lineTo(this.endDot.x, this.endDot.y);
    c.stroke();
    // console.log(this.start_point.x);
}

Line.prototype.updateBox = function(){
  if (this.startDot.x < this.endDot.x) {
    this.box[0] = this.startDot.x;
    this.box[1] = this.endDot.x;
  }
  else{
    this.box[0] = this.endDot.x;
    this.box[1] = this.startDot.x;
  }

  if (this.startDot.y < this.endDot.y) {
    this.box[2] = this.startDot.y;
    this.box[3] = this.endDot.y;
  }
  else{
    this.box[2] = this.endDot.y;
    this.box[3] = this.startDot.y;
  }

}
Line.prototype.insideBox = function(x, y){

  if ((this.box[0]-5<=x && this.box[1]+5>=x)&&(this.box[2]-5<=y && this.box[3]+5>=y)){
    return true;
  }
  return false;
}

Line.prototype.select = function(x, y) {
  this.updateBox();
  if (this.insideBox(x,y)){
  var dy = this.endDot.y - this.startDot.y;
  var dx = this.endDot.x - this.startDot.x;
  var len = Math.sqrt(dx*dx + dy*dy)
  var distance = Math.abs((x - this.startDot.x)*dy - (y - this.startDot.y)*dx)/len;
		if (distance <= 5) {
      this.selected = true;
      this.startDot.selected = true;
      this.endDot.selected = true;
      return true;
    }
  }
    return false;
}

function drawer_mouse_move(event) {
    if (!event) event = window.event;
    var cav = (window.event) ? event.srcElement.drawer : event.target.drawer;
    event.preventDefault();
    cav.canvas.getCoords(event);
    var x = cav.canvas.mouse_x + cav.x;
    var y = cav.canvas.mouse_y + cav.y;
    var temp_x = Math.round(x / cav.grid) * cav.grid;
    var temp_y = Math.round(y / cav.grid) * cav.grid;
    //  console.log(cav.dragging.length);
    if (cav.dragging.length != 0){
      for (var i = 0; i < cav.dragging.length; i++){
        cav.dragging[i].moveTo(temp_x - cav.cursor_x , temp_y - cav.cursor_y);
      }
      // console.log(cav.dragging);
      cav.preDot = null;
      cav.redraw();
      return false;
    }
    cav.unselect_all();
    cav.dotSelected = false;
    for (var i = 0; i < cav.points.length; i++) {
      if(cav.points[i].select(temp_x, temp_y)) {
        cav.dotSelected = true;
        break;
      }
    }
    if (cav.preDot) {
        cav.tempLine = new Line(cav.preDot,new Dot(temp_x, temp_y));
        cav.tempLine.selected = true;
    }
    else{
      if (!cav.dotSelected){
        for (var i = 0; i < cav.lines.length; i++) {
        if(cav.lines[i].select(x, y)) break;
      }
    }
    }
    cav.redraw();
    return false;
}

function context_menu(event) {
    if (event.button == right) {
        if (!event) event = window.event;
        var cav = (window.event) ? event.srcElement.drawer : event.target.drawer;
        event.preventDefault();

        if (cav.preDot) {
            if (cav.preDot.connection.length == 0) {
                cav.points.splice(-1, 1);
            }
        }
        cav.unselect_all();
        cav.preDot = null;
        cav.tempLine = null;
        cav.dragging = [];
        cav.redraw();
    }
    return false;
}

function drawer_mouse_up(event) {
    if (!event) event = window.event;
    else event.preventDefault();
    var cav = (window.event) ? event.srcElement.drawer : event.target.drawer;

    cav.dragging = [];
    // console.log(cav.dragging);
}

function drawer_mouse_down(event) {
    if (!event) event = window.event;
    else event.preventDefault();
    var cav = (window.event) ? event.srcElement.drawer : event.target.drawer;

    //
    cav.canvas.getCoords(event);
    var x = cav.canvas.mouse_x  + cav.x;
    var y = cav.canvas.mouse_y  + cav.y;
    cav.cursor_x = Math.round(x / cav.grid) * cav.grid;
    cav.cursor_y = Math.round(y / cav.grid) * cav.grid;
    if (event.button == left) {
        cav.unselect_all();


        for (var i = 0; i < cav.points.length; i++) {
          if (cav.points[i].select(cav.cursor_x, cav.cursor_y)){
            if (cav.preDot){
              // cav.points[i].selected = false;
              var newLine = new Line(cav.preDot, cav.points[i]);
              cav.lines.push(newLine);
              // newLine.addDot(cav.preDot,newDot);
              cav.preDot.connection.push(newLine);// = true;
              //cav.points[i].connected = true;
              cav.points[i].connection.push(newLine);
              cav.preDot = cav.points[i];
            }
            else{
              cav.dragging.push(cav.points[i]);
              cav.preDot = cav.points[i];
            }
            cav.redraw();
            return false;
          }
        }
        if (!cav.preDot){
        for (var i = 0; i < cav.lines.length; i++) {
            // this.draw_dot(ctx,this.points[i][0],this.points[i][1],2);
            if (cav.lines[i].select(x , y )) {
                cav.dragging.push(cav.lines[i].startDot);
                cav.dragging.push(cav.lines[i].endDot);
                cav.lines[i].startDot.moveBegin();
                cav.lines[i].endDot.moveBegin();
                cav.redraw();
                return false;
            }
        }
      }
        var newDot = new Dot(cav.cursor_x , cav.cursor_y );
        newDot.selected = true;
        cav.points.push(newDot);

        if (cav.preDot) {
            // var newLine = new Line(cav.preDot.x, cav.preDot.y, newDot.x, newDot.y);
            var newLine = new Line(cav.preDot, newDot);
            cav.lines.push(newLine);
            // newLine.addDot(cav.preDot,newDot);
            // cav.preDot.connected = true;
            // newDot.connected = true;
            cav.preDot.connection.push(newLine);// = true;
            //cav.points[i].connected = true;
            newDot.connection.push(newLine);
        }
        cav.preDot = newDot;


        // console.log(cav.points,cav.lines);
    }
    cav.redraw();
    return false;
}
//
HTMLCanvasElement.prototype.getCoords = function(event) {
    this.mouse_x = event.pageX - this.offsetLeft;
    this.mouse_y = event.pageY - this.offsetTop;

    this.page_x = event.pageX;
    this.page_y = event.pageY;
}

function initDrawer(){
  var drawer = new Drawer();
  drawer.redraw();
}
document.onload = initDrawer();
