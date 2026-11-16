import { IdSequence } from "./id-sequence.js";
import { User } from "./user.js";
import { requireDateTime, requireInstance, requireText } from "./validation.js";

export class Comment {
    static #ids = new IdSequence();

    #id;
    #author;
    #text;
    #createdAt;

    constructor({ id, author, text, createdAt = new Date().toISOString() }) {
        this.#id = id === undefined ? Comment.generateId() : id;
        Comment.#ids.reserve(this.#id);
        this.#author = requireInstance(author, User, "Comment author");
        this.#text = requireText(text, "Comment", { max: 300 });
        this.#createdAt = requireDateTime(createdAt, "Comment time");
    }

    static generateId() {
        return Comment.#ids.next();
    }

    get id() {
        return this.#id;
    }

    get author() {
        return this.#author;
    }

    get text() {
        return this.#text;
    }

    get createdAt() {
        return this.#createdAt;
    }
}