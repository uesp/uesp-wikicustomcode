<?php
/* Override attempt for global functions */
function wfHostNameAlt() {
	// Hostname overriding
	global $wgOverrideHostname;
	if ( $wgOverrideHostname !== false ) {
		return $wgOverrideHostname;
	}

	return php_uname( 'n' ) ?: 'unknown';
}

function getPagesMod( ResourceLoaderContext $context ) {
	$pages = [];
	if ( $this->getConfig()->get( 'UseSiteCss' ) ) {
		$pages['MediaWiki:Common.css'] = [ 'type' => 'style' ];
		$pages['MediaWiki:' . ucfirst( $context->getSkin() ) . '.css'] = [ 'type' => 'style' ];
		$pages['MediaWiki:Print.css'] = [ 'type' => 'style', 'media' => 'print' ];
		$pages['MediaWiki:Tabs.css'] = [ 'type' => 'style' ];

	}
	return $pages;
}

if (function_exists('runkit7_function_redefine')) {
	runkit7_function_redefine('wfHostname','', 'return wfHostNameAlt();');
	//runkit7_method_redefine('ResourceLoaderSiteStylesModule', 'getPages', '$context', 'return getPagesMod($context);');
}