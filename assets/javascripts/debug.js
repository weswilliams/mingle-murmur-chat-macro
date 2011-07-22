murmurChat.macroDebugInit = function(enabled, out) {
  var that = {};

  out.append("debug: " + enabled);
  if (enabled.toLowerCase() === 'false') {
    out.hide();
  }

  that.log = function(msg) {
    if (enabled.toLowerCase() === 'false') {
      return;
    }
    out.append(new Date() + ' - ' + msg + '<br/>');
  };
  that.log('debug log starting');
  murmurChat.log = that.log;
  return that;
};

