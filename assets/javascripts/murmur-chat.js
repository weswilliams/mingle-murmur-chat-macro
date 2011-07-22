var murmurChat = {};

murmurChat.init = function($, macroDebug) {

  var success = function(xml, textStatus) {
    var murmur, clear, messages, murmurXML, iconPath;
    try {

      $(xml).find('murmur').each(function() {
        murmur = $('#murmur-template:first').clone();
        clear = $('#clear:first').clone();
        messages = $('#murmur-messages');
        murmurXML = $(this);
        iconPath = murmurXML.find('icon_path').text();
        if (!iconPath) {
          iconPath = "../../../../plugin_assets/murmur_chat/images/default_user_avatar.png";
        }

        murmur.attr('id', murmurXML.find('id:first').text());
        $('#user-image', murmur).attr('src', iconPath);
        $('#message', murmur).text(murmurXML.find('body').text());
        $('#user-name', murmur).text(murmurXML.find('name').text());
        $('#create-at', murmur).text(murmurXML.find('created_at').text());
        messages.append(murmur);
        murmur.removeClass('hidden');
        murmur.addClass('murmur');
        murmur.show();
        messages.append(clear);
      });
    } catch(err) {
      macroDebug.log("error adding murmur: " + err);
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
  try {
    var newMurmur = $("#new-murmur"),
        murmur = {'murmur[body]': newMurmur.val() };
    macroDebug.log("posting murmur: " + murmur);
    $.post('/api/v2/projects/baml_team_1/murmurs.xml', murmur, 'xml');
    newMurmur.val("");
  } catch(err) {
    macroDebug.log(err);
  }
};
