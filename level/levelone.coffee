class LevelOne extends Game
  constructor: () ->
    @setfinalScore 10000
    @ennemi = new Ennemi()
    console.log score.getScore()
    @start()
  Boss: () ->
    new LevelOneBoss()
  start: () ->
    passage = 0
    partie = setInterval =>
      random = @getRandomNumber()
      if random < 5
        XY = @getXY()
        @sendAllPlayer {
            opcode:9
            ennemi:@ennemi.getEnnemi 1
            x: XY[0]
            y: XY[1]
          }
      if random > 8
        XY = @getXY()
        @sendAllPlayer {
          opcode:9
          ennemi:@ennemi.getEnnemi 2
          x: XY[0]
          y: XY[1]
        }
      if random < 2
        XY = @getXY()
        @sendAllPlayer {
          opcode:9
          ennemi:@ennemi.getEnnemi 3
          x: XY[0]
          y: XY[1]
        }
      if random is 10
        passage++
        if passage is 20
          XY = @getXY()
          @sendAllPlayer {
              opcode:9
              ennemi:@ennemi.getEnnemi 8
              x: XY[0]
              y: XY[1]
            }
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
      if score.getScore() > @getfinalScore()
        console.log "Boss"
        clearInterval partie
        @sendAllPlayer {
            opcode: 13
            partie: "Boss level 1"
            color: "red"
          }
        @sendAllPlayer {
          opcode: 25
          boss:true
        }
        @Boss()
    , 200
global.LevelOne = LevelOne
