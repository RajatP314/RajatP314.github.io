class MorseCode{

  constructor(symbols, code){
    this.symbols = symbols;
    this.code = code;
  }

  encode(message, separator){
    let output = "";
    for(let i=0;i<message.length;i++){
      let c = message[i];
      if(Object.keys(this.code).indexOf(c) > -1){
        c = this.code[c].replace(new RegExp('[.]', 'g'), symbols['.']).replace(new RegExp('[-]', 'g'), symbols['-'])
          + separator[i%separator.length];
      }
      output+=c;
    }
    return output;
  }

}
