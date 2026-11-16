import { IdSequence } from "./id-sequence.js";
import { ValidationError, requireText } from "./validation.js";

export class User {
    static #ids = new IdSequence();

    #id;
    #name;
    #email;
    #role;

    constructor({ id, name, email, role = "Member" }) {
        this.#id = id === undefined ? User.generateId() : id;
        User.#ids.reserve(this.#id);
        this.name = name;
        this.email = email;
        this.#role = requireText(role, "Role", { max: 30 });
    }

    static generateId() {
        return User.#ids.next();
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        this.#name = requireText(value, "Name", { min: 2, max: 50 });
    }

    get email() {
        return this.#email;
    }

    set email(value) {
        const email = requireText(value, "Email", { max: 80 });

        if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
            throw new ValidationError("Email is not valid.");
        }

        this.#email = email;
    }

    get role() {
        return this.#role;
    }

    get initials() {
        const parts = this.#name.split(" ").filter((part) => part !== "");
        const first = parts[0][0];
        const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

        return `${first}${last}`.toUpperCase();
    }
}