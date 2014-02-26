//persistent_server-mysql.js

var express = require("express");
var mysql = require('mysql');
var app = express();
app.use(express.logger());

var db_config = {
    host: 'us-cdbr-east-05.cleardb.net',
    user: 'b6c17621c70215',
    password: 'cb66271d',
    database: 'heroku_73f08b2ebf46a85'
};

var connection;

function handleDisconnect() {
    console.log('1. connecting to db:');
    connection = mysql.createConnection(db_config); // Recreate the connection, since
                          // the old one cannot be reused.

    connection.connect(function(err) {                // The server is either down
        if (err) {                                     // or restarting (takes a while sometimes).
            console.log('2. error when connecting to db:', err);
            setTimeout(handleDisconnect, 1000); // We introduce a delay before attempting to reconnect,
        }                                       // to avoid a hot loop, and to allow our node script to
    });                                       // process asynchronous requests in the meantime.
                          // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('3. db error', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {  // Connection to the MySQL server is usually
            handleDisconnect();                       // lost due to either server restart, or a
        } else {                                        // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}

handleDisconnect();

var db = {
  selectAllFromUrls: "SELECT * FROM urls",
  selectAllFromUrl_to_url: "SELECT * FROM url_to_url",
  testJoinJoin3: //YES, WORKING!!! Aliases are required in the SELECT line so row objects don't have duplicate properties
    "SELECT u1.title AS title1, u2.title AS title2  \
    FROM urls as u1  \
    INNER JOIN url_to_url ON u1.url_id = url_to_url.url_id  \
    INNER JOIN urls as u2 ON url_to_url.child_id = u2.url_id"  //? is a variable that's is specified as the 2cd argument of the query
}

app.get('/', function(request, response) {
    connection.query(db.testJoinJoin3, function(err, rows, fields) {
        if (err) {
            console.log('error: ', err);
            throw err;
        }
        response.send(['Hello World!!!! HOLA MUNDO!!!!', rows]);
    });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});
