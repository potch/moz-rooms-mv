var rooms = require('./rooms.json');

var out = [];

out = rooms.map(function (room) {
  var n = room.name;

  var capacity = n.match(/Seats (\d+)/);
  if (capacity) {
    capacity = parseInt(capacity[1]);
  } else {
    capacity = 0;
  }

  var parts = n.split(' - ');
  var floor = parseInt(parts[0].match(/\d/));
  var address = parts[1].match(/(\d{3})\s?(.*)/);
  var name, number;
  if (address) {
    number = parseInt(address[1]);
    name = address[2];
  }

  return {
    name: name || undefined,
    number: number,
    capacity: capacity,
    floor: floor,
    email: room.email
  };
}).sort(function (a, b) {
  return a.name > b.name ? 1 : -1;
});

console.log(JSON.stringify(out, null, 2));
