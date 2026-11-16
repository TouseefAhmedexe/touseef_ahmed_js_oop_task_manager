import { requireElement } from "./dom.js";
import { reportError } from "./toast.js";

export class DeleteDialog {
    #service;
    #dialog;
    #name;
    #confirm;
    #cancel;
    #entry;

    constructor(service) {
        this.handleConfirm = this.handleConfirm.bind(this);

        this.#service = service;
        this.#dialog = requireElement("delete-dialog");
        this.#name = requireElement("delete-name");
        this.#confirm = requireElement("delete-confirm");
        this.#cancel = requireElement("delete-cancel");

        this.#confirm.addEventListener("click", this.handleConfirm);
        this.#cancel.addEventListener("click", () => this.#dialog.close());
        this.#dialog.addEventListener("click", (event) => {
            if (event.target === this.#dialog) {
                this.#dialog.close();
            }
        });
    }

    open(entry) {
        this.#entry = entry;
        this.#name.textContent = entry.task.title;
        this.#dialog.showModal();
    }

    handleConfirm() {
        if (this.#entry === undefined) {
            return;
        }

        try {
            this.#service.deleteTask(this.#entry.project.id, this.#entry.task.id);
            this.#dialog.close();
        } catch (error) {
            this.#dialog.close();
            reportError(error);
        }
    }
}