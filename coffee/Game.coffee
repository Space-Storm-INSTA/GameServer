class Game
  getXY: () ->
    return [Math.floor((Math.random() * 1080) + 1), Math.floor((Math.random() * 1080) + 1)]
global.Game = Game
