<?php
/* Override attempt for global functions */
function wfHostNameAlt() {
	static $host;
		if ( is_null( $host ) ) {
			# Hostname overriding
			global $wgOverrideHostname;
			if ( $wgOverrideHostname !== false ) {
				# Set static and skip any detection
				$host = $wgOverrideHostname;
				return $host;
			}

			if ( function_exists( 'posix_uname' ) ) {
				// This function not present on Windows
				$uname = posix_uname();
			} else {
				$uname = false;
			}
			if ( is_array( $uname ) && isset( $uname['nodename'] ) ) {
				$host = $uname['nodename'];
			} elseif ( getenv( 'COMPUTERNAME' ) ) {
				# Windows computer name
				$host = getenv( 'COMPUTERNAME' );
			} elseif (isset($_SERVER['SERVER_NAME'])) {
			   # This may be a virtual server.
			   $host = $_SERVER['SERVER_NAME'];
			} else {
			   global $wgServerName;
			   $host = $wgServerName;
			}
		}
		return $host;
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