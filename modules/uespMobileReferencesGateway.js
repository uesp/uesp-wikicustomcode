( function ( M ) {
	var ReferencesGateway = M.require('mobile.references.gateway/ReferencesHtmlScraperGateway'),
		util = M.require( 'mobile.startup/util' );
	if (ReferencesGateway) {
		const originalGetReferenceFromContainer = ReferencesGateway.prototype.getReferenceFromContainer;
		const originalGetReference = ReferencesGateway.prototype.getReference;
		
		ReferencesGateway.prototype.getReference = function ( id, page ) {
			// If an id is not found it's possible the id passed needs decoding (per T188547).
			return this.getReferenceFromContainer( decodeURIComponent( id ), page.$( 'ol.references' ), page );
		};
		 
		ReferencesGateway.prototype.getReferenceFromContainer = function( id, $container, page) {
			var $el,
				result = util.Deferred();
			if (id && id.substr(1, 7) === 'intnote') {
				$el = page.$('#'+ util.escapeSelector( id.substr( 1 )));
				if ($el.length) {
					$el = $el.parent().find('td:last-child');
					if ($el) {
						$el = $el.first();
					}
				}
			} else {
				$el = $container.find( '#' + util.escapeSelector( id.substr( 1 ) ) );
			}
			if ( $el.length ) {
				result.resolve( { text: $el.html() } );
			} else {
				result.reject( ReferencesGateway.ERROR_NOT_EXIST );
			}
			return result.promise();
		};
	}
}( mw.mobileFrontend ) );
