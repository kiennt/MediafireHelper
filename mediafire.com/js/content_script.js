var log = new Logger();
var siteURL = "http://www.mediafire.com";


var MediafireHelper = {
  isFolder : function() {
    var divBlock = $("#filelistingtab1");
    if (divBlock == null) return false;
    return true;
  }, 
  
  getListOfFileUrl : function(listFileItems) {            
    var listUrl = [];            
    for (var i=0; i < listFileItems.length; i++) {
      var fileItem = listFileItems[i];
      if ($(fileItem).attr("style") == "display: inline; " &&
          $(fileItem).hasClass("file")) {
        var fileLink = siteURL + $("#ancfilename" + i).attr("href");
        var linkItem = {'link': fileLink};
        if ($("#ancfilename" + i).hasClass("foldername_password"))
          linkItem.pass = "";
        listUrl[listUrl.length] = linkItem;
        log.print(linkItem.link);
        if (linkItem.pass != null)
          log.print("   has passworld");
      }
    }
    return listUrl;
  }, 
  
  downloadAllFiles : function() {
    var listItems = MediafireHelper.getListOfFileUrl($("#filelistingtab1").children());
    chrome.extension.sendRequest({
      type: 'download_folder', 
      items: listItems
    }, function(respondse){
      log.print('downloading file');
    });    
  }, 
  
  addMenu : function() {        
    var style = "position:fixed; " +
                "margin: 102px 0px 0px 0px; " + 
                "background: #F0F0F0;" + 
                "border-width: 2px;" + 
                "border-stype: solid;" +
                "border-color: #BBDCFA;" + 
                "padding: 5px;" +
                "z-index: 40;";                
    $("<a href='#' style='" + style + "' onclick='downloadAllFiles()'>Download All Files</a>")
    .prependTo($("body"));    
  },
    

  isLinkDownload : function() {
    var downloadBlock = document.getElementsByClassName("dl_startlink");
    if (downloadBlock == null) return false;
    if (downloadBlock.length == null) return false;
    if (downloadBlock.length < 1) return false;
    this.downloadBlock = downloadBlock[0];
    return true;
  }, 
  
  isPasswordRequire : function() {
    var passwordBlock = document.getElementById("pprotected");
    var passwordStyle = passwordBlock.getAttribute("style");
    if (passwordStyle.trim() == "display: block;") {
      return true;
    } else
      return false;
  },
  
  isCaptchaRequire : function() {
    var captchaBlock = document.getElementById("captchaprotected");
    var captchaStyle = captchaBlock.getAttribute("style");
    if (captchaStyle.trim() == "display: block;") {
      return true;
    } else
      return false;
  },
  
  downloadLink : function() {    
 		for (var i=0; i < this.downloadBlock.children.length; i++) { 		  
 		  var thisElement = this.downloadBlock.children[i];
 		  var elementStyle = thisElement.getAttribute("style");
      if (elementStyle == "display: block; "){
        log.print("element " + i);
        var aElm = thisElement.getElementsByTagName('a');
        log.assert(aElm != null, "Cannot find a tag!!!");
        var directLink = aElm[0].getAttribute("href");
        log.print("download link: " + directLink);
        chrome.extension.sendRequest({type: 'download', link: directLink}, function(respondse){
          log.print('downloading file');
        });
        return true;
      }
 		}
	},
	
	downloadWithPassword : function(pass) {
	  log.print("download with password");
	  var passInput = document.getElementById("downloadp");
	  passInput.value = pass;
	  var me=document.getElementById('form_password');
	  me.status='disable';
	  me.submit();
	  return true;
	},
	
	downloadWithCaptcha : function() {
	  
  }
};


chrome.extension.onConnect.addListener(function(port) {
  log.assert(port.name == "mf_download");
  port.onMessage.addListener(function(msg) {
    alert(msg.type);
    if (msg.type == "pass") {
      alert(msg.pass);
      MediafireHelper.downloadWithPassword(msg.pass);
    }
  });
});


window.addEventListener(
 	'load',
 	function(){ 	   	  
    if (MediafireHelper.isLinkDownload()) {
      if (MediafireHelper.isPasswordRequire()) {
        log.print("password require");
        // ask extension pass
      } else if (MediafireHelper.isCaptchaRequire()) {
        // ask extension captcha
        log.print("captcha require");
      } else {
        MediafireHelper.downloadLink();
      }
    } else if (MediafireHelper.isFolder()){
      // Get num of file will be create based on cookie
      var numOfFile = $.cookie('mfipp');
      // if cookie dont store, default value is 20
      if (numOfFile == null) 
        numOfFile = 20;
      else 
        numOfFile = parseInt(numOfFile);
      numOfFile++;
      
      var delayTime = 1000;
      // Function wait to load all item in directory
      function waitToLoadFileItem() {
        var listFileItems = $("#filelistingtab1").children();
        if (listFileItems.length < numOfFile) {
          setTimeout(waitToLoadFileItem, delayTime);
        } else {
          //MediafireHelper.addMenu();
          MediafireHelper.downloadAllFiles();
        }
      }
      
      waitToLoadFileItem();
    }
 	},
 	true
);


