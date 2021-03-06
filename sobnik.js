/*  
    sobnik.js - sobnik.chrome background module

    Copyright (c) 2014 Artur Brugeman <brugeman.artur@gmail.com>
    Copyright other contributors as noted in the AUTHORS file.

    This file is part of sobnik.chrome, Sobnik plugin for Chrome:
    http://sobnik.com.

    This is free software; you can redistribute it and/or modify it under
    the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation; either version 3 of the License, or (at
    your option) any later version.

    This software is distributed in the hope that it will be useful, but
    WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
    Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public
    License along with this program. If not, see
    <http://www.gnu.org/licenses/>.
*/

(function () {

    function capture (sender, message, reply) {
	var parse = function (data) {
	    console.log (message.what);

	    var result = {};
	    for (var item in message.what) 
	    {
		var url = message.what[item]
		    .replace (/\//g, "\\/")
		    .replace ("?", "\\?")
		    .replace ("+", "\\+")
		    .replace ("=", "\\=")
		    .replace ("*", "\\*");

		var pattern = "Content-Location[^\\n]*"+url
		    +"[^A-Za-z0-9\\+\\/]*([A-Za-z0-9=\\+\\/\\r\\n]+)";

		console.log (pattern);
		var r = data.match (new RegExp (pattern));
		console.log (r);

		if (r && r.length > 1)
		    result[item] = r[1];
	    }

	    console.log (result);
	    reply (result);
	};

	chrome.pageCapture.saveAsMHTML ({tabId: sender.tab.id}, function (data) {
	    var reader = new FileReader ();
	    reader.addEventListener ("loadend", function () {
		parse (reader.result);
	    });

	    reader.readAsBinaryString (data);		
	});

	// tell chrome that we'll reply asynchronously
	return true;
    };

    chrome.runtime.onMessage.addListener (function (message, sender, reply) {
	if (!message.type)
	    return;

	var handlers = {
	    "capture": capture
	};

	var handler = handlers[message.type];
	if (handler)
	    return handler (sender, message, reply);
    });

} ());
