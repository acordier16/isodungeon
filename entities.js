function Entity(x, y, name, isPlayer, spritePath, basePV, basePA, basePM) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.isPlayer = isPlayer;
        this.spritePath = spritePath;
        this.basePV = basePV;
        this.basePA = basePA;
        this.basePM = basePM;

        this.PV = basePV;
        this.PA = basePA;
        this.PM = basePM;

        this.draw = function() {
          var sprite = new Image();
          sprite.src = this.spritePath
          // to put out of Entity
          var offX = this.x * Isometric.tileColumnOffset / 2 + this.y * Isometric.tileColumnOffset / 2 + Isometric.originX + sprite.width / 2;
          var offY = this.y * Isometric.tileRowOffset / 2 - this.x * Isometric.tileRowOffset / 2 + Isometric.originY - sprite.height / 2 - Isometric.tileRowOffset/2;
          //
          Isometric.context.drawImage(sprite, offX, offY);
        }
}

