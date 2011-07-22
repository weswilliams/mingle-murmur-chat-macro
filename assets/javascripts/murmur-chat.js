var murmurChat = {};

murmurChat.createMurmur = function(murmurXML, $) {
  var murmur, iconPath, id;
  murmur = $('#murmur-template:first').clone();
  iconPath = murmurXML.find('icon_path').text();
  if (!iconPath) {
    iconPath = "../../../../plugin_assets/murmur_chat/images/default_user_avatar.png";
  }
  id = parseInt(murmurXML.find('id:first').text(), 10);
  if (murmurChat.lastMurmurId == undefined || id > murmurChat.lastMurmurId) {
    murmurChat.lastMurmurId = id;
  }
  murmurChat.log("murmurChat.lastMurmurId = " + murmurChat.lastMurmurId);
  murmur.attr('id', id);
  $('#user-image', murmur).attr('src', iconPath);
  $('#message', murmur).text(murmurXML.find('body').text());
  $('#user-name', murmur).text(murmurXML.find('name').text());
  $('#create-at', murmur).text(murmurXML.find('created_at').text());
  murmur.removeClass('hidden');
  murmur.addClass('murmur');
  return murmur;
};

murmurChat.init = function($) {

  var success = function(xml, textStatus) {
    try {
      $(xml).find('murmur').each(function() {
        var murmur = murmurChat.createMurmur($(this), $),
            messages = $('#murmur-messages'),
            clear = $('#clear:first').clone();
        messages.append(murmur);
        messages.append(clear);
        murmur.show();
      });
      murmurChat.update($, 10);
    } catch(err) {
      murmurChat.log("error adding murmur: status:" + textStatus + ", err: " + err);
    }
  };

  try {

    $("#debug-info").ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
      $(this).append("Triggered ajaxError handler: " + thrownError);
    });

    $.get('/api/v2/projects/baml_team_1/murmurs.xml', success);

    $("#new-murmur").keydown(function(e) {
      if ((e.keyCode || e.which) == 13) {
        murmurChat.post($);
        return false;
      }
    });

  } catch(err) {
    murmurChat.log(err);
  }
};

murmurChat.createMurmurs = function($, xml, textStatus) {
  try {

    var murmurs = $(xml).find('murmur');
    var murmursArr = $.makeArray(murmurs);
    murmursArr.reverse();
    $(murmursArr).each(function() {
      var id, murmurXML, murmur, messages, clear;
      murmurXML = $(this);
      id = parseInt(murmurXML.find('id:first').text(), 10);
      if ($("#" + id).length == 0) {
        murmur = murmurChat.createMurmur(murmurXML, $);
        messages = $('#murmur-messages');
        clear = $('#clear:first').clone();
        messages.prepend(murmur);
        messages.prepend(clear);
        murmur.show();
      }
    });
  } catch(err) {
    murmurChat.log("error updating murmur: status:" + textStatus + ", err: " + err);
  }

};

murmurChat.post = function ($) {

  var success = function(xml, textStatus) {
//    murmurChat.createMurmurs($, xml, textStatus);
  };

  try {
    var newMurmur = $("#new-murmur"),
        murmur = {'murmur[body]': newMurmur.val() };
    $.post('/api/v2/projects/baml_team_1/murmurs.xml', murmur, success, 'xml');
    newMurmur.val("");
  } catch(err) {
    murmurChat.log("error posting murmur:" + err);
  }
};

murmurChat.update = function($, seconds) {

  var success = function(xml, textStatus) {
    murmurChat.createMurmurs($, xml, textStatus);
    murmurChat.update($, 10);
  };

  try {
    var url = '/api/v2/projects/baml_team_1/murmurs.xml';
    if (murmurChat.lastMurmurId != undefined) {
      url += "?since_id=" + murmurChat.lastMurmurId;
    }
    var getMurmurs = function(url, success) {
      return function() {
        $.get(url, success);
      }
    };
    setTimeout(getMurmurs(url, success), seconds * 1000);
  } catch(err) {
    murmurChat.log("error updating murmurs: " + err);
  }
};