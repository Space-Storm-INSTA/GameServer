class Exp
  constructor: (id, callback) ->
    app.getConnection().query 'select * from users WHERE id=?', [id], (err, rows) =>
      if err
        console.log "request exp"
        console.log err
      if rows.length isnt 0
        callback rows[0]
      else
        callback {id:null, name:"anonyme", level:1, exp:0, password:null}
global.Exp = Exp
