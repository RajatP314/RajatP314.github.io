const zeroUptime = true; //True -> "uptime":"" counts as 0 uptime
						 //False -> "uptime":"" is considered incomplete data

class Server{	//class that contains a server dat entry and some useful methods

	//Consider including info that's useful for data visualization (e.g. color of data point) here.
	constructor(area, version, uptime, hostname){
		this.area = area;
		if(area === ""){
			this.area = "unknown";
		}
		this.version = version;
		this.uptime = parseInt(uptime);
		if(uptime === "" && zeroUptime){
			this.uptime = 0
		}
		this.hostname = hostname;
	}
		
	static isIncomplete(baseObject){	//use this to check if the incoming JSON is a complete server entry
		if(baseObject.area === undefined ||
			baseObject.version === undefined || baseObject.version === "" ||
			baseObject.uptime === undefined || 
			baseObject.hostname === undefined || baseObject.hostname === ""){
			return true;	
		}
		if(zeroUptime === false){
			if(baseObject.uptime === ""){
				return true;
			}
		}
		return false;
	}
	
	toString(){
		return `Area: ${this.area}
				Version: ${this.version}
				Uptime: ${this.uptime}
				Hostname: ${this.hostname}`;
	}
	
}