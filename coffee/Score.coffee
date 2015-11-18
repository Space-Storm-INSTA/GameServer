class Score
  constructor: () ->
    @initScore()
    @getScoreEnnemi (exp) =>
       @exp = exp
  initScore: () ->
    @GlobalScore = 0
  SuprScore: (nb) ->
    if @GlobalScore > nb
      @GlobalScore - nb
    else
      @GlobalScore = 0
  addScrore: (type) ->
    for table in @exp
      if table.id is type
        @GlobalScore = @GlobalScore + table.exp
  getExpEnnemi: (type) ->
    for table in @exp
      if table.id is type
        return table.exp
    return 0
  getScoreEnnemi: (callback) ->
    arrayExp = []
    app.getConnection().query 'select * from ennemie', [], (err, rows) =>
      if err
        console.log "request score"
        console.log err
      for exp in rows
        arrayExp.push {id:exp.id_ennemie, exp:exp.exp}
      callback arrayExp
  getScore: () ->
    return @GlobalScore

global.Score = Score
