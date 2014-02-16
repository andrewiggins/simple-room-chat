/*******************************************************************************
 * Name:        index.js
 * Purpose:     Routes for the Index
 *
 * Author(s):   Andre Wiggins
 *
 * Created:     January 14, 2014
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


module.exports = function (app, socketio) {

    // home page
    app.get('/', function (req, res) {
        res.render('login');
    });

    app.get('/:room', function (req, res) {
        res.render('chat');
    });

    socketio.sockets.on('connection', function (socket) {
        console.log('connected');
    });

};
