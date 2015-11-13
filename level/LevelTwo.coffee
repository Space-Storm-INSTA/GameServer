class LevelTwo extends Game
  constructor: () ->
    @setfinalScore 2000
    @ennemi = new Ennemi()
    score.initScore()
    console.log score.getScore()
    @start()
    Boss: () ->
      #boss
    start: () ->
      start = setInterval ->
        
        if score.getScore() > @getfinalScore()
          clearInterval start
      , 200
