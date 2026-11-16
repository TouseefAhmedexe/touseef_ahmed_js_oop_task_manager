import { requireElement } from "./dom.js";
import { renderDetails } from "./render-details.js";
import { reportError } from "./toast.js";

export class DetailsPanel {
    #service;
    #callbacks;
    #container;
    #title;
    #entry;

    constructor(service, callbacks) {
        this.handleClick = this.handleClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.#service = service;
        this.#callbacks = callbacks;
        this.#container = requireElement("details-content");
        this.#title = requireElement("details-title");
        this.#container.addEventListener("click", this.handleClick);
        this.#container.addEventListener("submit", this.handleSubmit);
    }

    render(entry, today) {
        this.#entry = entry;
        renderDetails(this.#container, entry, today);
    }

    focus() {
        this.#title.focus();
        this.#title.scrollIntoView({ block: "nearest" });
    }

    handleClick(event) {
        const button = event.target.closest("[data-action]");

        if (button === null || this.#entry === undefined) {
            return;
        }

        const { project, task } = this.#entry;
        const action = button.dataset.action;

        if (action === "edit") {
            this.#callbacks.onEdit(this.#entry);
            return;
        }

        if (action === "delete") {
            this.#callbacks.onDelete(this.#entry);
            return;
        }

        try {
            this.#runAction(action, project.id, task.id, button);
        } catch (error) {
            reportError(error);
            return;
        }

        this.#restoreFocus(action);
    }

    handleSubmit(event) {
        event.preventDefault();

        const form = event.target.closest("form[data-form]");

        if (form === null || this.#entry === undefined) {
            return;
        }

        const { project, task } = this.#entry;
        const data = new FormData(form);

        try {
            this.#runForm(form.dataset.form, project.id, task.id, data);
        } catch (error) {
            reportError(error);
            return;
        }

        this.#restoreFocus("");
    }

    #runAction(action, projectId, taskId, button) {
        switch (action) {
            case "start":
                this.#service.startTask(projectId, taskId);
                break;
            case "complete":
                this.#service.completeTask(projectId, taskId);
                break;
            case "reopen":
                this.#service.reopenTask(projectId, taskId);
                break;
            case "duplicate":
                this.#service.duplicateTask(projectId, taskId);
                break;
            case "unassign":
                this.#service.unassignTask(projectId, taskId, Number(button.dataset.userId));
                break;
            default:
                break;
        }
    }

    #runForm(formName, projectId, taskId, data) {
        switch (formName) {
            case "assign":
                this.#service.assignTask(projectId, taskId, Number(data.get("userId")));
                break;
            case "comment":
                this.#service.addComment(projectId, taskId, data.get("text"));
                break;
            case "attachment": {
                const file = data.get("file");

                this.#service.addAttachment(projectId, taskId, {
                    fileName: file.name,
                    sizeKb: Math.max(1, Math.round(file.size / 1024))
                });
                break;
            }
            default:
                break;
        }
    }

    #restoreFocus(action) {
        const target = this.#container.querySelector(`[data-action="${action}"]:not(:disabled)`);

        (target ?? this.#title).focus();
    }
}