(function() {
  var Ennemi;

  Ennemi = (function() {
    function Ennemi() {
      this.generate((function(_this) {
        return function(table) {
          return _this.ennemi = table;
        };
      })(this));
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
      return app.getConnection().query('select * from ennemie, arme where ennemie.id_arme=arme.id_arme', [], (function(_this) {
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

  global.Ennemi = Ennemi;

}).call(this);

(function() {
  var Exp;

  Exp = (function() {
    function Exp(id, callback) {
      app.getConnection().query('select * from users WHERE id=?', [id], (function(_this) {
        return function(err, rows) {
          if (err) {
            console.log("request exp");
            console.log(err);
          }
          if (rows.length !== 0) {
            return callback(rows[0]);
          } else {
            return callback({
              id: null,
              name: "anonyme",
              level: 1,
              exp: 0,
              password: null
            });
          }
        };
      })(this));
    }

    return Exp;

  })();

  global.Exp = Exp;

}).call(this);

(function() {
  var Game;

  Game = (function() {
    function Game() {}

    Game.prototype.getXY = function() {
      return [Math.floor((Math.random() * 1080) + 1), Math.floor((Math.random() * 1080) + 1)];
    };

    Game.prototype.sendAllPlayer = function(json) {
      var player, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = players.length; _i < _len; _i++) {
        player = players[_i];
        _results.push(player.socket.sendText(JSON.stringify(json)));
      }
      return _results;
    };

    Game.prototype.getfinalScore = function() {
      return this.finalScore;
    };

    Game.prototype.setfinalScore = function(nb) {
      score.initScore();
      return this.finalScore = nb;
    };

    Game.prototype.getRandomNumber = function() {
      return Math.floor((Math.random() * 10) + 1);
    };

    return Game;

  })();

  global.Game = Game;

}).call(this);

(function() {
  var Score;

  Score = (function() {
    function Score() {
      this.initScore();
      this.getScoreEnnemi((function(_this) {
        return function(exp) {
          return _this.exp = exp;
        };
      })(this));
    }

    Score.prototype.initScore = function() {
      return this.GlobalScore = 0;
    };

    Score.prototype.SuprScore = function(nb) {
      if (this.GlobalScore > nb) {
        return this.GlobalScore - nb;
      } else {
        return this.GlobalScore = 0;
      }
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

    Score.prototype.getExpEnnemi = function(type) {
      var table, _i, _len, _ref;
      _ref = this.exp;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        table = _ref[_i];
        if (table.id === type) {
          return table.exp;
        }
      }
      return 0;
    };

    Score.prototype.getScoreEnnemi = function(callback) {
      var arrayExp;
      arrayExp = [];
      return app.getConnection().query('select * from ennemie', [], (function(_this) {
        return function(err, rows) {
          var exp, _i, _len;
          if (err) {
            console.log("request score");
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

  global.Score = Score;

}).call(this);

(function() {
  var Application, mysql, ws;

  mysql = require('mysql');

  ws = require("nodejs-websocket");

  Application = (function() {
    function Application() {
      console.log("Init");
      this.connection = {};
      this.StartTCP();
    }

    Application.prototype.StartTCP = function() {
      var server;
      this.setupDatabase("kingoloto");
      server = ws.createServer(function(conn) {
        console.log('New connection');
        return players.push(new Player(conn, -1));
      }).listen(3000);
      return process.on('uncaughtException', function(err) {
        return console.error(err.stack);
      });
    };

    Application.prototype.setupDatabase = function(base) {
      this.connection = mysql.createConnection({
        host: '5.196.69.227',
        user: 'romain',
        password: "ntm93"
      });
      console.log("database connected : '" + base + "'");
      return this.connection.query("USE " + base);
    };

    Application.prototype.getConnection = function() {
      return this.connection;
    };

    return Application;

  })();

  global.Application = Application;

  setTimeout(function() {
    var app, nbjoueurs, players, score;
    nbjoueurs = 0;
    players = new Array();
    app = new Application();
    global.app = app;
    score = new Score();
    global.nbjoueurs = nbjoueurs;
    global.score = score;
    return global.players = players;
  }, 200);

}).call(this);

(function() {
  var bonusShop;

  bonusShop = (function() {
    function bonusShop(id, callback) {
      app.getConnection().query('select * from shop where id_users=?', [id], (function(_this) {
        return function(err, rows) {
          if (rows.length !== 0) {
            return callback(rows[0]);
          } else {
            return callback({
              bonus_arme: 0
            });
          }
        };
      })(this));
    }

    bonusShop.prototype.deletBonus = function(id) {
      return app.getConnection().query('');
    };

    return bonusShop;

  })();

  global.bonusShop = bonusShop;

}).call(this);

(function() {
  var gestToken;

  gestToken = (function() {
    function gestToken(token) {
      this.token = token;
    }

    gestToken.prototype.getId = function(id, callback) {
      return app.getConnection().query('select * from users where token=?', [this.token], (function(_this) {
        return function(err, rows) {
          if (rows.length === 0) {
            return callback("nok");
          } else {
            return callback(rows[0].id);
          }
        };
      })(this));
    };

    return gestToken;

  })();

  global.gestToken = gestToken;

}).call(this);

(function() {
  var Player;

  Player = (function() {
    function Player(socket, id) {
      var err;
      this.socket = socket;
      this.id = id;
      this.life = 100;
      this.master = false;
      this.exp = {};
      this.bonus = [];
      try {
        this.socket.sendText(JSON.stringify({
          opcode: 1
        }));
        this.close(this.socket);
        this.text(this.socket, this.id);
        this.ennemi;
        if (players.length === 0) {
          score.initScore();
          new LevelOne();
        }
      } catch (_error) {
        err = _error;
        console.log("constructor");
        console.log(err);
      }
    }

    Player.prototype.save = function(exp, bonus) {
      console.log("save");
      app.getConnection().query("UPDATE  `kingoloto`.`users` SET  `level` =  '" + exp.level + "' WHERE  `users`.`id` =" + exp.id);
      app.getConnection().query("UPDATE  `kingoloto`.`users` SET  `exp` =  '" + exp.exp + "' WHERE  `users`.`id` =" + exp.id);
      return app.getConnection().query("UPDATE  `kingoloto`.`shop` SET  `bonus_arme` =  '" + bonus.bonus_arme + "' WHERE  `id_users` = " + exp.id);
    };

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
                _this.save(player.exp, player.bonus);
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
          var err, gesttoken, json, player, playerDead, _i, _j, _k, _l, _len, _len1, _len2, _len3, _len4, _len5, _m, _n, _results, _results1, _results2, _results3, _results4;
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
                if (player.id === _this.id) {
                  player.exp.exp = player.exp.exp + score.getExpEnnemi(json.type);
                  player.socket.sendText(JSON.stringify({
                    opcode: 12,
                    score: score.getScore(),
                    exp: player.exp.exp,
                    level: player.exp.level,
                    maxexp: 4000 / 1.9 * player.exp.level,
                    bonus_arme: player.bonus.bonus_arme
                  }));
                  if (player.exp.exp > 4000 / 1.9 * player.exp.level) {
                    player.exp.level = player.exp.level + 1;
                    player.exp.exp = 0;
                    _results.push(player.socket.sendText(JSON.stringify({
                      opcode: 13,
                      partie: "Level UP<br />level " + player.exp.level,
                      color: "green"
                    })));
                  } else {
                    _results.push(void 0);
                  }
                } else {
                  _results.push(void 0);
                }
              }
              return _results;
              break;
            case 10:
              playerDead = {
                dead: false
              };
              for (_j = 0, _len1 = players.length; _j < _len1; _j++) {
                player = players[_j];
                if (player.id === json.id) {
                  if (json.type === 8) {
                    player.socket.sendText(JSON.stringify({
                      opcode: 22,
                      arme: 2,
                      Mseconde: 2000
                    }));
                  } else {
                    player.life = player.life - 5;
                  }
                  if (player.life < 0) {
                    player.life = 0;
                  }
                  player.socket.sendText(JSON.stringify({
                    opcode: 10,
                    id: player.id,
                    life: player.life,
                    dead: false
                  }));
                  if (player.life === 0) {
                    playerDead = player;
                    playerDead.dead = true;
                    player.life = 100;
                    player.socket.sendText(JSON.stringify({
                      opcode: 10,
                      id: player.id,
                      life: player.life,
                      dead: true
                    }));
                  }
                }
              }
              if (playerDead.dead) {
                score.SuprScore(1000);
                _results1 = [];
                for (_k = 0, _len2 = players.length; _k < _len2; _k++) {
                  player = players[_k];
                  if (player.id === playerDead.id) {
                    player.socket.sendText(JSON.stringify({
                      opcode: 13,
                      partie: "Mort <br /> -1000 points",
                      color: "red"
                    }));
                  }
                  _results1.push(player.socket.sendText(JSON.stringify({
                    opcode: 20,
                    playerDead: playerDead.id
                  })));
                }
                return _results1;
              }
              break;
            case 6:
              try {
                _results2 = [];
                for (_l = 0, _len3 = players.length; _l < _len3; _l++) {
                  player = players[_l];
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
                gesttoken = new gestToken(json.token);
                return gesttoken.getId("", function(id) {
                  var _len4, _len5, _m, _n;
                  _this.id = id;
                  for (_m = 0, _len4 = players.length; _m < _len4; _m++) {
                    player = players[_m];
                    if (player.id !== _this.id) {
                      player.socket.sendText(JSON.stringify({
                        opcode: 3,
                        id: _this.id
                      }));
                    }
                    if (player.id === _this.id) {
                      player.socket.sendText(JSON.stringify({
                        opcode: 2,
                        token: json.token,
                        id: _this.id
                      }));
                      if (_this.id === "nok") {
                        player.exp = {
                          exp: 0,
                          level: 1
                        };
                        player.bonus = {
                          bonus_arme: 0
                        };
                        player.socket.sendText(JSON.stringify({
                          opcode: 21,
                          exp: player.exp.exp,
                          maxexp: 4000 / 1.9 * player.exp.level,
                          level: player.exp.level,
                          score: score.getScore(),
                          bonus_arme: player.bonus.bonus_arme
                        }));
                      } else {
                        new Exp(_this.id, function(rows) {
                          var BonusShop;
                          BonusShop = new bonusShop(_this.id);
                          return new bonusShop(_this.id, function(rowsBonus) {
                            player.exp = rows;
                            player.bonus = rowsBonus;
                            return player.socket.sendText(JSON.stringify({
                              opcode: 21,
                              exp: player.exp.exp,
                              maxexp: 4000 / 1.9 * player.exp.level,
                              level: player.exp.level,
                              score: score.getScore(),
                              bonus_arme: player.bonus.bonus_arme
                            }));
                          });
                        });
                      }
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
                  for (_n = 0, _len5 = players.length; _n < _len5; _n++) {
                    player = players[_n];
                    if (player.id !== _this.id) {
                      _this.socket.sendText(JSON.stringify({
                        opcode: 3,
                        id: player.id
                      }));
                    }
                  }
                  return console.log("Player " + _this.id + " connected !");
                });
              } catch (_error) {
                err = _error;
                console.log("connection player");
                return console.log(err);
              }
              break;
            case 4:
              try {
                _results3 = [];
                for (_m = 0, _len4 = players.length; _m < _len4; _m++) {
                  player = players[_m];
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
              break;
            case 30:
              _results4 = [];
              for (_n = 0, _len5 = players.length; _n < _len5; _n++) {
                player = players[_n];
                if (player.id === _this.id) {
                  if (player.bonus.bonus_arme !== 0) {
                    player.bonus.bonus_arme = player.bonus.bonus_arme - 1;
                    player.socket.sendText(JSON.stringify({
                      opcode: 31,
                      milli: 5000,
                      arme_bonus: 2
                    }));
                  }
                  _results4.push(player.socket.sendText(JSON.stringify({
                    opcode: 12,
                    score: score.getScore(),
                    exp: player.exp.exp,
                    level: player.exp.level,
                    maxexp: 4000 / 1.9 * player.exp.level,
                    bonus_arme: player.bonus.bonus_arme
                  })));
                } else {
                  _results4.push(void 0);
                }
              }
              return _results4;
          }
        };
      })(this));
    };

    return Player;

  })();

  global.Player = Player;

}).call(this);

(function() {
  var LevelOneBoss,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LevelOneBoss = (function(_super) {
    __extends(LevelOneBoss, _super);

    function LevelOneBoss() {
      this.setfinalScore(10000);
      this.ennemi = new Ennemi();
      setTimeout((function(_this) {
        return function() {
          return _this.start();
        };
      })(this), 200);
    }

    LevelOneBoss.prototype.levelTwo = function() {
      return setTimeout((function(_this) {
        return function() {
          score.initScore();
          _this.sendAllPlayer({
            opcode: 13,
            partie: "Reinit !",
            color: "green"
          });
          _this.sendAllPlayer({
            opcode: 25,
            boss: false
          });
          return new LevelOne();
        };
      })(this), 5000);
    };

    LevelOneBoss.prototype.start = function() {
      var XY, boss;
      console.log("boss generate");
      XY = this.getXY();
      boss = this.ennemi.getEnnemi(4);
      boss.life = boss.life * players.length;
      this.sendAllPlayer({
        opcode: 9,
        ennemi: boss,
        x: XY[0],
        y: XY[1]
      });
      return boss = setInterval((function(_this) {
        return function() {
          if (score.getScore() >= _this.getfinalScore()) {
            console.log("terminate");
            _this.sendAllPlayer({
              opcode: 13,
              partie: "Level 1 terminé",
              color: "green"
            });
            _this.sendAllPlayer({
              opcode: 25,
              boss: false
            });
            clearInterval(boss);
            return _this.levelTwo();
          }
        };
      })(this), 200);
    };

    return LevelOneBoss;

  })(Game);

  global.LevelOneBoss = LevelOneBoss;

}).call(this);

(function() {
  var LevelTwo,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LevelTwo = (function(_super) {
    __extends(LevelTwo, _super);

    function LevelTwo() {
      this.setfinalScore(2000);
      this.ennemi = new Ennemi();
      this.start();
    }

    LevelTwo.prototype.Boss = function() {};

    LevelTwo.prototype.start = function() {
      var start;
      return start = setInterval((function(_this) {
        return function() {
          var XY, random;
          random = _this.getRandomNumber();
          XY = _this.getXY();
          if (random < 2) {
            _this.sendAllPlayer({
              opcode: 9,
              ennemi: _this.ennemi.getEnnemi(6),
              x: XY[0],
              y: XY[1]
            });
          }
          if (score.getScore() > _this.getfinalScore()) {
            return clearInterval(start);
          }
        };
      })(this), 200);
    };

    return LevelTwo;

  })(Game);

  global.LevelTwo = LevelTwo;

}).call(this);

(function() {
  var LevelOne,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  LevelOne = (function(_super) {
    __extends(LevelOne, _super);

    function LevelOne() {
      this.setfinalScore(10000);
      this.ennemi = new Ennemi();
      console.log(score.getScore());
      this.start();
    }

    LevelOne.prototype.Boss = function() {
      return new LevelOneBoss();
    };

    LevelOne.prototype.start = function() {
      var partie, passage;
      passage = 0;
      return partie = setInterval((function(_this) {
        return function() {
          var XY, j, player, random, x, _i, _j, _len;
          if (players.length === 0) {
            clearInterval(partie);
          }
          random = _this.getRandomNumber();
          if (random < 5) {
            XY = _this.getXY();
            _this.sendAllPlayer({
              opcode: 9,
              ennemi: _this.ennemi.getEnnemi(1),
              x: XY[0],
              y: XY[1]
            });
          }
          if (random > 8) {
            XY = _this.getXY();
            _this.sendAllPlayer({
              opcode: 9,
              ennemi: _this.ennemi.getEnnemi(2),
              x: XY[0],
              y: XY[1]
            });
          }
          if (random < 2) {
            XY = _this.getXY();
            _this.sendAllPlayer({
              opcode: 9,
              ennemi: _this.ennemi.getEnnemi(3),
              x: XY[0],
              y: XY[1]
            });
          }
          if (random === 10) {
            passage++;
            if (passage === 20) {
              console.log("bonus");
              XY = _this.getXY();
              _this.sendAllPlayer({
                opcode: 9,
                ennemi: _this.ennemi.getEnnemi(8),
                x: XY[0],
                y: XY[1]
              });
            }
            if (passage > 30) {
              passage = 0;
              for (j = _i = 1; _i <= 15; j = ++_i) {
                x = j * 101;
                for (_j = 0, _len = players.length; _j < _len; _j++) {
                  player = players[_j];
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
          if (score.getScore() > _this.getfinalScore()) {
            console.log("Boss");
            clearInterval(partie);
            _this.sendAllPlayer({
              opcode: 13,
              partie: "Boss level 1",
              color: "red"
            });
            _this.sendAllPlayer({
              opcode: 25,
              boss: true
            });
            return _this.Boss();
          }
        };
      })(this), 500);
    };

    return LevelOne;

  })(Game);

  global.LevelOne = LevelOne;

}).call(this);
