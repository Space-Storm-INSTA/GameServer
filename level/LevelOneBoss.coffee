class LevelOneBoss extends Game
  constructor: () ->
    @setfinalScore 1000
    @ennemi = new Ennemi()
    setTimeout =>
      @start()
    , 200
  levelTwo: () ->
    setTimeout =>
      score.initScore()
      @sendAllPlayer {
        opcode: 13
        partie: "Reinit !"
        color: "green"
      }
      @sendAllPlayer {
        opcode: 25
        boss:false
      }
      new Levelone()
    , 5000
  start: () ->
    console.log "boss generate"
    XY = @getXY()
    boss = @ennemi.getEnnemi 4
    boss.life = boss.life * players.length
    @sendAllPlayer {
      opcode:9
      ennemi:boss
      x: XY[0]
      y: XY[1]
    }
    boss = setInterval =>
      if score.getScore() >= @getfinalScore()
        console.log "terminate"
        @sendAllPlayer {
          opcode: 13
          partie: "Level 1 terminé"
          color: "green"
        }
        @sendAllPlayer {
          opcode: 25
          boss:false
        }
        clearInterval boss

        @levelTwo()
    , 200
global.LevelOneBoss = LevelOneBoss
