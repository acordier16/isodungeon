export class Entity {
    constructor(x, y, name, isPlayer, spritePath, basePV, basePA, basePM, actions) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.isPlayer = isPlayer;
        this.spritePath = spritePath;
        this.basePV = basePV;
        this.basePA = basePA;
        this.basePM = basePM;
        this.actions = actions;

        this.PV = basePV;
        this.PA = basePA;
        this.PM = basePM;
        this.sprite = new Image();
        this.sprite.src = this.spritePath
    }
}
