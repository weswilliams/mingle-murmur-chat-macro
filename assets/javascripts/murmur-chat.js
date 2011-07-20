var murmurChat = {};

murmurChat.init = function($, macroDebug) {

  try {

    var success = function(xml, textStatus, jqXHR) {
      macroDebug.log('received status: ' + textStatus);
      $(xml).find('body').each(function() {
        $('#chat-messages').append($(this).text()).append('<br>');
      });
    };

    $("#debug-info").ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
      $(this).append("Triggered ajaxError handler: " + thrownError);
    });

    macroDebug.log('making murmur request');
    $.get('/api/v2/projects/baml_team_1/murmurs.xml?since_id=312', success);

  } catch(err) {
    macroDebug.log(err);
  }
};
