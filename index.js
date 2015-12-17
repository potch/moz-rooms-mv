var express = require('express');
var ical = require('ical');
var http = require('http');
var rooms = require('./rooms2.json');

const today = new Date();

function roomURL(email) {
  return 'https://www.google.com/calendar/ical/' + encodeURIComponent(email) + '/public/basic.ics';
}

function timeFmt(d) {
  return ('0' + d.getHours()).substr(-2) + ':' + ('0' + d.getMinutes()).substr(-2);
}

var status = [];

function update() {
  Promise.all(rooms.map(function (room) {
    return new Promise(function (resolve, reject) {
      ical.fromURL(
        roomURL(room.email), {},
        function(err, data) {
          if (err) {
            resolve({
              name: room.name,
              status: 'error',
              error: error
            });
          }
          for (var q in data) {
            var evt = data[q];
            var start = new Date(evt.start);
            var end = new Date(evt.end);
            if (start < today && today < end) {
              resolve({
                name: room.name,
                room: room,
                evt: evt,
                ends: end,
                status: 'busy'
              });
              return;
            }
          }
          resolve({
            name: room.name,
            room: room,
            status: 'free'
          });
        }
      );
    });
  }))
  .then(function (results) {
    status = results;
    console.log(new Date(), status.length);
  });
}

update();
setInterval(update, 30 * 1000);

var app = express();
app.set('port', (process.env.PORT || 8000));
// app.use(express.static(__dirname + '/static'));
var server = http.createServer(app);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/status', function(req, res) {
  res.json(status);
});

var fs = require('fs');
app.get('/', function(req, res) {
  res.end(fs.readFileSync('./index.html'));
});

server.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
