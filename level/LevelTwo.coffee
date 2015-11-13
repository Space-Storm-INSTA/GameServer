class LevelTwo extends Game
  constructor: () ->
    @setfinalScore 2000
    @ennemi = new Ennemi()
    @start()
  Boss: () ->
    #boss
  start: () ->
    start = setInterval =>
      random = @getRandomNumber()
      XY = @getXY()
      if random < 2
        @sendAllPlayer {
          opcode:9
          ennemi:@ennemi.getEnnemi 6
          x: XY[0]
          y: XY[1]
        }
      if score.getScore() > @getfinalScore()
        clearInterval start
    , 200
#m.update gametime for m in @miscs when m?
global.LevelTwo = LevelTwo
