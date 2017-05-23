var PushoverJs = function (appToken, userKey) {
  var self = {
    AppToken: appToken,
    UserKey: userKey || null,
    ApiURL: 'https://api.pushover.net/1/messages.json'
  };

  var api = {};

  // Actual pushover message object that will be sent out
  var message = function (self, message, title) {
    var api = {};
    var postData = self.createBaseRequest();

    api.title = function(title) {
      postData.title = title;
      return this;
    };

    api.message = function(message) {
      postData.message = message;
      return this;
    };

    api.url = function(url, title) {
      postData.url = url;
      if (title)postData.url_title = title;
      return this;
    };

    api.consolePre = function() {
      console.log(JSON.stringify(postData, null, 2));
      return this;
    };

    api.lowPriority = function() {
      postData.priority = -1;
      return this;
    };

    api.normalPriority = function() {
      postData.priority = 0;
      return this;
    };

    api.highPriority = function() {
      postData.priority = 1;
      return this;
    };

    api.addCurrentTime = function() {
      postData.timestamp = Math.floor((new Date()).getTime() / 1000);
      return this;
    };

    api.playSound = function (sound) {
      postData.sound = sound;
      return this;
    };

    api.userKey = function(userKey) {
      postData.user = userKey;
      return this;
    };

    api.send = function (waitForSend) {
      if (typeof waitForSend === 'undefined') waitForSend = false;
      self.postToServer(postData, !waitForSend);
    };

    if (message) api.message(message);
    if (title) api.title(title);

    return api;
  };

  // Private methods
  self.serialize = function (data) {
    var postData = [];
    var props = Object.getOwnPropertyNames(data);

    for (var i = 0; i < props.length; i++) {
      postData.push(encodeURIComponent(props[i]) + '=' + encodeURIComponent(data[props[i]]));
    }

    return postData.join('&');
  };

  self.postToServer = function (data, sendAsync) {
    var request = new XMLHttpRequest();
    request.open('POST', self.ApiURL, sendAsync);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    try {
      request.send(self.serialize(data));
    } catch (e) {
      // todo: handle and suppress errors
      // yummy - this is to stop CORS errors breaking code execution
    } 
  };

  self.createBaseRequest = function (message, userKey) {
    return  {
      token: self.AppToken,
      user: userKey || self.UserKey,
      message: message
    };
  };

  // Public methods
  api.createMessage = function (msg, title) {
    return new message(self, msg, title);
  };

  api.sounds = {
    bugle: 'bugle',
    pushover: 'pushover',
    bike: 'bike',
    cashregister: 'cashregister',
    classical: 'classical',
    cosmic: 'cosmic',
    falling: 'falling',
    gamelan: 'gamelan',
    incoming: 'incoming',
    magic: 'magic',
    mechanical: 'mechanical',
    pianobar: 'pianobar',
    siren: 'siren',
    spacealarm: 'spacealarm',
    tugboat: 'tugboat',
    alien: 'alien',
    climb: 'climb',
    persistent: 'persistent',
    echo: 'echo',
    updown: 'updown',
    none: 'none'
  };

  return api;
};