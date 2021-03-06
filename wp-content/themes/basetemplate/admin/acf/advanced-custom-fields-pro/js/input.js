

/* **********************************************
     Begin event-manager.js
********************************************** */

( function( window, undefined ) {
	"use strict";

	/**
	 * Handles managing all events for whatever you plug it into. Priorities for hooks are based on lowest to highest in
	 * that, lowest priority hooks are fired first.
	 */
	var EventManager = function() {
		/**
		 * Maintain a reference to the object scope so our public methods never get confusing.
		 */
		var MethodsAvailable = {
			removeFilter : removeFilter,
			applyFilters : applyFilters,
			addFilter : addFilter,
			removeAction : removeAction,
			doAction : doAction,
			addAction : addAction
		};

		/**
		 * Contains the hooks that get registered with this EventManager. The array for storage utilizes a "flat"
		 * object literal such that looking up the hook utilizes the native object literal hash.
		 */
		var STORAGE = {
			actions : {},
			filters : {}
		};

		/**
		 * Adds an action to the event manager.
		 *
		 * @param action Must contain namespace.identifier
		 * @param callback Must be a valid callback function before this action is added
		 * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
		 * @param [context] Supply a value to be used for this
		 */
		function addAction( action, callback, priority, context ) {
			if( typeof action === 'string' && typeof callback === 'function' ) {
				priority = parseInt( ( priority || 10 ), 10 );
				_addHook( 'actions', action, callback, priority, context );
			}

			return MethodsAvailable;
		}

		/**
		 * Performs an action if it exists. You can pass as many arguments as you want to this function; the only rule is
		 * that the first argument must always be the action.
		 */
		function doAction( /* action, arg1, arg2, ... */ ) {
			var args = Array.prototype.slice.call( arguments );
			var action = args.shift();

			if( typeof action === 'string' ) {
				_runHook( 'actions', action, args );
			}

			return MethodsAvailable;
		}

		/**
		 * Removes the specified action if it contains a namespace.identifier & exists.
		 *
		 * @param action The action to remove
		 * @param [callback] Callback function to remove
		 */
		function removeAction( action, callback ) {
			if( typeof action === 'string' ) {
				_removeHook( 'actions', action, callback );
			}

			return MethodsAvailable;
		}

		/**
		 * Adds a filter to the event manager.
		 *
		 * @param filter Must contain namespace.identifier
		 * @param callback Must be a valid callback function before this action is added
		 * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
		 * @param [context] Supply a value to be used for this
		 */
		function addFilter( filter, callback, priority, context ) {
			if( typeof filter === 'string' && typeof callback === 'function' ) {
				priority = parseInt( ( priority || 10 ), 10 );
				_addHook( 'filters', filter, callback, priority );
			}

			return MethodsAvailable;
		}

		/**
		 * Performs a filter if it exists. You should only ever pass 1 argument to be filtered. The only rule is that
		 * the first argument must always be the filter.
		 */
		function applyFilters( /* filter, filtered arg, arg2, ... */ ) {
			var args = Array.prototype.slice.call( arguments );
			var filter = args.shift();

			if( typeof filter === 'string' ) {
				return _runHook( 'filters', filter, args );
			}

			return MethodsAvailable;
		}

		/**
		 * Removes the specified filter if it contains a namespace.identifier & exists.
		 *
		 * @param filter The action to remove
		 * @param [callback] Callback function to remove
		 */
		function removeFilter( filter, callback ) {
			if( typeof filter === 'string') {
				_removeHook( 'filters', filter, callback );
			}

			return MethodsAvailable;
		}

		/**
		 * Removes the specified hook by resetting the value of it.
		 *
		 * @param type Type of hook, either 'actions' or 'filters'
		 * @param hook The hook (namespace.identifier) to remove
		 * @private
		 */
		function _removeHook( type, hook, callback, context ) {
			if ( !STORAGE[ type ][ hook ] ) {
				return;
			}
			if ( !callback ) {
				STORAGE[ type ][ hook ] = [];
			} else {
				var handlers = STORAGE[ type ][ hook ];
				var i;
				if ( !context ) {
					for ( i = handlers.length; i--; ) {
						if ( handlers[i].callback === callback ) {
							handlers.splice( i, 1 );
						}
					}
				}
				else {
					for ( i = handlers.length; i--; ) {
						var handler = handlers[i];
						if ( handler.callback === callback && handler.context === context) {
							handlers.splice( i, 1 );
						}
					}
				}
			}
		}

		/**
		 * Adds the hook to the appropriate storage container
		 *
		 * @param type 'actions' or 'filters'
		 * @param hook The hook (namespace.identifier) to add to our event manager
		 * @param callback The function that will be called when the hook is executed.
		 * @param priority The priority of this hook. Must be an integer.
		 * @param [context] A value to be used for this
		 * @private
		 */
		function _addHook( type, hook, callback, priority, context ) {
			var hookObject = {
				callback : callback,
				priority : priority,
				context : context
			};

			// Utilize 'prop itself' : http://jsperf.com/hasownproperty-vs-in-vs-undefined/19
			var hooks = STORAGE[ type ][ hook ];
			if( hooks ) {
				hooks.push( hookObject );
				hooks = _hookInsertSort( hooks );
			}
			else {
				hooks = [ hookObject ];
			}

			STORAGE[ type ][ hook ] = hooks;
		}

		/**
		 * Use an insert sort for keeping our hooks organized based on priority. This function is ridiculously faster
		 * than bubble sort, etc: http://jsperf.com/javascript-sort
		 *
		 * @param hooks The custom array containing all of the appropriate hooks to perform an insert sort on.
		 * @private
		 */
		function _hookInsertSort( hooks ) {
			var tmpHook, j, prevHook;
			for( var i = 1, len = hooks.length; i < len; i++ ) {
				tmpHook = hooks[ i ];
				j = i;
				while( ( prevHook = hooks[ j - 1 ] ) &&  prevHook.priority > tmpHook.priority ) {
					hooks[ j ] = hooks[ j - 1 ];
					--j;
				}
				hooks[ j ] = tmpHook;
			}

			return hooks;
		}

		/**
		 * Runs the specified hook. If it is an action, the value is not modified but if it is a filter, it is.
		 *
		 * @param type 'actions' or 'filters'
		 * @param hook The hook ( namespace.identifier ) to be ran.
		 * @param args Arguments to pass to the action/filter. If it's a filter, args is actually a single parameter.
		 * @private
		 */
		function _runHook( type, hook, args ) {
			var handlers = STORAGE[ type ][ hook ];
			
			if ( !handlers ) {
				return (type === 'filters') ? args[0] : false;
			}

			var i = 0, len = handlers.length;
			if ( type === 'filters' ) {
				for ( ; i < len; i++ ) {
					args[ 0 ] = handlers[ i ].callback.apply( handlers[ i ].context, args );
				}
			} else {
				for ( ; i < len; i++ ) {
					handlers[ i ].callback.apply( handlers[ i ].context, args );
				}
			}

			return ( type === 'filters' ) ? args[ 0 ] : true;
		}

		// return all of the publicly available methods
		return MethodsAvailable;

	};
	
	window.wp = window.wp || {};
	window.wp.hooks = new EventManager();

} )( window );


/* **********************************************
     Begin acf.js
********************************************** */

/*
*  input.js
*
*  All javascript needed for ACF to work
*
*  @type	awesome
*  @date	1/08/13
*
*  @param	N/A
*  @return	N/A
*/

var acf = {
	
	// vars
	l10n				: {},
	o					: {},
	
	
	// functions
	get					: null,
	update				: null,
	_e					: null,
	get_atts			: null,
	get_fields			: null,
	get_uniqid			: null,
	serialize_form		: null,
	
	
	// hooks
	add_action			: null,
	remove_action		: null,
	do_action			: null,
	add_filter			: null,
	remove_filter		: null,
	apply_filters		: null,
	
	
	// modules
	validation			:	null,
	conditional_logic	:	null,
	media				:	null,
	
	
	// fields
	fields				:	{
		date_picker		:	null,
		color_picker	:	null,
		image			:	null,
		file			:	null,
		wysiwyg			:	null,
		gallery			:	null,
		relationship	:	null
	}
};

(function($){
	
	
	/*
	*  Functions
	*
	*  These functions interact with the o object, and events
	*
	*  @type	function
	*  @date	23/10/13
	*  @since	5.0.0
	*
	*  @param	$n/a
	*  @return	$n/a
	*/
	
	$.extend(acf, {
		
		update : function( k, v ){
				
			this.o[ k ] = v;
			
		},
		
		get : function( k ){
			
			if( typeof this.o[ k ] !== 'undefined' ) {
				
				return this.o[ k ];
				
			}
			
			return null;
			
		},
		
		_e : function( context, string ){
			
			// defaults
			string = string || false;
			
			
			// get context
			var r = this.l10n[ context ] || false;
			
			
			// get string
			if( string )
			{
				r = r[ string ] || false;
			}
			
			
			// return
			return r || '';
			
		},
		
		get_fields : function( args, $el, all ){
			
			// debug
			//console.log( 'acf.get_fields(%o, %o, %o)', args, $el, all );
			//console.time("acf.get_fields");
			
			
			// defaults
			args = args || {};
			$el = $el || $('body');
			all = all || false;
			
			
			// vars
			var selector = '.acf-field';
			
			
			// add selector
			for( k in args ) {
				
				selector += '[data-' + k + '="' + args[k] + '"]';
				
			}
			
			
			// get fields
			var $fields = $el.find(selector);
			
			
			// is current $el a field?
			// this is the case when editing a field group
			if( $el.is( selector ) ) {
			
				$fields = $fields.add( $el );
				
			}
			
			
			//console.log('get_fields(%o, %s, %b). selector = %s', $el, field_type, allow_filter, selector);
			//console.log( $el );
			//console.log( $fields );
			
			// filter out fields
			if( !all ) {
			
				$fields = $fields.filter(function(){
					
					return acf.apply_filters('is_field_ready_for_js', true, $(this));			

				});
				
			}
			
			
			//console.timeEnd("acf.get_fields");
			
			
			// return
			return $fields;
							
		},
		
		get_field : function( field_key, $el ){
			
			// defaults
			$el = $el || $('body');
			
			
			// get fields
			var $fields = this.get_fields({ key : field_key }, $el, true);
			
			
			// validate
			if( !$fields.exists() )
			{
				return false;
			}
			
			
			// return
			return $fields.first();
			
		},
		
		get_the_field : function( $el ){
			
			return $el.parent().closest('.acf-field');
			
		},
		
		get_closest_field : function( $el, args ){
			
			// defaults
			args = args || {};
			
			
			// vars
			var selector = '.acf-field';
			
			
			// add selector
			for( k in args ) {
				
				selector += '[data-' + k + '="' + args[k] + '"]';
				
			}
			
			
			return $el.closest( selector );
			
		},
		
		get_field_wrap : function( $el ){
			
			return $el.closest('.acf-field');
			
		},
		
		/*
get_field_data : function( $el, name ){
			
			// defaults
			name = name || false;
			
			
			// vars
			$field = this.get_field_wrap( $el );
			
			
			// return
			return this.get_data( $field, name );
			
		},
*/
		
		get_field_key : function( $field ){
		
			return this.get_data( $field, 'key' );
			
		},
		
		get_field_type : function( $field ){
		
			return this.get_data( $field, 'type' );
			
		},
		
		
		get_data : function( $el, name ){
			
			//console.log('get_data(%o, %o)', name, $el);
			// defaults
			name = name || false;
			
			
			// vars
			var self = this,
				data = false;
			
			
			// specific data-name
			if( name ) {
			
				data = $el.attr('data-' + name)
				
				// convert ints (don't worry about floats. I doubt these would ever appear in data atts...)
        		if( $.isNumeric(data) ) {
        			
        			if( data.match(/[^0-9]/) ) {
	        			
	        			// leave value if it contains such characters: . + - e
	        			
        			} else {
	        			
	        			data = parseInt(data);
	        			
        			}
	        		
        		}
        		
			} else {
				
				// all data-names
				data = {};
				
				$.each( $el[0].attributes, function( i, attr ) {
			        
			        // bail early if not data-
		        	if( attr.name.substr(0, 5) !== 'data-' ) {
		        	
		        		return;
		        		
		        	}
		        	
		        	
		        	// vars
		        	name = attr.name.replace('data-', '');
		        	
		        	
		        	// add to atts
		        	data[ name ] = self.get_data( $el, name );
		        	
		        });
			}
			
			
			// return
	        return data;
				
		},
		
		is_field : function( $el, args ){
			
			// defaults
			args = args || {};
			
			
			// var
			var r = true;
			
			
			// check $el class
			if( ! $el.hasClass('acf-field') )
			{
				r = false;
			}
			
			
			// check args (data attributes)
			$.each( args, function( k, v ) {
				
				if( $el.attr('data-' + k) != v )
				{
					r = false;
				}
				
			});
			
			
			// return
			return r;
			
		},
		
		is_sub_field : function( $field, args ) {
			
			// defaults
			args = args || false;
			
			
			// var
			var r = false;
			
			
			// find parent
			$parent = $field.parent().closest('.acf-field');
			
			
			if( $parent.exists() ) {
			
				r = true;
				
				
				// check args (data attributes)
				if( args ) {
					
					r = this.is_field( $parent, args );
					
				}
				
			}
			
			
			// return
			return r;
			
		},
		
		get_uniqid : function( prefix, more_entropy ){
		
			// + original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			// + revised by: Kankrelune (http://www.webfaktory.info/)
			// % note 1: Uses an internal counter (in php_js global) to avoid collision
			// * example 1: uniqid();
			// * returns 1: 'a30285b160c14'
			// * example 2: uniqid('foo');
			// * returns 2: 'fooa30285b1cd361'
			// * example 3: uniqid('bar', true);
			// * returns 3: 'bara20285b23dfd1.31879087'
			if (typeof prefix === 'undefined') {
				prefix = "";
			}
			
			var retId;
			var formatSeed = function (seed, reqWidth) {
				seed = parseInt(seed, 10).toString(16); // to hex str
				if (reqWidth < seed.length) { // so long we split
					return seed.slice(seed.length - reqWidth);
				}
				if (reqWidth > seed.length) { // so short we pad
					return Array(1 + (reqWidth - seed.length)).join('0') + seed;
				}
				return seed;
			};
			
			// BEGIN REDUNDANT
			if (!this.php_js) {
				this.php_js = {};
			}
			// END REDUNDANT
			if (!this.php_js.uniqidSeed) { // init seed with big random int
				this.php_js.uniqidSeed = Math.floor(Math.random() * 0x75bcd15);
			}
			this.php_js.uniqidSeed++;
			
			retId = prefix; // start with prefix, add current milliseconds hex string
			retId += formatSeed(parseInt(new Date().getTime() / 1000, 10), 8);
			retId += formatSeed(this.php_js.uniqidSeed, 5); // add seed hex string
			if (more_entropy) {
				// for more entropy we add a float lower to 10
				retId += (Math.random() * 10).toFixed(8).toString();
			}
			
			return retId;
			
		},
		
		serialize_form : function( $el, prefix ){
			
			// defaults
			prefix = prefix || '';
			
			
			// vars
			var data = {},
				names = {},
				prelen = prefix.length,
				_prefix = '_' + prefix,
				_prelen = _prefix.length;
			
			
			// selector
			$selector = $el.find('select, textarea, input');
			
			
			// filter our hidden field groups
			$selector = $selector.filter(function(){
				
				return $(this).closest('.postbox.acf-hidden').exists() ? false : true;
								
			});
			
			
			// populate data
			$.each( $selector.serializeArray(), function( i, pair ) {
				
				// bail early if name does not start with acf or _acf
				if( prefix && pair.name.substring(0, prelen) != prefix && pair.name.substring(0, _prelen) != _prefix ) {
					
					return;
					
				}
				
				
				// initiate name
				if( pair.name.slice(-2) === '[]' ) {
					
					// remove []
					pair.name = pair.name.replace('[]', '');
					
					
					// initiate counter
					if( typeof names[ pair.name ] === 'undefined'){
						
						names[ pair.name ] = -1;
					}
					
					
					// increase counter
					names[ pair.name ]++;
					
					
					// add key
					pair.name += '[' + names[ pair.name ] +']';
				}
				
				
				// append to data
				data[ pair.name ] = pair.value;
				
			});
			
			
			// return
			return data;
		},
		
		remove_tr : function( $tr, callback ){
			
			// vars
			var height = $tr.height(),
				children = $tr.children().length;
			
			
			// add class
			$tr.addClass('acf-remove-element');
			
			
			// after animation
			setTimeout(function(){
				
				// remove class
				$tr.removeClass('acf-remove-element');
				
				
				// vars
				$tr.html('<td style="padding:0; height:' + height + 'px" colspan="' + children + '"></td>');
				
				
				$tr.children('td').animate({ height : 0}, 250, function(){
					
					$tr.remove();
					
					if( typeof(callback) == 'function' )
					{
						callback();
					}
					
					
				});
				
					
			}, 250);
			
		},
		
		remove_el : function( $el, callback, end_height ){
			
			// defaults
			end_height = end_height || 0;
			
			
			// set layout
			$el.css({
				height		: $el.height(),
				width		: $el.width(),
				position	: 'absolute',
				padding		: 0
			});
			
			
			// wrap field
			$el.wrap( '<div class="acf-temp-wrap" style="height:' + $el.outerHeight(true) + 'px"></div>' );
			
			
			// fade $el
			$el.animate({ opacity : 0 }, 250);
			
			
			// remove
			$el.parent('.acf-temp-wrap').animate({ height : end_height }, 250, function(){
				
				$(this).remove();
				
				if( typeof(callback) == 'function' )
				{
					callback();
				}
				
			});
			
			
		},
		
		isset : function(){
			
			var a = arguments,
		        l = a.length,
		        c = null,
		        undef;
			
		    if (l === 0) {
		        throw new Error('Empty isset');
		    }
			
			c = a[0];
			
		    for (i = 1; i < l; i++) {
		    	
		        if (a[i] === undef || c[ a[i] ] === undef) {
		            return false;
		        }
		        
		        c = c[ a[i] ];
		        
		    }
		    
		    return true;	
			
		},
		
		open_popup : function( args ){
			
			// vars
			$popup = $('body > #acf-popup');
			
			
			// already exists?
			if( $popup.exists() )
			{
				return update_popup(args);
			}
			
			
			// template
			var tmpl = [
				'<div id="acf-popup">',
					'<div class="acf-popup-box acf-box">',
						'<div class="title"><h3></h3><a href="#" class="acf-icon acf-close-popup"><i class="acf-sprite-delete "></i></a></div>',
						'<div class="inner"></div>',
						'<div class="loading"><i class="acf-loading"></i></div>',
					'</div>',
					'<div class="bg"></div>',
				'</div>'
			].join('');
			
			
			// append
			$('body').append( tmpl );
			
			
			$('#acf-popup').on('click', '.bg, .acf-close-popup', function( e ){
				
				e.preventDefault();
				
				acf.close_popup();
				
			});
			
			
			// update
			return this.update_popup(args);
			
		},
		
		update_popup : function( args ){
			
			// vars
			$popup = $('#acf-popup');
			
			
			// validate
			if( !$popup.exists() )
			{
				return false
			}
			
			
			// defaults
			args = $.extend({}, {
				title	: '',
				content : '',
				width	: 0,
				height	: 0,
				loading : false
			}, args);
			
			
			if( args.width )
			{
				$popup.find('.acf-popup-box').css({
					'width'			: args.width,
					'margin-left'	: 0 - (args.width / 2),
				});
			}
			
			if( args.height )
			{
				$popup.find('.acf-popup-box').css({
					'height'		: args.height,
					'margin-top'	: 0 - (args.height / 2),
				});	
			}
			
			if( args.title )
			{
				$popup.find('.title h3').html( args.title );
			}
			
			if( args.content )
			{
				$popup.find('.inner').html( args.content );
			}
			
			if( args.loading )
			{
				$popup.find('.loading').show();
			}
			else
			{
				$popup.find('.loading').hide();
			}
			
			return $popup;
		},
		
		close_popup : function(){
			
			// vars
			$popup = $('#acf-popup');
			
			
			// already exists?
			if( $popup.exists() )
			{
				$popup.remove();
			}
			
			
		},
		
		update_user_setting : function( name, value ) {
			
			// ajax
			$.ajax({
		    	url			: acf.get('ajaxurl'),
				dataType	: 'html',
				type		: 'post',
				data		: acf.prepare_for_ajax({
					'action'	: 'acf/update_user_setting',
					'name'		: name,
					'value'		: value
				})
			});
			
		},
		
		prepare_for_ajax : function( args ) {
			
			// nonce
			args.nonce = acf.get('nonce');
			
			
			// filter for 3rd party customization
			args = acf.apply_filters('prepare_for_ajax', args);	
			
			
			// return
			return args;
			
		},
		
		is_ajax_success : function( json ) {
			
			if( json && json.success ) {
				
				return true;
				
			}
			
			return false;
			
		},
		
		update_cookie : function( name, value, days ) {
			
			// defaults
			days = days || 31;
			
			if (days) {
				var date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				var expires = "; expires="+date.toGMTString();
			}
			else var expires = "";
			document.cookie = name+"="+value+expires+"; path=/";
			
		},
		
		get_cookie : function( name ) {
			
			var nameEQ = name + "=";
			var ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1,c.length);
				if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
			}
			return null;
			
		},
		
		delete_cookie : function( name ) {
			
			this.update_cookie(name,"",-1);
			
		},
		
		is_in_view: function( $el ) {
			
			var docViewTop = $(window).scrollTop();
		    var docViewBottom = docViewTop + $(window).height();
		
		    var elemTop = $el.offset().top;
		    var elemBottom = elemTop + $el.height();
		
		    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
					
		}
		
	});
	
	
	/*
	*  Hooks
	*
	*  These functions act as wrapper functions for the included event-manager JS library
	*  Wrapper functions will ensure that future changes to event-manager do not disrupt
	*  any custom actions / filter code written by users
	*
	*  @type	functions
	*  @date	30/11/2013
	*  @since	5.0.0
	*
	*  @param	n/a
	*  @return	n/a
	*/
	
	$.extend(acf, {
		
		add_action : function() {
			
			// allow multiple action parameters such as 'ready append'
			var actions = arguments[0].split(' ');
			
			for( k in actions )
			{
				// prefix action
				arguments[0] = 'acf.' + actions[ k ];
				
				wp.hooks.addAction.apply(this, arguments);
			}
			
			return this;
		},
		
		remove_action : function() {
			
			// prefix action
			arguments[0] = 'acf.' + arguments[0];
			
			wp.hooks.removeAction.apply(this, arguments);
			
			return this;
		},
		
		do_action : function() {
			
			// prefix action
			arguments[0] = 'acf.' + arguments[0];
			
			wp.hooks.doAction.apply(this, arguments);
			
			return this;
		},
		
		add_filter : function() {
			
			// prefix action
			arguments[0] = 'acf.' + arguments[0];
			
			wp.hooks.addFilter.apply(this, arguments);
			
			return this;
		},
		
		remove_filter : function() {
			
			// prefix action
			arguments[0] = 'acf.' + arguments[0];
			
			wp.hooks.removeFilter.apply(this, arguments);
			
			return this;
		},
		
		apply_filters : function() {
			
			// prefix action
			arguments[0] = 'acf.' + arguments[0];
			
			return wp.hooks.applyFilters.apply(this, arguments);
		}
		
	});
    
	
	/*
	*  Exists
	*
	*  @description: returns true / false		
	*  @created: 1/03/2011
	*/
	
	$.fn.exists = function()
	{
		return $(this).length>0;
	};
	
	
	/*
	*  outerHTML
	*
	*  This function will return a string containing the HTML of the selected element
	*
	*  @type	function
	*  @date	19/11/2013
	*  @since	5.0.0
	*
	*  @param	$.fn
	*  @return	(string)
	*/
	
	$.fn.outerHTML = function() {
	    
	    return $(this).get(0).outerHTML;
	    
	}
	
	
	/*
	*  3.5 Media
	*
	*  @description: 
	*  @since: 3.5.7
	*  @created: 16/01/13
	*/
	
	acf.media = {
		
		popup : function( args ) {
			
			// defaults
			var defaults = {
				'mode'			: 'select', // 'upload'|'edit'
				'title'			: '',		// 'Upload Image'
				'button'		: '',		// 'Select Image'
				'type'			: '',		// 'image'
				'library'		: 'all',	// 'all'|'uploadedTo'
				'multiple'		: false,	// false, true, 'add'
			};
			
			
			// vars
			args = $.extend({}, defaults, args);
			
			
			// frame options
			var options = {
				'title'			: args.title,
				'multiple'		: args.multiple,
				'library'		: {},
				'states'		: [],
			};
			
			
			// add library
			if( args.type ) {
				
				options.library = {
					'type' : args.type
				};
				
			}
			
			
			// limit query
			if( args.mode == 'edit' ) {
				
				options.library = {
					'post__in' : [args.id]
				};
				
			}
			
			
			// add button
			if( args.button ) {
			
				options.button = {
					'text' : args.button
				};
				
			}
			
			
			// add states
			options.states = [
				
				// main state
				new wp.media.controller.Library({
					library		: wp.media.query( options.library ),
					multiple	: options.multiple,
					title		: options.title,
					priority	: 20,
					filterable	: 'all',
					editable	: true,

					// If the user isn't allowed to edit fields,
					// can they still edit it locally?
					allowLocalEdits: true,
				}),
				
				// edit image functionality
				new wp.media.controller.EditImage()
				
			];
			
			
			// create frame
			var frame = wp.media( options );
			
			
			// log events
			/*
frame.on('all', function( e ) {
				
				console.log( 'frame all: %o', e );
			
			});
*/
			
			
			// edit image view
			// source: media-views.js:2410 editImageContent()
			frame.on('content:render:edit-image', function(){
				
				var image = this.state().get('image'),
					view = new wp.media.view.EditImage( { model: image, controller: this } ).render();
	
				this.content.set( view );
	
				// after creating the wrapper view, load the actual editor via an ajax call
				view.loadEditor();
				
			}, frame);
			
			
			// modify DOM
			frame.on('content:activate:browse', function(){
				
				// populate above vars making sure to allow for failure
				try {
					
					var content = frame.content.get(),
						toolbar = content.toolbar,
						filters = toolbar.get('filters');
				
				} catch(e) {
				
					// one of the objects was 'undefined'... perhaps the frame open is Upload Files
					// console.log( 'error %o', e );
					return;
					
				}
				
				
				// uploaded to post
				if( args.library == 'uploadedTo' && $.isNumeric(acf.get('post_id')) ) {
					
					// remove 'uploaded' option
					filters.$el.find('option[value="uploaded"]').remove();
					
					
					// add 'uploadedTo' text
					filters.$el.after('<span class="acf-uploadedTo">' + acf._e('image', 'uploadedTo') + '</span>')
					
					
					// add uploadedTo to filters
					$.each( filters.filters, function( k, v ){
						
						v.props.uploadedTo = acf.get('post_id');
						
					});
				
				}
				
				
				// type = image
				if( args.type == 'image' ) {
					
					// filter only images
					$.each( filters.filters, function( k, v ){
					
						v.props.type = 'image';
						
					});
					
					
					// remove non image options from filter list
					filters.$el.find('option').each(function(){
						
						// vars
						var v = $(this).attr('value');
						
						
						// don't remove the 'uploadedTo' if the library option is 'all'
						if( v == 'uploaded' && args.library == 'all' ) {
						
							return;
							
						}
						
						
						// remove this option
						if( v.indexOf('image') === -1 ) {
						
							$(this).remove();
							
						}
						
					});
					
					
					// set default filter
					filters.$el.val('image');
					
				}
				
				
				// trigger change
				filters.$el.trigger('change')
				
				
			});
			
			
			// select callback
			if( typeof args.select === 'function' ) {
			
			frame.on( 'select', function() {
				
				// reference
				var self = this,
					i = -1;
				
								
				// get selected images
				var selection = frame.state().get('selection');
				
				
				// loop over selection
				if( selection ) {
					
					selection.each(function( attachment ){
						
						i++;
						
						args.select.apply( self, [ attachment, i] );
						
					});
				}
				
			});
			
			}
			
			
			// close
			frame.on('close',function(){
			
				setTimeout(function(){
					
					// detach
					frame.detach();
					frame.dispose();
					
					
					// reset var
					frame = null;
					
				}, 500);
				
			});
			
			
			// edit mode
			if( args.mode == 'edit' ) {
				
			frame.on('open',function() {
				
				// set to browse
				if( this.content.mode() != 'browse' ) {
				
					this.content.mode('browse');
					
				}
				
				
				// add class
				this.$el.closest('.media-modal').addClass('acf-media-modal acf-expanded');
					
				
				// set selection
				var state 		= this.state(),
					selection	= state.get('selection'),
					attachment	= wp.media.attachment( args.id );
				
				
				selection.add( attachment );
						
			}, frame);
			
			frame.on('close',function(){
				
				// remove class
				frame.$el.closest('.media-modal').removeClass('acf-media-modal');
				
			});
				
			}
			
			
			// add button
			if( args.button ) {
			
			/*
			*  Notes
			*
			*  The normal button setting seems to break the 'back' functionality when editing an image.
			*  As a work around, the following code updates the button text.
			*/
			
			frame.on( 'toolbar:create:select', function( toolbar ) {
				
				options = {
					'text'			: args.button,
					'controller'	: this
				};	

				toolbar.view = new wp.media.view.Toolbar.Select( options );
				
				
			}, frame );
					
			}
			
			
			// open popup
			setTimeout(function(){
				
				frame.open();
				
			}, 1);
			
			
			// return
			return frame;
			
		},
		
		init : function(){
			
			// bail early if wp.media does not exist (field group edit page)
			if( typeof wp == 'undefined' )
			{
				return false;
			}
			
			
			// validate prototype
			if( ! acf.isset(wp, 'media', 'view', 'AttachmentCompat', 'prototype') )
			{
				return false;	
			}
			
			
			
			// vars
			var _prototype = wp.media.view.AttachmentCompat.prototype;
			
			
			// orig
			_prototype.orig_render = _prototype.render;
			_prototype.orig_dispose = _prototype.dispose;
			
			
			// modify render
			_prototype.render = function() {
				
				// reference
				var _this = this;
				
				
				// validate
				if( _this.ignore_render )
				{
					return this;	
				}
				
				
				// run the old render function
				this.orig_render();
				
				
				// add button
				setTimeout(function(){
					
					// vars
					var $media_model = _this.$el.closest('.media-modal');
					
					
					// is this an edit only modal?
					if( $media_model.hasClass('acf-media-modal') )
					{
						return;	
					}
					
					
					// does button already exist?
					if( $media_model.find('.media-frame-router .acf-expand-details').exists() )
					{
						return;	
					}
					
					
					// create button
					var button = $([
						'<a href="#" class="acf-expand-details">',
							'<span class="is-closed"><span class="acf-icon small"><i class="acf-sprite-left"></i></span>' + acf._e('expand_details') +  '</span>',
							'<span class="is-open"><span class="acf-icon small"><i class="acf-sprite-right"></i></span>' + acf._e('collapse_details') +  '</span>',
						'</a>'
					].join('')); 
					
					
					// add events
					button.on('click', function( e ){
						
						e.preventDefault();
						
						if( $media_model.hasClass('acf-expanded') )
						{
							$media_model.removeClass('acf-expanded');
						}
						else
						{
							$media_model.addClass('acf-expanded');
						}
						
					});
					
					
					// append
					$media_model.find('.media-frame-router').append( button );
						
				
				}, 0);
				
				
				// setup fields
				// The clearTimout is needed to prevent many setup functions from running at the same time
				clearTimeout( acf.media.render_timout );
				acf.media.render_timout = setTimeout(function(){
					
					acf.do_action('append', _this.$el);
					
				}, 50);

				
				// return based on the original render function
				return this;
			};
			
			
			// modify dispose
			_prototype.dispose = function() {
				
				// remove
				acf.do_action('remove', this.$el);
				
				
				// run the old render function
				this.orig_dispose();
				
			};
			
			
			// override save
			_prototype.save = function( event ) {
			
				if( event ) {
					
					event.preventDefault();
					
				}
				
				
				// serialize form
				var data = acf.serialize_form(this.$el);
				
				
				// ignore render
				this.ignore_render = true;
				
				
				// save
				this.model.saveCompat( data );
				
			};
			
			
			// update the wp.media.view.settings.post.id setting
			setTimeout(function(){
			
				// Hack for CPT without a content editor
				try {
				
					// post_id may be string (user_1) and therefore, the uploaded image cannot be attached to the post
					if( $.isNumeric(acf.o.post_id) ) {
					
						wp.media.view.settings.post.id = acf.o.post_id;
						
					}
					
				} catch(e) {}
				
			}, 10);
			
			
		}
	};
	
	acf.add_action('load', function(){
		
		acf.media.init();
		
	});
	
	
	
	/*
	*  conditional_logic
	*
	*  description
	*
	*  @type	function
	*  @date	21/02/2014
	*  @since	3.5.1
	*
	*  @param	$post_id (int)
	*  @return	$post_id (int)
	*/
		
	acf.conditional_logic = {
		
		items : {},
		triggers : {},
		
		init : function(){
			
			// debug
			//console.log( 'conditional_logic.init(%o)', this );
			
			
			// reference
			var self = this;
			
			
			// events
			$(document).on('change', '.acf-field input, .acf-field textarea, .acf-field select', function(){
				
				self.change( $(this) );
				
			});
			
			
			// actions
			acf.add_action('ready', function( $el ){
				
				self.render( $el );
				
			}, 20);
			
						
			acf.add_action('append', function( $el ){
				
				self.render( $el );
				
			}, 20);
			
			
			// return
			return this;
			
		},
		
		add : function( key, groups ){
			
			// debug
			//console.log( 'conditional_logic.add(%o, %o)', key, groups );
			
			
			// reference
			var self = this;
			
			
			// append items
			this.items[ key ] = groups;
			
			
			// populate triggers
			for( var i in groups ) {
				
				var group = groups[i];
				
				for( var k in group ) {
					
					var rule = group[k];
					
					// add rule.field to triggers
					if( typeof this.triggers[rule.field] === 'undefined' ) {
					
						this.triggers[rule.field] = [];
						
					}
					
					
					// ignore trigger if already exists
					if( this.triggers[rule.field].indexOf(key) !== -1 ) {
					
						 continue;
						 
					}
					
					
					// append key to this trigger
					this.triggers[rule.field].push( key );
										
				}
				
			}
			
		},
		
		change : function( $input ){
			
			// debug
			//console.log( 'conditional_logic.change(%o)', $input );
			
			
			// vars
			var $field	= acf.get_field_wrap( $input ),
				$parent = $field.parent(),
				key		= acf.get_field_key( $field );
			
			
			// bail early if this field does not trigger any actions
			if( typeof this.triggers[key] === 'undefined' ) {
				
				return false;
				
			}
			
			
			// update visibility
			for( var i in this.triggers[ key ] ) {
				
				// get the target key
				var target_key = this.triggers[ key ][ i ];
				
				
				// get targets
				var $targets = acf.get_fields({key : target_key}, $parent, true);
				
				
				this.render_fields( $targets );
				
			}
			
		},
		
		render : function( $el ){
			
			// debug
			//console.log('render(%o)', $el);
			
			
			// defaults
			$el = $el || $('body');
			
			
			// get targets
			var $targets = acf.get_fields( {}, $el, true );
			
			
			// render fields
			this.render_fields( $targets );
			
		},
		
		render_fields : function( $targets ) {
		
			// reference
			var self = this;
			
			
			// loop over targets and render them			
			$targets.each(function(){
					
				self.render_field( $(this) );
				
			});
			
			
			// repeater hide column
			
			// action for 3rd party customization
			//acf.do_action('conditional_logic_render_field');
			
		},
		
		render_field : function( $field ){
			
			// reference
			var self = this;
			
			
			// vars
			var visibility	= false,
				key			= acf.get_field_key( $field );
				
			
			// bail early if this field does not contain any conditional logic
			if( typeof this.items[key] === 'undefined' ) {
				
				return false;
				
			}
			
			
			// debug
			//console.log( 'conditional_logic.render_field(%o)', $field );
			
			
			// get conditional logic
			var groups = this.items[ key ];
			
			
			// calculate visibility
			for( var i in groups ) {
				
				// vars
				var group		= groups[i],
					match_group	= true;
				
				for( var k in group ) {
					
					var rule = group[k];
					
					if( !self.get_visibility( $field, rule) ) {
						
						match_group = false;
						break;
						
					}
										
				}
				
				
				if( match_group ) {
					
					visibility = true;
					break;
					
				}
				
			}
			
			
			// hide / show field
			if( visibility ) {
				
				self.show_field( $field );					
			
			} else {
				
				self.hide_field( $field );
			
			}
			
		},
		
		show_field : function( $field ){
			
			// vars
			//var key = acf.get_field_key( $field );
							
			
			// add class
			$field.removeClass( 'hidden-by-conditional-logic' );
			
			
			// remove "disabled"
			// ignore inputs which have a class of 'acf-disabled'. These inputs are disabled for life
			$field.find('input, textarea, select').not('.acf-disabled').removeAttr('disabled');
			
			
			// action for 3rd party customization
			acf.do_action('conditional_logic_show_field', $field );
			acf.do_action('show_field', $field, 'conditional_logic' );
			
		},
		
		hide_field : function( $field ){
			
			// debug
			//console.log( 'conditional_logic.hide_field(%o)', $field );
			
			
			// vars
			//var key = acf.get_field_key( $field );
			
			
			// add class
			$field.addClass( 'hidden-by-conditional-logic' );
			
			
			// add "disabled"
			$field.find('input, textarea, select').attr('disabled', 'disabled');
			
			
			// action for 3rd party customization
			acf.do_action('conditional_logic_hide_field', $field );
			acf.do_action('hide_field', $field, 'conditional_logic' );
			
		},
		
		get_visibility : function( $target, rule ){
			
			//console.log( 'conditional_logic.get_visibility(%o, %o)', $target, rule );
			
			// vars
			//var $search = acf.is_sub_field( $target ) ? $target.parent() : $('body');
			//console.log( '$search %o', $search );
			
			// vars
			var $triggers = acf.get_fields({key : rule.field}, false, true),
				$trigger = null;
			
			
			// bail early if no triggers found
			if( !$triggers.exists() ) {
				
				return false;
				
			}
			
			
			// set $trigger
			$trigger = $triggers.first();
			
			
			// find better $trigger
			if( $triggers.length > 1 ) {
				
				$triggers.each(function(){
					
					// vars
					$parent = $(this).parent();
					
					
					if( $target.closest( $parent ).exists() ) {
						
						$trigger = $(this);
						return false;
					}

				});
				
			}
			
			
			// calculate
			var visibility = this.calculate( rule, $trigger, $target );
			
			
			// return
			return visibility;
		},
		
		calculate : function( rule, $trigger, $target ){
			
			// debug
			//console.log( 'calculate(%o, %o, %o)', rule, $trigger, $target);
			
			
			// vars
			var type = acf.get_data($trigger, 'type');
			
			
			// input with :checked
			if( type == 'true_false' || type == 'checkbox' || type == 'radio' ) {
				
				var exists = $trigger.find('input[value="' + rule.value + '"]:checked').exists();
				
				if( rule.operator == "==" && exists ) {
				
					return true;
					
				} else if( rule.operator == "!=" && !exists ) {
				
					return true;
					
				}
				
			} else if( type == 'select' ) {
				
				// vars
				var $select = $trigger.find('select'),
					data = acf.get_data( $select ),
					val = [];
				
				
				if( data.multiple && data.ui ) {
					
					$trigger.find('.acf-select2-multi-choice').each(function(){
						
						val.push( $(this).val() );
						
					});
					
				} else if( data.multiple ) {
					
					val = $select.val();
					
				} else if( data.ui ) {
					
					val.push( $trigger.find('input').first().val() );
					
				} else {
					
					val.push( $select.val() );
				
				}
				
				
				if( rule.operator == "==" ) {
					
					if( $.inArray(rule.value, val) > -1 ) {
					
						return true;
						
					}
					
				} else {
				
					if( $.inArray(rule.value, val) < 0 ) {
					
						return true;
						
					}
					
				}
				
			}
			
			
			// return
			return false;
			
		}
		
	}.init();
	
	
	
	/*
	*  ready
	*
	*  description
	*
	*  @type	function
	*  @date	19/02/2014
	*  @since	5.0.0
	*
	*  @param	$post_id (int)
	*  @return	$post_id (int)
	*/
	
	$(document).ready(function(){
		
		// action for 3rd party customization
		acf.do_action('ready', $('body'));
		
	});
	
	
	/*
	*  load
	*
	*  description
	*
	*  @type	function
	*  @date	19/02/2014
	*  @since	5.0.0
	*
	*  @param	$post_id (int)
	*  @return	$post_id (int)
	*/
	
	$(window).load(function(){
		
		// action for 3rd party customization
		acf.do_action('load', $('body'));
		
	});
	
	
	/*
	*  preventDefault helper
	*
	*  This function will prevent default of any link with an href of #
	*
	*  @type	function
	*  @date	24/07/2014
	*  @since	5.0.0
	*
	*  @param	$post_id (int)
	*  @return	$post_id (int)
	*/
	
	$(document).on('click', '.acf-field a[href="#"]', function( e ){
		
		e.preventDefault();
		
	});
	
	
	/*
	*  Force revisions
	*
	*  description
	*
	*  @type	function
	*  @date	19/02/2014
	*  @since	5.0.0
	*
	*  @param	$post_id (int)
	*  @return	$post_id (int)
	*/
	
	$(document).on('change', '.acf-field input, .acf-field textarea, .acf-field select', function(){
		
		// preview hack
		if( $('#acf-form-data input[name="_acfchanged"]').exists() ) {
		
			$('#acf-form-data input[name="_acfchanged"]').val(1);
			
		}
		
		
		// update setting
		acf.update('changed', true);
		
	});
	
	
	/*
	*  unload
	*
	*  description
	*
	*  @type	function
	*  @date	1/09/2014
	*  @since	5.0.0
	*
	*  @param	$post_id (int)
	*  @return	$post_id (int)
	*/
	
	var unload = function(){
			
		if( acf.get('changed') ) {
			
			return acf._e('unload');
			
		}
		
	};	
	
	
	// add unload if validation fails
	acf.add_filter('validation_complete', function( json, $form ){
		
		if( json.errors ) {
			
			$(window).on('beforeunload', unload);
			
		}
		
		
		// return
		return json;
		
	});
	
	
	// remove unload when submitting form
	$(document).on('submit', 'form', function( e ){
		
		$(window).off('beforeunload', unload);
						
	});
	
	acf.add_action('submit', function( $form ){
		
		$(window).off('beforeunload', unload);
						
	});
	
	
	// add unload event
	$(window).on('beforeunload', unload);
			
	
	/*
	*  Sortable
	*
	*  These functions will hook into the start and stop of a jQuery sortable event and modify the item and placeholder to look seamless
	*
	*  @type	function
	*  @date	12/11/2013
	*  @since	5.0.0
	*
	*  @param	$post_id (int)
	*  @return	$post_id (int)
	*/
	
	acf.add_action('sortstart', function( $item, $placeholder ){
		
		// if $item is a tr, apply some css to the elements
		if( $item.is('tr') )
		{
			// temp set as relative to find widths
			$item.css('position', 'relative');
			
			
			// set widths for td children		
			$item.children().each(function(){
			
				$(this).width($(this).width());
				
			});
			
			
			// revert position css
			$item.css('position', 'absolute');
			
			
			// add markup to the placeholder
			$placeholder.html('<td style="height:' + $item.height() + 'px; padding:0;" colspan="' + $item.children('td').length + '"></td>');
		}
		
	});
	
	
	
	/*
	*  before & after duplicate
	*
	*  This function will modify the DOM before it is cloned. Primarily fixes a cloning issue with select elements
	*
	*  @type	function
	*  @date	16/05/2014
	*  @since	5.0.0
	*
	*  @param	$post_id (int)
	*  @return	$post_id (int)
	*/
	
	acf.add_action('before_duplicate', function( $orig ){
		
		// save select values
		$orig.find('select').each(function(){
			
			$(this).find(':selected').addClass('selected');
			
		});
		
	});
	
	acf.add_action('after_duplicate', function( $orig, $duplicate ){
		
		// restore select values
		$orig.find('select').each(function(){
			
			$(this).find('.selected').removeClass('selected');
			
		});
		
		
		// set select values
		$duplicate.find('select').each(function(){
			
			var $selected = $(this).find('.selected');
			
			$(this).val( $selected.attr('value') );
			
			$selected.removeClass('selected');
			
		});
		
	});
	
	
	/*
	*  field model
	*
	*  description
	*
	*  @type	function
	*  @date	14/08/2014
	*  @since	5.0.0
	*
	*  @param	$post_id (int)
	*  @return	$post_id (int)
	*/
	
	acf.add_action('ready', function( $el ){
				
		acf.get_fields({}, $el).each(function(){
			
			acf.do_action('ready_field', $(this));
			acf.do_action('ready_field/type=' + acf.get_field_type($(this)), $(this));
			
		});
		
	});
	
	acf.add_action('append', function( $el ){
				
		acf.get_fields({}, $el).each(function(){
			
			acf.do_action('append_field', $(this));
			acf.do_action('append_field/type=' + acf.get_field_type($(this)), $(this));
			
		});
		
	});
	
	acf.add_action('load', function( $el ){
				
		acf.get_fields({}, $el).each(function(){
			
			acf.do_action('load_field', $(this));
			acf.do_action('load_field/type=' + acf.get_field_type($(this)), $(this));
			
		});
		
	});
	
	
	acf.add_action('remove', function( $el ){
				
		acf.get_fields({}, $el).each(function(){
			
			acf.do_action('remove_field', $(this));
			acf.do_action('remove_field/type=' + acf.get_field_type($(this)), $(this));
			
		});
		
	});
	
	acf.add_action('sortstart', function( $item, $placeholder ){
				
		acf.get_fields({}, $item).each(function(){
			
			acf.do_action('sortstart_field', $(this));
			acf.do_action('sortstart_field/type=' + acf.get_field_type($(this)), $(this));
			
		});
		
	});
	
	acf.add_action('sortstop', function( $item, $placeholder ){
				
		acf.get_fields({}, $item).each(function(){
			
			acf.do_action('sortstop_field', $(this));
			acf.do_action('sortstop_field/type=' + acf.get_field_type($(this)), $(this));
			
		});
		
	});
	
	acf.add_action('hide_field', function( $el, context ){
				
		acf.do_action('hide_field/type=' + acf.get_field_type($el), $el, context);
		
	});
	
	acf.add_action('show_field', function( $el, context ){
				
		acf.do_action('show_field/type=' + acf.get_field_type($el), $el, context);
		
	});
	
	
	acf.field = {
		
		// vars
		type:		'',
		settings:	{},
		actions:	{},
		events:		{},
		$field:		null,
		
		extend: function( args ){
			
			// extend
			var model = $.extend( {}, this, args );
			
			
			// setup actions
			$.each(model.actions, function( action, callback ){
				
				// vars
				var action = action + '_field/type=' + model.type;
				
				acf.add_action(action, function(){
					
					[].unshift.apply(arguments, [callback]);
					
					model.doAction.apply(model, arguments);
					
				});
			
			});
			
			
			// setup events
			$.each(model.events, function( k, callback ){
				
				var event = k.substr(0,k.indexOf(' ')),
					selector = k.substr(k.indexOf(' ')+1);
				
				$(document).on(event, '.acf-field[data-type="' + model.type + '"] ' + selector, function( e ){
					
					e.$el = $(this);
					
					model.doEvent.apply(model, [ callback, e ]);
					
				});
				
			});
			
			
			// return
			return model;
			
		},
		
		doFocus: function( $field ){
			
			// focus on $field
			this.$field = $field;
			
			
			// merge in field's data
			$.extend(this.settings, acf.get_data($field));
			
			
			// callback
			if( typeof this.focus === 'function' ) {
				
				this.focus();
				
			}
			
		},
		
		doAction: function(){
			
			// debug
			//console.log('doAction(%o)', arguments);
			
			
			// remove callback from arguments
			var callback = [].shift.apply(arguments);
			
			
			// focus
			this.doFocus( arguments[0] );
			
			
			// callback
			this[ callback ].apply(this, arguments);
			
		},
		
		doEvent: function( callback, e ){
			
			// debug
			//console.log('doEvent(%o, %o, %o)', callback, $el, e);
			
			
			// focus
			this.doFocus( acf.get_closest_field( e.$el ) );
			
			
			// callback
			this[ callback ].apply(this, [e]);
			
		},
		
	};
	
})(jQuery);

/* **********************************************
     Begin ajax.js
********************************************** */

(function($){
	
	acf.ajax = {
		
		o : {
			action 			:	'acf/post/get_field_groups',
			post_id			:	0,
			page_template	:	0,
			page_parent		:	0,
			page_type		:	0,
			post_format		:	0,
			post_taxonomy	:	0,
			lang			:	0,
		},
		
		update : function( k, v ){
			
			this.o[ k ] = v;
			return this;
			
		},
		
		get : function( k ){
			
			return this.o[ k ] || null;
			
		},
		
		init : function(){
			
			// bail early if ajax is disabled
			if( ! acf.get('ajax') )
			{
				return false;	
			}
			
			
			// vars
			this.update('post_id', acf.get('post_id'));
			
			
			// MPML
			if( $('#icl-als-first').length > 0 )
			{
				var href = $('#icl-als-first').children('a').attr('href'),
					regex = new RegExp( "lang=([^&#]*)" ),
					results = regex.exec( href );
				
				// lang
				this.update('lang', results[1]);
				
			}
			
			
			// add triggers
			this.add_events();
		},
		
		fetch : function(){
			
			// reference
			var _this = this;
			
			
			// ajax
			$.ajax({
				url			: acf.get('ajaxurl'),
				data		: acf.prepare_for_ajax( this.o ),
				type		: 'post',
				dataType	: 'json',
				success		: function( json ){
					
					if( acf.is_ajax_success( json ) ) {
						
						_this.render( json.data );
						
					}
					
				}
			});
			
		},
		
		render : function( json ){
			
			// hide all metaboxes
			$('.acf-postbox').addClass('acf-hidden');
			$('.acf-postbox-toggle').addClass('acf-hidden');
			
			
			// show the new postboxes
			$.each(json, function( k, field_group ){
				
				// vars
				var $el = $('#acf-' + field_group.key),
					$toggle = $('#adv-settings .acf_postbox-toggle[for="acf-' + field_group.key + '-hide"]');
				
				
				// classes
				$el.removeClass('acf-hidden hide-if-js');
				$toggle.removeClass('acf-hidden hide-if-js');
				$toggle.find('input[type="checkbox"]').attr('checked', 'checked');
				
				
				// replace HTML if needed
				$el.find('.acf-replace-with-fields').each(function(){
					
					$(this).replaceWith( field_group.html );
					
					acf.do_action('append', $el);
					
				});
				
				
				// update style if needed
				if( k === 0 )
				{
					$('#acf-style').html( field_group.style );
				}
				
			});
			
		},
		
		sync_taxonomy_terms : function(){
			
			// vars
			var values = [];
			
			
			$('.categorychecklist, .acf-taxonomy-field').each(function(){
				
				// vars
				var $el = $(this),
					$checkbox = $el.find('input[type="checkbox"]').not(':disabled'),
					$radio = $el.find('input[type="radio"]').not(':disabled'),
					$select = $el.find('select').not(':disabled'),
					$hidden = $el.find('input[type="hidden"]').not(':disabled');
				
				
				// bail early if not a field which saves taxonomy terms to post
				if( $el.is('.acf-taxonomy-field') && $el.attr('data-load_save') != '1' ) {
					
					return;
					
				}
				
				
				// bail early if in attachment
				if( $el.closest('.media-frame').exists() ) {
					
					return;
				
				}
				
				
				// checkbox
				if( $checkbox.exists() ) {
					
					$checkbox.filter(':checked').each(function(){
						
						values.push( $(this).val() );
						
					});
					
				} else if( $radio.exists() ) {
					
					$radio.filter(':checked').each(function(){
						
						values.push( $(this).val() );
						
					});
					
				} else if( $select.exists() ) {
					
					$select.find('option:selected').each(function(){
						
						values.push( $(this).val() );
						
					});
					
				} else if( $hidden.exists() ) {
					
					$hidden.each(function(){
						
						// ignor blank values or those which contain a comma (select2 multi-select)
						if( ! $(this).val() || $(this).val().indexOf(',') > -1 ) {
							
							return;
							
						}
						
						values.push( $(this).val() );
						
					});
					
				}
								
			});
	
			
			// filter duplicates
			values = values.filter (function (v, i, a) { return a.indexOf (v) == i });
			
			
			// update screen
			this.update( 'post_taxonomy', values ).fetch();
			
		},
		
		add_events : function(){
			
			// reference
			var _this = this;
			
			
			// page template
			$(document).on('change', '#page_template', function(){
				
				var page_template = $(this).val();
				
				_this.update( 'page_template', page_template ).fetch();
			    
			});
			
			
			// page parent
			$(document).on('change', '#parent_id', function(){
				
				var page_type = 'parent',
					page_parent = 0;
				
				
				if( $(this).val() != "" ) {
				
					page_type = 'child';
					page_parent = $(this).val();
					
				}
				
				_this.update( 'page_type', page_type ).update( 'page_parent', page_parent ).fetch();
			    
			});
			
			
			// post format
			$(document).on('change', '#post-formats-select input[type="radio"]', function(){
				
				var post_format = $(this).val();
				
				if( post_format == '0' )
				{
					post_format = 'standard';
				}
				
				_this.update( 'post_format', post_format ).fetch();
				
			});
			
			
			// post taxonomy
			$(document).on('change', '.categorychecklist input, .acf-taxonomy-field input, .acf-taxonomy-field select', function(){
				
				// a taxonomy field may trigger this change event, however, the value selected is not
				// actually a term relationship, it is meta data
				var $el = $(this).closest('.acf-taxonomy-field');
				
				if( $el.exists() && $el.attr('data-load_save') != '1' ) {
					
					return;
					
				}
				
				
				// this may be triggered from editing an image in a popup. Popup does not support correct metaboxes so ignore this
				if( $(this).closest('.media-frame').exists() ) {
					
					return;
				
				}
				
				
				// set timeout to fix issue with chrome which does not register the change has yet happened
				setTimeout(function(){
					
					_this.sync_taxonomy_terms();
				
				}, 1);
				
				
			});
			
			
			
			// user role
			/*
			$(document).on('change', 'select[id="role"][name="role"]', function(){
				
				_this.update( 'user_role', $(this).val() ).fetch();
				
			});
			*/
			
		}
		
	};
	
	
	/*
	*  Document Ready
	*
	*  Initialize the object
	*
	*  @type	function
	*  @date	1/03/2011
	*
	*  @param	N/A
	*  @return	N/A
	*/
	
	$(document).ready(function(){
		
		// initialize
		acf.ajax.init();
		
	});


	
})(jQuery);

/* **********************************************
     Begin color-picker.js
********************************************** */

(function($){
	
	acf.fields.color_picker = acf.field.extend({
		
		type: 'color_picker',
		timeout: null,
		
		actions: {
			'ready':	'initialize',
			'append':	'initialize'
		},
		
		focus: function(){
			
			this.$input = this.$field.find('input[type="text"]');
			
		},
		
		initialize: function(){
			
			// reference
			var self = this;
			
			
			// vars
			var $hidden = this.$input.clone();
			
			
			// modify hidden
			$hidden.attr({
				'type'	: 'hidden',
				'class' : '',
				'id'	: '',
				'value'	: ''
 			});
 			
 			
 			// append hidden
 			this.$input.before( $hidden );
 			
 			
 			// iris
			this.$input.wpColorPicker({
				
				change: function( event, ui ){
			
					if( self.timeout ) {
				
						clearTimeout( self.timeout );
						
					}
					
					
					self.timeout = setTimeout(function(){
						
						$hidden.trigger('change');
						
					}, 1000);
					
				}
				
			});
			
		}
		
	});
	

})(jQuery);

/* **********************************************
     Begin date-picker.js
********************************************** */

(function($){
	
	acf.fields.date_picker = acf.field.extend({
		
		type: 'date_picker',
		$el: null,
		$input: null,
		$hidden: null,
		
		actions: {
			'ready':	'initialize',
			'append':	'initialize'
		},
		
		events: {
			'blur input[type="text"]': 'blur',
		},
		
		focus: function(){
			
			this.$el = this.$field.find('.acf-date_picker');
			this.$input = this.$el.find('input[type="text"]');
			this.$hidden = this.$el.find('input[type="hidden"]');
			
			this.settings = acf.get_data( this.$el );
		},
		
		initialize: function(){
			
			// get and set value from alt field
			this.$input.val( this.$hidden.val() );
			
			
			// create options
			var args = $.extend( {}, acf.l10n.date_picker, { 
				dateFormat		:	'yymmdd',
				altField		:	this.$hidden,
				altFormat		:	'yymmdd',
				changeYear		:	true,
				yearRange		:	"-100:+100",
				changeMonth		:	true,
				showButtonPanel	:	true,
				firstDay		:	this.settings.first_day
			});
			
			
			// filter for 3rd party customization
			args = acf.apply_filters('date_picker_args', args, this.$el);
			
			
			// add date picker
			this.$input.addClass('active').datepicker( args );
			
			
			// now change the format back to how it should be.
			this.$input.datepicker( "option", "dateFormat", this.settings.display_format );
			
			
			// wrap the datepicker (only if it hasn't already been wrapped)
			if( $('body > #ui-datepicker-div').exists() ) {
			
				$('body > #ui-datepicker-div').wrap('<div class="acf-ui-datepicker" />');
				
			}
			
		},
		
		blur : function(){
			
			if( !this.$input.val() ) {
			
				this.$hidden.val('');
				
			}
			
		}
		
	});
	
})(jQuery);

/* **********************************************
     Begin file.js
********************************************** */

(function($){
	
	acf.fields.file = acf.field.extend({
		
		type: 'file',
		$el: null,
		
		events: {
			'click [data-name="add"]': 		'add',
			'click [data-name="edit"]': 	'edit',
			'click [data-name="remove"]':	'remove',
		},
		
		focus: function(){
			
			this.$el = this.$field.find('.acf-file-uploader');
			
			this.settings = acf.get_data( this.$el );
			
		},
		
		add : function( $a ) {
			
			// reference
			var self = this;
			
			
			// vars
			var field_key = acf.get_data( this.$field, 'key' );
			
			
			// get repeater
			var $repeater = acf.get_closest_field( this.$field, {type:'repeater'} );
			
			
			// popup
			var frame = acf.media.popup({
				
				title:		acf._e('file', 'select'),
				mode:		'select',
				type:		'',
				multiple:	$repeater.exists(),
				library:	this.settings.library,
				
				select: function( attachment, i ) {
					
					// select / add another image field?
			    	if( i > 0 ) {
			    		
						// vars
						var $tr = self.$field.parent(),
							$next = false;
							
						
						// find next image field
						$tr.nextAll('.acf-row').not('.clone').each(function(){
							
							// get next $field
							$next = acf.get_field( field_key, $(this) );
							
							
							// bail early if $next was not found
							if( !$next ) {
								
								return;
								
							}
							
							
							// bail early if next file uploader has value
							if( $next.find('.acf-file-uploader.has-value').exists() ) {
								
								$next = false;
								return;
								
							}
								
								
							// end loop if $next is found
							return false;
							
						});
						
						
						
						// add extra row if next is not found
						if( !$next ) {
							
							$tr = acf.fields.repeater.set( $repeater ).add();
							
							
							// get next $field
							$next = acf.get_field( field_key, $tr );
							
						}
						
						
						// update $el
						self.doFocus( $next );
						
					}
											
					
			    	// vars
			    	var file = {
				    	id:		attachment.id,
				    	title:	attachment.attributes.title,
				    	name:	attachment.attributes.filename,
				    	url:	attachment.attributes.url,
				    	icon:	attachment.attributes.icon,
				    	size:	attachment.attributes.filesize
			    	};
			    	
			    	
			    	// add file to field
			        self.render( file );
					
				}
			});
			
			
		},
		
		render : function( file ){
			
			// set atts
			this.$el.find('[data-name="icon"]').attr( 'src', file.icon );
			this.$el.find('[data-name="title"]').text( file.title );
		 	this.$el.find('[data-name="name"]').text( file.name ).attr( 'href', file.url );
		 	this.$el.find('[data-name="size"]').text( file.size );
			this.$el.find('[data-name="id"]').val( file.id ).trigger('change');
			
					 	
		 	// set div class
		 	this.$el.addClass('has-value');
	
		},
		
		edit : function( $a ) {
			
			// reference
			var self = this;
			
			
			// vars
			var id = this.$el.find('[data-name="id"]').val();
			
			
			// popup
			var frame = acf.media.popup({
			
				title:		acf._e('file', 'edit'),
				button:		acf._e('file', 'update'),
				mode:		'edit',
				id:			id,
				
				select:	function( attachment, i ) {
					
			    	// vars
			    	var file = {
				    	id:		attachment.id,
				    	title:	attachment.attributes.title,
				    	name:	attachment.attributes.filename,
				    	url:	attachment.attributes.url,
				    	icon:	attachment.attributes.icon,
				    	size:	attachment.attributes.filesize
			    	};
			    	
			    	
			    	// add file to field
			        self.render( file );
					
				}
			});
			
			
		},
		
		
		remove : function( $a ) {
			
			// vars
	    	var file = {
		    	id:		'',
		    	title:	'',
		    	name:	'',
		    	url:	'',
		    	icon:	'',
		    	size:	''
	    	};
	    	
	    	
	    	// add file to field
	        this.render( file );
	        
	        
			// remove class
			this.$el.removeClass('has-value');
			
		},
		
		
	});
	

})(jQuery);

/* **********************************************
     Begin google-map.js
********************************************** */

(function($){
	
	/*
	*  Location
	*
	*  static model for this field
	*
	*  @type	event
	*  @date	1/06/13
	*
	*/
	
	acf.fields.google_map = {
		
		$el : null,
		$input : null,
		
		o : {},
		
		ready : false,
		geocoder : false,
		map : false,
		maps : {},
		
		set : function( o ){
			
			// merge in new option
			$.extend( this, o );
			
			
			// find input
			this.$input = this.$el.find('.value');
			
			
			// get options
			this.o = acf.get_data( this.$el );
			
			
			// get map
			if( this.maps[ this.o.id ] )
			{
				this.map = this.maps[ this.o.id ];
			}
			
				
			// return this for chaining
			return this;
			
		},
		init : function(){
			
			// geocode
			if( !this.geocoder )
			{
				this.geocoder = new google.maps.Geocoder();
			}
			
			
			// google maps is loaded and ready
			this.ready = true;
			
			
			// render map
			this.render();
					
		},
		render : function(){
			
			// reference
			var _this	= this,
				_$el	= this.$el;
			
			
			// vars
			var args = {
        		zoom		: parseInt(this.o.zoom),
        		center		: new google.maps.LatLng(this.o.lat, this.o.lng),
        		mapTypeId	: google.maps.MapTypeId.ROADMAP
        	};
			
			// create map	        	
        	this.map = new google.maps.Map( this.$el.find('.canvas')[0], args);
	        
	        
	        // add search
			var autocomplete = new google.maps.places.Autocomplete( this.$el.find('.search')[0] );
			autocomplete.map = this.map;
			autocomplete.bindTo('bounds', this.map);
			
			
			// add dummy marker
	        this.map.marker = new google.maps.Marker({
		        draggable	: true,
		        raiseOnDrag	: true,
		        map			: this.map,
		    });
		    
		    
		    // add references
		    this.map.$el = this.$el;
		    
		    
		    // value exists?
		    var lat = this.$el.find('.input-lat').val(),
		    	lng = this.$el.find('.input-lng').val();
		    
		    if( lat && lng )
		    {
			    this.update( lat, lng ).center();
		    }
		    
		    
			// events
			google.maps.event.addListener(autocomplete, 'place_changed', function( e ) {
			    
			    // reference
			    var $el = this.map.$el;


			    // manually update address
			    var address = $el.find('.search').val();
			    $el.find('.input-address').val( address );
			    $el.find('.title h4').text( address );
			    
			    
			    // vars
			    var place = this.getPlace();
			    
			    
			    // validate
			    if( place.geometry )
			    {
			    	var lat = place.geometry.location.lat(),
						lng = place.geometry.location.lng();
						
						
				    _this.set({ $el : $el }).update( lat, lng ).center();
			    }
			    else
			    {
				    // client hit enter, manually get the place
				    _this.geocoder.geocode({ 'address' : address }, function( results, status ){
				    	
				    	// validate
						if( status != google.maps.GeocoderStatus.OK )
						{
							console.log('Geocoder failed due to: ' + status);
							return;
						}
						
						if( !results[0] )
						{
							console.log('No results found');
							return;
						}
						
						
						// get place
						place = results[0];
						
						var lat = place.geometry.location.lat(),
							lng = place.geometry.location.lng();
							
							
					    _this.set({ $el : $el }).update( lat, lng ).center();
					    
					});
			    }
			    
			});
		    
		    
		    google.maps.event.addListener( this.map.marker, 'dragend', function(){
		    	
		    	// reference
			    var $el = this.map.$el;
			    
			    
		    	// vars
				var position = this.map.marker.getPosition(),
					lat = position.lat(),
			    	lng = position.lng();
			    	
				_this.set({ $el : $el }).update( lat, lng ).sync();
			    
			});
			
			
			google.maps.event.addListener( this.map, 'click', function( e ) {
				
				// reference
			    var $el = this.$el;
			    
			    
				// vars
				var lat = e.latLng.lat(),
					lng = e.latLng.lng();
				
				
				_this.set({ $el : $el }).update( lat, lng ).sync();
			
			});

			
			
	        // add to maps
	        this.maps[ this.o.id ] = this.map;
	        
	        
		},
		
		update : function( lat, lng ){
			
			// vars
			var latlng = new google.maps.LatLng( lat, lng );
		    
		    
		    // update inputs
			this.$el.find('.input-lat').val( lat );
			this.$el.find('.input-lng').val( lng ).trigger('change');
			
			
		    // update marker
		    this.map.marker.setPosition( latlng );
		    
		    
			// show marker
			this.map.marker.setVisible( true );
		    
		    
	        // update class
	        this.$el.addClass('active');
	        
	        
	        // validation
			this.$el.closest('.acf-field').removeClass('error');
			
			
	        // return for chaining
	        return this;
		},
		
		center : function(){
			
			// vars
			var position = this.map.marker.getPosition(),
				lat = this.o.lat,
				lng = this.o.lng;
			
			
			// if marker exists, center on the marker
			if( position )
			{
				lat = position.lat();
				lng = position.lng();
			}
			
			
			var latlng = new google.maps.LatLng( lat, lng );
				
			
			// set center of map
	        this.map.setCenter( latlng );
		},
		
		sync : function(){
			
			// reference
			var $el	= this.$el;
				
			
			// vars
			var position = this.map.marker.getPosition(),
				latlng = new google.maps.LatLng( position.lat(), position.lng() );
			
			
			this.geocoder.geocode({ 'latLng' : latlng }, function( results, status ){
				
				// validate
				if( status != google.maps.GeocoderStatus.OK )
				{
					console.log('Geocoder failed due to: ' + status);
					return;
				}
				
				if( !results[0] )
				{
					console.log('No results found');
					return;
				}
				
				
				// get location
				var location = results[0];
				
				
				// update h4
				$el.find('.title h4').text( location.formatted_address );

				
				// update input
				$el.find('.input-address').val( location.formatted_address ).trigger('change');
				
			});
			
			
			// return for chaining
	        return this;
		},
		
		locate : function(){
			
			// reference
			var _this	= this,
				_$el	= this.$el;
			
			
			// Try HTML5 geolocation
			if( ! navigator.geolocation )
			{
				alert( acf.l10n.google_map.browser_support );
				return this;
			}
			
			
			// show loading text
			_$el.find('.title h4').text(acf.l10n.google_map.locating + '...');
			_$el.addClass('active');
			
		    navigator.geolocation.getCurrentPosition(function(position){
		    	
		    	// vars
				var lat = position.coords.latitude,
			    	lng = position.coords.longitude;
			    	
				_this.set({ $el : _$el }).update( lat, lng ).sync().center();
				
			});

				
		},
		
		clear : function(){
			
			// update class
	        this.$el.removeClass('active');
			
			
			// clear search
			this.$el.find('.search').val('');
			
			
			// clear inputs
			this.$el.find('.input-address').val('');
			this.$el.find('.input-lat').val('');
			this.$el.find('.input-lng').val('');
			
			
			// hide marker
			this.map.marker.setVisible( false );
		},
		
		edit : function(){
			
			// update class
	        this.$el.removeClass('active');
			
			
			// clear search
			var val = this.$el.find('.title h4').text();
			
			
			this.$el.find('.search').val( val ).focus();
			
		},
		
		refresh : function(){
			
			// trigger resize on div
			google.maps.event.trigger(this.map, 'resize');
			
			// center map
			this.center();
			
		}

	
	};
	
	
	/*
	*  acf/setup_fields
	*
	*  run init function on all elements for this field
	*
	*  @type	event
	*  @date	20/07/13
	*
	*  @param	{object}	e		event object
	*  @param	{object}	el		DOM object which may contain new ACF elements
	*  @return	N/A
	*/
	
	acf.add_action('ready append', function( $el ){
		
		//vars
		var $fields = acf.get_fields({ type : 'google_map'}, $el);
		
		
		// validate
		if( !$fields.exists() )
		{
			return;
		}
		
		
		// validate google
		if( typeof google === 'undefined' )
		{
			$.getScript('https://www.google.com/jsapi', function(){
			
			    google.load('maps', '3', { other_params: 'sensor=false&libraries=places', callback: function(){
			    
			        $fields.each(function(){
					
						acf.fields.google_map.set({ $el : $(this).find('.acf-google-map') }).init();
						
					});
			        
			    }});
			});
			
		}
		else
		{
			$fields.each(function(){
				
				acf.fields.google_map.set({ $el : $(this).find('.acf-google-map') }).init();
				
			});
			
		}
		
		
	});
	
	
	/*
	*  Events
	*
	*  jQuery events for this field
	*
	*  @type	function
	*  @date	1/03/2011
	*
	*  @param	N/A
	*  @return	N/A
	*/
	
	$(document).on('click', '.acf-google-map a[data-name="clear-location"]', function( e ){
		
		e.preventDefault();
		
		acf.fields.google_map.set({ $el : $(this).closest('.acf-google-map') }).clear();
		
		$(this).blur();
		
	});
	
	
	$(document).on('click', '.acf-google-map a[data-name="find-location"]', function( e ){
		
		e.preventDefault();
		
		acf.fields.google_map.set({ $el : $(this).closest('.acf-google-map') }).locate();
		
		$(this).blur();
		
	});
	
	$(document).on('click', '.acf-google-map .title h4', function( e ){
		
		e.preventDefault();
		
		acf.fields.google_map.set({ $el : $(this).closest('.acf-google-map') }).edit();
			
	});
	
	$(document).on('keydown', '.acf-google-map .search', function( e ){
		
		// prevent form from submitting
		if( e.which == 13 )
		{
		    return false;
		}
			
	});
	
	$(document).on('blur', '.acf-google-map .search', function( e ){
		
		// vars
		var $el = $(this).closest('.acf-google-map');
		
		
		// has a value?
		if( $el.find('.input-lat').val() )
		{
			$el.addClass('active');
		}
			
	});
	
	acf.add_action('show_field', function( $field ){
		
		// validate
		if( ! acf.fields.google_map.ready )
		{
			return;
		}
		
		
		// validate
		if( acf.is_field($field, {type : 'google_map'}) )
		{
			acf.fields.google_map.set({ $el : $field.find('.acf-google-map') }).refresh();
		}
		
	});
	

})(jQuery);

/* **********************************************
     Begin image.js
********************************************** */

(function($){
	
	acf.fields.image = {
				
		edit : function( $a ) {
			
			// vars
			var $el = $a.closest('.acf-image-uploader'),
				id = $el.find('[data-name="value-id"]').val();
			
			
			// popup
			var frame = acf.media.popup({
				'title'			: acf._e('image', 'edit'),
				'button'		: acf._e('image', 'update'),
				'mode'			: 'edit',
				'id'			: id
			});
			
		},
		
		remove : function( $a ) {
			
			// vars
			var $el = $a.closest('.acf-image-uploader');
			
			
			// set atts
		 	$el.find('[data-name="value-url"]').attr( 'src', '' );
			$el.find('[data-name="value-id"]').val('').trigger('change');
			
			
			// remove class
			$el.removeClass('has-value');
			
		},
		
		popup : function( $a ) {
			
			// el
			var $el				= $a.closest('.acf-image-uploader'),
				$field			= acf.get_the_field( $el ),
				$repeater		= acf.get_the_field( $field );
			
			
			// vars
			var library 		= acf.get_data( $el, 'library' ),
				preview_size	= acf.get_data( $el, 'preview_size' ),
				multiple		= false;
				
				
			// get parent
			if( $repeater.exists() && acf.is_field($repeater, {type : 'repeater'}) ) {
				
				multiple = true;
				
			}
			
			
			// popup
			var frame = acf.media.popup({
				'title'			: acf._e('image', 'select'),
				'mode'			: 'select',
				'type'			: 'image',
				'multiple'		: multiple,
				'library'		: library,
				'select'		: function( attachment, i ) {
					
					// select / add another image field?
			    	if( i > 0 ) {
			    		
						// vars
						var $tr 	= $field.parent(),
							$next	= false,
							key 	= acf.get_data( $field, 'key' );
							
						
						// find next image field
						$tr.nextAll('.acf-row').not('.clone').each(function(){
							
							// get next $field
							$next = acf.get_field( key, $(this) );
							
							
							// bail early if $next was not found
							if( !$next ) {
								
								return;
								
							}
							
							
							// bail early if next file uploader has value
							if( $next.find('.acf-image-uploader.has-value').exists() ) {
								
								$next = false;
								return;
								
							}
								
								
							// end loop if $next is found
							return false;
							
						});
						
						
						// add extra row if next is not found
						if( !$next ) {
							
							$tr = acf.fields.repeater.set( $repeater ).add();
							
							
							// get next $field
							$next = acf.get_field( key, $tr );
							
						}
						
						
						// update $el
						$el = $next.find('.acf-image-uploader');
						
					}
					
					
			    	// vars
			    	var image_id = attachment.id,
			    		image_url = attachment.attributes.url;
			    	
					
			    	// is preview size available?
			    	if( attachment.attributes.sizes && attachment.attributes.sizes[ preview_size ] ) {
			    	
				    	image_url = attachment.attributes.sizes[ preview_size ].url;
				    	
			    	}
			    	
			    	
			    	// add image to field
			        acf.fields.image.add( $el, image_id, image_url );
					
				}
			});
			
			
		},
		
		add : function( $el, id, url ){
			
			// set atts
		 	$el.find('[data-name="value-url"]').attr( 'src', url );
			$el.find('[data-name="value-id"]').val( id ).trigger('change');
			
			
			// add class
			$el.addClass('has-value');
	
		}
		
	};
	
	
	/*
	*  Events
	*
	*  jQuery events for this field
	*
	*  @type	function
	*  @date	1/03/2011
	*
	*  @param	N/A
	*  @return	N/A
	*/
	
	$(document).on('click', '.acf-image-uploader [data-name="remove-button"]', function( e ){
		
		e.preventDefault();
		
		acf.fields.image.remove( $(this) );
			
	});
	
	$(document).on('click', '.acf-image-uploader [data-name="edit-button"]', function( e ){
		
		e.preventDefault();
		
		acf.fields.image.edit( $(this) );
			
	});
	
	$(document).on('click', '.acf-image-uploader [data-name="add-button"]', function( e ){
		
		e.preventDefault();
		
		acf.fields.image.popup( $(this) );
		
	});
	

})(jQuery);

/* **********************************************
     Begin oembed.js
********************************************** */

(function($){
	
	acf.fields.oembed = {
		
		search : function( $el ){ 
			
			// vars
			var s = $el.find('[data-name="search-input"]').val();
			
			
			// fix missing 'http://' - causes the oembed code to error and fail
			if( s.substr(0, 4) != 'http' )
			{
				s = 'http://' + s;
				$el.find('[data-name="search-input"]').val( s );
			}
			
			
			// show loading
			$el.addClass('is-loading');
			
			
			// AJAX data
			var ajax_data = {
				'action'	: 'acf/fields/oembed/search',
				'nonce'		: acf.get('nonce'),
				's'			: s,
				'width'		: acf.get_data($el, 'width'),
				'height'	: acf.get_data($el, 'height')
			};
			
			
			// abort XHR if this field is already loading AJAX data
			if( $el.data('xhr') )
			{
				$el.data('xhr').abort();
			}
			
			
			// get HTML
			var xhr = $.ajax({
				url: acf.get('ajaxurl'),
				data: ajax_data,
				type: 'post',
				dataType: 'html',
				success: function( html ){
					
					$el.removeClass('is-loading');
					
					
					// update from json
					acf.fields.oembed.search_success( $el, s, html );
					
					
					// no results?
					if( !html )
					{
						acf.fields.oembed.search_error( $el );
					}
					
				}
			});
			
			
			// update el data
			$el.data('xhr', xhr);
			
		},
		
		search_success : function( $el, s, html ){
		
			$el.removeClass('has-error').addClass('has-value');
			
			$el.find('[data-name="value-input"]').val( s );
			$el.find('[data-name="value-title"]').html( s );
			$el.find('[data-name="value-embed"]').html( html );
			
		},
		
		search_error : function( $el ){
			
			// update class
	        $el.removeClass('has-value').addClass('has-error');
			
		},
		
		clear : function( $el ){
			
			// update class
	        $el.removeClass('has-error has-value');
			
			
			// clear search
			$el.find('[data-name="search-input"]').val('');
			
			
			// clear inputs
			$el.find('[data-name="value-input"]').val( '' );
			$el.find('[data-name="value-title"]').html( '' );
			$el.find('[data-name="value-embed"]').html( '' );
			
		},
		
		edit : function( $el ){ 
			
			// update class
	        $el.addClass('is-editing');
	        
	        
	        // set url and focus
	        var url = $el.find('[data-name="value-title"]').text();
	        
	        $el.find('[data-name="search-input"]').val( url ).focus()
			
		},
		
		blur : function( $el ){ 
			
			$el.removeClass('is-editing');
			
			
	        // set url and focus
	        var old_url = $el.find('[data-name="value-title"]').text(),
	        	new_url = $el.find('[data-name="search-input"]').val(),
	        	embed = $el.find('[data-name="value-embed"]').html();
	        
	        
	        // bail early if no valu
	        if( !new_url ) {
		        
		        this.clear( $el );
		        return;
	        }
	        
	        
	        // bail early if no change
	        if( new_url == old_url ) {
		        
		        return;
		        
	        }
	        
	        this.search( $el );
	        
	        			
		}
	};
	
	
	/*
	*  acf/setup_fields
	*
	*  run init function on all elements for this field
	*
	*  @type	event
	*  @date	20/07/13
	*
	*  @param	{object}	e		event object
	*  @param	{object}	el		DOM object which may contain new ACF elements
	*  @return	N/A
	*/
	
	/*
acf.add_action('ready append', function( $el ){
		
		
		// add tabs
		acf.get_fields({ type : 'oembed'}, $el).each(function(){
			
			acf.fields.oembed.add_oembed( $(this) );
			
		});
		
		
		// activate first tab
		acf.fields.tab.refresh( $el );
		
	});
*/
	
	
	/*
	*  Events
	*
	*  jQuery events for this field
	*
	*  @type	function
	*  @date	1/03/2011
	*
	*  @param	N/A
	*  @return	N/A
	*/
	
	$(document).on('click', '.acf-oembed [data-name="search-button"]', function( e ){
		
		e.preventDefault();
		
		acf.fields.oembed.search( $(this).closest('.acf-oembed') );
		
		$(this).blur();
		
	});
	
	$(document).on('click', '.acf-oembed [data-name="clear-button"]', function( e ){
		
		e.preventDefault();
		
		acf.fields.oembed.clear( $(this).closest('.acf-oembed') );
		
		$(this).blur();
		
	});
	
	$(document).on('click', '.acf-oembed [data-name="value-title"]', function( e ){
		
		e.preventDefault();
		
		acf.fields.oembed.edit( $(this).closest('.acf-oembed') );
			
	});
	
	$(document).on('keypress', '.acf-oembed [data-name="search-input"]', function( e ){
		
		// don't submit form
		if( e.which == 13 )
		{
			e.preventDefault();
		}
		
	});
	
	
	$(document).on('keyup', '.acf-oembed [data-name="search-input"]', function( e ){
		
		// bail early if no value
		if( ! $(this).val() ) {
			
			return;
			
		}
		
		
		// bail early for directional controls
		if( ! e.which ) {
		
			return;
			
		}
		
		acf.fields.oembed.search( $(this).closest('.acf-oembed') );
		
	});
	
	$(document).on('blur', '.acf-oembed [data-name="search-input"]', function(e){
		
		acf.fields.oembed.blur( $(this).closest('.acf-oembed') );
		
	});
		
	

})(jQuery);

/* **********************************************
     Begin post_object.js
********************************************** */



/* **********************************************
     Begin radio.js
********************************************** */

(function($){
	
	acf.fields.radio = acf.field.extend({
		
		type: 'radio',
		$selected: null,
		$other: null,
		
		actions: {
			'ready':	'render',
			'append':	'render'
		},
		
		events: {
			'change input[type="radio"]': 'render',
		},
		
		focus: function(){
			
			this.$selected = this.$field.find('input[type="radio"]:checked');
			this.$other = this.$field.find('input[type="text"]');
			
		},
		
		render: function(){
			
			if( this.$selected.val() === 'other' ) {
			
				this.$other.removeAttr('disabled').attr('name', this.$selected.attr('name'));
				
			} else {
				
				this.$other.attr('disabled', 'disabled').attr('name', '');
				
			}
			
		}
		
	});	

})(jQuery);

/* **********************************************
     Begin relationship.js
********************************************** */

(function($){
	
	acf.fields.relationship = acf.field.extend({
		
		type: 'relationship',
		
		$el: null,
		$input: null,
		$filters: null,
		$choices: null,
		$values: null,
		
		actions: {
			'ready':	'initialize',
			'append':	'initialize'
		},
		
		events: {
			'keypress [data-filter]': 			'submit_filter',
			'change [data-filter]': 			'change_filter',
			'keyup [data-filter]': 				'change_filter',
			'click .choices .acf-rel-item': 	'add_item',
			'click [data-name="remove_item"]': 	'remove_item'
		},
		
		focus: function(){
			
			this.$el = this.$field.find('.acf-relationship');
			this.$input = this.$el.find('.acf-hidden input');
			this.$choices = this.$el.find('.choices'),
			this.$values = this.$el.find('.values');
			
			this.settings = acf.get_data( this.$el );
			
		},
		
		initialize: function(){
			
			// reference
			var self = this,
				$field = this.$field,
				$el = this.$el,
				$input = this.$input;
			
			
			// right sortable
			this.$values.children('.list').sortable({
			
				items:					'li',
				forceHelperSize:		true,
				forcePlaceholderSize:	true,
				scroll:					true,
				
				update:	function(){
					
					$input.trigger('change');
					
				}
				
			});
			
			
			this.$choices.children('.list').scrollTop(0).on('scroll', function(e){
				
				// bail early if no more results
				if( $el.hasClass('is-loading') || $el.hasClass('is-empty') ) {
				
					return;
					
				}
				
				
				// Scrolled to bottom
				if( $(this).scrollTop() + $(this).innerHeight() >= $(this).get(0).scrollHeight ) {
					
					var paged = parseInt( $el.attr('data-paged') );
					
					
					// update paged
					$el.attr('data-paged', (paged + 1) );
					
					
					// fetch
					self.doFocus($field);
					self.fetch();
				}
				
			});
			
			
			/*
var scroll_timer = null;
			var scroll_event = function( e ){
				
				console.log( 'scroll_event' );
				
				if( scroll_timer) {
					
			        clearTimeout( scroll_timer );
			        
			    }
			    
			    
			    scroll_timer = setTimeout(function(){
				    
				    
				    if( $field.is(':visible') && acf.is_in_view($field) ) {
						
						// fetch
						self.doFocus($field);
						self.fetch();
						
						
						$(window).off('scroll', scroll_event);
						
					}
				    
				    
			    }, 100);			    
			    				
				
			};
			
						
			$(window).on('scroll', scroll_event);
			
*/
			// ajax fetch values for left side
			this.fetch();
			
		},
		
		fetch: function(){
			
			// reference
			var self = this,
				$field = this.$field;
			
			
			// add class
			this.$el.addClass('is-loading');
			
			
			// vars
			var data = acf.prepare_for_ajax({
				action:		'acf/fields/relationship/query',
				field_key:	acf.get_field_key($field),
				post_id:	acf.get('post_id'),
			});
			
			
			// merge in wrap data
			// don't use this.settings becuase they are outdated
			$.extend(data, acf.get_data( this.$el ));
			
			
			// clear html if is new query
			if( data.paged == 1 ) {
				
				this.$choices.children('.list').html('')
				
			}
			
			
			// add message
			this.$choices.children('.list').append('<p>' + acf._e('relationship', 'loading') + '...</p>');

			
			// abort XHR if this field is already loading AJAX data
			if( this.$el.data('xhr') ) {
			
				this.$el.data('xhr').abort();
				
			}
			
			
			// get results
		    var xhr = $.ajax({
		    
		    	url:		acf.get('ajaxurl'),
				dataType:	'json',
				type:		'post',
				data:		data,
				
				success: function( json ){
					
					// render
					self.doFocus($field);
					self.render(json);
					
				}
				
			});
			
			
			// update el data
			this.$el.data('xhr', xhr);
			
		},
		
		render: function( json ){
			
			// remove loading class
			this.$el.removeClass('is-loading is-empty');
			
			
			// remove p tag
			this.$choices.children('.list').children('p').remove();
			
			
			// no results?
			if( !json || !json.length ) {
			
				// add class
				this.$el.addClass('is-empty');
			
				
				// add message
				if( this.settings.paged == 1 ) {
				
					this.$choices.children('.list').append('<p>' + acf._e('relationship', 'empty') + '</p>');
			
				}

				
				// return
				return;
				
			}
			
			
			// get new results
			var $new = $( this.walker(json) );
			
				
			// apply .disabled to left li's
			this.$values.find('.acf-rel-item').each(function(){
				
				var id = $(this).attr('data-id');
				
				$new.find('.acf-rel-item[data-id="' + id + '"]').addClass('disabled');
				
			});
			
			
			// underline search match
			if( this.settings.s ) {
			
				var s = this.settings.s;
				
				$new.find('.acf-rel-item').each(function(){
					
					// vars
					var find = $(this).text(),
						replace = find.replace( new RegExp('(' + s + ')', 'gi'), '<b>$1</b>');
					
					$(this).html( $(this).html().replace(find, replace) );	
									
				});
				
			}
			
			
			// append
			this.$choices.children('.list').append( $new );
			
			
			// merge together groups
			var label = '',
				$list = null;
				
			this.$choices.find('.acf-rel-label').each(function(){
				
				if( $(this).text() == label ) {
					
					$list.append( $(this).siblings('ul').html() );
					
					$(this).parent().remove();
					
					return;
				}
				
				
				// update vars
				label = $(this).text();
				$list = $(this).siblings('ul');
				
			});
			
			
		},
		
		walker: function( data ){
			
			// vars
			var s = '';
			
			
			// loop through data
			if( $.isArray(data) ) {
			
				for( var k in data ) {
				
					s += this.walker( data[ k ] );
					
				}
				
			} else if( $.isPlainObject(data) ) {
				
				// optgroup
				if( data.children !== undefined ) {
					
					s += '<li><span class="acf-rel-label">' + data.text + '</span><ul class="acf-bl">';
					
						s += this.walker( data.children );
					
					s += '</ul></li>';
					
				} else {
				
					s += '<li><span class="acf-rel-item" data-id="' + data.id + '">' + data.text + '</span></li>';
					
				}
				
			}
			
			
			// return
			return s;
			
		},
		
		submit_filter: function( e ){
			
			// don't submit form
			if( e.which == 13 ) {
				
				e.preventDefault();
				
			}
			
		},
		
		change_filter: function( e ){
			
			// vars
			var val = e.$el.val(),
				filter = e.$el.attr('data-filter');
				
			
			// Bail early if filter has not changed
			if( this.$el.attr('data-' + filter) == val ) {
			
				return;
				
			}
			
			
			// update attr
			this.$el.attr('data-' + filter, val);
			
			
			// reset paged
			this.$el.attr('data-paged', 1);
		    
		    
		    // fetch
		    this.fetch();
			
		},
		
		add_item: function( e ){
			
			// max posts
			if( this.settings.max > 0 ) {
			
				if( this.$values.find('.acf-rel-item').length >= this.settings.max ) {
				
					alert( acf._e('relationship', 'max').replace('{max}', this.settings.max) );
					
					return;
					
				}
				
			}
			
			
			// can be added?
			if( e.$el.hasClass('disabled') ) {
			
				return false;
				
			}
			
			
			// disable
			e.$el.addClass('disabled');
			
			
			// template
			var html = [
				'<li>',
					'<input type="hidden" name="' + this.$input.attr('name') + '[]" value="' + e.$el.attr('data-id') + '" />',
					'<span data-id="' + e.$el.attr('data-id') + '" class="acf-rel-item">' + e.$el.html(),
						'<a href="#" class="acf-icon small dark" data-name="remove_item"><i class="acf-sprite-remove"></i></a>',
					'</span>',
				'</li>'].join('');
						
			
			// add new li
			this.$values.children('.list').append( html )
			
			
			// trigger change on new_li
			this.$input.trigger('change');
			
			
			// validation
			acf.validation.remove_error( this.$field );
			
		},
		
		remove_item : function( e ){
			
			// vars
			var $span = e.$el.parent(),
				id = $span.attr('data-id');
			
			
			// remove
			$span.parent('li').remove();
			
			
			// show
			this.$choices.find('.acf-rel-item[data-id="' + id + '"]').removeClass('disabled');
			
			
			// trigger change on new_li
			this.$input.trigger('change');
			
		}
		
	});
	

})(jQuery);

/* **********************************************
     Begin select.js
********************************************** */

(function($){
	
	function add_select2( $select, settings ) {
		
		// vars
		settings = $.extend({
			'allow_null':	false,
			'placeholder':	'',
			'multiple':		false,
			'ajax':			false,
			'action':		'',
			'pagination':	false
		}, settings);
		
				
		// vars
		var $input = $select.siblings('input');
		
		
		// select2 args
		var args = {
			width			: '100%',
			allowClear		: settings.allow_null,
			placeholder		: settings.placeholder,
			multiple		: settings.multiple,
			data			: [],
			escapeMarkup	: function( m ){ return m; }
		};
		
		
		// customize HTML for selected choices
		if( settings.multiple ) {
			
			args.formatSelection = function( object, $div ){
				
				$div.parent().append('<input type="hidden" class="acf-select2-multi-choice" name="' + $select.attr('name') + '" value="' + object.id + '" />');
				
				return object.text;
			}
		}
		
		
		// remove the blank option as we have a clear all button!
		if( settings.allow_null ) {
			
			args.placeholder = settings.placeholder;
			$select.find('option[value=""]').remove();
			
		}
		
		
		// vars
		var selection = $input.val().split(','),
			initial_selection = [];
			
		
		// populate args.data
		var optgroups = {};
		
		$select.find('option').each(function( i ){
			
			// var
			var parent = '_root';
			
			
			// optgroup?
			if( $(this).parent().is('optgroup') ) {
			
				parent = $(this).parent().attr('label');
				
			}
			
			
			// append to choices
			if( ! optgroups[ parent ] ) {
			
				optgroups[ parent ] = [];
				
			}
			
			optgroups[ parent ].push({
				id		: $(this).attr('value'),
				text	: $(this).text()
			});
			
		});
		

		$.each( optgroups, function( label, children ){
			
			if( label == '_root' ) {
			
				$.each( children, function( i, child ){
					
					args.data.push( child );
					
				});
				
			} else {
			
				args.data.push({
					text		: label,
					children	: children
				});
				
			}
						
		});

		
		// re-order options
		$.each( selection, function( k, value ){
			
			$.each( args.data, function( i, choice ){
				
				if( value == choice.id ) {
				
					initial_selection.push( choice );
					
				}
				
			});
						
		});
		
		
		// ajax
		if( settings.ajax ) {
			
			args.ajax = {
				url			: acf.get('ajaxurl'),
				dataType	: 'json',
				type		: 'post',
				cache		: false,
				data		: function (term, page) {
					
					// vars
					var data = {
						action		: settings.action,
						field_key	: settings.key,
						nonce		: acf.get('nonce'),
						post_id		: acf.get('post_id'),
						s			: term,
						paged		: page
					};

					
					// return
					return data;
					
				},
				results: function(data, page){
					
					return {
						results	: data
					};
					
				}
			};
			
			if( settings.pagination ) {
				
				args.ajax.results = function( data, page ) {
					
					var i = 0;
					
					$.each(data, function(k, v){
						
						l = 1;
						
						if( typeof v.children !== 'undefined' ) {
							
							l = v.children.length;
							
						}
						
						i += l;
						
					});
					
					
					// vars
					return {
						results	: data,
						more	: (i >= 20)
					};
					
				};
				
				$input.on("select2-loaded", function(e) { 
					
					// merge together groups
					var label = '',
						$list = null;
						
					$('#select2-drop .select2-results > li > .select2-result-label').each(function(){
						
						if( $(this).text() == label ) {
							
							$list.append( $(this).siblings('ul').html() );
							
							$(this).parent().remove();
							
							return;
						}
						
						
						// update vars
						label = $(this).text();
						$list = $(this).siblings('ul');
						
					});
											
				});	
			}
			
			
			args.initSelection = function (element, callback) {
				
				// single select requires 1 val, not an array
				if( ! settings.multiple ) {
				
					initial_selection = initial_selection[0];
					
				}
				
					        
		        // callback
		        callback( initial_selection );
		        
		    };
		}
		
		
		// attachment z-index fix
		args.dropdownCss = {
			'z-index' : '999999999'
		};
		
		
		// filter for 3rd party customization
		args = acf.apply_filters( 'select2_args', args, $select, settings );
		
		
		// add select2
		$input.select2( args );

		
		// reorder DOM
		$input.select2('container').before( $input );
		
		
		// multiple
		if( settings.multiple ) {
			
			// clear input value (allow nothing to be saved) - only for multiple
			//$input.val('');
			
			
			// sortable
			$input.select2('container').find('ul.select2-choices').sortable({
				 //containment: 'parent',
				 start: function() {
				 	$input.select2("onSortStart");
				 },
				 update: function() {
				 	$input.select2("onSortEnd");
				 }
			});
		}
		
		
		// make sure select is disabled (repeater / flex may enable it!)
		$select.attr('disabled', 'disabled').addClass('acf-disabled');


	}
	
	function remove_select2( $select ) {
		
		$select.siblings('.select2-container').remove();
		
	}
	
	
	// select
	acf.fields.select = acf.field.extend({
		
		type: 'select',
		
		$select: null,
		settings: {
			'action':		'',
			'pagination':	false
		},
		
		actions: {
			'ready':	'render',
			'append':	'render',
			'remove':	'remove'
		},

		focus: function(){
			
			// focus on $select
			this.$select = this.$field.find('select');
			
			
			// bail early if no select field
			if( !this.$select.exists() ) {
				
				return;
				
			}
			
			
			// merge in select's settings
			$.extend(this.settings, acf.get_data( this.$select ));
			
			
			// update action based on type			
			this.settings.action = 'acf/fields/' + this.type + '/query';
			
		},
		
		render: function(){
			
			// validate ui
			if( !this.$select.exists() || !this.settings.ui ) {
				
				return false;
				
			}
			
			
			add_select2( this.$select, this.settings );
			
		},
		
		remove: function(){
			
			// validate ui
			if( !this.$select.exists() || !this.settings.ui ) {
				
				return false;
				
			}
			
			
			remove_select2( this.$select );
			
		}
		
	});
	
	
	// taxonomy
	acf.fields.taxonomy = acf.fields.select.extend({
		
		type: 'taxonomy'
		
	});
	
	
	// user
	acf.fields.user = acf.fields.select.extend({
		
		type: 'user'
		
	});	
	
	
	// post_object
	acf.fields.post_object = acf.fields.select.extend({
		
		type: 'post_object',
		
		settings: {
			'pagination':	true
		}
		
	});
	
	
	// page_link
	acf.fields.page_link = acf.fields.post_object.extend({
		
		type: 'page_link',
		
	});
	

})(jQuery);

/* **********************************************
     Begin tab.js
********************************************** */

(function($){
	
	acf.fields.tab = acf.field.extend({
		
		type: 'tab',
		
		actions: {
			'ready':	'initialize',
			'append':	'initialize',
			'hide':		'hide',
			'show':		'show'
		},
		
		initialize: function(){
			
			// add tab group if it doesn't exist
			if( !this.$field.siblings('.acf-tab-wrap').exists() ) {
			
				this.add_group();
				
			}
			
			
			// add tab
			this.add_tab();
			
		},
		
		add_tab : function(){
			
			// vars
			var $el = this.$field.find('.acf-tab'),
				$group = this.$field.siblings('.acf-tab-wrap'),
				key = this.settings.key;
			
			
			// template
			var html = [
				'<li>',
					'<a class="acf-tab-button" href="#" data-key="' + key + '">' + $el.text() + '</a>',
				'</li>'].join('');
				
				
			// add tab
			$group.find('ul').append( html );
			
			
			// show first tab, hide others
			if( $group.find('li').length == 1 ) {
				
				$group.find('li').addClass('active');
				
				this.show_tab_fields( this.$field );
				
			} else {
				
				this.hide_tab_fields( this.$field );
				
			}
			
		},
		
		add_group : function(){
			
			// vars
			var $wrap = this.$field.parent(),
				html = '';
			
			
			// generate html
			if( $wrap.is('tbody') ) {
				
				html = '<tr class="acf-tab-wrap"><td colspan="2"><ul class="acf-hl acf-tab-group"></ul></td></tr>';
			
			} else {
			
				html = '<div class="acf-tab-wrap"><ul class="acf-hl acf-tab-group"></ul></div>';
				
			}
			
			
			// append html
			this.$field.before( html );
			
		},
		
		toggle : function( $a ){
			
			// reference
			var self = this;
			
			
			// vars
			var $wrap = $a.closest('.acf-tab-wrap');
				
				
			// add and remove classes
			$a.parent().addClass('active').siblings().removeClass('active');
			
			
			// loop over 
			$wrap.siblings('.acf-field[data-type="tab"]').each(function(){
				
				// show fields
				if( $(this).attr('data-key') === $a.attr('data-key') ) {
					
					self.show_tab_fields( $(this) );
					return;
					
				}
				
				
				// hide fields
				if( ! $(this).hasClass('hidden-by-tab') ) {
					
					self.hide_tab_fields( $(this) );
					return;
					
				}
				
			});

		},
		
		show_tab_fields : function( $field ) {
			
			// debug
			//console.log('show tab fields %o', $field);
			
			$field.removeClass('hidden-by-tab');
			
			$field.nextUntil('.acf-field[data-type="tab"]', '.acf-field').each(function(){
				
				// remove class
				$(this).removeClass('hidden-by-tab');
				
				
				// do action
				acf.do_action('show_field', $(this));
				
			});
			
		},
		
		hide_tab_fields : function( $field ) {
			
			// debug
			//console.log('hide tab fields %o', $field);
			
			$field.addClass('hidden-by-tab');
			
			$field.nextUntil('.acf-field[data-type="tab"]', '.acf-field').each(function(){
				
				// add class
				$(this).addClass('hidden-by-tab');
				
				
				// do action
				acf.do_action('hide_field', $(this));
				
			});
			
		},
		
		hide: function( $field, context ){
			
			// vars
			var $a = $field.siblings('.acf-tab-wrap').find('a[data-key="' + this.settings.key + '"]'),
				$li = $a.parent();
				
			
			// if this tab field was hidden by conditional_logic, disable it's children to prevent validation
			if( context == 'conditional_logic' ) {
				
				$field.nextUntil('.acf-field[data-type="tab"]', '.acf-field').each(function(){
					
					acf.conditional_logic.hide_field( $(this) );
					
				});
				
			}
			
			
			// bail early if already hidden
			if( $li.is(':hidden') ) {
			
				return;
				
			}
			
			
			// visibility
			$li.hide();
			
			
			// bail early if active tab exists
			if( $li.siblings('.active').exists() ) {
			
				return;
				
			}
			
			
			// if sibling tab exists, click it
			if( $li.siblings(':visible').exists() ) {
				
				$li.siblings(':visible').first().children('a').trigger('click');
				return;
			}
			
			
			// hide fields under this tab
			acf.fields.tab.hide_tab_fields( $field );
			
		},
		
		show: function( $field, context ){
			
			// vars
			var $a = $field.siblings('.acf-tab-wrap').find('a[data-key="' + this.settings.key + '"]'),
				$li = $a.parent();
				
			
			// if this tab field was shown by conditional_logic, enable it's children to allow validation
			if( context == 'conditional_logic' ) {
				
				$field.nextUntil('.acf-field[data-type="tab"]', '.acf-field').each(function(){
					
					acf.conditional_logic.show_field( $(this) );
					
				});
				
			}
			
			
			// if tab is already visible, then ignore the following functionality
			if( $li.is(':visible') ) {
			
				return;
				
			}
			
			
			// visibility
			$li.show();
			
			
			// bail early if this is the active tab
			if( $li.hasClass('active') ) {
			
				return;
				
			}
			
			
			// if the sibling active tab is actually hidden by conditional logic, take ownership of tabs
			if( !$li.siblings(':visible').exists() ) {
			
				// show this tab group
				$a.trigger('click');
				
			}
			
		}
		
	});
	
	
		
	
	/*
	*  Events
	*
	*  jQuery events for this field
	*
	*  @type	function
	*  @date	1/03/2011
	*
	*  @param	N/A
	*  @return	N/A
	*/
	
	$(document).on('click', '.acf-tab-button', function( e ){
		
		e.preventDefault();
		
		acf.fields.tab.toggle( $(this) );
		
		$(this).trigger('blur');
			
	});
	
	acf.add_filter('validation_complete', function( json, $form ){
		
		// show field error messages
		$.each( json.errors, function( k, item ){
		
			var $input = $form.find('[name="' + item.input + '"]').first(),
				$field = acf.get_field_wrap( $input ),
				$tab = $field.prevAll('.acf-field[data-type="tab"]:first');
			
			
			// does tab group exist?
			if( ! $tab.exists() )
			{
				return;
			}

			
			// is this field hidden
			if( $field.hasClass('hidden-by-tab') )
			{
				// show this tab
				$tab.siblings('.acf-tab-wrap').find('a[data-key="' + acf.get_data($tab, 'key') + '"]').trigger('click');
				
				// end loop
				return false;
			}
			
			
			// field is within a tab group, and the tab is already showing
			// end loop
			return false;
			
		});
		
		
		// return
		return json;
				
	});
	
	

})(jQuery);

/* **********************************************
     Begin url.js
********************************************** */

(function($){
	
	acf.fields.url = acf.field.extend({
		
		type: 'url',
		$input: null,
		
		actions: {
			'ready':	'render',
			'append':	'render'
		},
		
		events: {
			'keyup input[type="url"]': 'render',
		},
		
		focus: function(){
			
			this.$input = this.$field.find('input[type="url"]');
			
		},
		
		render: function(){
			
			this.$input.parent().removeClass('valid');
			
			if( this.$input.val().substr(0, 4) === 'http' ) {
				
				this.$input.parent().addClass('valid');
				
			}
			
		}
		
	});

})(jQuery);

/* **********************************************
     Begin validation.js
********************************************** */

(function($){
    
	acf.validation = {
		
		// vars
		active	: 1,
		ignore	: 0,
		
		
		// classes
		error_class : 'acf-error',
		message_class : 'acf-error-message',
		
		
		// el
		$trigger : null,
		
		
		// functions
		init : function(){
			
			// read validation setting
			this.active = acf.get('validation');
			
			
			// bail early if disabled
			if( !this.active ) {
			
				return;
				
			}
			
			
			// add events
			this.add_events();
		},
		
		add_error : function( $field, message ){
			
			// add class
			$field.addClass(this.error_class);
			
			
			// add message
			if( message !== undefined )
			{
				$field.children('.acf-input').children('.' + this.message_class).remove();
				$field.children('.acf-input').prepend('<div class="' + this.message_class + '"><p>' + message + '</p></div>');
			}
			
			
			// hook for 3rd party customization
			acf.do_action('add_field_error', $field);
		},
		
		remove_error : function( $field ){
			
			// var
			$message = $field.children('.acf-input').children('.' + this.message_class);
			
			
			// remove class
			$field.removeClass(this.error_class);
			
			
			// remove message
			setTimeout(function(){
				
				acf.remove_el( $message );
				
			}, 250);
			
			
			// hook for 3rd party customization
			acf.do_action('remove_field_error', $field);
		},
		
		add_warning : function( $field, message ){
			
			this.add_error( $field, message );
			
			setTimeout(function(){
				
				acf.validation.remove_error( $field )
				
			}, 1000);
		},
		
		fetch : function( $form ){
			
			// reference
			var self = this;
			
			
			// vars
			var data = acf.serialize_form( $form, 'acf' );
				
			
			// append AJAX action		
			data.action = 'acf/validate_save_post';
			
				
			// ajax
			$.ajax({
				url			: acf.get('ajaxurl'),
				data		: data,
				type		: 'post',
				dataType	: 'json',
				success		: function( json ){
					
					self.complete( $form, json );
					
				}
			});
			
		},
		
		complete : function( $form, json ){
			
			// filter for 3rd party customization
			json = acf.apply_filters('validation_complete', json, $form);
			
			
			// reference
			var self = this;
			
			
			// remove previous error message
			$form.children('.' + this.message_class).remove();
			
			
			// hide ajax stuff on submit button
			if( $('#submitdiv').exists() ) {
				
				// remove disabled classes
				$('#submitdiv').find('.disabled').removeClass('disabled');
				$('#submitdiv').find('.button-disabled').removeClass('button-disabled');
				$('#submitdiv').find('.button-primary-disabled').removeClass('button-primary-disabled');
				
				
				// remove spinner
				$('#submitdiv .spinner').hide();
				
			}
			
			
			// validate json
			if( !json || typeof json.result === 'undefined' || json.result == 1) {
			
				// remove hidden postboxes (this will stop them from being posted to save)
				$form.find('.acf-postbox.acf-hidden').remove();
					
					
				// bypass JS and submit form
				this.ignore = 1;
				
				
				// action for 3rd party customization
				acf.do_action('submit', $form);
				
				
				// submit form again
				if( this.$trigger )
				{
					this.$trigger.click();
				}
				else
				{
					$form.submit();
				}
				
				
				// end function
				return;
			}
			
			
			// show error message	
			$form.prepend('<div class="' + this.message_class + '"><p>' + json.message + '</p></div>');
			
			
			// show field error messages
			if( json.errors ) {
				
				for( var i in json.errors ) {
					
					// get error
					var error = json.errors[ i ];
					
					
					// get input
					var $input = $form.find('[name="' + error.input + '"]').first();
					
					
					// if $_POST value was an array, this $input may not exist
					if( ! $input.exists() ) {
						
						$input = $form.find('[name^="' + error.input + '"]').first();
						
					}
					
					
					// now get field
					var $field = acf.get_field_wrap( $input );
					
					
					// add error
					self.add_error( $field, error.message );
					
					
				}
			
			}
			
		},
		
		add_events : function(){
			
			var self = this;
			
			
			// focus
			$(document).on('focus click change', '.acf-field[data-required="1"] input, .acf-field[data-required="1"] textarea, .acf-field[data-required="1"] select', function( e ){

				self.remove_error( $(this).closest('.acf-field') );
				
			});
			
			
			// click save
			if( $('#save-post').exists() ) {
				
				$('#save-post').on('click', function(){
				
					self.ignore = 1;
					self.$trigger = $(this);
					
				});
				
			}
			
			
			
			// click preview
			if( $('#post-preview').exists() ) {
				
				$('#post-preview').on('click', function(){
				
					self.ignore = 1;
					self.$trigger = $(this);
					
				});
				
			}
						
			
			// click submit
			if( $('#submit').exists() ) {
				
				$('#submit').on('click', function(){
				
					self.$trigger = $(this);
					
				});
				
			}
			
			
			// click publish
			if( $('#publish').exists() ) {
				
				$('#publish').on('click', function(){
				
					self.$trigger = $(this);
					
				});
				
			}
			
			
			
			// submit
			$(document).on('submit', 'form', function( e ){
				
				// bail early if this form does not contain ACF data
				if( ! $(this).find('#acf-form-data').exists() ) {
				
					return true;
					
				}
				
				
				// filter for 3rd party customization
				self.ignore = acf.apply_filters('ignore_validation', self.ignore, self.$trigger, $(this) );

				
				// ignore this submit?
				if( self.ignore == 1 ) {
				
					self.ignore = 0;
					return true;
					
				}
				
				
				// bail early if disabled
				if( self.active == 0 ) {
				
					return true;
					
				}
				
				
				// prevent default
				e.preventDefault();
				
				
				// run validation
				self.fetch( $(this) );
								
			});
			
		}
		
	};
	
	acf.add_action('ready', function(){
		
		acf.validation.init();
		
	}, 20);
	

})(jQuery);

/* **********************************************
     Begin wysiwyg.js
********************************************** */

(function($){
	
	acf.fields.wysiwyg = acf.field.extend({
		
		type: 'wysiwyg',
		$el: null,
		$textarea: null,
		toolbars: {},
		
		actions: {
			'ready':		'initialize',
			'append':		'initialize',
			'remove':		'disable',
			'sortstart':	'disable',
			'sortstop':		'enable'
		},
		
		focus: function(){
			
			// update vars
			this.$el = this.$field.find('.wp-editor-wrap').last();
			this.$textarea = this.$el.find('textarea');
			
			
			// settings
			this.settings = acf.get_data( this.$el );
			this.settings.id = this.$textarea.attr('id');
		},
		
		initialize: function(){
			
			// bail early if no tinymce
			if( typeof tinyMCEPreInit === 'undefined' ) {
				
				return false;
				
			}
			
			
			// vars
			var mceInit = this.get_mceInit(),
				qtInit = this.get_qtInit();
			
				
			// append settings
			tinyMCEPreInit.mceInit[ mceInit.id ] = mceInit;
			tinyMCEPreInit.qtInit[ qtInit.id ] = qtInit;
			
			
			// initialize mceInit
			if( this.$el.hasClass('tmce-active') ) {
				
				try {
					
					tinymce.init( mceInit );
					
				} catch(e){}
				
			}
			

			// initialize qtInit
			try {
			
				var qtag = quicktags( qtInit );
				
				this._buttonsInit( qtag );
				
			} catch(e){}
			
		},
		
		
		get_mceInit : function(){
			
			// reference
			var $field = this.$field;
				
				
			// vars
			var toolbar = this.get_toolbar( this.settings.toolbar ),
				mceInit = $.extend({}, tinyMCEPreInit.mceInit.acf_content);
			
			
			// selector
			mceInit.selector = '#' + this.settings.id;
			
			
			// id
			mceInit.id = this.settings.id; // tinymce v4
			mceInit.elements = this.settings.id; // tinymce v3
			
			
			// toolbar
			if( toolbar ) {
				
				var k = (tinymce.majorVersion < 4) ? 'theme_advanced_buttons' : 'toolbar';
				
				for( var i = 1; i < 5; i++ ) {
					
					mceInit[ k + i ] = acf.isset(toolbar, i) ? toolbar[i] : '';
					
				}
				
			}
			
			
			// events
			if( tinymce.majorVersion < 4 ) {
				
				mceInit.setup = function( ed ){
					
					ed.onInit.add(function(ed, event) {
						
						// focus
						$(ed.getBody()).on('focus', function(){
					
							acf.validation.remove_error( $field );
							
						});
						
						$(ed.getBody()).on('blur', function(){
							
							// update the hidden textarea
							// - This fixes a bug when adding a taxonomy term as the form is not posted and the hidden textarea is never populated!
			
							// save to textarea	
							ed.save();
							
							
							// trigger change on textarea
							$field.find('textarea').trigger('change');
							
						});
					
					});
					
				};
			
			} else {
			
				mceInit.setup = function( ed ){
					
					ed.on('focus', function(e) {
				
						acf.validation.remove_error( $field );
						
					});
					
					ed.on('blur', function(e) {
						
						// update the hidden textarea
						// - This fixes a but when adding a taxonomy term as the form is not posted and the hidden textarea is never populated!
		
						// save to textarea	
						ed.save();
						
						
						// trigger change on textarea
						$field.find('textarea').trigger('change');
						
					});
					
				};
			
			}
			
			
			// hook for 3rd party customization
			mceInit = acf.apply_filters('wysiwyg_tinymce_settings', mceInit, mceInit.id);
			
			
			// return
			return mceInit;
			
		},
		
		get_qtInit : function(){
				
			// vars
			var qtInit = $.extend({}, tinyMCEPreInit.qtInit.acf_content);
			
			
			// id
			qtInit.id = this.settings.id;
			
			
			// hook for 3rd party customization
			qtInit = acf.apply_filters('wysiwyg_quicktags_settings', qtInit, qtInit.id);
			
			
			// return
			return qtInit;
			
		},
		
		/*
		*  disable
		*
		*  This function will disable the tinymce for a given field
		*  Note: txtarea_el is different from $textarea.val() and is the value that you see, not the value that you save.
		*        this allows text like <--more--> to wok instead of showing as an image when the tinymce is removed
		*
		*  @type	function
		*  @date	1/08/2014
		*  @since	5.0.0
		*
		*  @param	n/a
		*  @return	n/a
		*/
		
		disable: function(){
			
			try {
				
				// vars
				var ed = tinyMCE.get( this.settings.id ),
					txtarea_el = tinyMCE.DOM.get( this.settings.id );
					val = txtarea_el.value;
					
				
				// destory
				ed.destroy();
				
				
				// update value
				if( this.$field.find('.wp-editor-wrap').hasClass('html-active') ) {
				
					txtarea_el.value = val;
				
				}

				
			} catch(e) {}
			
		},
		
		enable: function(){
			
			// bail early if html mode
			if( this.$field.find('.wp-editor-wrap').hasClass('html-active') ) {
				
				return;
				
			}
			
			
			try {
				
				tinyMCE.init( tinyMCEPreInit.mceInit[ this.settings.id ] );
				
			} catch(e) {}
			
			
		},
		
		get_toolbar : function( name ){
			
			// bail early if toolbar doesn't exist
			if( typeof this.toolbars[ name ] !== 'undefined' ) {
				
				return this.toolbars[ name ];
				
			}
			
			
			// return
			return false;
			
		},
		
		
		/*
		*  _buttonsInit
		*
		*  This function will add the quicktags HTML to a WYSIWYG field. Normaly, this is added via quicktags on document ready,
		*  however, there is no support for 'append'. Source: wp-includes/js/quicktags.js:245
		*
		*  @type	function
		*  @date	1/08/2014
		*  @since	5.0.0
		*
		*  @param	ed (object) quicktag object
		*  @return	n/a
		*/
		
		_buttonsInit: function( ed ) {
			var defaults = ',strong,em,link,block,del,ins,img,ul,ol,li,code,more,close,';
	
			canvas = ed.canvas;
			name = ed.name;
			settings = ed.settings;
			html = '';
			theButtons = {};
			use = '';

			// set buttons
			if ( settings.buttons ) {
				use = ','+settings.buttons+',';
			}

			for ( i in edButtons ) {
				if ( !edButtons[i] ) {
					continue;
				}

				id = edButtons[i].id;
				if ( use && defaults.indexOf( ',' + id + ',' ) !== -1 && use.indexOf( ',' + id + ',' ) === -1 ) {
					continue;
				}

				if ( !edButtons[i].instance || edButtons[i].instance === inst ) {
					theButtons[id] = edButtons[i];

					if ( edButtons[i].html ) {
						html += edButtons[i].html(name + '_');
					}
				}
			}

			if ( use && use.indexOf(',fullscreen,') !== -1 ) {
				theButtons.fullscreen = new qt.FullscreenButton();
				html += theButtons.fullscreen.html(name + '_');
			}


			if ( 'rtl' === document.getElementsByTagName('html')[0].dir ) {
				theButtons.textdirection = new qt.TextDirectionButton();
				html += theButtons.textdirection.html(name + '_');
			}

			ed.toolbar.innerHTML = html;
			ed.theButtons = theButtons;
			
		},
		
	});
	

	$(document).ready(function(){
		
		// move acf_content wysiwyg
		if( $('#wp-acf_content-wrap').exists() ) {
			
			$('#wp-acf_content-wrap').parent().appendTo('body');
			
		}
		
	});


})(jQuery);
