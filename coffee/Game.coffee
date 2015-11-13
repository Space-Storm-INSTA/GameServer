class Game
  getXY: () ->
    return [Math.floor((Math.random() * 1080) + 1), Math.floor((Math.random() * 1080) + 1)]
  sendAllPlayer: (json) ->
    for player in players
        player.socket.sendText JSON.stringify (json)
  getfinalScore: () ->
    return @finalScore
  setfinalScore: (nb) ->
    score.initScore()
    @finalScore = nb
  getRandomNumber: () ->
    return Math.floor((Math.random() * 10) + 1)
global.Game = Game
