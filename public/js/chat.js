/*******************************************************************************
 * Name:        chat.js
 * Purpose:     Drives chat interface
 *
 * Author(s):   Andre Wiggins
 *
 * Created:     February 15, 2014
 * Copyright:   (c) Andre Wiggins 2014
 * License:
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE*2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 ******************************************************************************/

var viewModel = null;
$(document).ready(init);


function init() {
    initDebug();

    initializeRoom();

    adjustMinHeight();
    $(window).on('resize', adjustMinHeight);

    $('#login-form').on('submit', function (evt) {
        evt.preventDefault();

        var room = $('#room').val();
        var username = $('#username').val();

        $('#login').addClass('hidden');
        $('#chat').removeClass('hidden');

        $('#new-message').focus();

        viewModel = new ChatModel(username, room);
        ko.applyBindings(viewModel);
    });

    $('#new-message-form').on('submit', function (evt) {
        evt.preventDefault();

        var $message = $('#new-message');

        var message = $message.val();
        viewModel.sendUserMessage(message);

        $message.val('');
        window.scrollTo(0, document.body.scrollHeight);
    });

    $('.messages').on('click', '.timestamp', function (evt) {
        viewModel.toggleVerbose();
    });
}


function adjustMinHeight() {
    var $content = $('#chat .content');
    var marginTop = parseInt($content.css('margin-top'));
    var marginBottom = parseInt($content.css('margin-bottom'));
    var windowHeight = $(window).height();

    var minHeight = windowHeight - marginTop - marginBottom;
    $('#chat .content').css({'min-height': minHeight});
    $('#chat-viewport').css({'height': minHeight+1});
}


function initializeRoom() {
    var room = location.hash;

    if (room) {
        room = room.substring(1);
        $('#room').val(room);
        $('#username').focus();
    } else {
        $('#room').focus();
    }
}


function Message(type, message, username, timestamp, previousMessage) {
    var self = this;

    function init() {
        self.type = type;
        self.message = message;
        self.username = username;
        self.timestamp = timestamp;
        self.previousMessage = previousMessage;

        self.dateString = ko.computed(_dateString, self);
        self.isCollapsed = ko.computed(_isCollapsed, self);
        self.cssClass = ko.computed(_cssClass, self);
    }

    this.toObject = function () {
        return {
            type: self.type,
            message: self.message,
            username: self.username,
            timestamp: self.timestamp,
        };
    }

    function _dateString () {
        var date = new Date(this.timestamp);
        return date.toLocaleString();
    }

    function _cssClass () {
        var classes = [this.type];

        if (this.isCollapsed()) {
            classes.push('collapse');
        }

        return classes.join(' ');
    }

    function _isCollapsed () {
        if (!this.previousMessage) {
            return false;
        }

        if (!viewModel.isVerbose() && collapseMessages(this, this.previousMessage)) {
            return true;
        }

        return false;
    }

    function collapseMessages(msg1, msg2) {
        var fiveMinutes = 300000; // milliseconds

        if (msg1.type !== msg2.type) {
            return false;
        }

        var result = false;
        if (msg1.type === 'control') {
            result = msg1.type === msg2.type;
        } else {
            result = msg1.username === msg2.username &&
                     Math.abs(msg1.timestamp - msg2.timestamp) < fiveMinutes;
        }
        
        return result;
    }

    init();
}


function ChatModel(username, roomName) {
    var self = this;
    var userMessage = 'user';
    var controlMessage = 'control';

    function init(username, roomName) {
        self.room = ko.observable(roomName);
        self.username = username;
        self.messages = ko.observableArray([]);

        location.hash = '#'+self.room();

        initSocket();
        self.subscribe();
    }

    function initSocket() {
        self.socket = io.connect(location.origin);
        self.socket.on('new-message', function (data) {
            self.addMessage(data);
        });
        self.socket.on('disconnect', function () {
            var message = "You have been disconnected from the server";
            self.addMessage(controlMessage, message);
        });
        self.socket.on('reconnect', function () {
            self.subscribe();
        });
    }

    self.isVerbose = ko.observable(false);

    self.toggleVerbose = function () {
        self.isVerbose(!self.isVerbose());
    };

    self.addMessage = function (data, message, username, timestamp) {
        var type = data;
        if (typeof(data) === 'object') {
            message = data.message;
            username = data.username;
            timestamp = data.timestamp;
            type = data.type;
        }

        if (username === undefined) {
            username = self.username;
        }

        if (timestamp === undefined) {
            timestamp = Date.now();
        }

        var prev = null;
        if (self.messages().length > 0) {
            prev = self.messages.slice(-1)[0];
        }

        var newMessage = new Message(type, message, username, timestamp, prev);
        self.messages.push(newMessage);

        return newMessage;
    };

    self.sendUserMessage = function (message) {
      self.sendMessage(userMessage, message);
    }

    self.sendControlMessage = function (message) {
      self.sendMessage(controlMessage, message);
    }

    self.sendMessage = function (type, message) {
        var messageModel = self.addMessage(type, message);
        self.socket.emit('new-message', messageModel.toObject());
    }

    self.subscribe = function () {
        self.socket.emit('subscribe', { 
            'room': self.room(),
            'username': self.username
        });
        self.sendControlMessage(username + ' has joined the room.');
    };

    init(username, roomName);
}


function initDebug() {
    $('#chat header').on('click', function () {
        $('#chat').toggleClass('well-alt');
    });
}
