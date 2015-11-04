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

    ennemi = new Ennemi()

    process.on 'uncaughtException', (err) ->
      console.error err.stack
  setupDatabase: (base) ->
    connection = mysql.createConnection {
      socketPath : '/Applications/MAMP/tmp/mysql/mysql.sock',
      user       : 'root',
      password   : 'root'
    }
    console.log "database connected : '#{base}'"
    connection.query "USE #{base}"
class Ennemi
  constructor: () ->
    @generate (table) =>
      @ennemi = table
    setInterval =>
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
          #console.log "generate bomberman"
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
  BomberMan: ()->
    #0 - 1080
    console.log "nomber"
    for player in players
      for x in [0..30]
        x = 35 * x
        player.socket.sendText JSON.stringify ({
          opcode:9
          ennemi:@getEnnemi 3
          x: x
          y: 0
        })
  getRandom: (pourcentage) ->
    random = Math.floor(((Math.random() * 100) + 1))
    #console.log "#{random} <= #{pourcentage * nbjoueurs}"
    if random <= pourcentage * nbjoueurs and random isnt 0
      return true
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
    @GlobalScore = 0
    @getScrore (exp) =>
       @exp = exp
  addScrore: (type) ->
    for table in @exp
      if table.id is type
        console.log "#{table.id} et #{table.exp}"
        @GlobalScore = @GlobalScore + table.exp
  getScrore: (callback) ->
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

app = new Application()
score = new Score()
