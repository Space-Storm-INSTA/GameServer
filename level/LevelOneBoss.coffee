class LevelOneBoss
  constructor: () ->
    @finalScore =  11000
    @ennemi = new Ennemi()
    setTimeout =>
      @start()
    , 200
  getXY: () ->
    return [Math.floor((Math.random() * 1080) + 1), Math.floor((Math.random() * 1080) + 1)]
  levelTwo: () ->
    setTimeout =>
      for player in players
        player.socket.sendText JSON.stringify ({
          opcode: 13
          partie: "Reinit !"
          color: "green"
        })
        player.socket.sendText JSON.stringify ({
          opcode: 25
          boss:false
        })
      new LevelOneBoss()
    , 5000
  start: () ->
    console.log "boss generate"
    XY = @getXY()
    for player in players
      boss = @ennemi.getEnnemi 4
      boss.life = boss.life * players.length
      player.socket.sendText JSON.stringify ({
        opcode:9
        ennemi:boss
        x: XY[0]
        y: XY[1]
      })
    boss = setInterval =>
      if score.getScore() >= @finalScore
        console.log "terminate"
        for player in players
          player.socket.sendText JSON.stringify ({
            opcode: 13
            partie: "Level 1 terminé"
            color: "green"
          })
          player.socket.sendText JSON.stringify ({
            opcode: 25
            boss:false
          })
        clearInterval boss

        #@levelTwo()
    , 200
global.LevelOneBoss = LevelOneBoss
