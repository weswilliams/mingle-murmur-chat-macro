murmurChat.currentFilter = '';

murmurChat.filters = function() {

  var userFilter = function($, data) {
    var that = {},
        filterUser = data.filter.trim().substring(1),
        searchField = $('#' + data.searchField, data.murmur),
        pattern = new RegExp("(" + filterUser + ")", "gi");
    that.searchField = searchField,
        that.pattern = pattern;
    that.matches = function() {
      if (data.filter.indexOf('@') !== 0) {
        return false;
      }
      return that.pattern.test(that.searchField.text().trim());
    };
    return that;
  };

  var userNameFilter = function($, data) {
    murmurChat.log("applying user name filter: " + data);
    data.searchField = 'user-name';
    return userFilter($, data);
  };

  var userMentionFilter = function($, data) {
    murmurChat.log("applying user mention filter: " + data);
    data.searchField = 'message';
    return userFilter($, data);
  };

  var textFilter = function($, data) {
    murmurChat.log("applying text message filter: " + data);
    var that = {},
        textFilter = data.filter.trim(),
        textField = $('#' + data.searchField, data.murmur),
        pattern = new RegExp("(" + textFilter + ")", "gi");
    that.pattern = pattern;
    that.searchField = textField;
    that.matches = function() {
      return textFilter !== '' && pattern.test(textField.text().trim());
    };
    return that;
  };

  var messageFilter = function($, data) {
    data.searchField = 'message';
    return textFilter($, data);
  };

  var relatedFilter = function($, data) {
    var modifiedData = $.extend(true, {}, data);
    if (modifiedData.filter.indexOf('#') === 0) {
      modifiedData.filter = modifiedData.filter.substring(1);
      murmurChat.log('modified filter: ' + modifiedData.filter);
    }
    modifiedData.searchField = 'related-link';
    return textFilter($, modifiedData);
  };

  var noFilter = function($, data) {
    var that = {};
    that.matches = function() {
      return data.filter.trim() === '';
    };
    return that;
  };

  return [noFilter, userNameFilter, userMentionFilter, messageFilter, relatedFilter];
};

murmurChat.filter = function($, filter) {
  murmurChat.log("applying filter: " + filter);

  $('.filter-highlight').replaceWith(function() {
    return $(this).text();
  });

  murmurChat.currentFilter = filter;

  var filterHighlighter = function($, filter) {
    murmurChat.log("decorate search");
    var that = {},
        canBeHighlighted = function () {
          return filter.searchField !== undefined && filter.pattern !== undefined;
        };

    that.matches = function() {
      var matches = filter.matches(), pattern;
      if (matches && canBeHighlighted()) {
        pattern = new RegExp("(\/)?" + filter.pattern.source, "gi");
        murmurChat.log("new regex: " + pattern.source);
        // TODO - I don't have a better solution for this but this is emulating a reverse negative
        //        lookup to fix an issue with decorating card number search that is part of the url.
        //        It fixes that issue but there are still potential for issues with search decoration.
        filter.searchField.html(filter.searchField.html().replace(
            pattern, function($0, $1, $2) {
              murmurChat.log("$0=" + $0 + "$1=" + $1 + "$2=" + $2);
              return $1 ? $0 : "<span class='filter-highlight'>" + murmurChat.replaceSpecialChars($2) + "</span>";
            }));
      }
      return matches;
    };

    return that;
  };

  $('.murmur').each(function() {
    var murmur = $(this),
        data = { filter: filter, murmur: murmur },
        filters = murmurChat.filters(),
        show = false, index = 0, thisFilter;
    for (index = 0; index < filters.length; index++) {
      thisFilter = filterHighlighter($, filters[index]($, data));
      show = show || thisFilter.matches();
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
