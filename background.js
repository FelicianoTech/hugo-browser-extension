function navigate( url ){

	chrome.tabs.query( {active: true, currentWindow: true }, function( tabs ){
		chrome.tabs.update( tabs[0].id, { url: url } );
	});
}

// handle searching specifically for Hugo Docs
function searchDocs( searchType, text, suggest){

	var suggestions = [];

	chrome.omnibox.setDefaultSuggestion( { description: searchSections[ searchType ].defaultSuggestion } );

	index.search( text, {
		//filters: "version:" + searchSections[ searchType ].filter,
		highlightPreTag:	"<match>",
		highlightPostTag:	"</match>",
		hitsPerPage:		5
	}, function searchDone( err, content ){

		if( err ){
			
			console.error( err );
			return;
		}

		for( var h in content.hits ){
			// DEBUG
			console.log( content.hits[h] );

			if( content.hits[h]._highlightResult.hierarchy.lvl2 ){
				suggestions.push( { content: content.hits[h].url, description: "<dim>" + content.hits[h].hierarchy.lvl0 + " Docs - </dim>" + content.hits[h]._highlightResult.hierarchy.lvl1.value + ": " + content.hits[h]._highlightResult.hierarchy.lvl2.value } );
			}else{
				suggestions.push( { content: content.hits[h].url, description: "<dim>" + content.hits[h].hierarchy.lvl0 + " Docs - </dim>" + content.hits[h]._highlightResult.hierarchy.lvl1.value } );
			}
			suggest( suggestions );
		}
	});
}



/*-----------------------------------------------------------------------------
 * Main
 *---------------------------------------------------------------------------*/

// searchSections
var searchSections = {
	"d": {
		"filter": null,
		"defaultSuggestion": "Click Here to Open Hugo Docs",
		"indexPage": "https://gohugo.io/documentation/"
	}
};

// Prepare the Algolia API client to search Hugo Docs
var client = algoliasearch( "BH4D9OD16A", "167e7998590aebda7f9fedcf86bc4a55" );
var index = client.initIndex( "hugodocs" );

// Omnibox Search - currently just searches Hugo Docs
chrome.omnibox.onInputChanged.addListener( function( text, suggest ){

	var searchType = text.split(" ")[0];
	text = text.substring( searchType.length );

	switch( searchType ){
		case "d":
			searchDocs( searchType, text, suggest );
			break;
		default:
			chrome.omnibox.setDefaultSuggestion( { description: "Search type not recognized." } );
	}
});


// Omnibox Search - visit the URL of the selected suggestion
chrome.omnibox.onInputEntered.addListener( function( text, disposition ){

	var searchType = text.split(" ")[0];

	switch( searchType ){
		case "d":
			navigate( searchSections[ searchType ].indexPage );
			break;
		default:
			navigate( text );
	}
});

chrome.runtime.onMessage.addListener(function(request, sender){

	var tabId = sender.tab.id;

	if( request.isHugo){

		chrome.pageAction.show( tabId );
		chrome.pageAction.setIcon( {tabId, path: "logo48.png"} );
		chrome.pageAction.setTitle({
			tabId,
			title: "This website is built with Hugo!"
		});
	}else{

		chrome.pageAction.hide( tabId );
		chrome.pageAction.setIcon( {tabId, path: "logo-grey48.png"} );
		chrome.pageAction.setTitle( {
			tabId,
			title: "This website isn't built with Hugo."
		});
	}
});
