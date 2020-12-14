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
    getRandomArbitrary(min, max) {
      return Math.random() * (max - min) + min;
    }

    sample_delta(delta) {
        if (typeof(delta) == Array) {
            return this.getRandomArbitrary(delta[0], delta[delta.length - 1]);
        }
        else {
            return delta;
        }
    }

    sample_deltas() {
        if (this.probability >= Math.random()) {
            //return [this.sample_delta(this.deltaPV),
            //       this.sample_delta(this.deltaPM),
            //       this.sample_delta(this.deltaPA),
            //       this.sample_delta(this.deltaPO)];
            this.deltaPV = this.sample_delta(this.deltaPV); // sampling won't work right now, we need a new Effect object for every new effect
            this.deltaPM = this.sample_delta(this.deltaPM);
            this.deltaPA = this.sample_delta(this.deltaPA);
            this.deltaPO = this.sample_delta(this.deltaPO);
            }
        else {
            //return 0, 0, 0, 0;
            this.deltaPV = 0;
            this.deltaPM = 0;
            this.deltaPA = 0;
            this.deltaPO = 0;
        }
    }
}
