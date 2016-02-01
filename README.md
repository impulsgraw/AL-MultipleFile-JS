# AL-MultipleFile-JS
Allows to call html input file dialogue with any html element and add files to form in native JavaScript

## Requirements
Requires **jQuery** library

## Usage
Simply connect **al.multiplefile.*.js** after jQuery, then bind it on any DOM object (for ex. button):

```javascript
$('.btn').multipleFile({
		maxFiles: 4, //files limit
		accept: '.doc,.docx', //accepting extensions
		maxFileSize: 5*1024*1024, //max file size
		onInitSuccess: function(){ //called when mltipleFiles initialized
			console.log('MultipleFile plugin initialized successfully!');
		},
});
```

This code creates an instance of multipleFile on **.btn** object, sets the files limit up to _4_ (maximal file size of each not higher than _5\*1024\*1024_ bytes) and acceptable extensions to _.doc_ and _.docx_. You can also use MIME-types of acceptable file extensions in the same context (combining simplified file extensions with MIME-types, e.g. `accept: 'image/png,.jpg'` - makes differences in different browsers).
