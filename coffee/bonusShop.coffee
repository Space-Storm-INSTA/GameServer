class bonusShop
  constructor: (id, callback) ->
    app.getConnection().query 'select * from shop where id_users=?', [id], (err, rows) =>
      if rows.length isnt 0
        callback rows[0]
      else
        callback {bonus_arme:0}
global.bonusShop = bonusShop
