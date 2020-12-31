import { addDefinitiveEffectTextLineToConsole } from "/js/utils.js";

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
        this.sprite.src = this.spritePath;
    }

    move(x, y, pathLength) {
        this.x = x;
        this.y = y;
        this.PM = this.PM - pathLength; // should have a check for PM < 0!
    }

    tileWithinActionRange(x, y, action) {
        var distanceX = Math.abs(this.x - x);
        var distanceY = Math.abs(this.y - y);
        // below function should be in action.js? to take into account: entity bonus PO
        if (action.rangeType == "diamond") {
            if (action.minPO <= distanceX + distanceY && distanceX + distanceY <= action.maxPO) {
                return true;
            }
        } else if (action.rangeType == "cross") {
            if (
                (distanceX == 0 && action.minPO <= distanceY && distanceY <= action.maxPO) ||
                (distanceY == 0 && action.minPO <= distanceX && distanceX <= action.maxPO)
            ) {
                return true;
            }
        } else if (action.rangeType == "circle") {
            if (
                Math.pow(action.minPO, 2) <= Math.pow(distanceX, 2) + Math.pow(distanceY, 2) &&
                Math.pow(distanceX, 2) + Math.pow(distanceY, 2) <= Math.pow(action.maxPO, 2)
            ) {
                return true;
            }
        }
        // TO DO: square
        return false;
    }

    setPointsAsBasePoints() {
        this.PV = this.basePV;
        this.PA = this.basePA;
        this.PM = this.basePM;
        this.PO = this.basePO;
    }

    restorePMAndPA() {
        this.PM = this.basePM;
        this.PA = this.basePA;
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
        var index = this.effects.indexOf(effect);
        this.effects.splice(index, 1);
        console.log("Removed effect", effect, "from entity");
    }

    applyDefinitiveEffect(effect) {
        this.basePV = Math.max(this.basePV + effect.deltaPV, 0);
        this.basePM = Math.max(this.basePM + effect.deltaPM, 0);
        this.basePA = Math.max(this.basePA + effect.deltaPA, 0);
        this.basePO = Math.max(this.basePO + effect.deltaPO, 0);
        addDefinitiveEffectTextLineToConsole(effect, this.name);
    }

    applyTemporaryEffect(effect) {
        this.PV = Math.max(this.PV + effect.deltaPV, 0);
        this.PM = Math.max(this.PM + effect.deltaPM, 0);
        this.PA = Math.max(this.PA + effect.deltaPA, 0);
        this.PO = Math.max(this.PO + effect.deltaPO, 0);
    }

    applyEffect(effect) {
        if (effect.type == "temporary") {
            this.applyTemporaryEffect(effect);
        } else if (effect.type == "definitive") {
            this.applyDefinitiveEffect(effect);
            this.setPointsAsBasePoints();
        }
    }

    applyDefinitiveEffects() {
        var effectsToRemove = [];
        for (var i = 0; i < this.effects.length; i++) {
            if (this.effects[i].type == "definitive") {
                this.applyDefinitiveEffect(this.effects[i]);
            }
        }
        this.setPointsAsBasePoints();
    }

    applyTemporaryEffects() {
        this.setPointsAsBasePoints();
        for (var i = 0; i < this.effects.length; i++) {
            if (this.effects[i].type == "temporary") {
                this.applyTemporaryEffect(this.effects[i]);
            }
        }
    }

    reduceEffectsDurationAndRemoveFinishedEffects() {
        var effectsToRemove = [];
        for (var i = 0; i < this.effects.length; i++) {
            this.effects[i].duration--;
            if (this.effects[i].duration + 1 <= 0) {
                effectsToRemove.push(this.effects[i]);
            }
        }
        for (var i = 0; i < effectsToRemove.length; i++) {
            this.removeEffect(effectsToRemove[i]);
        }
    }

    updateEffects() {
        this.reduceEffectsDurationAndRemoveFinishedEffects();
        this.applyDefinitiveEffects();
        this.applyTemporaryEffects();
    }
}
