var lastoPlugin = {
	Hello: function()
	{
		window.alert("Hello Boris");
	},
	ConsoleHello: function()
	{
		console.log("Hello Boris");
	},
	BrowserAlert: function()
	{
		alert("Hello\nHow are you?");	
	},
	DebugLog: function ()
	{
		Debug.log ("hello");
	},
	showDeleteCursor: function()
	{
		//canvas.style.cursor = "move";
		//canvas.style.cursor = "url(cursors/rubber.png)";
		//$("#canvas").css('cursor','move');
	},
	showNormalCursor: function()
	{
		//("#canvas").css('cursor','pointer');
	},
	closeLoader: function()
	{
		
	}
};

//mergeInto(LibraryManager.library, lastoPlugin);