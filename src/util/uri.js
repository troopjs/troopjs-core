/*!
 * TroopJS util/uri module
 * 
 * parts of code from parseUri 1.2.2 Copyright Steven Levithan <stevenlevithan.com>
 * 
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose" ], function URIModule(Compose) {
	var NULL = null;
	var FUNCTION = Function;
	var ARRAY = Array;
	var ARRAY_PROTO = ARRAY.prototype;
	var TYPEOF_OBJECT = typeof Object.prototype;
	var TYPEOF_STRING = typeof String.prototype;
	var RE_URI = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?(?:([^?#]*)(?:\?([^#]*))?(?:#(.*))?)/;

	var PROTOCOL = "protocol";
	var AUTHORITY = "authority";
	var PATH = "path";
	var QUERY = "query";
	var ANCHOR = "anchor";

	var KEYS = [ "source",
		PROTOCOL,
		AUTHORITY,
		"userInfo",
		"user",
		"password",
		"host",
		"port",
		PATH,
		QUERY,
		ANCHOR ];

	// Store current Compose.secure setting
	var SECURE = Compose.secure;

	// Prevent Compose from creating constructor property
	Compose.secure = true;

	var Query = Compose(function Query(arg) {
		var self = this;
		var matches;
		var key = NULL;
		var value;
		var re = /(?:&|^)([^&=]*)=?([^&]*)/g;

		switch (typeof arg) {
		case TYPEOF_OBJECT:
			for (key in arg) {
				self[key] = arg[key];
			}
			break;

		case TYPEOF_STRING:
			while (matches = re.exec(str)) {
				key = matches[1];

				if (key in self) {
					value = self[key];

					if (value instanceof ARRAY) {
						value[value.length] = matches[2];
					}
					else {
						self[key] = [ value, matches[2] ];
					}
				}
				else {
					self[key] = matches[2];
				}
			}
			break;
		}

	}, {
		toString : function toString() {
			var self = this;
			var key = NULL;
			var value = NULL;
			var query = [];
			var i = 0;
			var j;

			for (key in self) {
				if (self[key] instanceof FUNCTION) {
					continue;
				}

				query[i++] = key;
			}

			query.sort();

			while (i--) {
				key = query[i];
				value = self[key];

				if (value instanceof ARRAY) {
					value = value.slice(0);

					value.sort();

					j = value.length;

					while (j--) {
						value[j] = key + "=" + value[j];
					}

					query[i] = value.join("&");
				}
				else {
					query[i] = key + "=" + value;
				}
			}

			return query.join("&");
		}
	});

	var Path = Compose(ARRAY_PROTO, function Path(str) {
		if (!str || str.length === 0) {
			return;
		}

		var self = this;
		var matches;
		var re = /(?:\/|^)([^\/]*)/g;

		while (matches = re.exec(str)) {
			self.push(matches[1]);
		}
	}, {
		toString : function toString() {
			return this.join("/");
		}
	});

	var URI = Compose(function URI(str) {
		var self = this;
		var matches = RE_URI.exec(str);
		var i = matches.length;
		var value;

		while (i--) {
			value = matches[i];

			if (value) {
				self[KEYS[i]] = value;
			}
		}

		if (QUERY in self) {
			self[QUERY] = Query(self[QUERY]);
		}

		if (PATH in self) {
			self[PATH] = Path(self[PATH]);
		}
	}, {
		toString : function toString() {
			var self = this;
			var uri = [ PROTOCOL , "://", AUTHORITY, "/", PATH, "?", QUERY, "#", ANCHOR ];
			var i;
			var key;

			if (!(PROTOCOL in self)) {
				uri.splice(0, 3);
			}

			if (!(PATH in self)) {
				uri.splice(0, 2);
			}

			if (!(ANCHOR in self)) {
				uri.splice(-2, 2);
			}

			if (!(QUERY in self)) {
				uri.splice(-2, 2);
			}

			i = uri.length;

			while (i--) {
				key = uri[i];

				if (key in self) {
					uri[i] = self[key];
				}
			}

			return uri.join("");
		}
	});

	// Restore Compose.secure setting
	Compose.secure = SECURE;

	URI.Path = Path;
	URI.Query = Query;

	return URI;
});