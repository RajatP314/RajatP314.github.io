//let mouse = {x:0, y:0};
let defaultText = "";
let defaultStyles = [];

//This class binds a region in the canvas to HTML elements.
//The constructor takes position and dimension parameters for a rectangle in the canvas,
//and some HTML to update an element.

class MouseRegion{

  constructor(x, y, w, h, text){
    this.x1 = x;
    this.y1 = y;
    this.x2 = x+w;
    this.y2 = y+h;
    this.output = text;
  }

  pointInRegion(x, y){ 	//Pass this method the mouse position to see if it's in the region
    return x >= Math.min(this.x1, this.x2) && x <Math.max(this.x1, this.x2)
     && y >= Math.min(this.y1, this.y2) && y < Math.max(this.y1, this.y2);
  }

  updateElement(element){	//Update an HTML element with the text
    element.innerHTML = this.output; //Run this method if the mouse is in the region
  }

}
