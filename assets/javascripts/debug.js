murmurChat.macroDebugInit = function(enabled, out) {
    var that = {};
    that.log = function(msg) {
        if (!enabled) {
            return;
        }
        out.append(new Date() + ' - ' + msg + '<br/>');
    };
    that.log('debug log starting');
    murmurChat.log = that.log;
    return that;
};

