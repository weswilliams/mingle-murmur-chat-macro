var murmurChat = {};

murmurChat.init = function($, macroDebug) {

  var success = function(xml, textStatus, jqXHR) {
    macroDebug.log('received status: ' + textStatus);
    var murmur, murmurXML, iconPath;
    $(xml).find('murmur').each(function() {
      murmur = $('#murmur-template').clone();
      murmurXML = $(this);
      iconPath = murmurXML.find('icon_path').text();
      if (!iconPath) {
        iconPath = "../../../../plugin_assets/murmur_chat/images/default_user_avatar.png";
      }
      macroDebug.log("setting icon to: [" + iconPath + "]");
      $('#user-image', murmur).attr('src',iconPath);
      $('#message', murmur).text(murmurXML.find('body').text());
      $('#user-name', murmur).text(murmurXML.find('name').text());
      $('#murmur-messages').append(murmur);
    });
  };

  try {

    $("#debug-info").ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
      $(this).append("Triggered ajaxError handler: " + thrownError);
    });

    macroDebug.log('making murmur request');
    $.get('/api/v2/projects/baml_team_1/murmurs.xml', success);

  } catch(err) {
    macroDebug.log(err);
  }
};
