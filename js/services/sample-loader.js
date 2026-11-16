import { sampleData } from "../../data/sample-data.js";
import { Attachment } from "../models/attachment.js";
import { Comment } from "../models/comment.js";
import { Project } from "../models/project.js";
import { User } from "../models/user.js";
import { TaskFactory } from "../patterns/task-factory.js";
import { ProjectService } from "./project-service.js";

function addSampleTask(project, record, findUser) {
    const { status, assigneeIds = [], comments = [], attachments = [], ...taskData } = record;
    const task = project.addTask(TaskFactory.create(taskData));

    assigneeIds.forEach((userId) => project.assignTask(task.id, userId));
    comments.forEach(({ authorId, text }) => {
        task.addComment(new Comment({ author: findUser(authorId), text }));
    });
    attachments.forEach(({ fileName, sizeKb, addedById }) => {
        task.addAttachment(new Attachment({ fileName, sizeKb, addedBy: findUser(addedById) }));
    });

    if (status === "In progress") {
        project.startTask(task.id);
    }

    if (status === "Done") {
        project.completeTask(task.id);
    }
}

export function loadSampleData(data = sampleData) {
    const users = data.users.map((record) => new User(record));
    const findUser = (userId) => users.find((user) => user.id === userId);
    const projects = data.projects.map((record) => {
        const { memberIds, tasks, ...projectData } = record;
        const project = new Project(projectData);

        memberIds.forEach((userId) => project.addMember(findUser(userId)));
        tasks.forEach((taskRecord) => addSampleTask(project, taskRecord, findUser));
        return project;
    });

    return new ProjectService({ projects, users, currentUser: findUser(data.currentUserId) });
}