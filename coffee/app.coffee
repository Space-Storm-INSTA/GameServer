mysql          = require 'mysql'
ws             = require "nodejs-websocket"

players = new Array()

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
            master = true
        players.splice players.indexOf(@), 1
        console.log 'Connection closed'
        if master
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
        when 10
          for player in players
            if player.id is json.id
              #console.log "players :#{player.id} touché !"
              player.life = player.life - 20
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
    ).listen(3000)

    ennemi = new Ennemi @connection

    process.on 'uncaughtException', (err) ->
      console.error err.stack

  setupDatabase: (base) ->
    @connection = mysql.createConnection {
      socketPath : '/Applications/MAMP/tmp/mysql/mysql.sock',
      user       : 'root',
      password   : 'root'
    }
    console.log "database connected : '#{base}'"
    @connection.query "USE #{base}"

class Ennemi
  constructor: (@connection) ->
    setInterval =>
      try
        random = Math.floor((Math.random() * 10) + 1)
        if random is 10
          id = 3
        else
          id = Math.floor((Math.random() * 2) + 1)
        x = Math.floor((Math.random() * 1080) + 1)
        y = Math.floor((Math.random() * 1080) + 1)
        @generate id, (rows) =>
          for player in players
            player.socket.sendText JSON.stringify ({
              opcode:9
              ennemi:rows
              x: x
              y: y
            })
      catch err
        console.log "ennemi"
        console.log err
    , 200
  generate: (id, callback) ->
    @connection.query 'select * from ennemie, arme where ennemie.id_arme=arme.id_arme AND ennemie.id_ennemie = ?', [id], (err, rows) =>
      if err
        console.log "request"
        console.log err
      callback rows[0]


app = new Application()
