export class IdSequence {
    #last;

    constructor(start = 0) {
        this.#last = start;
    }

    next() {
        this.#last += 1;
        return this.#last;
    }

    reserve(id) {
        if (Number.isInteger(id) && id > this.#last) {
            this.#last = id;
        }
    }
}