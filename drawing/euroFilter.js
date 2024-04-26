export default class OneEuroFilter {
    constructor(freq, minCutoff = 1.0, beta = 0.0, dCutoff = 1.0, deadZoneFactor = 1) {
        this.freq = freq;
        this.minCutoff = minCutoff;
        this.beta = beta;
        this.dCutoff = dCutoff;
        this.deadZoneFactor = deadZoneFactor; // Relative dead zone factor
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
            this.x.filter(value, this.alpha(this.minCutoff)); // Initialize with the first value
            return value;
        }

        const dt = (timestamp - this.lastTime) / 1000;
        if (dt <= 0) {
            return value; // If timestamps are not increasing, just return the value
        }

        this.freq = 1.0 / dt;
        this.lastTime = timestamp;

        const dValue = (value - this.x.lastRawValue) / dt;
        const edValue = this.dx.filter(dValue, this.alpha(this.dCutoff));
        const cutoff = this.minCutoff + this.beta * Math.abs(edValue);

        let filteredValue = this.x.filter(value, this.alpha(cutoff));
        const deadZone = this.deadZoneFactor * Math.abs(this.x.lastFilteredValue);

        if (Math.abs(filteredValue - this.x.lastFilteredValue) < deadZone) {
            filteredValue = this.x.lastFilteredValue; // If within dead zone, use last filtered value
        }

        return filteredValue;
    }
}

class LowPassFilter {
    constructor(alpha, initValue = 0) {
        this.alpha = alpha;
        this._lastValue = initValue;
        this._lastRawValue = initValue;
        this.hasLastValue = false;
    }

    filter(value, alpha = null) {
        if (alpha !== null) {
            this.alpha = alpha;
        }

        if (!this.hasLastValue) {
            this._lastValue = value;
            this._lastRawValue = value;
            this.hasLastValue = true;
            return value;
        }

        const filteredValue = (value * this.alpha) + (this._lastValue * (1.0 - this.alpha));
        this._lastRawValue = value;
        this._lastValue = filteredValue;
        return filteredValue;
    }

    get lastFilteredValue() {
        return this._lastValue;
    }

    set lastRawValue(value) {
        this._lastRawValue = value;
    }

    get lastRawValue() {
        return this._lastRawValue;
    }
}
