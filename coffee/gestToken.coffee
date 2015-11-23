class gestToken
  constructor: (token) ->
    @token = token
  getId: (id, callback) ->
    app.getConnection().query 'select * from users where token=?', [@token], (err, rows) =>
      if rows.length is 0
        callback "nok"
      else
        callback rows[0].id
global.gestToken = gestToken
