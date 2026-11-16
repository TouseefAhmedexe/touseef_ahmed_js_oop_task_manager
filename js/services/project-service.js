import { Attachment } from "../models/attachment.js";
import { Comment } from "../models/comment.js";
import { User } from "../models/user.js";
import { ValidationError, requireInstance } from "../models/validation.js";
import { Observable } from "../patterns/observable.js";
import { TaskFactory } from "../patterns/task-factory.js";

export class ProjectService extends Observable {
    #projects;
    #users;
    #currentUser;

    constructor({ projects, users, currentUser }) {
        super();
        this.#projects = [...projects];
        this.#users = [...users];
        this.#currentUser = requireInstance(currentUser, User, "Current user");
    }

    get currentUser() {
        return this.#currentUser;
    }

    getProjects() {
        return [...this.#projects];
    }

    getUsers() {
        return [...this.#users];
    }

    getProject(projectId) {
        return this.#projects.find((project) => project.id === projectId);
    }

    findEntry(projectId, taskId) {
        const project = this.getProject(projectId);
        const task = project === undefined ? undefined : project.getTask(taskId);

        return task === undefined ? undefined : { project, task };
    }

    #requireProject(projectId) {
        const project = this.getProject(projectId);

        if (project === undefined) {
            throw new ValidationError("That project could not be found.");
        }

        return project;
    }

    #requireTask(projectId, taskId) {
        const task = this.#requireProject(projectId).getTask(taskId);

        if (task === undefined) {
            throw new ValidationError("That task could not be found.");
        }

        return task;
    }

    #announce(type, projectId, taskId, message) {
        this.notify({ type, projectId, taskId, message });
    }

    createTask(projectId, data, assigneeIds = []) {
        const project = this.#requireProject(projectId);
        const task = TaskFactory.create(data);

        project.addTask(task, this.#currentUser);

        try {
            assigneeIds.forEach((userId) => project.assignTask(task.id, userId, this.#currentUser));
        } catch (error) {
            project.deleteTask(task.id, this.#currentUser);
            throw error;
        }

        this.#announce("task-added", projectId, task.id, `Added the task "${task.title}".`);
        return task;
    }

    updateTask(projectId, taskId, changes) {
        const task = this.#requireProject(projectId).updateTask(taskId, changes, this.#currentUser);

        this.#announce("task-updated", projectId, taskId, `Updated "${task.title}".`);
        return task;
    }

    deleteTask(projectId, taskId) {
        const task = this.#requireProject(projectId).deleteTask(taskId, this.#currentUser);

        this.#announce("task-deleted", projectId, taskId, `Deleted "${task.title}".`);
        return task;
    }

    startTask(projectId, taskId) {
        const task = this.#requireProject(projectId).startTask(taskId, this.#currentUser);

        this.#announce("task-started", projectId, taskId, `Started "${task.title}".`);
        return task;
    }

    completeTask(projectId, taskId) {
        const task = this.#requireProject(projectId).completeTask(taskId, this.#currentUser);

        this.#announce("task-completed", projectId, taskId, `Completed "${task.title}".`);
        return task;
    }

    reopenTask(projectId, taskId) {
        const task = this.#requireProject(projectId).reopenTask(taskId, this.#currentUser);

        this.#announce("task-reopened", projectId, taskId, `Reopened "${task.title}".`);
        return task;
    }

    assignTask(projectId, taskId, userId) {
        const user = this.#requireProject(projectId).assignTask(taskId, userId, this.#currentUser);
        const task = this.#requireTask(projectId, taskId);

        this.#announce("task-assigned", projectId, taskId, `Assigned ${user.name} to "${task.title}".`);
        return user;
    }

    unassignTask(projectId, taskId, userId) {
        const user = this.#users.find((item) => item.id === userId);
        const task = this.#requireProject(projectId).unassignTask(taskId, userId, this.#currentUser);

        this.#announce("task-unassigned", projectId, taskId, `Removed ${user.name} from "${task.title}".`);
        return task;
    }

    addComment(projectId, taskId, text) {
        const task = this.#requireTask(projectId, taskId);

        task.addComment(new Comment({ author: this.#currentUser, text }), this.#currentUser);
        this.#announce("comment-added", projectId, taskId, `Added a comment to "${task.title}".`);
        return task;
    }

    addAttachment(projectId, taskId, { fileName, sizeKb }) {
        const task = this.#requireTask(projectId, taskId);

        task.addAttachment(new Attachment({ fileName, sizeKb, addedBy: this.#currentUser }), this.#currentUser);
        this.#announce("attachment-added", projectId, taskId, `Attached ${fileName} to "${task.title}".`);
        return task;
    }

    duplicateTask(projectId, taskId) {
        const project = this.#requireProject(projectId);
        const original = this.#requireTask(projectId, taskId);
        const copy = TaskFactory.duplicate(original);

        project.addTask(copy, this.#currentUser);
        original.getAssignees().forEach((user) => project.assignTask(copy.id, user.id, this.#currentUser));
        this.#announce("task-duplicated", projectId, copy.id, `Duplicated "${original.title}".`);
        return copy;
    }
}