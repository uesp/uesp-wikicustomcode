( function ( mw, uw, $, OO ) {
	mw.loader.using( [ 'ext.uploadWizard' ] ).then( function () {
		mw.UploadWizardDetails.prototype.buildInterface = function () {
			var descriptionRequired, uri,
				$moreDetailsWrapperDiv, $moreDetailsDiv,
				details = this;

			this.thumbnailDiv = $( '<div class="mwe-upwiz-thumbnail mwe-upwiz-thumbnail-side"></div>' );

			this.dataDiv = $( '<div class="mwe-upwiz-data"></div>' );

			this.titleDetails = new uw.TitleDetailsWidget( {
				// Normalize file extension, e.g. 'JPEG' to 'jpg'
				extension: mw.Title.normalizeExtension( this.upload.title.getExtension() )
			} );
			this.titleDetailsField = new uw.FieldLayout( this.titleDetails, {
				label: mw.message( 'mwe-upwiz-title' ).text(),
				help: mw.message( 'mwe-upwiz-tooltip-title' ).text(),
				required: true
			} );
			this.mainFields.push( this.titleDetailsField );

			this.captionsDetails = new uw.MultipleLanguageInputWidget( {
				required: false,
				// Messages: mwe-upwiz-caption-add-0, mwe-upwiz-caption-add-n
				label: mw.message( 'mwe-upwiz-caption-add' ),
				error: mw.message( 'mwe-upwiz-error-bad-captions' ),
				remove: mw.message( 'mwe-upwiz-remove-caption' ),
				minLength: mw.UploadWizard.config.minCaptionLength,
				maxLength: mw.UploadWizard.config.maxCaptionLength
			} );
			this.captionsDetailsField = new uw.FieldLayout( this.captionsDetails, {
				required: false,
				label: mw.message( 'mwe-upwiz-caption' ).text(),
				help: mw.message( 'mwe-upwiz-tooltip-caption' ).text()
			} );
			if ( mw.UploadWizard.config.wikibase.enabled ) {
				this.mainFields.push( this.captionsDetailsField );
			}

			// descriptions
			// Description is not required if a campaign provides alternative wikitext fields,
			// which are assumed to function like a description
			descriptionRequired = !(
				mw.UploadWizard.config.fields &&
				mw.UploadWizard.config.fields.length &&
				mw.UploadWizard.config.fields[ 0 ].wikitext
			);
			this.descriptionsDetails = new uw.MultipleLanguageInputWidget( {
				required: descriptionRequired,
				// Messages: mwe-upwiz-desc-add-0, mwe-upwiz-desc-add-n
				label: mw.message( 'mwe-upwiz-desc-add' ),
				error: mw.message( 'mwe-upwiz-error-bad-descriptions' ),
				remove: mw.message( 'mwe-upwiz-remove-description' ),
				minLength: mw.UploadWizard.config.minDescriptionLength,
				maxLength: mw.UploadWizard.config.maxDescriptionLength
			} );
			this.descriptionsDetailsField = new uw.FieldLayout( this.descriptionsDetails, {
				required: descriptionRequired,
				label: mw.message( 'mwe-upwiz-desc' ).text(),
				help: mw.message( 'mwe-upwiz-tooltip-description' ).text()
			} );
			this.mainFields.push( this.descriptionsDetailsField );

			this.deedChooserDetailsField = new uw.FieldLayout( this.deedChooserDetails, {
				label: mw.message( 'mwe-upwiz-copyright-info' ).text(),
				required: true
			} );
			this.deedChooserDetailsField.toggle( this.customDeedChooser ); // See useCustomDeedChooser()
			this.mainFields.push( this.deedChooserDetailsField );

			this.categoriesDetails = new uw.CategoriesDetailsWidget();
			this.categoriesDetailsField = new uw.FieldLayout( this.categoriesDetails, {
				label: mw.message( 'mwe-upwiz-categories' ).text(),
				help: new OO.ui.HtmlSnippet(
					mw.message( 'mwe-upwiz-tooltip-categories', $( '<a>' ).attr( {
						target: '_blank',
						href: 'https://commons.wikimedia.org/wiki/Commons:Categories'
					} ) ).parse()
				)
			} );
			this.mainFields.push( this.categoriesDetailsField );

			this.dateDetails = new uw.DateDetailsWidget( { upload: this.upload } );
			this.dateDetailsField = new uw.FieldLayout( this.dateDetails, {
				label: mw.message( 'mwe-upwiz-date-created' ).text(),
				help: mw.message( 'mwe-upwiz-tooltip-date' ).text(),
				required: true
			} );
			this.mainFields.push( this.dateDetailsField );

			this.otherDetails = new uw.OtherDetailsWidget();
			this.otherDetailsField = new uw.FieldLayout( this.otherDetails, {
				label: mw.message( 'mwe-upwiz-other' ).text(),
				help: mw.message( 'mwe-upwiz-tooltip-other' ).text()
			} );
			this.mainFields.push( this.otherDetailsField );

			this.locationInput = new uw.LocationDetailsWidget( { showHeading: true } );
			this.locationInputField = new uw.FieldLayout( this.locationInput, {
				// No 'label', labels are included in this widget
				help: new OO.ui.HtmlSnippet(
					mw.message( 'mwe-upwiz-tooltip-location', $( '<a>' ).attr( {
						target: '_blank',
						href: '//commons.wikimedia.org/wiki/Commons:Geocoding'
					} ) ).parse()
				)
			} );
			this.mainFields.push( this.locationInputField );

			/* Build the form for the file upload */
			this.$form = $( '<form id="mwe-upwiz-detailsform' + this.upload.index + '"></form>' ).addClass( 'detailsForm' );
			this.$form.append(
				this.titleDetailsField.$element,
				mw.UploadWizard.config.wikibase.enabled ? this.captionsDetailsField.$element : null,
				this.descriptionsDetailsField.$element,
				this.deedChooserDetailsField.$element,
				this.dateDetailsField.$element,
				this.categoriesDetailsField.$element
			);

			this.$form.on( 'submit', function ( e ) {
				// Prevent actual form submission
				e.preventDefault();
			} );

			this.campaignDetailsFields = [];
			$.each( mw.UploadWizard.config.fields, function ( i, field ) {
				var customDetails, customDetailsField;

				if ( field.wikitext ) {
					customDetails = new uw.CampaignDetailsWidget( field );
					customDetailsField = new uw.FieldLayout( customDetails, {
						label: $( $.parseHTML( field.label ) ),
						required: !!field.required
					} );

					if ( field.initialValue ) {
						customDetails.setSerialized( { value: field.initialValue } );
					}

					details.$form.append( customDetailsField.$element );
					details.campaignDetailsFields.push( customDetailsField );
				}
			} );

			$moreDetailsWrapperDiv = $( '<div class="mwe-more-details">' );
			$moreDetailsDiv = $( '<div>' );

			$moreDetailsDiv.append(
				this.locationInputField.$element,
				this.otherDetailsField.$element
			);

			$moreDetailsWrapperDiv
				.append(
					$( '<a>' ).text( mw.msg( 'mwe-upwiz-more-options' ) )
						.addClass( 'mwe-upwiz-details-more-options mw-collapsible-toggle mw-collapsible-arrow' ),
					$moreDetailsDiv.addClass( 'mw-collapsible-content' )
				)
				.makeCollapsible( { collapsed: true } );

			// Expand collapsed sections if the fields within were changed (e.g. by metadata copier)
			this.locationInput.on( 'change', function () {
				$moreDetailsWrapperDiv.data( 'mw-collapsible' ).expand();
			} );
			this.otherDetails.on( 'change', function () {
				$moreDetailsWrapperDiv.data( 'mw-collapsible' ).expand();
			} );

			this.$form.append(
				$moreDetailsWrapperDiv
			);

			// Add in remove control to form
			this.removeCtrl = new OO.ui.ButtonWidget( {
				label: mw.message( 'mwe-upwiz-remove' ).text(),
				title: mw.message( 'mwe-upwiz-remove-upload' ).text(),
				classes: [ 'mwe-upwiz-remove-upload' ],
				flags: 'destructive',
				icon: 'trash',
				framed: false
			} ).on( 'click', function () {
				OO.ui.confirm( mw.message( 'mwe-upwiz-license-confirm-remove' ).text(), {
					title: mw.message( 'mwe-upwiz-license-confirm-remove-title' ).text()
				} ).done( function ( confirmed ) {
					if ( confirmed ) {
						details.upload.emit( 'remove-upload' );
					}
				} );
			} );

			this.$form.append( this.removeCtrl.$element );

			this.submittingDiv = $( '<div>' ).addClass( 'mwe-upwiz-submitting' )
				.append(
					$( '<div>' ).addClass( 'mwe-upwiz-file-indicator' ),
					$( '<div>' ).addClass( 'mwe-upwiz-details-texts' ).append(
						$( '<div>' ).addClass( 'mwe-upwiz-visible-file-filename-text' ),
						$( '<div>' ).addClass( 'mwe-upwiz-file-status-line' )
					)
				);

			$( this.dataDiv ).append(
				this.$form,
				this.submittingDiv
			).morphCrossfader();

			$( this.div ).append(
				this.thumbnailDiv,
				this.dataDiv
			);

			uri = new mw.Uri( location.href, { overrideKeys: true } );
			/*if ( mw.UploadWizard.config.defaults.caption || uri.query.captionlang ) {
				this.captionsDetails.setSerialized( {
					inputs: [
						{
							language: uri.query.captionlang ?
								uw.SingleLanguageInputWidget.static.getClosestAllowedLanguage( uri.query.captionlang ) :
								uw.SingleLanguageInputWidget.static.getDefaultLanguage(),
							text: mw.UploadWizard.config.defaults.caption || ''
						}
					]
				} );
			}

			if ( mw.UploadWizard.config.defaults.description || uri.query.descriptionlang ) {
				this.descriptionsDetails.setSerialized( {
					inputs: [
						{
							language: uri.query.descriptionlang ?
								uw.SingleLanguageInputWidget.static.getClosestAllowedLanguage( uri.query.descriptionlang ) :
								uw.SingleLanguageInputWidget.static.getDefaultLanguage(),
							text: mw.UploadWizard.config.defaults.description || ''
						}
					]
				} );
			}*/

			this.populate();

			this.interfaceBuilt = true;

			if ( this.savedSerialData ) {
				this.setSerialized( this.savedSerialData );
				this.savedSerialData = undefined;
			}
		}
	});
	
}( mediaWiki, mediaWiki.uploadWizard, jQuery, OO ) );