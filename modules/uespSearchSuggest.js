( function ( mw, $ ) {
	// Override for the default searchSuggest
	mw.searchSuggest.request = function ( api, query, response, maxRows, namespace ) {
		return api.get( {
			formatversion: 2,
			action: 'opensearch',
			search: query,
			namespace: namespace || mw.config.get('wgContentNamespaces').join('|'),
			limit: maxRows,
			suggest: true
		} ).done( function ( data, jqXHR ) {
			response( data[ 1 ], {
				type: jqXHR.getResponseHeader( 'X-OpenSearch-Type' ),
				query: query
			} );
		} );
	};
	
}( mediaWiki, jQuery ) );