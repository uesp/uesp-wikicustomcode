( function ( M ) {
	var SearchGateway = M.require('mobile.search.api/SearchGateway');
	SearchGateway.prototype.searchNamespace = mw.config.get('wgContentNamespaces').join('|');
}( mw.mobileFrontend ) );
