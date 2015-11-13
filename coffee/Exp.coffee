class Exp
  constructor: (id) ->
    @getScoreEnnemi id, (exp) =>
      console.log exp
      exp_player = exp
  getScoreEnnemi: (id) ->
    console.log id
    app.getConnection().query 'select * from users WHERE id=?', [id], (err, rows) =>
      if err
        console.log "request exp"
        console.log err
      console.log rows
      callback rows.exp
global.Exp = Exp
