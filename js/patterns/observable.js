export class Observable {
    #listeners = [];

    subscribe(listener) {
        if (typeof listener !== "function") {
            throw new TypeError("A listener must be a function.");
        }

        this.#listeners.push(listener);

        return () => {
            this.#listeners = this.#listeners.filter((item) => item !== listener);
        };
    }

    notify(change) {
        this.#listeners.forEach((listener) => listener(change));
    }
}