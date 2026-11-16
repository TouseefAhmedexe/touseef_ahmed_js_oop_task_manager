import { Task } from "../models/task.js";
import { ValidationError } from "../models/validation.js";
import { TaskFactory } from "../patterns/task-factory.js";
import { addDaysIso } from "../shared/dates.js";
import { fillSelect, makeElement, requireElement } from "./dom.js";

const DEFAULT_DUE_DAYS = 7;

export class TaskDialog {
    #service;
    #elements;
    #mode = "create";
    #entry;

    constructor(service) {
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTypeChange = this.handleTypeChange.bind(this);
        this.handleProjectChange = this.handleProjectChange.bind(this);

        this.#service = service;
        this.#elements = {
            dialog: requireElement("task-dialog"),
            form: requireElement("task-form"),
            heading: requireElement("task-dialog-title"),
            project: requireElement("form-project"),
            type: requireElement("form-type"),
            titleInput: requireElement("form-title"),
            description: requireElement("form-description"),
            priority: requireElement("form-priority"),
            due: requireElement("form-due"),
            hours: requireElement("form-hours"),
            detailField: requireElement("detail-field"),
            detailLabel: requireElement("detail-label"),
            detail: requireElement("form-detail"),
            assigneeFieldset: requireElement("assignee-fieldset"),
            assigneeOptions: requireElement("assignee-options"),
            error: requireElement("form-error"),
            submit: requireElement("form-submit"),
            cancel: requireElement("form-cancel")
        };

        this.#bindEvents();
    }

    open(mode, entry, defaultProjectId = "all") {
        const el = this.#elements;
        const isEdit = mode === "edit";
        const projects = this.#service.getProjects();
        const projectValue = defaultProjectId === "all" ? String(projects[0].id) : defaultProjectId;

        this.#mode = mode;
        this.#entry = entry;
        el.form.reset();
        el.error.textContent = "";
        el.heading.textContent = isEdit ? "Edit task" : "New task";
        el.submit.textContent = isEdit ? "Save changes" : "Add task";

        fillSelect(el.project, projects.map((project) => ({ value: project.id, label: project.title })), isEdit ? String(entry.project.id) : projectValue);
        fillSelect(el.type, TaskFactory.options(), isEdit ? entry.task.type : "general");
        fillSelect(el.priority, Task.PRIORITIES.map((priority) => ({ value: priority, label: priority })), isEdit ? entry.task.priority : "Medium");

        el.project.disabled = isEdit;
        el.type.disabled = isEdit;
        el.assigneeFieldset.hidden = isEdit;
        this.#updateDetailField();

        if (isEdit) {
            const { task } = entry;

            el.titleInput.value = task.title;
            el.description.value = task.description;
            el.due.value = task.dueDate;
            el.hours.value = String(task.estimatedHours);
            el.detail.value = String(task.detail);
        } else {
            el.due.value = addDaysIso(DEFAULT_DUE_DAYS);
            this.#renderAssigneeOptions(Number(el.project.value));
        }

        el.dialog.showModal();
    }

    handleTypeChange() {
        this.#elements.detail.value = "";
        this.#updateDetailField();
    }

    handleProjectChange() {
        this.#renderAssigneeOptions(Number(this.#elements.project.value));
    }

    handleSubmit(event) {
        event.preventDefault();

        const el = this.#elements;
        const data = new FormData(el.form);
        const values = {
            title: data.get("title"),
            description: data.get("description"),
            priority: data.get("priority"),
            dueDate: data.get("dueDate"),
            estimatedHours: data.get("estimatedHours"),
            detail: data.get("detail")
        };

        try {
            if (this.#mode === "edit") {
                this.#service.updateTask(this.#entry.project.id, this.#entry.task.id, values);
            } else {
                const assigneeIds = data.getAll("assignees").map(Number);

                this.#service.createTask(Number(data.get("project")), { ...values, type: data.get("type") }, assigneeIds);
            }

            el.dialog.close();
        } catch (error) {
            this.#showError(error);
        }
    }

    #bindEvents() {
        const { dialog, form, type, project, cancel } = this.#elements;

        form.addEventListener("submit", this.handleSubmit);
        type.addEventListener("change", this.handleTypeChange);
        project.addEventListener("change", this.handleProjectChange);
        cancel.addEventListener("click", () => dialog.close());
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) {
                dialog.close();
            }
        });
    }

    #updateDetailField() {
        const el = this.#elements;
        const info = TaskFactory.describe(el.type.value);

        if (info.detailLabel === "") {
            el.detailField.hidden = true;
            el.detail.value = "";
            return;
        }

        el.detailField.hidden = false;
        el.detailLabel.textContent = info.detailLabel;
        el.detail.type = info.detailKind === "number" ? "number" : "text";

        if (info.detailKind === "number") {
            el.detail.min = "0";
            el.detail.max = "500";
            el.detail.step = "1";
        } else {
            el.detail.removeAttribute("min");
            el.detail.removeAttribute("max");
            el.detail.removeAttribute("step");
        }
    }

    #renderAssigneeOptions(projectId) {
        const container = this.#elements.assigneeOptions;
        const project = this.#service.getProject(projectId);

        container.textContent = "";

        if (project === undefined) {
            return;
        }

        project.getMembers().forEach((member) => {
            const label = makeElement("label", "check");
            const checkbox = document.createElement("input");

            checkbox.type = "checkbox";
            checkbox.name = "assignees";
            checkbox.value = String(member.id);
            label.append(checkbox, `${member.name} (${member.role})`);
            container.append(label);
        });
    }

    #showError(error) {
        if (error instanceof ValidationError) {
            this.#elements.error.textContent = error.message;
            return;
        }

        throw error;
    }
}