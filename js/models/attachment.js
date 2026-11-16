import { IdSequence } from "./id-sequence.js";
import { User } from "./user.js";
import { requireDateTime, requireInstance, requireNumber, requireText } from "./validation.js";

export class Attachment {
    static #ids = new IdSequence();

    #id;
    #fileName;
    #sizeKb;
    #addedBy;
    #addedAt;

    constructor({ id, fileName, sizeKb, addedBy, addedAt = new Date().toISOString() }) {
        this.#id = id === undefined ? Attachment.generateId() : id;
        Attachment.#ids.reserve(this.#id);
        this.#fileName = requireText(fileName, "File name", { max: 120 });
        this.#sizeKb = requireNumber(sizeKb, "File size", { min: 1, max: 1000000, integer: true });
        this.#addedBy = requireInstance(addedBy, User, "Attachment owner");
        this.#addedAt = requireDateTime(addedAt, "Attachment time");
    }

    static generateId() {
        return Attachment.#ids.next();
    }

    get id() {
        return this.#id;
    }

    get fileName() {
        return this.#fileName;
    }

    get sizeKb() {
        return this.#sizeKb;
    }

    get addedBy() {
        return this.#addedBy;
    }

    get addedAt() {
        return this.#addedAt;
    }
}