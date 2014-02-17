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
        viewModel.sendMessage(message);

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


function Message(username, message, timestamp, previousMessage) {
    var self = this;

    self.username = username;
    self.message = message;
    self.timestamp = timestamp;
    self.previousMessage = previousMessage;

    self.dateString = ko.computed(function () {
        var date = new Date(this.timestamp);
        return date.toLocaleString();
    }, self);

    self.toObject = function () {
        return {
            username: username,
            message: message,
            timestamp: timestamp,
        };
    }

    self.isCollapsed = ko.computed(function () {
        var fiveMinutes = 300000; // milliseconds

        if (!this.previousMessage) {
            return false;
        }

        if (this.username === this.previousMessage.username &&
            this.timestamp - this.previousMessage.timestamp < fiveMinutes) {
            return true;
        }

        return false;
    }, self);
}


function ChatModel(username, roomName) {
    var self = this;

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
            var message = "You have been disconnected frome the server";
            self.addMessage(message);
        });
        self.socket.on('reconnect', function () {
            self.subscribe();
        });
    }

    self.isVerbose = ko.observable(false);

    self.toggleVerbose = function () {
        self.isVerbose(!self.isVerbose());
    };

    self.addMessage = function (data, username, timestamp) {
        var message = data;
        if (typeof(data) === 'object') {
            username = data.username;
            timestamp = data.timestamp;
            message = data.message;
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

        var newMessage = new Message(username, message, timestamp, prev);
        self.messages.push(newMessage);

        return newMessage;
    };

    self.sendMessage = function (message) {
        var messageModel = self.addMessage(message);
        self.socket.emit('new-message', messageModel.toObject());
    }

    self.subscribe = function () {
        self.socket.emit('subscribe', { 
            'room': self.room(),
            'username': self.username
        });
        self.sendMessage(username + ' has joined the room.');
    };

    init(username, roomName);
}


function initDebug() {
    $('#chat header').on('click', function () {
        $('#chat').toggleClass('well-alt');
    });
}
