/**
* jQuery AJAX Submitter by Avais Sethi
* See README.md for details
*/

(function($) {

	//attach method to jQuery
	$.fn.ajaxSubmitter = function(settings) {
		
		//function is used to create an array of update elements
		var setElements = function(elements, moreElements) {
			try {

				//some variables
				var eles;
				var i;
				var data;

				if ( !elements ) elements = [];

				if ( !$.isArray(elements) ) {  //make sure there are elements	
					
					//forms an array out of a string of space separated values
					eles = elements.split(' '); 
					elements = [];
					for ( i = 0; i < eles.length; i++ ) {  
						elements.push(eles[i]);  
					}
				}

				if ( moreElements ) {  //get the 'data-*' attribute
					eles = moreElements;
					//add to elements array
					eles = !$.isArray(eles) ? eles.split(' ') : eles;  //split space seperated values if needed
					for ( i = 0; i < eles.length; i++ ) {
						elements.push(eles[i]);
					}
				}

				return elements;

			} catch (e) {
				console.log(e.message);
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
				console.log(e.message);
			}
		};

		//function is used to actually submit the AJAX request
		var submitRequest = function(event) {
			
			event.preventDefault();  //stop the default action
			$this = event.target;
			var config = {};

			try {

				switch ( $this.tagName.toLowerCase() ) {  //default configs depend on element type

					case 'form':
						config.action = $this.getAttribute('action');
						config.params = $($this).serialize();
						config.method = $this.getAttribute('method') || 'post';
					break;

					case 'a':
						var uri = $this.href.split('?');
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
				config.successElements = setElements(config.successElements, $($this).data('successElements'));  
				config.failElements = setElements(config.failElements, $($this).data('failElements'));

			} catch (e) {
				console.log(e.message);
			}

			if ( !config.before || (config.before && config.before()) ) { 

				$.ajax({  //jQuery's ajax method
			
					url: config.action,
					data: config.params,
					type: config.method
			
				}).done(function(response) {  //success

					updateElements(config.successElements, response);  //update elements on success
					if ( config.success ) config.success(response);  //execute callback if exists
					
				}).fail(function() {  //fail

					updateElements(config.failElements, config.failMessage, true);  //update elements on fail
					if ( config.fail ) config.fail();  //execute callback if exists

				}).always(function() {  //always

					if ( config.after ) config.after();  //execute callback if exists

				})	

			}

		}

		/* Here is where the function actually gets binded to the event */

		var eventName;

		if ( settings.eventName ) {
			eventName = settings.eventName;
			if ( this.length ) this.live(eventName, submitRequest);
		} else {
			
			if ( this.length ) {

				switch ( this.prop('tagName').toLowerCase() ) {  //event will depend on element type
					case 'form':
						eventName = 'submit';
					break;
					default:
						eventName = 'click';
					break;
				}

				this.live(eventName, submitRequest);

			}

		}

		return this;  //make sure to maintain chainability!

	}

})(jQuery);

