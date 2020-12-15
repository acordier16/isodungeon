export class Action {
    constructor(name, costPA, rangeType, minPO, maxPO, effects) {
        this.name = name;
        this.costPA = costPA;
        this.rangeType = rangeType; // cross or diamond or circle or square
        this.minPO = minPO;
        this.maxPO = maxPO;
        this.effects = effects;
    }
}

export class Effect {
    constructor(type, duration, allowMultiple, probability, deltaPV, deltaPM, deltaPA, deltaPO) {
        this.type = type; //"temporary" or "definitive"
        this.duration = duration; // int (1 to ...)
        this.allowMultiple = allowMultiple; // true or false, allow this effect to be applied multiple times to a same entity
        this.probability = probability;
        this.deltaPV = deltaPV; // can be a range or an int
        this.deltaPM = deltaPM; // can be a range or an int
        this.deltaPA = deltaPA; // can be a range or an int
        this.deltaPO = deltaPO; // can be a range or an int
    }

    // to put in utils?
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    sample_delta(delta) {
        if (Array.isArray(delta)) {
            return this.getRandomInt(delta[0], delta[delta.length - 1]);
        } else {
            return delta;
        }
    }

    sample_deltas() {
        if (this.probability >= Math.random()) {
            this.deltaPV = this.sample_delta(this.deltaPV);
            this.deltaPM = this.sample_delta(this.deltaPM);
            this.deltaPA = this.sample_delta(this.deltaPA);
            this.deltaPO = this.sample_delta(this.deltaPO);
        } else {
            this.deltaPV = 0;
            this.deltaPM = 0;
            this.deltaPA = 0;
            this.deltaPO = 0;
        }
    }
}
