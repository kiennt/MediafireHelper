function Logger() {
  this.isDebug = true;
  
  this.print = function(message) {
    if (this.isDebug)
      console.log(message);
  };
  
  this.assert = function(expr, message) {
    if (this.isDebug) 
      console.assert(expr, message);
  }
}