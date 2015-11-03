mysql          = require 'mysql'
ws             = require "nodejs-websocket"

players = new Array()

class Player
  close: (@socket) ->
    @socket.on 'close', (code, reason) =>
      for player in players
        if player.id isnt @id
          player.socket.sendText JSON.stringify ({
            opcode: 5
            id: @id
          })
      players.splice players.indexOf(@), 1
      console.log 'Connection closed'
  text: (@socket, @id) ->
    @socket.on 'text', (str) =>
      json = JSON.parse str
      switch json.opcode
        when 6
          #missile
          for player in players
            if player.id isnt @id
              player.socket.sendText JSON.stringify ({
                opcode: 7
                id: @id
                type:json.type
                x: json.position.x
                y: json.position.y
              })

        when 2
          #connection player
          @id = json.id
          for player in players
            if player.id isnt @id
              player.socket.sendText JSON.stringify ({
                opcode: 3
                id: @id
              })

          for player in players
            if player.id isnt @id
              @socket.sendText JSON.stringify ({
                opcode: 3
                id: player.id
              })

          console.log "Player #{@id} connected !"
        when 4
          #position
          for player in players
            if player.id isnt @id
              player.socket.sendText JSON.stringify ({
                opcode: 4
                id: @id
                x: json.position.x
                y: json.position.y
              })

  constructor: (@socket, @id) ->
    @socket.sendText JSON.stringify ({
      opcode: 1
    })
    @close @socket
    @text @socket, @id
    @ennemi



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
    , 200
  generate: (id, callback) ->
    @connection.query 'select * from ennemie, arme where ennemie.id_arme=arme.id_arme AND ennemie.id_ennemie = ?', [id], (err, rows) =>
      callback rows[0]
###
'select level.id_level as "level", level.description as "level_description",
ennemie.id_ennemie as "ennemie", ennemie.description as "ennemie_description", ennemie.name as "ennemie_name",
ennemie.speed as "ennemie_speed", ennemie.life as "ennemie_life", arme.id_arme as "arme", arme.description as "arme_description",
arme.degats as "arme_degats", arme.speed as "arme_speed", level_generate.frame as "frame"
from level_generate, level, ennemie, arme
where level_generate.id_level=level.id_level and ennemie.id_ennemie=level_generate.id_ennemie and
ennemie.id_arme=arme.id_arme AND level.id_level = ?'
###

app = new Application()
