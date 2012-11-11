/**
* jQuery AJAX Submitter by Avais Sethi
* See README.md for details
*/

(function($) {

	//attach method to jQuery
	$.fn.ajaxSubmitter = function(settings) {

		$this = this;  //get a reference to the current object
		
		//function is used to create an array of update elements
		var setElements = function(elements, arrayName) {
			try {

				//some variables
				var eles;
				var i;

				if ( elements && !$.isArray(elements) ) {  //make sure there are elements	
					
					//forms an array out of a string of space separated values
					eles = elements.split(' '); 
					elements = [];
					for ( i = 0; i < eles.length; i++ ) {  
						elements.push(eles[i]);  
					}
				}

				if ( $this.attr('data-'+arrayName) ) {  //get the 'data-*' attribute
					
					//add to elements array with string of space separated values
					eles = $this.attr('data-'+arrayName).split(' ');
					for ( i = 0; i < eles.length; i++ ) {
						elements.push(eles[i]);
					}
				}

				return elements;

			} catch (e) {
				alert(e.message);
			}
		};

		//function is used to update elements with their counterparts in the AJAX response
		var updateElements = function(elements, response, fail) {
			
			var html;	

			try {
		
				if ( elements ) {  //are there any elements?
					if ( $.isArray(elements) ) {  //are there multiples?
						for ( var i = 0; i < elements.length; i++ ) {  //loop
							html = fail ? response : $(response).find(elements[i]).html()  //there will be 1 message for failed requests
							$(elements[i]).html(html);  //update element innerHTML
						}
					} else {
						html = fail ? response : $(response).find(elements).html()  //there will be 1 message for failed requests
						$(elements).html(html);  //update element innerHTML
					}	
				}
				
			} catch (e) {
				alert(e.message);
			}
		};

		//function is used to actually submit the AJAX request
		var submitRequest = function(event) {
			
			event.preventDefault();  //stop the default action
			var config = {};  //config object

			try {

				switch ( $this.prop('tagName').toLowerCase() ) {  //default configs depend on element type

					case 'form':
						config.action = $this.attr('action');
						config.params = $this.serialize();
						config.method = $this.attr('method') || 'post';
					break;

					case 'a':
						var uri = $this.attr('href').split('?');
						config.action = uri[0];
						config.params = uri[1] || '';
						config.method = 'get';
					break;

					default:
						config.action = '';
						config.params = '';
						config.method = 'get';
					break;

				}

				$.extend(config, settings);  //override config with settings

				//prepare an array of element names to be updated on success or failure
				config.successElements = setElements(config.successElements, 'successElements');  
				config.failElements = setElements(config.failElements, 'failElements');

			} catch (e) {
				alert(e.message);
			}

			$.ajax({  //jQuery's ajax method
		
				url: config.action,
				data: config.params,
				type: config.method
		
			}).done(function(response) {

				updateElements(config.successElements, response);  //update elements on success
				if ( config.success ) config.success(response);  //execute user callback if it exists
				
			}).fail(function() {

				updateElements(config.failElements, config.failMessage, true);  //update elements on fail
				if ( config.fail ) config.fail();  //execute user callback if exists

			});		

		};

		var eventName;

		if ( settings.eventName ) {
			eventName = settings.eventName;
		} else {

			switch ( this.prop('tagName').toLowerCase() ) {  //event will depend on element type
				case 'form':
					eventName = 'submit';
				break;
				default:
					eventName = 'click';
				break;
			}

		}


		this.bind(eventName submitRequest);

		return this;  //make sure to maintain chainability!

	}

})(jQuery);

