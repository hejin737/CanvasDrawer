
function initDrawer(){
  var drawer = new Drawer();
  drawer.redraw();
}
window.onload = function(){initDrawer();};

var left = 0;
var right = 2;

function Drawer() {
    this.grid = 5;
    // this.scale = 2;
    this.x = 0;
    this.y = 0;
    this.canvas = document.getElementById("myCanvas");
    this.canvas.drawer = this;
    this.cursor_x = 0;
    this.cursor_y = 0;
    this.points = [];  //store the dots in the canvas
    this.lines = [];  //store lines
    this.preDot = null;  //start dot in the temp line
    this.tempLine = null;
    this.selecting = [];
    this.dotSelected = false;

    this.canvas.addEventListener('mousedown', drawer_mouse_down, false);
    this.canvas.addEventListener('mouseup', drawer_mouse_up, false);
    this.canvas.addEventListener('mousemove', drawer_mouse_move, false);
    this.canvas.addEventListener('contextmenu', context_menu, false);
    // this.canvas.addEventListener('keypress', drawer_key_down, false);
    window.addEventListener("keydown", drawer_key_down ,false);
}

//redraw the canvas when there is any change
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


Drawer.prototype.unselectAll = function(){
  for (var i = 0; i < this.lines.length; i++) {
      this.lines[i].selected = false;
  }
  for (var i = 0; i < this.points.length; i++) {
      this.points[i].selected = false;
  }
}

//delete lines
Drawer.prototype.delete = function(){
  for (var i = 0; i < this.lines.length; i++){
    var line = this.lines[i];
    if (line.selected){
       this.lines.splice(i,1);  //delete from canvas
       var s = line.startDot.connection;
       if (s.length == 1){   //delete dot which is islanded
         this.points.splice(this.points.indexOf(line.startDot),1);
       }
       else{
         s.splice(s.indexOf(line),1);
       }
       var e = line.endDot.connection;
       if (e.length == 1){
         this.points.splice(this.points.indexOf(line.endDot),1);
       }
       else{
         e.splice(e.indexOf(line),1);
       }

    }
  }
  this.redraw();
}

//hover lines and dots, start dragging
function drawer_mouse_move(event) {
    if (!event) event = window.event;
    var cav = (window.event) ? event.srcElement.drawer : event.target.drawer;
    event.preventDefault();
    cav.canvas.getCoords(event);
    var x = cav.canvas.mouse_x + cav.x;
    var y = cav.canvas.mouse_y + cav.y;
    var temp_x = Math.round(x / cav.grid) * cav.grid;
    var temp_y = Math.round(y / cav.grid) * cav.grid;
    //  console.log(cav.selecting.length);
    if (cav.selecting.length != 0){    //start dragging
      for (var i = 0; i < cav.selecting.length; i++){
        cav.selecting[i].moveTo(temp_x - cav.cursor_x , temp_y - cav.cursor_y);
      }
      // console.log(cav.selecting);
      cav.preDot = null;
      cav.redraw();
      return false;
    }
    cav.unselectAll();
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

//cancel drawing lines
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
        cav.unselectAll();
        cav.preDot = null;
        cav.tempLine = null;
        cav.selecting = [];
        cav.redraw();
    }
    return false;
}

// dragging end
function drawer_mouse_up(event) {
    if (!event) event = window.event;
    else event.preventDefault();
    var cav = (window.event) ? event.srcElement.drawer : event.target.drawer;
    if (cav.selecting.length != 0){

    }
    cav.selecting = [];
    // console.log(cav.selecting);
}

// select dots and lines on canvas
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
        cav.unselectAll();

        for (var i = 0; i < cav.points.length; i++) {    // check whether select a dot or not
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
              cav.selecting.push(cav.points[i]);
              cav.preDot = cav.points[i];
            }
            cav.redraw();
            return false;
          }
        }
        if (!cav.preDot){
        for (var i = 0; i < cav.lines.length; i++) {  //check whether select a line or not
            // this.draw_dot(ctx,this.points[i][0],this.points[i][1],2);
            if (cav.lines[i].select(x , y )) {
                cav.selecting.push(cav.lines[i].startDot);
                cav.selecting.push(cav.lines[i].endDot);
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

//delete lines and dots
function drawer_key_down(event){

  if (!event) event = window.event;
  // var cav = (window.event) ? event.srcElement.drawer : event.target.drawer;
  var cav  = document.getElementById('myCanvas').drawer;
  var code = event.keyCode;
  if (code == 8 || code == 46) {
    // console.log('delete');
    cav.delete();
  }
  event.preventDefault();
  return false;
}
//

// get (x,y) on canvas
HTMLCanvasElement.prototype.getCoords = function(event) {
    this.mouse_x = event.pageX - this.offsetLeft;
    this.mouse_y = event.pageY - this.offsetTop;

    this.page_x = event.pageX;
    this.page_y = event.pageY;
}
