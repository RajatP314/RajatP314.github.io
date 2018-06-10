let main = new Brush();
main.pathFunction = function(t){
	return [200*Math.cos(5*2*Math.PI*t/tMax)+450,
	200*Math.sin(7*2*Math.PI*t/tMax)+450];	
}
main.sizeFunction = function(t){
	return 5;
}
main.colorFunction = function(t){
	return "hsla(" + 
	(230-30*t/tMax) + "," +
	(50+50*t/tMax) + "%," +
	(60+15*t/tMax) + "%," +
	(0.1) + 
	")";
}
main.update = function(ctx, t, stroke){
	this.setPosition(...this.pathFunction(t));
	this.setColor(this.colorFunction(t));
	this.setSize(this.sizeFunction(t));
	this.draw(ctx, stroke);
	if(this.duration > 0){
		this.duration--;
	}
	if(this.duration === 0){
		this.deleteSelfFromList();
		console.log(this.list);
	}
	if(t%20 === 0){
		let branch = new Brush(1000);
		branch.owner = this;
		let x = this.x, y = this.y, r = this.r;
		branch.time = t;
		branch.pathFunction = function(t){
			let px = branch.owner.pathFunction(branch.time+200)[0];
			let py = branch.owner.pathFunction(branch.time+200)[1];
			return [px+(x-px)*this.duration/1000,
			py+(y-py)*this.duration/1000];
		}
		branch.sizeFunction = function(t){
			//console.log(t, time, this.duration);
			return 5-5*this.duration/1000;
		}
		branch.colorFunction = function(t){
			return "hsla(" + 
			(230-30*t/tMax) + "," +
			(50+50*t/tMax) + "%," +
			(60-15*t/tMax) + "%," +
			(0.01) + 
			")";
		}
		branch.addSelfToList(brushList);
	}
}

main.addSelfToList(brushList);