mysql          = require 'mysql'
ws             = require "nodejs-websocket"


class Application
  constructor : ->
    console.log "Init"
    @connection = {}
    @StartTCP()
  StartTCP: ->
    #Meoooww
    @setupDatabase "kingoloto"
    #Meoooooowwww
    server = ws.createServer((conn) ->
      console.log 'New connection'
      players.push new Player(conn, -1)
    ).listen(3001)

    process.on 'uncaughtException', (err) ->
      console.error err.stack
  setupDatabase: (base) ->
    @connection = mysql.createConnection {
      host : 'localhost',
      user       : 'root',
      password   : "nicolas95"
    }
    console.log "database connected : '#{base}'"
    @connection.query "USE #{base}"
  getConnection: () ->
    return @connection
global.Application = Application

setTimeout ->
  nbjoueurs = 0
  players = new Array()
  app = new Application()
  global.app = app
  score = new Score()

  global.nbjoueurs = nbjoueurs
  global.score = score
  global.players = players
, 200
