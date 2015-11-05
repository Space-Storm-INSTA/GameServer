class Ennemi
  constructor: () ->
    @generate (table) =>
      @ennemi = table
  getRandom: (pourcentage) ->
    random = Math.floor(((Math.random() * 100) + 1))
    if random <= (pourcentage * nbjoueurs) and random isnt 0
      return true
    return false
  generate: (callback) ->
    ennemi = []
    app.getConnection().query 'select * from ennemie, arme where ennemie.id_arme=arme.id_arme', [], (err, rows) =>
      if err
        console.log "request"
        console.log err
      for table in rows
        ennemi.push table
      callback ennemi
  getEnnemi: (id) ->
    for table in @ennemi
      if table.id_ennemie is id
        return table

global.Ennemi = Ennemi
