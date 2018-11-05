var isHugo;
var hugoVersion;

if( $( "meta[content^='Hugo ']" ).length ){

	isHugo = true;
}else{
	isHugo = false;
}

chrome.runtime.sendMessage({ isHugo: isHugo });
