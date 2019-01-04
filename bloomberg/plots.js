function initialize(){ //Initialize and prepare the data
	for(let server of data){
		if(Server.isIncomplete(server)){		//Isolate the incomplete entries
			incomplete.push(server);
		} else {
			servers.push(new Server(server.area, server.version, server.uptime, server.hostname));
		}
	}
	document.querySelector("#incomplete_list").innerHTML += `<br /><br />${incomplete.map((s)=>s.hostname).join("<br />")}`;
	uncategorizedServers = servers.map((s)=>{
		let s2 = JSON.parse(JSON.stringify(s)); //Display the incomplete servers
		s2.area = "server";
		return s2;
	})
	for(let server of servers){
		if(categories.indexOf(server.area) < 0){		//Make a list of server areas
			categories.push(server.area);
		}
	}
	for(let server of data){						//Make a list of server version 
	  if(server.version !== undefined){				//formats, and of versions themselves
		let f = getFormat(server.version);
		if(formatStrs.indexOf(f.format) < 0){
		  formats.push(f);
		  formatStrs.push(f.format);
		}
		if(versions.indexOf(server.version) < 0){
			versions.push(server.version);
		}
	  }
	}

	//Populate UI checklists with area list and version format list
	let areaList = document.getElementById("area_list");
	for(let category of categories){
		let c2 = category;
		if(category.length > 12){
			c2 = category.substring(0, 9)+"...";
		}
		areaList.innerHTML += `
			<li class="menu_item">
				<input type="checkbox" value="${category}" /><span title="${category}">${c2}</span>
			</li>
		`;
	}
	let formatList = document.getElementById("format_list");
	for(let format of formatStrs){
		let f2 = format;
		if(format.length > 12){
			f2 = format.substring(0, 9)+"...";
		}
		formatList.innerHTML += `
			<li class="menu_item">
				<input type="checkbox" value="${format}" /><span title="${format}">${f2}</span>
			</li>
		`;
	}	
	document.querySelector("#uptime_min").value = 0;	//Set default min/max for uptime filter
	document.querySelector("#uptime_max").value = Math.max(...servers.map((s)=>s.uptime));
}


function uptimeFreqPlot(servers, c, f, minXScale=0, maxXScale=2600, bounds=[0.15, 0.95, 0.9, 0.1]){ //Draw uptime plot
	f.clearRect(0, 0, c.width, c.height);					
	defaultText = "Plot of server uptimes by area. The length of a bar indicates the relative frequency of servers with that uptime."
	info.innerHTML = defaultText;		//Set up default description in info box
	currentPlot = "uptime";
	mouseRegions = [];
	let categories = [];
	let maxTime = -1, minTime = Infinity;			//Note: The bounds array defines the min and max x and y values for the rectangle
	for(let server of servers){						//in which the plot is displayed. The values are percentages of the canvas width or
		if(server.uptime > maxTime){				//height. [minX, maxX, minY, maxY]
			maxTime = server.uptime;
		}
		if(server.uptime < minTime){
			minTime = server.uptime;
		}
		if(categories.indexOf(server.area) < 0){	//list all the areas present in this dataset
			categories.push(server.area);
		}
	}
	minXScale = 100*Math.floor(minTime/100);		//Set scale bounds by finding the
	maxXScale = 100*Math.ceil(maxTime/100);			//nearest multiple of 100 to the
	if(minXScale == maxXScale){						//min and max values of the dataset.
		maxXScale += 100;
	}
	//console.log(minXScale, maxXScale);

	servers.sort((a, b)=>{		//Sort be area first, and by uptime within each area block
		let d = categories.indexOf(a.area)-categories.indexOf(b.area);
		if(d !== 0){
			return d;
		} else {
			return a.uptime - b.uptime;		
		}
	});
	let categorizedServers = Array.from({length:categories.length}, (v, i)=>[]);
	for(let i=0;i<servers.length;i++){
		categorizedServers[categories.indexOf(servers[i].area)].push(servers[i]);
	}	//Create a 2D array where each entry is a single area of servers sorted by uptime.

	//PREPARE RENDERING
			//Visual parameters of the plot
	let minX = bounds[0]*c.width, maxX = bounds[1]*c.width; //physical coordinates of the axis
	let stepNum = 10; //Number of intervals in the x-axis
	let backgroundPadding = 5;
	let minY = bounds[2]*c.height, maxY = bounds[3]*c.height; //backwards to invert the plot vertically

	let colors = Array.from({length:categories.length}, (v, i)=>`hsl(${Math.round(360*i/categories.length)}, 50%, 40%)`);
	let bgColors = Array.from({length:categories.length}, (v, i)=>`hsl(${Math.round(360*i/categories.length)}, 30%, 70%)`);

	//SET VISUAL PROPERTIES OF SERVER DATA POINT

	let maxOffsets = [];					//Calculates the height of each section in the plot in "offsets"
	for(let row of categorizedServers){		//An offset refers to the length of the line segment representing one server
		let maxOffset = -1, offset = 0;		//To preserve plot size, the length of an offset decreases with the dataset length.
		for(let i=0;i<row.length;i++){
			if(i < row.length-1 && row[i+1].uptime === row[i].uptime){
				offset+=1;
			} else {
				if(offset > maxOffset){
					maxOffset = offset;
				}
				offset = 0;
			}
		}
		maxOffsets.push(maxOffset+2); //Plus margin
	}
	let totalOffset = maxOffsets.reduce((a, b)=>a+b);	//Total height of plot in offsets
	let yPosFractions = [maxOffsets[0]/(totalOffset)];	//Fractions of the plot's height at which each section is positioned.
	for(let i=1;i<maxOffsets.length;i++){
		yPosFractions[i] = yPosFractions[i-1] + maxOffsets[i]/totalOffset;
	}

	//DRAW PLOT

	let offsetIncrement = (maxY - minY)/(totalOffset); //Draw each section of the plot
	for(let i=0;i<categories.length;i++){
		f.fillStyle = bgColors[i];
		//console.log(minY + (maxY-minY)*yPosFractions[i] + offsetIncrement);
		f.fillRect(minX-backgroundPadding, minY + (maxY-minY)*yPosFractions[i], backgroundPadding*2+maxX-minX, (minY-maxY)*maxOffsets[i]/totalOffset);
		f.fillStyle = bgColors[i].replace(/70/g, "80");
		f.fillRect(minX-0.1*c.width, minY + (maxY-minY)*yPosFractions[i], 0.1*c.width, (minY-maxY)*maxOffsets[i]/totalOffset);
		let cs = categorizedServers[i].map((s)=>s.uptime);
		mouseRegions.push(new MouseRegion(minX-0.1*c.width, minY + (maxY-minY)*yPosFractions[i],
		 minX, (minY-maxY)*maxOffsets[i]/totalOffset,
			`
			<p><b>Area:</b> ${categories[i]}</p>
			<p><b>Number of Servers:</b> ${cs.length}</p>
		`));
		mouseRegions.push(new MouseRegion(minX, minY + (maxY-minY)*yPosFractions[i],
			 backgroundPadding*2+maxX-minX, (minY-maxY)*maxOffsets[i]/totalOffset,
				`
				<p><b>Area:</b> ${categories[i]}</p>
				<p><b>Mininum Uptime:</b> ${cs[0]}</p>
				<p><b>Median Uptime:</b> ${getPercentile(cs, 50)}</p>
				<p><b>Maximum Uptime:</b> ${cs[cs.length-1]}</p>
				<p><b>Mean Uptime:</b> ${(cs.reduce((a,b)=>a+b)/cs.length).toFixed(2)}</p>
		`));
	}	//Bind each area's plot to descriptive stats.

	let offset = 0;				
	for(let j=0;j<servers.length;j++){				//Draw in the line segments representing each server
		let server = servers[j];					//top->bottom and left->right in each section,
		let i = categories.indexOf(server.area);	//filling sections bottom->top
		server.color = colors[i];
		server.xc = minX + (maxX-minX)*(server.uptime - minXScale)/(maxXScale - minXScale);
		server.yc = minY + (maxY-minY)*yPosFractions[i] - offsetIncrement + offset;
		if(j < servers.length-1 && servers[j+1].uptime === server.uptime && servers[j+1].area === server.area){
			offset -= offsetIncrement;
		} else {
			offset = 0;
		}
		f.fillStyle=server.color;
		f.fillRect(server.xc, server.yc, 1, offsetIncrement);
	}
//	console.log(maxOffsets, yPosFractions);
//	console.log(servers, servers.map((s)=>[s.xc, s.yc]));

	//DRAW X-AXIS
	f.beginPath();
	f.moveTo(minX-backgroundPadding, minY+0.01*c.height);
	f.lineTo(maxX+backgroundPadding, minY+0.01*c.height);
	f.lineWidth = c.width*0.005;
	f.stroke();
	f.fillStyle = "black";
	for(let i=0;i<=stepNum;i++){
		f.beginPath()
		f.arc(minX+(maxX-minX)*i/stepNum, minY+0.01*c.height, c.width*0.005, 0, 2*Math.PI);
		f.fill();
		f.closePath();
		f.font = `${Math.round(c.height*0.015)}px Courier`;
		//console.log(minXScale, maxXScale);
		let num = minXScale + (maxXScale-minXScale)*i/stepNum
		//console.log(num);
		f.fillText(num, minX+(maxX-minX)*i/stepNum - f.measureText(num).width/2, minY+0.03*c.height)
	}
	f.font = `${Math.round(c.height*0.04)}px Courier`;
	let text = "Uptime";
	f.fillText(text, (minX+maxX-f.measureText(text).width)/2, minY+0.08*c.height)

	//DRAW CATEGORY LABELS
	for(let i=0;i<=stepNum;i++){
		f.fillStyle = colors[i];
		f.font = `${Math.round(c.height*0.015)}px Courier`;
		f.fillText(categories[i], minX - c.width*0.05 - f.measureText(categories[i]).width/2, minY + (maxY-minY)*yPosFractions[i] + 0.5*(minY-maxY)*maxOffsets[i]/totalOffset);
	}

	//TITLE
	f.font = `${Math.round(c.height*0.03)}px Courier`;
	f.fillStyle = "black";
	let title = "Servers by Area and Uptime";
	f.fillText(title, minX+(maxX-minX-0.1*c.width)/2-f.measureText(title).width/2, maxY-0.03*c.height);
}

function inventoryPlot(servers, c, f, minXScale=0, maxXScale=2600, bounds=[0.15, 0.95, 0.9, 0.1]){
	f.clearRect(0, 0, c.width, c.height);
	defaultText = "Plot of server inventory. The y-axis shows server area, and the x-axis shows version (grouped by format of version number). A brighter cell indicates more servers.";
	currentPlot = "inventory";
	mouseRegions = [];
	let categories = [];
	let formats = [];
	let formatStrs = [];
	let versions = [];
	let serverBoxes = [];
//	console.log(servers);
	for(let server of servers){						//Get all the areas of servers in this dataset
		if(categories.indexOf(server.area) < 0){
			categories.push(server.area);
		}
	}
	for(let server of servers){						//Get all the version formats
	  if(server.version !== undefined){
		let f = getFormat(server.version);
		if(formatStrs.indexOf(f.format) < 0){
		  formats.push(f);
		  formatStrs.push(f.format);
		}
		if(versions.indexOf(server.version) < 0){	//Get all the versions
			versions.push(server.version);
		}
	  }
	}
	let sortData = sortVersions(versions);		//Cluster the data by version format
	versions = sortData[0];						//and sort the data by order of increasing version
	let formatAmounts = sortData[1];

	serverBoxes = Array.from({length:versions.length}, (v, i)=>(Array.from({length:categories.length}, (v, i)=>[])));
	//serverBoxes[version][category]
	//Each cell in the plot will represent the amount of servers of a certain version in a certain area
	for(let server of servers){
		let v = versions.indexOf(server.version);
		let ca = categories.indexOf(server.area);
		serverBoxes[v][ca].push(server);	//Create the categorized server list
	}
	//console.log(serverBoxes);

	let maxNum = -1;
	for(let row of serverBoxes){	//Get the max number of servers that exists in a cell
		for(let col of row){
			if(col.length > maxNum){
				maxNum = col.length;
			}
		}
	}
	//console.log(versions);
	//console.log(serverBoxes);

	//PREPARE RENDERING
		//Visual parameters of the plot
	let minX = bounds[0]*c.width, maxX = bounds[1]*c.width; //physical coordinates of the axis
	let stepNum = (maxXScale-minXScale)/200;
	let backgroundPadding = 5;
	let minY = bounds[2]*c.height, maxY = bounds[3]*c.height; //backwards to invert the plot vertically

	let colors = [], xColors = [], yColors = []; //Colors for x/y-axis labels
	let ranges = clusterData(serverBoxes);	//Min/max values for the 3 scales the plot uses
	let scaleData = [ [0, 20, 70, 2], [120, 10, 70, 5], [240, 30, 60, 10] ]; //Color parameters for the 3 scales
					  //each sub-array: hue, min value, range, # of scale degrees 
					  //lower scale, normal scale, upper scale
	for(let i=0;i<versions.length;i++){
		let row = [], row2 = [];				//Figure out the color of every cell and label
		for(let j=0;j<categories.length;j++){
			//row.push(`hsl(${Math.round(360*i/versions.length)}, ${20+Math.round(80*j/categories.length)}%,  ${100*Math.tanh(serverBoxes[i][j].length/maxNum)}%)`)
			let color = getBucketColor(serverBoxes[i][j].length, ranges, scaleData);
			if(color === 0){
				color = (j%2===i%2)?"hsl(0, 0%, 0%)":"hsl(0, 0%, 15%)";
			}
			row.push(color)
			//row.push(`hsl(0, 100%,  ${20+80*Math.log(serverBoxes[i][j].length)/Math.log(maxNum)}%)`)
			if(i === 0){
				yColors.push(`hsl(0, ${Math.round(100*j/categories.length)}%, 30%)`);
			}
		}
		colors.push(row); 
	}
	for(let i=0;i<formatAmounts.length;i++){
		xColors.push(`hsl(30, ${Math.round(100*i/formatAmounts.length)}%, 30%)`);
	}
	
	//DRAW PLOT
	f.fillStyle="hsl(0, 0%, 70%)";					//Draw background
	f.fillRect(minX, minY, maxX-minX, maxY-minY);
	f.fillStyle="hsl(0, 0%, 60%)";
	f.fillRect(minX, minY, maxX-minX, 0.05*c.height);
	let width = (maxX-minX)/versions.length, height = (maxY-minY)/categories.length;
	//console.log(clusterData(serverBoxes));
	for(let i=0;i<versions.length;i++){
		for(let j=0;j<categories.length;j++){			//Draw the cells
			f.fillStyle = colors[i][j];
			f.fillRect(minX + i*width, minY + j*height, width, height);
			mouseRegions.push(new MouseRegion(minX + i*width, minY + j*height, width, height,
			`
			<p><b>Area:</b> ${categories[j]}</p>
			<p><b>Version:</b> ${versions[i]}</p>
			<p><b>Number of Servers:</b> ${serverBoxes[i][j].length}</p>
			`));
		}
	}
	//Y-Axis
	for(let i=0;i<categories.length;i++){
		f.fillStyle = yColors[i];
		f.fillRect(minX-0.1*c.width, minY + i*height, 0.1*c.width, height+1);
		f.fillStyle = yColors[i].replace(/30/g, "80");
		f.font = `${Math.round(c.height*0.015)}px Courier`;
		f.fillText(categories[i], minX - c.width*0.05 - f.measureText(categories[i]).width/2, minY + (i+0.5)*height + Math.round(c.height*0.015)/2);
		mouseRegions.push(new MouseRegion(minX-0.1*c.width, minY + i*height, 0.1*c.width, height+1,
		`
		<p>Area: ${categories[i]}</p>
		<p>Number of Servers: ${filterByAreas(servers, [categories[i]]).length}</p>
		`));
	}
	//X-axis (labelled by version format)
	let x = 0;
	for(let i=0;i<formatAmounts.length;i++){
		f.fillStyle = xColors[i];
		f.fillRect(minX+x, minY, formatAmounts[i]*width-1, 0.05*c.height);
		f.fillStyle = xColors[i].replace(/30/g, "80");
		f.beginPath();
		f.strokeStyle = "hsl(0, 0%, 50%)";
		f.lineWidth = 2;
		f.moveTo(minX+x, minY);
		f.lineTo(minX+x, maxY);
		f.stroke();
		f.closePath();
		f.font = `${Math.round(c.height*0.015)}px Courier`;
		let text = formatStrs[i];
		while(f.measureText(text).width + 10 >= formatAmounts[i]*width){
			text = text.substring(0, text.length-1);
		}
		if(text.length < formatStrs[i].length){
			if(text.length === 0){
				text = ".";
			} else {						//Shorten the version format name to ., .., or ... if it doesn't fit in
				if(text.length <= 3){		//the allotted space
					text = ".".repeat(text.length);
				} else {
					text = text.substring(0, text.length - 3) + "...";
				}
			}
		}
		f.fillText(text, minX + x + formatAmounts[i]*width/2 - f.measureText(text).width/2, minY + 0.025*c.height + c.height*0.015/2);
		mouseRegions.push(new MouseRegion(minX+x, minY, formatAmounts[i]*width-1, 0.05*c.height,
		`
		<p>Area: ${formatStrs[i]}</p>
		<p>Number of Servers: ${filterByFormats(servers, [formatStrs[i]]).length}</p>
		`));
		x+=formatAmounts[i]*width;
	}
	//Title
	f.font = `${Math.round(c.height*0.03)}px Courier`;
	f.fillStyle = "black";
	let title = "Servers by Area and Version";
	f.fillText(title, minX+(maxX-minX-0.1*c.width)/2-f.measureText(title).width/2, maxY-0.03*c.height);
	let tableHeadings = ["Lower Outliers", "Normal Values", "Upper Outliers"];
	defaultText += "<table>";
	
	//Create the key for the color scales to display in the info box 
	for(let i=0;i<ranges.length;i+=2){
		if(ranges[i] !== undefined){
			minColor = `hsl(${scaleData[i/2][0]}, 50%, ${scaleData[i/2][1]}%)`;
			halfColor = `hsl(${scaleData[i/2][0]}, 50%, ${scaleData[i/2][1]+scaleData[i/2][2]/2}%)`;
			maxColor = `hsl(${scaleData[i/2][0]}, 50%, ${scaleData[i/2][1]+scaleData[i/2][2]}%)`
			let minTextColor = (scaleData[i/2][1]<40)?"rgb(200, 200, 200":"black";
			defaultText += `
					<tr>
						<th>${tableHeadings[i/2]}</th>
						<td class="min" style="background:linear-gradient(to right, ${minColor}, ${halfColor});color:${minTextColor}">${ranges[i]}</td>
						<td class="max" style="background:linear-gradient(to right, ${halfColor}, ${maxColor})">${ranges[i+1]}</td>
					</tr>
			`
		}
	}
	defaultText += "</table>";
	info.innerHTML = defaultText;
}



function getFormat(str){ //get format of version number
  let formatList = [];
  for(let c of str.split("")){
    if(c.match(/[0-9]/) !== null){
      if(formatList[formatList.length-1] != 0){
        formatList.push(0);
      }
    } else if(c.match(/[A-Za-z]/) !== null){
      formatList.push("A");
    } else {
      formatList.push(c);
    }
  }
  return {format: formatList.join(""), list: formatList};
}

function clusterData(data){		//Figure out the thresholds for lower outliers, "normal data," and upper outliers
	let list = [];
	for(let i=0;i<data.length;i++){
		for(let j=0;j<data[i].length;j++){
			if(data[i][j].length !== 0){
				list.push(data[i][j].length);
			}
		}
	}
	list.sort((a, b)=>a-b);
	let q1, q3, threshold;
	q1 = getPercentile(list, 25);
	q3 = getPercentile(list, 75);
	threshold = 1.5*(q3-q1);
	let lowOutliers = [], highOutliers = [], normal = [];
	for(let num of list){
		if(num < q1-threshold){
			lowOutliers.push(num);
		} else if(num > q3+threshold){
			highOutliers.push(num);
		} else {
			normal.push(num);
		}
	}
	return [lowOutliers[0], lowOutliers[lowOutliers.length-1], normal[0], normal[normal.length-1], highOutliers[0], highOutliers[highOutliers.length-1]];
}

function getBucketColor(value, ranges, scaleData){ //Get color of a specific cell
	let n = 0;
	for(n=0;n<6;n+=2){
		if(ranges[n] !== undefined && ranges[n] <= value && value <= ranges[n+1]){
			break;
		}
	}
	let hue, v;
	//console.log(n);
	let setColor = (a, b, c, d)=>{
		hue = a;
		v = b+c*getBucket(value, ranges[n], ranges[n+1], d)/d;
	}
	switch(n){	//These cases are for whether the number is a lower outlier, "normal value," or upper outlier
		case 0:
			setColor(...scaleData[0]);
			break;
		case 2:
			setColor(...scaleData[1]);
			break;
		case 4:
			setColor(...scaleData[2]);
			break;
		default:
			return 0;
			break;
	}

	return `hsl(${hue}, 50%, ${v}%)`;
}
									//# of intervals in the scale
function getBucket(value, min, max, buckets){	//Instead of a continuous scale, this program assigns all numbers of a certain range
	for(let i=1;i<=buckets;i++){				//to a particular color in the inventory plot. This function figures out which range
		if(value < min+(i-1)*(max-min)/buckets){//(bucket) a particular number is in based on the parameters of the scale.
			return i-1;
		}
	}
	return buckets;
}

function getPercentile(list, pct){		//Get the pct-th percentile of a dataset
	let index = list.length*pct/100;
	if(Math.floor(index) === index){
		return (list[index]+list[index-1])/2;
	} else {
		return list[Math.floor(index)];
	}
}

function breakByFormat(str){		//Split a version format string into component letter and number parts
  let formatList = [];
  counter = -1;
  for(let c of str.split("")){
    if(c.match(/[0-9]/) !== null){
    //	console.log(formatList[counter] !== undefined && formatList[counter].match(/[0-9]/) !== null);
    	if(formatList[counter] !== undefined && formatList[counter].match(/[0-9]/) !== null){
       	 formatList[counter]+=c;
       	} else {
       		formatList.push(c);
       		counter++;
       	}
    } else if(c.match(/[A-Za-z]/) !== null){
		formatList.push(c);
		counter++;
    } else {
      formatList.push(c);
      counter++;
    }
  }
  return formatList;
}

function compareByFormat(a, b){		//Comparison function for sorting version strings
  fA = breakByFormat(a);			//Sorts by comparing the components returned from
  fB = breakByFormat(b);			//breakByFormat
  //console.log(fA, fB);
  let pos = 0;
  for(let item of getFormat(a).list){
  	//console.log(fA[pos], fB[pos], "start");
    if(typeof item === "number"){
      let d = parseInt(fA[pos])-parseInt(fB[pos]);
     // console.log(d, "num");
      if(d !== 0){
        return d;
      }
    } else if(typeof item === "string") {
      let d = fA[pos].localeCompare(fB[pos]);
    //  console.log(d, "str");
      if(d !== 0){
        return d;
      }
    }
    pos++;
  }
  return 0;
}

function sortVersions(versions){	
	let sortedVersions = [];
	let formatAmounts = [];		//Group servers by version format
	let v = versions.map((x, i)=>{return {"format":formatStrs.indexOf(getFormat(x).format), "index":i}}).sort((a, b)=>a.format-b.format)
	let v2 = []
	for(let i=0;i<v.length;i++){
	 if(v2[v2.length-1] === undefined || v2[v2.length-1][0].format !== v[i].format){
	  v2.push([v[i]]);
	 } else {
	  v2[v2.length-1].push(v[i]);
	 }
	}				//Within each format cluster, sort in order of increasing version
	v2 = v2.map((row)=>row.map((entry)=>versions[entry.index]).sort(compareByFormat));
	for(let row of v2){
	 formatAmounts.push(row.length);
	 for(let item of row){
	  sortedVersions.push(item);
	 }
	}
	return [sortedVersions, formatAmounts]
}
