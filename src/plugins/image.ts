"use strict";

// Register image plugin
export let plugin = {
	name: "image-plugin",
	register: async function (server, options) {
		// it works as amiddleware with every request
		server.ext("onRequest", (request, h) => {
			// do something
			return h.continue;
		});

		// routing using plugin
		/*server.route({
			method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
			path: '/{path*}',
			handler: function(request, h){
				return {'message':"Hello from rajat"};
			}
		});*/
	}
};