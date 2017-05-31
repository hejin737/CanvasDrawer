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

// update the rectangle area when the position of line is changed
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

//see if (x,y) is inside the box of this line. box is the rectangle area of line.
Line.prototype.insideBox = function(x, y){

  if ((this.box[0]-5<=x && this.box[1]+5>=x)&&(this.box[2]-5<=y && this.box[3]+5>=y)){
    return true;
  }
  return false;
}

// see if this line is selected or not
Line.prototype.select = function(x, y) {
  this.updateBox();
  if (this.insideBox(x,y)){  // if (x,y) is inside box of line, calculate the distance bewteen (x,y) and line
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
