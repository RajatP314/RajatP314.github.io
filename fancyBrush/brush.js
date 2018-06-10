class Brush{

	constructor(d = -1){
		this.r = 5;
		this.x = null;
		this.y = null;
		this.color = 'white';
		this.index = -1;
		this.duration = d;
	}
	
	draw(ctx, stroke){
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI);
		if(!stroke){
			ctx.fillStyle=this.color;
			ctx.fill();
		} else {
			ctx.strokeStyle=this.color;
			ctx.stroke();
		}
		ctx.closePath();
	}
	
	setPosition(x, y){
		this.x = x;
		this.y = y;
	}
	
	setSize(r){
		this.r = r;
	}
	
	setColor(color){
		this.color = color;
	}
	
	pathFunction(t){
		//Insert path as a function of time
	}
	
	colorFunction(t){
		//Insert color as a function of time if needed
	}
	
	sizeFunction(t){
		//Insert size as a function of time if needed
	}	
	
	update(ctx, t, stroke){
		this.setPosition(...this.pathFunction(t));
		this.setColor(this.colorFunction(t));
		this.setSize(this.sizeFunction(t));
		this.draw(ctx, stroke);
		if(this.duration > 0){
			this.duration--;
		}
		if(this.duration === 0){
			this.deleteSelfFromList();
			//console.log(this.list);
		}
		//Add additional update stuff here
	}	
	
	addSelfToList(list){
		this.list = list;
		this.index = list.length;
		this.list.push(this);
	}
	
	deleteSelfFromList(){
		this.list[this.index] = null;
	}

}