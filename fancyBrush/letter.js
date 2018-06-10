let main = new Brush();
main.pathFunction = function(t){
	let a = Math.PI/4 + 1.5*Math.PI*t/tMax;
	return [-200*Math.cos(2*a - Math.PI/2)+450,
	2*200*Math.sin(a)+450];	
}
main.sizeFunction = function(t){
	return 20;
}
main.colorFunction = function(t){
	return "hsla(" + 
	(230-30*t/tMax) + "," +
	(10+90*t/tMax) + "%," +
	(60+15*t/tMax) + "%," +
	(0.05) + 
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
	if(t%20 === 0 && t+800 <= tMax){
		let branch = new Brush(1000);
		branch.owner = this;
		let x = this.x, y = this.y, r = this.r;
		branch.time = t;
		branch.pathFunction = function(t){
			let px = branch.owner.pathFunction(branch.time+800)[0];
			let py = branch.owner.pathFunction(branch.time+800)[1];
			return [px+(x-px)*this.duration/1000,
			py+(y-py)*this.duration/1000];
		}
		branch.sizeFunction = function(t){
			//console.log(t, time, this.duration);
			return 10-10*this.duration/1000;
		}
		branch.colorFunction = function(t){
			return "hsla(" + 
			(230-30*t/tMax) + "," +
			(20+80*t/tMax) + "%," +
			(80-20*t/tMax) + "%," +
			(0.01) + 
			")";
		}
		branch.addSelfToList(brushList);
	}
}
main.addSelfToList(brushList);

let second = new Brush();
second.pathFunction = function(t){
	let a = Math.PI/4 + 1.5*Math.PI*t/tMax;
	return [-200*Math.cos(2*2*Math.PI*t/tMax - Math.PI/2)+450,
	2*200*Math.sin(a)+450];	
}
second.sizeFunction = function(t){
	return 11+10*Math.cos(2*Math.PI*t/tMax);
}
second.colorFunction = function(t){
	return "hsla(" + 
	(240-30*t/tMax) + "," +
	(10+90*t/tMax) + "%," +
	(20+10*t/tMax) + "%," +
	(0.1) + 
	")";
}
second.update = function(ctx, t, stroke){
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
	if(t%10 === 0){
		let branch = new Brush(500);
		branch.owner = this;
		let x = this.x, y = this.y, r = this.r;
		branch.time = t;
		branch.pathFunction = function(t){
			let px = main.pathFunction(branch.time)[0];
			let py = main.pathFunction(branch.time)[1];
			return [px+(x-px)*this.duration/500,
			py+(y-py)*this.duration/500];
		}
		branch.sizeFunction = function(t){
			//console.log(t, time, this.duration);
			return 3;
		}
		branch.colorFunction = function(t){
			return "hsla(" + 
			(15-30*t/tMax) + "," +
			(20+80*t/tMax) + "%," +
			(80-20*t/tMax) + "%," +
			(0.01) + 
			")";
		}
		branch.addSelfToList(brushList);
	}
}
second.addSelfToList(brushList);

let third = new Brush();
third.pathFunction = function(t){
	return [-200*Math.cos(2.5*2*Math.PI*t/tMax - Math.PI)+450,
	2*200*Math.sin(2*Math.PI*t/tMax)+450];	
}
third.sizeFunction = function(t){
	return 30-25*Math.cos(2*Math.PI*t/tMax);
}
third.colorFunction = function(t){
	return "hsla(" + 
	(190-30*t/tMax) + "," +
	(10+90*t/tMax) + "%," +
	(30+15*t/tMax) + "%," +
	(0.1) + 
	")";
}
third.update = function(ctx, t, stroke){
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
	if(t%20 === 0){
		let branch = new Brush(500);
		branch.owner = this;
		let x = this.x, y = this.y, r = this.r;
		branch.time = t;
		branch.pathFunction = function(t){
			let px = second.pathFunction(branch.time)[0];
			let py = second.pathFunction(branch.time)[1];
			return [px+(x-px)*this.duration/500,
			py+(y-py)*this.duration/500];
		}
		branch.sizeFunction = function(t){
			//console.log(t, time, this.duration);
			return 1+second.sizeFunction(branch.time)-second.sizeFunction(branch.time)*this.duration/500;
		}
		branch.colorFunction = function(t){
			return "hsla(" + 
			(365-15*t/tMax) + "," +
			(20+20*branch.time/tMax-15*this.duration/500) + "%," +
			(60+20*t/tMax) + "%," +
			(0.007) + 
			")";
		}
		branch.addSelfToList(brushList);
	}
}
third.addSelfToList(brushList);
let fourth = new Brush();
fourth.pathFunction = function(t){
	let a = Math.PI/4 + 1.5*Math.PI*t/tMax;
	return [200*Math.cos(2*a - Math.PI/2)+450,
	-2*200*Math.sin(a)+450];		
}
fourth.sizeFunction = function(t){
	return 40-39*Math.cos(2*Math.PI*t/tMax);
}
fourth.colorFunction = function(t){
	return "hsla(" + 
	(45-30*t/tMax) + "," +
	(100-90*t/tMax) + "%," +
	(75-35*t/tMax) + "%," +
	(0.05) + 
	")";
}
fourth.addSelfToList(brushList);
