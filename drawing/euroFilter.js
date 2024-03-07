export default class OneEuroFilter {
    constructor(freq, minCutoff = 1.0, beta = 0.0, dCutoff = 1.0) {
        this.freq = freq;
        this.minCutoff = minCutoff;
        this.beta = beta;
        this.dCutoff = dCutoff;
        this.x = new LowPassFilter(this.alpha(minCutoff));
        this.dx = new LowPassFilter(this.alpha(dCutoff));
        this.lastTime = undefined;
    }

    alpha(cutoff) {
        const tau = 1.0 / (2 * Math.PI * cutoff);
        const result = 1.0 / (1.0 + (tau * this.freq));
        return result;
    }

    filter(value, timestamp) {
        if (this.lastTime === undefined) {
            this.lastTime = timestamp;
            this.x.filter(value, this.alpha(this.minCutoff)); // Initialize the filter with the first value
            return value;
        }

        const dt = (timestamp - this.lastTime) / 1000;

        if (dt <= 0) {
            return value; // Consider how to handle this case in your application
        }

        this.freq = 1.0 / dt;
        this.lastTime = timestamp;

        const dValue = (value - this.x.lastRawValue) / dt;
        const edValue = this.dx.filter(dValue, this.alpha(this.dCutoff));
        const cutoff = this.minCutoff + this.beta * Math.abs(edValue);

        return this.x.filter(value, this.alpha(cutoff));
    }
}

class LowPassFilter {
    constructor(alpha, initValue = 0) {
        this.alpha = alpha;
        this._lastValue = initValue; // Use a private field
        this._lastRawValue = initValue; // Use a private field for raw value
        this.hasLastValue = true; // Assume initial value is valid
    }

    filter(value, alpha) {
        if (alpha !== null) {
            this.alpha = alpha;
        }
        const filteredValue = this.hasLastValue ? ((value * this.alpha) + (this._lastValue * (1.0 - this.alpha))) : value;
        this.lastRawValue = value; // This will now call the setter
        this._lastValue = filteredValue;
        this.hasLastValue = true;
        return filteredValue;
    }

    get lastRawValue() {
        return this._lastRawValue;
    }

    set lastRawValue(value) {
        this._lastRawValue = value;
    }
}