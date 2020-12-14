export class Entity {
    constructor(x, y, name, isPlayer, spritePath, basePV, basePA, basePM, basePO, actions) {
        this.x = x;
        this.y = y;
        this.name = name;
        this.isPlayer = isPlayer;
        this.spritePath = spritePath;
        this.basePV = basePV;
        this.basePA = basePA;
        this.basePM = basePM;
        this.actions = actions;

        this.initialPV = basePV;
        this.initialPA = basePA;
        this.initialPM = basePM;
        this.initialPO = basePO;

        // base = without effects
        this.basePV = basePV;
        this.basePA = basePA;
        this.basePM = basePM;
        this.basePO = basePO; // delta value applied to the actions max PO
        this.setPointsAsBasePoints();

        this.effects = [];
        this.sprite = new Image();
        this.sprite.src = this.spritePath
    }

    setPointsAsBasePoints() {
        this.PV = this.basePV;
        this.PA = this.basePA;
        this.PM = this.basePM;
        this.PO = this.basePO;
    }

    addEffect(effect) {
        if (!effect.allowMultiple && this.effects.includes(effect)) {
            console.log("Error: effect", effect, "is already applied on entity");
        } else {
            this.effects.push(effect);
            console.log("Effect", effect, "was applied on entity");
        }
    }

    removeEffect(effect) {
        var index = this.effects.indexOf(effect)
        this.effects.splice(index, 1); // remove effect
        console.log("Removed effect", effect, "from entity");
    }

    applyDefinitiveEffects(nextTurn) {
        var effectsToRemove = [];
        for (var i = 0; i < this.effects.length; i++) {
            if (this.effects[i].type == "definitive") {
                this.basePV = Math.max(this.basePV + this.effects[i].deltaPV, 0);
                this.basePM = Math.max(this.basePM + this.effects[i].deltaPM, 0);
                this.basePA = Math.max(this.basePA + this.effects[i].deltaPA, 0);
                this.basePO = Math.max(this.basePO + this.effects[i].deltaPO, 0);

                // if effect duration is over, remove it
                if (nextTurn) {
                    this.effects[i].duration--;
                    if (this.effects[i].duration == 0) {
                        effectsToRemove.push(this.effects[i]);
                    }
                    this.setPointsAsBasePoints();
                }
            }
        }
        for (var i = 0; i < effectsToRemove.length; i++) {
            this.removeEffect(effectsToRemove[i]);
        }
    }

    applyTemporaryEffects(nextTurn) {
        var effectsToRemove = [];
        this.setPointsAsBasePoints();
        for (var i = 0; i < this.effects.length; i++) {
            if (this.effects[i].type == "temporary") {
                this.PV = Math.max(this.PV + this.effects[i].deltaPV, 0);
                this.PM = Math.max(this.PM + this.effects[i].deltaPM, 0);
                this.PA = Math.max(this.PA + this.effects[i].deltaPA, 0);
                this.PO = Math.max(this.PO + this.effects[i].deltaPO, 0);

                // if effect duration is over, remove it
                if (nextTurn) {
                    this.effects[i].duration--;
                    if (this.effects[i].duration == 0) {
                        effectsToRemove.push(this.effects[i]);
                    }
                }
            }
        }
        for (var i = 0; i < effectsToRemove.length; i++) {
            this.removeEffect(effectsToRemove[i]);
        }
    }
}
