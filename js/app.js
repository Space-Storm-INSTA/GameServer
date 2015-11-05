(function() {
  var Application, Ennemi, Player, Score, app, connection, levelone, mysql, nbjoueurs, players, score, ws;

  mysql = require('mysql');

  ws = require("nodejs-websocket");

  players = new Array();

  nbjoueurs = 0;

  connection = {};

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
            console.log("Connection closed for " + _this.id);
            if (master && players.length > 0) {
              players[0].master = true;
              player.socket.sendText(JSON.stringify({
                opcode: 0,
                id: players[0].id,
                master: players[0].master
              }));
              console.log("Master changed (" + players[0].id + ")");
            }
            if (players.length === 0) {
              return score.initScore();
            }
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
          var err, json, player, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _results, _results1, _results2, _results3;
          try {
            json = JSON.parse(str);
          } catch (_error) {
            err = _error;
            console.log("json : " + err);
          }
          switch (json.opcode) {
            case 11:
              score.addScrore(json.type);
              console.log(score.getScore());
              _results = [];
              for (_i = 0, _len = players.length; _i < _len; _i++) {
                player = players[_i];
                _results.push(player.socket.sendText(JSON.stringify({
                  opcode: 12,
                  score: score.getScore()
                })));
              }
              return _results;
              break;
            case 10:
              _results1 = [];
              for (_j = 0, _len1 = players.length; _j < _len1; _j++) {
                player = players[_j];
                if (player.id === json.id) {
                  player.life = player.life - 5;
                  if (player.life < 0) {
                    player.life = 0;
                  }
                  _results1.push(player.socket.sendText(JSON.stringify({
                    opcode: 10,
                    id: player.id,
                    life: player.life
                  })));
                } else {
                  _results1.push(void 0);
                }
              }
              return _results1;
              break;
            case 6:
              try {
                _results2 = [];
                for (_k = 0, _len2 = players.length; _k < _len2; _k++) {
                  player = players[_k];
                  if (player.id !== _this.id) {
                    _results2.push(player.socket.sendText(JSON.stringify({
                      opcode: 7,
                      id: _this.id,
                      type: json.type,
                      x: json.position.x,
                      y: json.position.y,
                      offset: {
                        x: json.offset.x,
                        y: json.offset.y
                      }
                    })));
                  } else {
                    _results2.push(void 0);
                  }
                }
                return _results2;
              } catch (_error) {
                err = _error;
                console.log("missile");
                return console.log(err);
              }
              break;
            case 2:
              try {
                _this.id = json.id;
                for (_l = 0, _len3 = players.length; _l < _len3; _l++) {
                  player = players[_l];
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
                for (_m = 0, _len4 = players.length; _m < _len4; _m++) {
                  player = players[_m];
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
                _results3 = [];
                for (_n = 0, _len5 = players.length; _n < _len5; _n++) {
                  player = players[_n];
                  if (player.id !== _this.id) {
                    _results3.push(player.socket.sendText(JSON.stringify({
                      opcode: 4,
                      id: _this.id,
                      x: json.position.x,
                      y: json.position.y
                    })));
                  } else {
                    _results3.push(void 0);
                  }
                }
                return _results3;
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
      var server;
      this.setupDatabase("kingoloto");
      server = ws.createServer(function(conn) {
        console.log('New connection');
        return players.push(new Player(conn, -1));
      }).listen(3001);
      new levelone();
      return process.on('uncaughtException', function(err) {
        return console.error(err.stack);
      });
    };

    Application.prototype.setupDatabase = function(base) {
      connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'yfful95df'
      });
      console.log("database connected : '" + base + "'");
      return connection.query("USE " + base);
    };

    return Application;

  })();

  Ennemi = (function() {
    function Ennemi() {
      this.generate((function(_this) {
        return function(table) {
          return _this.ennemi = table;
        };
      })(this));

      /*setInterval =>
        try
          nbjoueurs = players.length
          random = Math.floor((Math.random() * 100) + 1)
          if @getRandom 20
             *console.log "generate vert"
            x = Math.floor((Math.random() * 1080) + 1)
            y = Math.floor((Math.random() * 1080) + 1)
            for player in players
              player.socket.sendText JSON.stringify ({
                opcode:9
                ennemi:@getEnnemi 1
                x: x
                y: y
              })
          if @getRandom 10
             *console.log "generate red"
            x = Math.floor((Math.random() * 1080) + 1)
            y = Math.floor((Math.random() * 1080) + 1)
            for player in players
              player.socket.sendText JSON.stringify ({
                opcode:9
                ennemi:@getEnnemi 2
                x: x
                y: y
              })
          if @getRandom 5
            x = Math.floor((Math.random() * 1080) + 1)
            y = Math.floor((Math.random() * 1080) + 1)
            for player in players
              player.socket.sendText JSON.stringify ({
                opcode:9
                ennemi:@getEnnemi 3
                x: x
                y: y
              })
        catch err
          console.log "ennemi"
          console.log err
      , 200
       */
    }

    Ennemi.prototype.getRandom = function(pourcentage) {
      var random;
      random = Math.floor((Math.random() * 100) + 1);
      if (random <= (pourcentage * nbjoueurs) && random !== 0) {
        return true;
      }
      return false;
    };

    Ennemi.prototype.generate = function(callback) {
      var ennemi;
      ennemi = [];
      return connection.query('select * from ennemie, arme where ennemie.id_arme=arme.id_arme', [], (function(_this) {
        return function(err, rows) {
          var table, _i, _len;
          if (err) {
            console.log("request");
            console.log(err);
          }
          for (_i = 0, _len = rows.length; _i < _len; _i++) {
            table = rows[_i];
            ennemi.push(table);
          }
          return callback(ennemi);
        };
      })(this));
    };

    Ennemi.prototype.getEnnemi = function(id) {
      var table, _i, _len, _ref;
      _ref = this.ennemi;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        table = _ref[_i];
        if (table.id_ennemie === id) {
          return table;
        }
      }
    };

    return Ennemi;

  })();

  Score = (function() {
    function Score() {
      this.initScore();
      this.getScroreEnnemi((function(_this) {
        return function(exp) {
          return _this.exp = exp;
        };
      })(this));
    }

    Score.prototype.initScore = function() {
      return this.GlobalScore = 0;
    };

    Score.prototype.addScrore = function(type) {
      var table, _i, _len, _ref, _results;
      _ref = this.exp;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        table = _ref[_i];
        if (table.id === type) {
          _results.push(this.GlobalScore = this.GlobalScore + table.exp);
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    Score.prototype.getScroreEnnemi = function(callback) {
      var arrayExp;
      arrayExp = [];
      return connection.query('select * from ennemie', [], (function(_this) {
        return function(err, rows) {
          var exp, _i, _len;
          if (err) {
            console.log("request");
            console.log(err);
          }
          for (_i = 0, _len = rows.length; _i < _len; _i++) {
            exp = rows[_i];
            arrayExp.push({
              id: exp.id_ennemie,
              exp: exp.exp
            });
          }
          return callback(arrayExp);
        };
      })(this));
    };

    Score.prototype.getScore = function() {
      return this.GlobalScore;
    };

    return Score;

  })();

  levelone = (function() {
    function levelone() {
      this.finalScore = 10000;
      this.partie1();
      this.ennemi = new Ennemi();
    }

    levelone.prototype.getXY = function() {
      return [Math.floor((Math.random() * 1080) + 1), Math.floor((Math.random() * 1080) + 1)];
    };

    levelone.prototype.partie1 = function() {
      var partie, passage;
      passage = 0;
      return partie = setInterval((function(_this) {
        return function() {
          var XY, j, player, random, x, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _m, _n, _results;
          random = Math.floor((Math.random() * 10) + 1);
          if (random < 5) {
            XY = _this.getXY();
            for (_i = 0, _len = players.length; _i < _len; _i++) {
              player = players[_i];
              player.socket.sendText(JSON.stringify({
                opcode: 9,
                ennemi: _this.ennemi.getEnnemi(1),
                x: XY[0],
                y: XY[1]
              }));
            }
          }
          if (random > 7) {
            XY = _this.getXY();
            for (_j = 0, _len1 = players.length; _j < _len1; _j++) {
              player = players[_j];
              player.socket.sendText(JSON.stringify({
                opcode: 9,
                ennemi: _this.ennemi.getEnnemi(2),
                x: XY[0],
                y: XY[1]
              }));
            }
          }
          if (random < 2) {
            XY = _this.getXY();
            for (_k = 0, _len2 = players.length; _k < _len2; _k++) {
              player = players[_k];
              player.socket.sendText(JSON.stringify({
                opcode: 9,
                ennemi: _this.ennemi.getEnnemi(3),
                x: XY[0],
                y: XY[1]
              }));
            }
          }
          if (random === 10) {
            passage++;
            if (passage > 30) {
              passage = 0;
              for (j = _l = 1; _l <= 10; j = ++_l) {
                x = j * 101;
                for (_m = 0, _len3 = players.length; _m < _len3; _m++) {
                  player = players[_m];
                  player.socket.sendText(JSON.stringify({
                    opcode: 9,
                    ennemi: _this.ennemi.getEnnemi(3),
                    x: x,
                    y: 0
                  }));
                }
              }
            }
          }
          if (score.getScore() > _this.finalScore) {
            console.log("fin");
            clearInterval(partie);
            _results = [];
            for (_n = 0, _len4 = players.length; _n < _len4; _n++) {
              player = players[_n];
              _results.push(player.socket.sendText(JSON.stringify({
                opcode: 13,
                partie: "DEMO"
              })));
            }
            return _results;
          }
        };
      })(this), 200);
    };

    return levelone;

  })();

  app = new Application();

  score = new Score();

}).call(this);

(function() {


}).call(this);
