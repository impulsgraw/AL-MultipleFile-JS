;

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

if (!Array.prototype.nativeLength) {
  Array.prototype.nativeLength = function() {
    var res = 0;
	for(var b = 0; b < this.length; b++)
		if((typeof this[b] != 'undefined') && (this[b] != null))
			res++;
	return res;
  };
}

(function($){

	$.multipleFile = function(element, options){
		var defaultOptions = {
			maxFiles: 			Infinity,
			accept:				'',
			maxFileSize:		Infinity, //in bytes
			insertMode: 		'After',
			insertLink:			null, //null means $btn
			basicName:			'files',
			btnHoverClass:		'hover',
			btnDisabledClass:	'disabled',
			
			onFileAddSuccess:	null,
			onFileAddError:		null,
			onInitSuccess:		null,
		};
		
		var plugin				= this,
			$btn				= $(element);
			
		const std_tpl			= '<input type="file" accept="{0}" style="cursor: pointer;" />'; // data-file-tag="{tag}" data-file-id="{id}"
			
		plugin.fileObjects		= new Array(); //array of DOM <input type="file"> links
		plugin.fileVirtual		= null;
		plugin.hoveredVirtual	= false;
		
		plugin.fileDlgEnabled	= false;
		plugin.inited			= false;
		
		plugin.init = function(){
			
			plugin.options = $.extend({}, defaultOptions, options);
			
			plugin.fileDlgEnabled = true;
			
			createNewVirtualFileDlg();
			
			//bind events						
			
			//this evaluation makes browser very busy. VERY. hope it'l be fixed in next versions of plugin
			$(document).on('mousemove', function(e){
				if(!plugin.fileDlgEnabled) return;
				
				if(pointInConstraints(e.pageX, e.pageY, $btn.offset().left-1, $btn.offset().top-1, $btn.outerWidth()+1, $btn.outerHeight()+1)){
					if(plugin.hoveredVirtual == false){
						plugin.hoveredVirtual = true;
						onMouseOver();
					}
					onMouseMove(e);
				}else{
					onMouseOut();
					plugin.hoveredVirtual = false;
				}
			});
			
			plugin.inited = true;
			
		};
		
		plugin.route = function(options){ //here options is an arguments array
			
			switch(options.length){
				case 0:
					return plugin;
				break;
				case 1:
					options = options[0];
					
					if(typeof options == "object"){
						plugin.options = $.extend(plugin.options, options);
					}else if(typeof options == 'string'){
						switch($.trim(options.toLowerCase())){
							case 'files':
								return plugin.fileObjects;
							break;
							case 'destroy':
								enableFileDlg();
								$(plugin.fileVirtual).remove();
								delete plugin.fileObjects;
								delete plugin.fileVirtual;
							
								$(this).data('multipleFile', undefined);
								$(document).off('mousemove');
								
								plugin = null;
								return this;
							break;
							default: //simply return the relevant plugin.option
								return plugin.options[options];
							break;
						}
					}
				break;
				default: //>= 2
					var paramA = options[0];
					var paramB = options[1];
					
					switch($.trim(paramA.toLowerCase())){
						case 'removefile': //paramB - file id in plugin.fileObjects
							$(plugin.fileObjects[parseInt(paramB)]).remove();
						
							plugin.fileObjects[parseInt(paramB)] = null;
							
							if(plugin.fileObjects.nativeLength() < plugin.options.maxFiles)
								enableFileDlg();
							else
								disableFileDlg();
							
							return this;
						break;
						default: //simply change the relevant plugin.option
							plugin.options[paramA] = paramB;
							
							if(plugin.fileObjects.nativeLength() < plugin.options.maxFiles)
								enableFileDlg();
							else
								disableFileDlg();
							
							return this;
						break;
					}
				break;
			}
			
		};
		
		//plugin internal events
		var onMouseOver = function(){
			//$btn.mouseenter();
			$btn.addClass(plugin.options.btnHoverClass);
		};
		
		var onMouseMove = function(e){
			$(plugin.fileVirtual).css('left', e.pageX - Math.round($(plugin.fileVirtual).width()/2));
			$(plugin.fileVirtual).css('top', e.pageY - Math.round($(plugin.fileVirtual).height()/2));
			//$btn.mousemove();
		};
		
		var onMouseOut = function(){
			$(plugin.fileVirtual).css('left', -1000);
			$(plugin.fileVirtual).css('top', -1000);
			//$btn.mouseleave();
			$btn.removeClass(plugin.options.btnHoverClass);
		};
		
		var onFileDlgOpen = function(){
			
		};
		
		var onFileChange = function(e){
			var fileData = e.target.files[0];
			
			//if nothing chosen
			if(typeof fileData === 'indefined') return false;
			//additional checking
			if(plugin.fileObjects.nativeLength() == plugin.options.maxFiles) return false;
			
			//check acception and filesize
			if(fileData.size > plugin.options.maxFileSize){
				if(plugin.options.onFileAddError != null)
					plugin.options.onFileAddError('size');
				
				return false;
			}else if(($.trim(plugin.options.accept) != '') && ((plugin.options.accept).split(',').indexOf('.'+fileData.name.split('.').pop()) == -1) && ((plugin.options.accept).split(',').indexOf(fileData.type) == -1)){
				if(plugin.options.onFileAddError != null)
					plugin.options.onFileAddError('accept');
				
				return false;
			}
			
			//move virtual file DOM object after $btn area
			$(plugin.fileVirtual).detach().attr('name', plugin.options.basicName+'[]').removeAttr('style').removeAttr('accept').hide();//.insertAfter($btn);
				switch($.trim(plugin.options.insertMode.toLowerCase())){
					case 'before':
						var $el = (plugin.options.insertLink == null)?$btn:$(plugin.options.insertLink);
						$(plugin.fileVirtual).insertBefore($el);
					break;
					case 'append': //into the end
						var $el = (plugin.options.insertLink == null)?$btn:$(plugin.options.insertLink);
						$(plugin.fileVirtual).appendTo($el);
					break;
					case 'prepend': //into the start
						var $el = (plugin.options.insertLink == null)?$btn:$(plugin.options.insertLink);
						$(plugin.fileVirtual).prependTo($el);
					break;
					default: //after
						var $el = (plugin.options.insertLink == null)?$btn:$(plugin.options.insertLink);
						$(plugin.fileVirtual).insertAfter($el);
					break;
				}
			
			//add new file to plugin.fileObjects array
			plugin.fileObjects.push(plugin.fileVirtual);
			
			//external callback
			if(plugin.options.onFileAddSuccess != null)
				plugin.options.onFileAddSuccess(fileData, plugin.fileObjects.length-1);
			
			//initialize new plugin.fileVirtual and new virtual file DOM object
			createNewVirtualFileDlg();
			
			//block $btn
			if(plugin.fileObjects.nativeLength() >= plugin.options.maxFiles)
				disableFileDlg();
		};
		
		//additional functions
		//detect point in constraints
		var pointInConstraints = function(x1, y1, x2, y2, w2, h2){
			if((x1 >= x2) && (x1 <= x2 + w2) && (y1 >= y2) && (y1 <= y2 + h2)) return true;
			return false;
		};
		
		var enableFileDlg = function(){
			$(plugin.fileVirtual).removeAttr('disabled');
			$btn.removeClass(plugin.options.btnDisabledClass);
			
			plugin.fileDlgEnabled = true;
		};
		
		var disableFileDlg = function(){
			$(plugin.fileVirtual).attr('disabled', 'disabled');
			$btn.addClass(plugin.options.btnDisabledClass);
			
			plugin.fileDlgEnabled = false;
		};
		
		var createNewVirtualFileDlg = function(){
			delete plugin.fileVirtual;
			plugin.fileVirtual = $(std_tpl.format(plugin.options.accept)).css('opacity', 0).css('position', 'absolute').css('left', -1000).css('top', -1000).css('z-index', '9999').prependTo('body');
			
			$(plugin.fileVirtual).on('click', function(){
				$(this).blur();
				
				onFileDlgOpen();
			});
			
			$(plugin.fileVirtual).on('change', onFileChange);
		};
		
		//plugin body
		plugin.init();
		
		if(plugin.options.onInitSuccess != null)
			plugin.options.onInitSuccess(true);
	};
	
	$.fn.multipleFile = function(options) {
		if((this.length == 1) && (undefined != $(this).data('multipleFile'))){
			return $(this).data('multipleFile').route(arguments);
		}else
			return this.each(function() {
				if (undefined == $(this).data('multipleFile')) {
					var plugin = new $.multipleFile(this, options);
					$(this).data('multipleFile', plugin);
				}else{
					console.error('Select only one object');
				}
			});
    };
	
})(jQuery);
