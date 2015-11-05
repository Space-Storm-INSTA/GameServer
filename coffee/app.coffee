mysql          = require 'mysql'
ws             = require "nodejs-websocket"

players = new Array()
nbjoueurs = 0
connection = {}

class Player
  constructor: (@socket, @id) ->
    @life = 100
    @master = false
    try
      @socket.sendText JSON.stringify ({
        opcode: 1
      })
      @close @socket
      @text @socket, @id
      @ennemi
    catch err
      console.log "constructor"
      console.log err
  close: (@socket) ->
    try
      @socket.on 'close', (code, reason) =>
        master = false
        for player in players
          if player.id isnt @id
            player.socket.sendText JSON.stringify ({
              opcode: 5
              id: @id
            })
          if player.id is @id
            #moeeww on regarde si la personne qui va etre delet est le master de la partie
            master = true
        players.splice players.indexOf(@), 1
        console.log "Connection closed for #{@id}"
        if master and players.length > 0
          #Moeeewww on renvoie un packet pour redefinir le master
          players[0].master = true
          player.socket.sendText JSON.stringify ({
            opcode: 0
            id: players[0].id
            master:players[0].master
          })
          console.log "Master changed (#{players[0].id})"
        if players.length is 0
          score.initScore()
    catch err
      console.log "close"
      console.log err

  text: (@socket, @id) ->
    @socket.on 'text', (str) =>
      try
        json = JSON.parse str
      catch err
        console.log "json : #{err}"
      switch json.opcode
        when 11
          score.addScrore json.type
          console.log score.getScore()
          for player in players
            player.socket.sendText JSON.stringify ({
              opcode: 12
              score:score.getScore()
            })
        when 10
          #life
          for player in players
            if player.id is json.id
              #console.log "players :#{player.id} touché !"
              #Life
              player.life = player.life - 5
              if player.life < 0
                player.life = 0
              player.socket.sendText JSON.stringify ({
                opcode: 10
                id:player.id
                life:player.life
              })
        when 6
          #missile
          try
            for player in players
              if player.id isnt @id
                player.socket.sendText JSON.stringify ({
                  opcode: 7
                  id: @id
                  type:json.type
                  x: json.position.x
                  y: json.position.y
                  offset: {x:json.offset.x, y:json.offset.y}
                })
          catch err
            console.log "missile"
            console.log err

        when 2
          #connection player
          try
            @id = json.id
            for player in players
              if player.id isnt @id
                player.socket.sendText JSON.stringify ({
                  opcode: 3
                  id: @id
                })

            if players.length is 1
              player.master = true
              player.socket.sendText JSON.stringify ({
                opcode: 0
                id: @id
                master:true
              })

            for player in players
              if player.id isnt @id
                @socket.sendText JSON.stringify ({
                  opcode: 3
                  id: player.id
                })

            console.log "Player #{@id} connected !"
          catch err
            console.log "connection player"
            console.log err
        when 4
          #position
          try
            for player in players
              if player.id isnt @id
                player.socket.sendText JSON.stringify ({
                  opcode: 4
                  id: @id
                  x: json.position.x
                  y: json.position.y
                })
          catch err
            console.log "position"
            console.log err

class Application
  constructor : ->
    console.log "Init"
    @StartTCP()
  StartTCP: ->
    #Meoooww
    @setupDatabase "kingoloto"
    #Meoooooowwww
    server = ws.createServer((conn) ->
      console.log 'New connection'
      players.push new Player(conn, -1)
    ).listen(3001)

    new levelone()

    process.on 'uncaughtException', (err) ->
      console.error err.stack
  setupDatabase: (base) ->
    connection = mysql.createConnection {
      host : 'localhost',
      user       : 'root',
      password   : 'yfful95df'
    }
    console.log "database connected : '#{base}'"
    connection.query "USE #{base}"
class Ennemi
  constructor: () ->
    @generate (table) =>
      @ennemi = table
    ###setInterval =>
      try
        nbjoueurs = players.length
        random = Math.floor((Math.random() * 100) + 1)
        if @getRandom 20
          #console.log "generate vert"
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
          #console.log "generate red"
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
    , 200###
  getRandom: (pourcentage) ->
    random = Math.floor(((Math.random() * 100) + 1))
    if random <= (pourcentage * nbjoueurs) and random isnt 0
      return true
    return false
  generate: (callback) ->
    ennemi = []
    connection.query 'select * from ennemie, arme where ennemie.id_arme=arme.id_arme', [], (err, rows) =>
      if err
        console.log "request"
        console.log err
      for table in rows
        ennemi.push table
      callback ennemi
  getEnnemi: (id) ->
    for table in @ennemi
      if table.id_ennemie is id
        return table
class Score
  constructor: () ->
    @initScore()
    @getScroreEnnemi (exp) =>
       @exp = exp
  initScore: () ->
    @GlobalScore = 0
  addScrore: (type) ->
    for table in @exp
      if table.id is type
        @GlobalScore = @GlobalScore + table.exp
  getScroreEnnemi: (callback) ->
    arrayExp = []
    connection.query 'select * from ennemie', [], (err, rows) =>
      if err
        console.log "request"
        console.log err
      for exp in rows
        arrayExp.push {id:exp.id_ennemie, exp:exp.exp}
      callback arrayExp
  getScore: () ->
    return @GlobalScore

class levelone
  constructor: () ->
    @finalScore = 10000
    @partie1()
    @ennemi = new Ennemi()
  getXY: () ->
    return [Math.floor((Math.random() * 1080) + 1), Math.floor((Math.random() * 1080) + 1)]
  partie1: () ->
    passage = 0
    partie = setInterval =>
      random = Math.floor((Math.random() * 10) + 1)
      if random < 5
        XY = @getXY()
        for player in players
          player.socket.sendText JSON.stringify ({
            opcode:9
            ennemi:@ennemi.getEnnemi 1
            x: XY[0]
            y: XY[1]
          })
      if random > 7
        XY = @getXY()
        for player in players
          player.socket.sendText JSON.stringify ({
            opcode:9
            ennemi:@ennemi.getEnnemi 2
            x: XY[0]
            y: XY[1]
          })
      if random < 2
        XY = @getXY()
        for player in players
          player.socket.sendText JSON.stringify ({
            opcode:9
            ennemi:@ennemi.getEnnemi 3
            x: XY[0]
            y: XY[1]
          })
      if random is 10
        passage++
        if passage > 30
          passage = 0
          for j in [1..10]
            x = j * 101
            for player in players
              player.socket.sendText JSON.stringify ({
                opcode:9
                ennemi:@ennemi.getEnnemi 3
                x: x
                y: 0
              })
      if score.getScore() > @finalScore
        console.log "fin"
        clearInterval partie
        for player in players
          player.socket.sendText JSON.stringify ({
            opcode:13
            partie: "DEMO"
          })
    , 200
app = new Application()
score = new Score()
