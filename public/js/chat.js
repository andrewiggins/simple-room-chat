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

$(document).ready(init);

var viewModel = null;

function init() {
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

function Message(username, message, timestamp) {
    var self = this;

    if (message === undefined && timestamp === undefined) {
        var data = username;
        message = data.message;
        timestamp = data.timestamp;
        username = data.username;
    }

    self.username = username;
    self.message = message;
    self.timestamp = timestamp;

    self.toObject = function () {
        return {
            username: username,
            message: message,
            timestamp: timestamp,
        };
    }
}

function ChatModel(username, roomName) {
    var self = this;

    self.room = ko.observable(roomName);
    self.username = username;

    location.hash = '#'+self.room();

    self.socket = io.connect(location.origin);
    self.socket.emit('subscribe', { 
        'room': roomName,
        'username': username
    });
    self.socket.on('new-message', function (data) {
        self.messages.push(new Message(data));
    });

    self.messages = ko.observableArray([]);

    self.sendMessage = function (message) {
        var timestamp = Date.now();
        var message = new Message(self.username, message, timestamp);

        self.messages.push(message);    

        self.socket.emit('new-message', message.toObject());
    }

    self.sendMessage(username + ' has joined the room.');
}
