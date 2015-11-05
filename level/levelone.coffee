class Levelone
  constructor: () ->
    @finalScore = 10000
    @ennemi = new Ennemi()
    score.initScore()
    console.log score.getScore()
    @partie1()
  getXY: () ->
    return [Math.floor((Math.random() * 1080) + 1), Math.floor((Math.random() * 1080) + 1)]
  Boss: () ->
    new LevelOneBoss()
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
      if random > 8
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
          for j in [1..15]
            x = j * 101
            for player in players
              player.socket.sendText JSON.stringify ({
                opcode:9
                ennemi:@ennemi.getEnnemi 3
                x: x
                y: 0
              })
      if score.getScore() > @finalScore
        console.log "Boss"
        clearInterval partie
        for player in players
          player.socket.sendText JSON.stringify ({
            opcode: 13
            partie: "Boss level 1"
            color: "red"
          })
          player.socket.sendText JSON.stringify ({
            opcode: 25
            boss:true
          })
        @Boss()
    , 200
global.Levelone = Levelone
