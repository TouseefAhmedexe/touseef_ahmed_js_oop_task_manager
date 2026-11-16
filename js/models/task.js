import { ActivityLog } from "./activity-log.js";
import { Attachment } from "./attachment.js";
import { Comment } from "./comment.js";
import { IdSequence } from "./id-sequence.js";
import { User } from "./user.js";
import { ValidationError, optionalText, requireDate, requireInstance, requireNumber, requireOneOf, requireText } from "./validation.js";

export class Task {
    static PRIORITIES = Object.freeze(["Low", "Medium", "High"]);
    static STATUSES = Object.freeze(["To do", "In progress", "Done"]);
    static typeKey = "general";
    static label = "General";
    static detailLabel = "";
    static detailKind = "text";
    static #ids = new IdSequence();

    #id;
    #title;
    #description;
    #priority;
    #status;
    #dueDate;
    #estimatedHours;
    #assignees = [];
    #comments = [];
    #attachments = [];
    #log = new ActivityLog();

    constructor({ id, title, description = "", priority = "Medium", status = "To do", dueDate, estimatedHours = 1 }) {
        this.#id = id === undefined ? Task.generateId() : id;
        Task.#ids.reserve(this.#id);
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.#status = requireOneOf(status, Task.STATUSES, "Status");
        this.dueDate = dueDate;
        this.estimatedHours = estimatedHours;
        this.#log.add("Task created");
    }

    static generateId() {
        return Task.#ids.next();
    }

    static priorityWeight(priority) {
        return Task.PRIORITIES.indexOf(priority) + 1;
    }

    static summarize(tasks, today) {
        const completed = tasks.filter((task) => task.status === "Done").length;
        const totalHours = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);

        return {
            total: tasks.length,
            completed,
            pending: tasks.length - completed,
            overdue: tasks.filter((task) => task.isOverdue(today)).length,
            totalHours: Math.round(totalHours * 10) / 10,
            percentComplete: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100)
        };
    }

    get id() {
        return this.#id;
    }

    get title() {
        return this.#title;
    }

    set title(value) {
        this.#title = requireText(value, "Title", { min: 3, max: 100 });
    }

    get description() {
        return this.#description;
    }

    set description(value) {
        this.#description = optionalText(value, "Description", 300);
    }

    get priority() {
        return this.#priority;
    }

    set priority(value) {
        this.#priority = requireOneOf(value, Task.PRIORITIES, "Priority");
    }

    get status() {
        return this.#status;
    }

    get dueDate() {
        return this.#dueDate;
    }

    set dueDate(value) {
        this.#dueDate = requireDate(value, "Due date");
    }

    get estimatedHours() {
        return this.#estimatedHours;
    }

    set estimatedHours(value) {
        this.#estimatedHours = requireNumber(value, "Estimated hours", { min: 0.5, max: 200 });
    }

    get type() {
        return this.constructor.typeKey;
    }

    get typeLabel() {
        return this.constructor.label;
    }

    get detailLabel() {
        return this.constructor.detailLabel;
    }

    get detail() {
        return "";
    }

    get assigneeCount() {
        return this.#assignees.length;
    }

    getAssignees() {
        return [...this.#assignees];
    }

    getComments() {
        return [...this.#comments];
    }

    getAttachments() {
        return [...this.#attachments];
    }

    getHistory() {
        return this.#log.getEntries();
    }

    getChecklist() {
        return ["Define the goal", "Do the work", "Review the result"];
    }

    isAssignedTo(userId) {
        return this.#assignees.some((user) => user.id === userId);
    }

    isOverdue(today) {
        return this.#status !== "Done" && this.#dueDate < today;
    }

    canComplete() {
        if (this.#status === "Done") {
            return { ok: false, reason: "The task is already completed." };
        }

        if (this.#assignees.length === 0) {
            return { ok: false, reason: "Assign at least one person before completing the task." };
        }

        return { ok: true, reason: "" };
    }

    assign(user, actor = null) {
        requireInstance(user, User, "Assignee");

        if (this.isAssignedTo(user.id)) {
            throw new ValidationError(`${user.name} is already assigned to this task.`);
        }

        this.#assignees.push(user);
        this.#log.add(`Assigned ${user.name}`, actor);
    }

    unassign(userId, actor = null) {
        const user = this.#assignees.find((item) => item.id === userId);

        if (user === undefined) {
            throw new ValidationError("That person is not assigned to this task.");
        }

        if (this.#status === "In progress" && this.#assignees.length === 1) {
            throw new ValidationError("A task in progress needs at least one assignee.");
        }

        this.#assignees = this.#assignees.filter((item) => item.id !== userId);
        this.#log.add(`Removed ${user.name}`, actor);
    }

    start(actor = null) {
        if (this.#status !== "To do") {
            throw new ValidationError("Only a task that is still to do can be started.");
        }

        if (this.#assignees.length === 0) {
            throw new ValidationError("Assign someone before starting the task.");
        }

        this.#status = "In progress";
        this.#log.add("Started the task", actor);
    }

    complete(actor = null) {
        const check = this.canComplete();

        if (!check.ok) {
            throw new ValidationError(check.reason);
        }

        this.#status = "Done";
        this.#log.add("Completed the task", actor);
    }

    reopen(actor = null) {
        if (this.#status !== "Done") {
            throw new ValidationError("Only a completed task can be reopened.");
        }

        if (this.#assignees.length === 0) {
            throw new ValidationError("Assign someone before reopening the task.");
        }

        this.#status = "In progress";
        this.#log.add("Reopened the task", actor);
    }

    update(changes, actor = null) {
        const before = {
            title: this.#title,
            description: this.#description,
            priority: this.#priority,
            dueDate: this.#dueDate,
            estimatedHours: this.#estimatedHours,
            detail: this.detail
        };
        const changed = [];

        try {
            ["title", "description", "priority", "dueDate", "estimatedHours"].forEach((field) => {
                if (field in changes) {
                    this[field] = changes[field];
                    changed.push(field);
                }
            });

            if ("detail" in changes && this.detailLabel !== "") {
                this.detail = changes.detail;
                changed.push("detail");
            }
        } catch (error) {
            this.#title = before.title;
            this.#description = before.description;
            this.#priority = before.priority;
            this.#dueDate = before.dueDate;
            this.#estimatedHours = before.estimatedHours;

            if (this.detailLabel !== "") {
                this.detail = before.detail;
            }

            throw error;
        }

        if (changed.length > 0) {
            this.#log.add(`Updated ${changed.join(", ")}`, actor);
        }

        return changed;
    }

    addComment(comment, actor = null) {
        requireInstance(comment, Comment, "Comment");
        this.#comments.push(comment);
        this.#log.add("Added a comment", actor ?? comment.author);
    }

    addAttachment(attachment, actor = null) {
        requireInstance(attachment, Attachment, "Attachment");
        this.#attachments.push(attachment);
        this.#log.add(`Attached ${attachment.fileName}`, actor ?? attachment.addedBy);
    }

    toData() {
        return {
            type: this.type,
            id: this.#id,
            title: this.#title,
            description: this.#description,
            priority: this.#priority,
            status: this.#status,
            dueDate: this.#dueDate,
            estimatedHours: this.#estimatedHours,
            detail: this.detail,
            assigneeIds: this.#assignees.map((user) => user.id)
        };
    }
}