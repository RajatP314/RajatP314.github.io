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

  decode(codedText){
    let output = "";
    let letters = codedText.split(new RegExp('[^'+this.symbols['.']+this.symbols['-']+']'));
    //console.log(letters)
    for(let i=0;i<letters.length;i++){
      let s = letters[i].replace(new RegExp(symbols['.'], 'g'), '.').replace(new RegExp(symbols['-'], 'g'), '-');
      if(Object.values(this.code).indexOf(s) > -1){
        output += Object.keys(this.code)[ Object.values(this.code).indexOf(s) ];
      }
    }
    return output;
  }

}
