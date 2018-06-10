let test = new Brush();
test.pathFunction = function(t){
	return [200*Math.cos(5*2*Math.PI*t/tMax)+450,
	200*Math.sin(4*2*Math.PI*t/tMax)+450];	
}
test.sizeFunction = function(t){
	return 50 + 45*Math.cos(20*Math.PI*t/tMax);
}
test.colorFunction = function(t){
	return "rgba(" + 
	0.25*Math.floor(50+50*Math.sin(t/5)) + "," +
	0.5*Math.floor(150+50*Math.sin(t/3)) + "," +
	0.5*Math.floor(150+50*Math.cos(t/7)) + "," +
	(0.1*Math.cos(t)/2+0.3) + 
	")";
}
test.addSelfToList(brushList);

let test2 = new Brush();
test2.pathFunction = function(t){
	return [-240*Math.cos(5*2*Math.PI*t/tMax)+450,
	-240*Math.sin(4*2*Math.PI*t/tMax)+450];	
}
test2.sizeFunction = function(t){
	return 25 + 20*Math.sin(40*Math.PI*t/tMax);
}
test2.colorFunction = function(t){
	return "rgba(" + 
	Math.floor(150+25*Math.cos(t)) + "," +
	Math.floor(180+25*Math.cos(t)) + "," +
	Math.floor(220+25*Math.cos(t)) + "," +
	(0.1*Math.cos(t)/2+0.2) + 
	")";
}
test2.addSelfToList(brushList);
