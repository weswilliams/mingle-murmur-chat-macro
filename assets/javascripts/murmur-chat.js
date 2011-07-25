var murmurChat = {};

murmurChat.initFilterUserAutoComplete = function($) {

  murmurChat.log('init filter with user names');

  var success = function(xml, status) {
    var users = [];
    murmurChat.log("retrieved users: " + status);

    $(xml).find("user").each(function() {
      var name = '@' + $(this).find("name").text();
      murmurChat.log("add user " + name);
      users.push(name);
    });

    $("#murmur-filter").autocomplete({
      source: users
    });
  };

  try {
    murmurChat.log('retrieving users from: ' + murmurChat.userURL);
    $.get(murmurChat.userURL, success);
  } catch(e) {
    murmurChat.log("error getting users: " + e);
  }

};

murmurChat.initNewMessage = function($) {
  $("#new-murmur").keydown(function(e) {
    if ((e.keyCode || e.which) == 13) {
      murmurChat.post($);
      return false;
    }
  });
};

murmurChat.filters = function() {

  var userNameFilter = function($, data) {
    if (data.filter.indexOf('@') !== 0) {
      return true;
    }
    var filterUser = data.filter.trim().substring(1),
        murmurUser = $('#user-name', data.murmur).text().trim(),
        namePattern = new RegExp(filterUser, "i");
    return namePattern.test(murmurUser);
  };

  var noFilter = function($, data) {
    return data.filter.trim() === '';
  };

  return [userNameFilter, noFilter];
};

murmurChat.filter = function($, filter) {
  $('.murmur').each(function() {
    var murmurUser = $('#user-name', $(this)).text().toLowerCase().trim(),
        murmur = $(this),
        data = { filter: filter, murmur: murmur },
        filters = murmurChat.filters(),
        show = false, index = 0;
    for (index = 0; index < filters.length; index++) {
      if (filters[index]($, data)) {
        show = true;
        break;
      }
    }
    murmur.toggle(show);
  });
};

murmurChat.initFilter = function($) {
  $("#murmur-filter").keydown(function(e) {
    if ((e.keyCode || e.which) == 13) {
      murmurChat.filter($, $("#murmur-filter").val());
      return false;
    }
  });
};

murmurChat.createMurmur = function(murmurXML, $) {
  var murmur, iconPath, id;
  murmur = $('#murmur-template:first').clone();
  iconPath = murmurXML.find('icon_path').text();
  if (!iconPath) {
    iconPath = "../../../../plugin_assets/murmur_chat/images/default_user_avatar.png";
  }
  id = parseInt(murmurXML.find('id:first').text(), 10);
  if (murmurChat.lastMurmurId === undefined || id > murmurChat.lastMurmurId) {
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

murmurChat.initMurmurs = function($) {

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
      murmurChat.update($);
    } catch(err) {
      murmurChat.log("error adding murmur: status:" + textStatus + ", err: " + err);
    }
  };

  murmurChat.log("getting murmurs: " + murmurChat.url);
  $.get(murmurChat.url, success);

};

murmurChat.initAjaxErrorHandling = function($) {
  $("#debug-info").ajaxError(function(event, jqXHR, ajaxSettings, thrownError) {
    murmurChat.log("Triggered ajaxError handler: " + thrownError);
  });
};

murmurChat.initResizeMurmurs = function($) {
  $('.resizable').resizable({
    maxWidth: 400,
    minWidth: 400,
    resize: function(event, ui) {
      $('#murmur-messages').height(ui.size.height - 100);
    }
  });
};

murmurChat.init = function($, project, updateInterval, mingle_url) {

  try {
    murmurChat.log("chat for: " + project);
    murmurChat.updateInterval = updateInterval;
    murmurChat.url = mingle_url + '/api/v2/projects/' + project + '/murmurs.xml';
    murmurChat.userURL = mingle_url + '/api/v2/users.xml';
    murmurChat.initAjaxErrorHandling($);
    murmurChat.initMurmurs($);
    murmurChat.initNewMessage($);
    murmurChat.initFilterUserAutoComplete($);
    murmurChat.initResizeMurmurs($);
    murmurChat.initFilter($);
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
        messages.prepend(clear);
        messages.prepend(murmur);
        murmur.show();
      }
    });
  } catch(err) {
    murmurChat.log("error updating murmur: status:" + textStatus + ", err: " + err);
  }

};

murmurChat.post = function ($) {

  try {
    var newMurmur = $("#new-murmur"),
        murmur = {'murmur[body]': newMurmur.val() };
    murmurChat.log("posting murmur: " + murmur);
    $.post(murmurChat.url, murmur, 'xml');
    newMurmur.val("");
  } catch(err) {
    murmurChat.log("error posting murmur:" + err);
  }
};

murmurChat.update = function($) {

  var success = function(xml, textStatus) {
    murmurChat.createMurmurs($, xml, textStatus);
    murmurChat.update($);
  };

  try {
    var url = murmurChat.url;
    if (murmurChat.lastMurmurId !== undefined) {
      url += "?since_id=" + murmurChat.lastMurmurId;
    }
    var getMurmurs = function(url, success) {
      return function() {
        murmurChat.log("getting murmurs: " + url);
        $.get(url, success);
      }
    };
    murmurChat.log("updating in " + murmurChat.updateInterval + " seconds");
    setTimeout(getMurmurs(url, success), murmurChat.updateInterval * 1000);
  } catch(err) {
    murmurChat.log("error updating murmurs: " + err);
  }
};