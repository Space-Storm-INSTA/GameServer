(function() {
  var Application, Ennemi, Player, app, mysql, players, ws;

  mysql = require('mysql');

  ws = require("nodejs-websocket");

  players = new Array();

  Player = (function() {
    function Player(socket, id) {
      var err;
      this.socket = socket;
      this.id = id;
      this.life = 100;
      this.master = false;
      try {
        this.socket.sendText(JSON.stringify({
          opcode: 1
        }));
        this.close(this.socket);
        this.text(this.socket, this.id);
        this.ennemi;
      } catch (_error) {
        err = _error;
        console.log("constructor");
        console.log(err);
      }
    }

    Player.prototype.close = function(socket) {
      var err;
      this.socket = socket;
      try {
        return this.socket.on('close', (function(_this) {
          return function(code, reason) {
            var master, player, _i, _len;
            master = false;
            for (_i = 0, _len = players.length; _i < _len; _i++) {
              player = players[_i];
              if (player.id !== _this.id) {
                player.socket.sendText(JSON.stringify({
                  opcode: 5,
                  id: _this.id
                }));
              }
              if (player.id === _this.id) {
                master = true;
              }
            }
            players.splice(players.indexOf(_this), 1);
            console.log('Connection closed');
            if (master) {
              players[0].master = true;
              player.socket.sendText(JSON.stringify({
                opcode: 0,
                id: players[0].id,
                master: players[0].master
              }));
            }
            return console.log("Master changed (" + players[0].id + ")");
          };
        })(this));
      } catch (_error) {
        err = _error;
        console.log("close");
        return console.log(err);
      }
    };

    Player.prototype.text = function(socket, id) {
      this.socket = socket;
      this.id = id;
      return this.socket.on('text', (function(_this) {
        return function(str) {
          var err, json, player, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _results, _results1, _results2;
          try {
            json = JSON.parse(str);
          } catch (_error) {
            err = _error;
            console.log("json : " + err);
          }
          switch (json.opcode) {
            case 10:
              _results = [];
              for (_i = 0, _len = players.length; _i < _len; _i++) {
                player = players[_i];
                if (player.id === json.id) {
                  player.life = player.life - 20;
                  if (player.life < 0) {
                    player.life = 0;
                  }
                  _results.push(player.socket.sendText(JSON.stringify({
                    opcode: 10,
                    id: player.id,
                    life: player.life
                  })));
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
              break;
            case 6:
              try {
                _results1 = [];
                for (_j = 0, _len1 = players.length; _j < _len1; _j++) {
                  player = players[_j];
                  if (player.id !== _this.id) {
                    _results1.push(player.socket.sendText(JSON.stringify({
                      opcode: 7,
                      id: _this.id,
                      type: json.type,
                      x: json.position.x,
                      y: json.position.y
                    })));
                  } else {
                    _results1.push(void 0);
                  }
                }
                return _results1;
              } catch (_error) {
                err = _error;
                console.log("missile");
                return console.log(err);
              }
              break;
            case 2:
              try {
                _this.id = json.id;
                for (_k = 0, _len2 = players.length; _k < _len2; _k++) {
                  player = players[_k];
                  if (player.id !== _this.id) {
                    player.socket.sendText(JSON.stringify({
                      opcode: 3,
                      id: _this.id
                    }));
                  }
                }
                if (players.length === 1) {
                  player.master = true;
                  player.socket.sendText(JSON.stringify({
                    opcode: 0,
                    id: _this.id,
                    master: true
                  }));
                }
                for (_l = 0, _len3 = players.length; _l < _len3; _l++) {
                  player = players[_l];
                  if (player.id !== _this.id) {
                    _this.socket.sendText(JSON.stringify({
                      opcode: 3,
                      id: player.id
                    }));
                  }
                }
                return console.log("Player " + _this.id + " connected !");
              } catch (_error) {
                err = _error;
                console.log("connection player");
                return console.log(err);
              }
              break;
            case 4:
              try {
                _results2 = [];
                for (_m = 0, _len4 = players.length; _m < _len4; _m++) {
                  player = players[_m];
                  if (player.id !== _this.id) {
                    _results2.push(player.socket.sendText(JSON.stringify({
                      opcode: 4,
                      id: _this.id,
                      x: json.position.x,
                      y: json.position.y
                    })));
                  } else {
                    _results2.push(void 0);
                  }
                }
                return _results2;
              } catch (_error) {
                err = _error;
                console.log("position");
                return console.log(err);
              }
          }
        };
      })(this));
    };

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
      ennemi = new Ennemi(this.connection);
      return process.on('uncaughtException', function(err) {
        return console.error(err.stack);
      });
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
          var err, id, random, x, y;
          try {
            random = Math.floor((Math.random() * 10) + 1);
            if (random === 10) {
              id = 3;
            } else {
              id = Math.floor((Math.random() * 2) + 1);
            }
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
          } catch (_error) {
            err = _error;
            console.log("ennemi");
            return console.log(err);
          }
        };
      })(this), 200);
    }

    Ennemi.prototype.generate = function(id, callback) {
      return this.connection.query('select * from ennemie, arme where ennemie.id_arme=arme.id_arme AND ennemie.id_ennemie = ?', [id], (function(_this) {
        return function(err, rows) {
          if (err) {
            console.log("request");
            console.log(err);
          }
          return callback(rows[0]);
        };
      })(this));
    };

    return Ennemi;

  })();

  app = new Application();

}).call(this);

(function() {


}).call(this);
