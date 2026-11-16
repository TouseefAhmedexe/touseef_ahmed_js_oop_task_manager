export class ActivityLog {
    #entries = [];

    add(message, actor = null) {
        const entry = Object.freeze({
            message,
            actorName: actor === null ? "System" : actor.name,
            at: new Date().toISOString()
        });

        this.#entries.push(entry);
        return entry;
    }

    getEntries() {
        return [...this.#entries].reverse();
    }

    get size() {
        return this.#entries.length;
    }
}