class Player
  constructor: (@socket, @id) ->
    @life = 100
    @master = false
    @exp = 0
    try
      @socket.sendText JSON.stringify ({
        opcode: 1
      })
      @close @socket
      @text @socket, @id
      @ennemi
      if players.length is 0
        #Démarrage du jeux.
        score.initScore()
        new LevelOne()
    catch err
      console.log "constructor"
      console.log err
  close: (@socket) ->
    try
      @socket.on 'close', (code, reason) =>
        master = false
        for player in players
          if player.id isnt @id
            player.socket.sendText JSON.stringify ({
              opcode: 5
              id: @id
            })
          if player.id is @id
            #moeeww on regarde si la personne qui va etre delet est le master de la partie
            master = true
        players.splice players.indexOf(@), 1
        console.log "Connection closed for #{@id}"
        if master and players.length > 0
          #Moeeewww on renvoie un packet pour redefinir le master
          players[0].master = true
          player.socket.sendText JSON.stringify ({
            opcode: 0
            id: players[0].id
            master:players[0].master
          })
          console.log "Master changed (#{players[0].id})"
        if players.length is 0
          score.initScore()
    catch err
      console.log "close"
      console.log err

  text: (@socket, @id) ->
    @socket.on 'text', (str) =>
      try
        json = JSON.parse str
      catch err
        console.log "json : #{err}"
      switch json.opcode
        when 11
          #Exp
          score.addScrore json.type
          console.log score.getScore()
          for player in players
            player.socket.sendText JSON.stringify ({
              opcode: 12
              score:score.getScore()
            })
        when 10
          #life
          playerDead = {dead:false}
          for player in players
            if player.id is json.id
              #Meooww
              player.life = player.life - 5
              if player.life < 0
                player.life = 0
              player.socket.sendText JSON.stringify ({
                opcode: 10
                id: player.id
                life: player.life
                dead: false
              })
              if player.life is 0
                playerDead = player
                playerDead.dead = true
                player.life = 100
                player.socket.sendText JSON.stringify ({
                  opcode: 10
                  id: player.id
                  life: player.life
                  dead: true
                })
          if playerDead.dead
            #On enleve 100 de score global si un joueur meurt
            score.SuprScore 100
            for player in players
              if player.id is playerDead.id
                player.socket.sendText JSON.stringify ({
                  opcode: 13
                  partie: "Mort <3"
                  color: "red"
                })
              player.socket.sendText JSON.stringify ({
                opcode: 20
                playerDead: playerDead.id
              })

        when 6
          #missile
          try
            for player in players
              if player.id isnt @id
                player.socket.sendText JSON.stringify ({
                  opcode: 7
                  id: @id
                  type:json.type
                  x: json.position.x
                  y: json.position.y
                  offset: {x:json.offset.x, y:json.offset.y}
                })
          catch err
            console.log "missile"
            console.log err

        when 2
          #connection player meooww
          try
            @id = json.id
            #new Exp @id
            for player in players
              if player.id isnt @id
                player.socket.sendText JSON.stringify ({
                  opcode: 3
                  id: @id
                })

            if players.length is 1
              player.master = true
              player.socket.sendText JSON.stringify ({
                opcode: 0
                id: @id
                master:true
              })

            for player in players
              if player.id isnt @id
                @socket.sendText JSON.stringify ({
                  opcode: 3
                  id: player.id
                })

            console.log "Player #{@id} connected !"
          catch err
            console.log "connection player"
            console.log err
        when 4
          #position
          try
            for player in players
              if player.id isnt @id
                player.socket.sendText JSON.stringify ({
                  opcode: 4
                  id: @id
                  x: json.position.x
                  y: json.position.y
                })
          catch err
            console.log "position"
            console.log err
global.Player = Player
