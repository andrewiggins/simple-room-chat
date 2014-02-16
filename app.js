/*******************************************************************************
 * Name:        app.js
 * Purpose:     Core server code
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


/**
* MODULE DEPENDENCIES
* -------------------------------------------------------------------------------------------------
* include any modules you will use through out the file
**/

// Create core server
var express = require('express')
  , app = module.exports = express()
  , server = require('http').createServer(app)
  , socketio = require('socket.io').listen(server);

// Other dependencies
var path = require('path')
  , swig = require('swig');



/**
* CONFIGURATION
* -------------------------------------------------------------------------------------------------
* set up view engine (swig), and any custom middleware 
**/

app.configure('development', function () {
    app.use(express.logger('dev'));

    app.set('view cache', false);
    swig.setDefaults({ cache: false });
});

app.configure(function() {
    app.engine('html', swig.renderFile);

    app.set('port', process.env.PORT || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'html');

    app.use(express.favicon());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());

    app.use(express.session({ secret: 'azure zomg' }));

    app.use(app.router);

    var public_dir = path.join(__dirname, 'public');
    app.use(express.static(public_dir));
});



/**
* ROUTING
* -------------------------------------------------------------------------------------------------
* include a route file for each major area of functionality in the site
**/

require('./routes/chat')(app, socketio);



/**
* RUN
* -------------------------------------------------------------------------------------------------
* this starts up the server on the given port
**/

server.listen(app.get('port'), function () { 
    console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
});
