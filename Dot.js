function Dot(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 3;
    this.selected = false;
    this.connected = false;
    this.move_x = 0;
    this.move_y = 0;
    this.connection = [];
    // this.canvas = undefined;
}

Dot.prototype.draw = function(c) {
    c.fillStyle = this.selected? 'red':'black';
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    c.fill();
}

//see if the dot is selected or not, near is a value deciding the area of the dot
Dot.prototype.select = function(x, y){
  var near = 5;
  if ((this.x >= x - near)&&(this.x <= x + near)&&(this.y >= y- near)&&(this.y <= y + near)){
    this.selected = true;
    this.moveBegin();
    return true;
  }
  return false;
}
//remember the origin position of dot
Dot.prototype.moveBegin = function(){
  this.move_x = this.x;
  this.move_y = this.y;
}
//move to new position
Dot.prototype.moveTo = function(dx, dy){
  // console.log(this.y, this.move_y);
  this.x = this.move_x + dx;
  this.y = this.move_y + dy;
  // console.log(this.y, this.move_y);
}

// Dot.prototype.delete = function(){
//
// }
