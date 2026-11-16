import { ActivityLog } from "./activity-log.js";
import { IdSequence } from "./id-sequence.js";
import { Task } from "./task.js";
import { User } from "./user.js";
import { ValidationError, optionalText, requireDate, requireInstance, requireNumber, requireOneOf, requireText } from "./validation.js";

export class Project {
    static STATUSES = Object.freeze(["Planning", "Active", "Completed"]);
    static #ids = new IdSequence();

    #id;
    #title;
    #description;
    #startDate;
    #dueDate;
    #status;
    #config;
    #members = [];
    #tasks = [];
    #log = new ActivityLog();

    constructor({ id, title, description = "", startDate, dueDate, status = "Planning", maxTasks = 12 }) {
        this.#id = id === undefined ? Project.generateId() : id;
        Project.#ids.reserve(this.#id);
        this.title = title;
        this.description = description;
        this.#startDate = requireDate(startDate, "Start date");
        this.#dueDate = requireDate(dueDate, "Due date");
        this.#status = requireOneOf(status, Project.STATUSES, "Status");
        this.#config = Object.freeze({
            maxTasks: requireNumber(maxTasks, "Maximum tasks", { min: 1, max: 50, integer: true })
        });

        if (this.#dueDate < this.#startDate) {
            throw new ValidationError("The project due date cannot be before the start date.");
        }

        this.#log.add("Project created");
    }

    static generateId() {
        return Project.#ids.next();
    }

    get id() {
        return this.#id;
    }

    get title() {
        return this.#title;
    }

    set title(value) {
        this.#title = requireText(value, "Project title", { min: 3, max: 80 });
    }

    get description() {
        return this.#description;
    }

    set description(value) {
        this.#description = optionalText(value, "Project description", 300);
    }

    get startDate() {
        return this.#startDate;
    }

    get dueDate() {
        return this.#dueDate;
    }

    get status() {
        return this.#status;
    }

    get maxTasks() {
        return this.#config.maxTasks;
    }

    getMembers() {
        return [...this.#members];
    }

    hasMember(userId) {
        return this.#members.some((user) => user.id === userId);
    }

    addMember(user, actor = null) {
        requireInstance(user, User, "Member");

        if (this.hasMember(user.id)) {
            throw new ValidationError(`${user.name} is already a member of this project.`);
        }

        this.#members.push(user);
        this.#log.add(`Added ${user.name} to the project`, actor);
    }

    getTasks() {
        return [...this.#tasks];
    }

    getTask(taskId) {
        return this.#tasks.find((task) => task.id === taskId);
    }

    #requireTask(taskId) {
        const task = this.getTask(taskId);

        if (task === undefined) {
            throw new ValidationError("That task could not be found.");
        }

        return task;
    }

    addTask(task, actor = null) {
        requireInstance(task, Task, "Task");

        if (this.#tasks.length >= this.#config.maxTasks) {
            throw new ValidationError(`This project can have at most ${this.#config.maxTasks} tasks.`);
        }

        if (this.getTask(task.id) !== undefined) {
            throw new ValidationError("A task with this id already exists.");
        }

        this.#tasks.push(task);
        this.#log.add(`Added the task "${task.title}"`, actor);
        return task;
    }

    updateTask(taskId, changes, actor = null) {
        const task = this.#requireTask(taskId);

        task.update(changes, actor);
        return task;
    }

    deleteTask(taskId, actor = null) {
        const task = this.#requireTask(taskId);

        if (task.status === "In progress") {
            throw new ValidationError("A task in progress cannot be deleted. Complete it first.");
        }

        this.#tasks = this.#tasks.filter((item) => item.id !== taskId);
        this.#log.add(`Deleted the task "${task.title}"`, actor);
        return task;
    }

    assignTask(taskId, userId, actor = null) {
        const task = this.#requireTask(taskId);
        const user = this.#members.find((member) => member.id === userId);

        if (user === undefined) {
            throw new ValidationError("Only project members can be assigned to its tasks.");
        }

        task.assign(user, actor);
        return user;
    }

    unassignTask(taskId, userId, actor = null) {
        const task = this.#requireTask(taskId);

        task.unassign(userId, actor);
        return task;
    }

    startTask(taskId, actor = null) {
        const task = this.#requireTask(taskId);

        task.start(actor);
        return task;
    }

    completeTask(taskId, actor = null) {
        const task = this.#requireTask(taskId);

        task.complete(actor);
        return task;
    }

    reopenTask(taskId, actor = null) {
        const task = this.#requireTask(taskId);

        task.reopen(actor);
        return task;
    }

    getSummary(today) {
        return Task.summarize(this.#tasks, today);
    }

    getHistory() {
        return this.#log.getEntries();
    }
}