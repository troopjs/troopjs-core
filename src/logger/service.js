/**
 * TroopJS core/logger/pubsub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../component/service", "troopjs-utils/merge",  "troopjs-utils/tr", "troopjs-utils/when", "troopjs-utils/deferred" ], function logger(Service, merge, tr, when, Deferred) {
	var ARRAY_SLICE = Array.prototype.slice;
	var OBJECT_TOSTRING = String.prototype.toString;
	var TOSTRING_OBJECT = "[object Object]";
	var LENGTH = "length";
	var APPENDERS = "appenders";
	var BROWSER = navigator.userAgent;

	function forward(signal, deferred) {
		var self = this;

		var appenders = tr.call(self[APPENDERS], function (appender) {
			return Deferred(function (dfd) {
				appender.signal(signal, dfd);
			});
		});

		if (deferred) {
			when.apply($, appenders).then(deferred.resolve, deferred.reject, deferred.notify);
		}

		return self;
	}

	function convert(cat, message) {
		var result = {
			"cat" : cat,
			"href": window.location.href,
			"browser" : BROWSER,
			"time": new Date().getTime()
		};

		if (OBJECT_TOSTRING.call(message) === TOSTRING_OBJECT) {
			merge.call(result, message)
		}
		else {
			result["msg"] = message;
		}

		return result;
	}

	function append(obj) {
		var self = this;
		var appenders = self[APPENDERS];
		var i;
		var iMax;

		for (i = 0, iMax = appenders[LENGTH]; i < iMax; i++) {
			appenders[i].append(obj);
		}
	}

	return Service.extend(function loggerService() {
		this[APPENDERS] = ARRAY_SLICE.call(arguments);
	}, {
		displayName : "core/logger/service",
		"sig/initialize" : forward,
		"sig/finalize" : forward,
		"sig/start" : forward,
		"sig/stop" : forward,

		"hub/logger/log" : function onLog(topic, message) {
			append.call(this, convert("log", message));
		},

		"hub/logger/warn" : function onWarn(topic, message) {
			append.call(this, convert("warn", message));
		},

		"hub/logger/debug" : function onDebug(topic, message) {
			append.call(this, convert("debug", message));
		},

		"hub/logger/info" : function onInfo(topic, message) {
			append.call(this, convert("info", message));
		},

		"hub/logger/error" : function onError(topic, message) {
			append.call(this, convert("error", message));
		}
	});
});