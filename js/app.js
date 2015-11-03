(function() {
  var Application, Ennemi, Player, app, mysql, players, ws;

  mysql = require('mysql');

  ws = require("nodejs-websocket");

  players = new Array();

  Player = (function() {
    Player.prototype.close = function(socket) {
      this.socket = socket;
      return this.socket.on('close', (function(_this) {
        return function(code, reason) {
          var player, _i, _len;
          for (_i = 0, _len = players.length; _i < _len; _i++) {
            player = players[_i];
            if (player.id !== _this.id) {
              player.socket.sendText(JSON.stringify({
                opcode: 5,
                id: _this.id
              }));
            }
          }
          players.splice(players.indexOf(_this), 1);
          return console.log('Connection closed');
        };
      })(this));
    };

    Player.prototype.text = function(socket, id) {
      this.socket = socket;
      this.id = id;
      return this.socket.on('text', (function(_this) {
        return function(str) {
          var json, player, _i, _j, _k, _l, _len, _len1, _len2, _len3, _results, _results1;
          json = JSON.parse(str);
          switch (json.opcode) {
            case 6:
              _results = [];
              for (_i = 0, _len = players.length; _i < _len; _i++) {
                player = players[_i];
                if (player.id !== _this.id) {
                  _results.push(player.socket.sendText(JSON.stringify({
                    opcode: 7,
                    id: _this.id,
                    type: json.type,
                    x: json.position.x,
                    y: json.position.y
                  })));
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
              break;
            case 2:
              _this.id = json.id;
              for (_j = 0, _len1 = players.length; _j < _len1; _j++) {
                player = players[_j];
                if (player.id !== _this.id) {
                  player.socket.sendText(JSON.stringify({
                    opcode: 3,
                    id: _this.id
                  }));
                }
              }
              for (_k = 0, _len2 = players.length; _k < _len2; _k++) {
                player = players[_k];
                if (player.id !== _this.id) {
                  _this.socket.sendText(JSON.stringify({
                    opcode: 3,
                    id: player.id
                  }));
                }
              }
              return console.log("Player " + _this.id + " connected !");
            case 4:
              _results1 = [];
              for (_l = 0, _len3 = players.length; _l < _len3; _l++) {
                player = players[_l];
                if (player.id !== _this.id) {
                  _results1.push(player.socket.sendText(JSON.stringify({
                    opcode: 4,
                    id: _this.id,
                    x: json.position.x,
                    y: json.position.y
                  })));
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
          }
        };
      })(this));
    };

    function Player(socket, id) {
      this.socket = socket;
      this.id = id;
      this.socket.sendText(JSON.stringify({
        opcode: 1
      }));
      this.close(this.socket);
      this.text(this.socket, this.id);
      this.ennemi;
    }

    return Player;

  })();

  Application = (function() {
    function Application() {
      console.log("Init");
      this.StartTCP();
    }

    Application.prototype.StartTCP = function() {
      var ennemi, server;
      this.setupDatabase("kingoloto");
      server = ws.createServer(function(conn) {
        console.log('New connection');
        return players.push(new Player(conn, -1));
      }).listen(3000);
      return ennemi = new Ennemi(this.connection);
    };

    Application.prototype.setupDatabase = function(base) {
      this.connection = mysql.createConnection({
        socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
        user: 'root',
        password: 'root'
      });
      console.log("database connected : '" + base + "'");
      return this.connection.query("USE " + base);
    };

    return Application;

  })();

  Ennemi = (function() {
    function Ennemi(connection) {
      this.connection = connection;
      setInterval((function(_this) {
        return function() {
          var id, x, y;
          id = Math.floor((Math.random() * 2) + 1);
          x = Math.floor((Math.random() * 1080) + 1);
          y = Math.floor((Math.random() * 1080) + 1);
          return _this.generate(id, function(rows) {
            var player, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = players.length; _i < _len; _i++) {
              player = players[_i];
              _results.push(player.socket.sendText(JSON.stringify({
                opcode: 9,
                ennemi: rows,
                x: x,
                y: y
              })));
            }
            return _results;
          });
        };
      })(this), 200);
    }

    Ennemi.prototype.generate = function(id, callback) {
      return this.connection.query('select * from ennemie, arme where ennemie.id_arme=arme.id_arme AND ennemie.id_ennemie = ?', [id], (function(_this) {
        return function(err, rows) {
          return callback(rows[0]);
        };
      })(this));
    };

    return Ennemi;

  })();


  /*
  'select level.id_level as "level", level.description as "level_description",
  ennemie.id_ennemie as "ennemie", ennemie.description as "ennemie_description", ennemie.name as "ennemie_name",
  ennemie.speed as "ennemie_speed", ennemie.life as "ennemie_life", arme.id_arme as "arme", arme.description as "arme_description",
  arme.degats as "arme_degats", arme.speed as "arme_speed", level_generate.frame as "frame"
  from level_generate, level, ennemie, arme
  where level_generate.id_level=level.id_level and ennemie.id_ennemie=level_generate.id_ennemie and
  ennemie.id_arme=arme.id_arme AND level.id_level = ?'
   */

  app = new Application();

}).call(this);

(function() {


}).call(this);
