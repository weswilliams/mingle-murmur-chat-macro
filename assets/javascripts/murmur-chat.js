var murmurChat = {};

murmurChat.createMurmur = function(murmurXML, $, macroDebug) {
  var murmur, iconPath;
  macroDebug.log("creating murmur");
  murmur = $('#murmur-template:first').clone();
  iconPath = murmurXML.find('icon_path').text();
  if (!iconPath) {
    iconPath = "../../../../plugin_assets/murmur_chat/images/default_user_avatar.png";
  }
  murmur.attr('id', murmurXML.find('id:first').text());
  $('#user-image', murmur).attr('src', iconPath);
  $('#message', murmur).text(murmurXML.find('body').text());
  $('#user-name', murmur).text(murmurXML.find('name').text());
  $('#create-at', murmur).text(murmurXML.find('created_at').text());
  murmur.removeClass('hidden');
  murmur.addClass('murmur');
  return murmur;
};

murmurChat.init = function($, macroDebug) {

  var success = function(xml, textStatus) {
    try {

      $(xml).find('murmur').each(function() {
        var murmur = murmurChat.createMurmur($(this), $, macroDebug),
            messages = $('#murmur-messages'),
            clear = $('#clear:first').clone();
        messages.append(murmur);
        messages.append(clear);
        murmur.show();
      });
    } catch(err) {
      macroDebug.log("error adding murmur: status:" + textStatus + ", err: " + err);
    }
  };

  try {

    $("#debug-info").ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
      $(this).append("Triggered ajaxError handler: " + thrownError);
    });

    macroDebug.log('making murmur request');
    $.get('/api/v2/projects/baml_team_1/murmurs.xml', success);

    $("#new-murmur").keydown(function(e) {
      if ((e.keyCode || e.which) == 13) {
        murmurChat.post($, macroDebug);
      }
    });
    
  } catch(err) {
    macroDebug.log(err);
  }
};

murmurChat.post = function ($, macroDebug) {

  var success = function(xml, textStatus) {
    try {
      macroDebug.log("successful post: " + textStatus);
      $(xml).find('murmur').each(function() {
        var murmur = murmurChat.createMurmur($(this), $, macroDebug),
            messages = $('#murmur-messages'),
            clear = $('#clear:first').clone();
        messages.prepend(murmur);
        messages.prepend(clear);
        murmur.show();
      });
    } catch(err) {
      macroDebug.log("error updating murmur: status:" + textStatus + ", err: " + err);
    }
  };
  
  try {
    var newMurmur = $("#new-murmur"),
        murmur = {'murmur[body]': newMurmur.val() };
    macroDebug.log("posting murmur: " + murmur);
    $.post('/api/v2/projects/baml_team_1/murmurs.xml', murmur, success, 'xml');
    newMurmur.val("");
  } catch(err) {
    macroDebug.log("error posting murmur:" + err);
  }
};
