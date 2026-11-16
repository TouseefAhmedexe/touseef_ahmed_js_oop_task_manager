import { Task } from "../models/task.js";
import { DevelopmentTask, DocumentationTask, TestingTask } from "../models/task-types.js";
import { ValidationError } from "../models/validation.js";

const TASK_CLASSES = {
    general: Task,
    development: DevelopmentTask,
    testing: TestingTask,
    documentation: DocumentationTask
};

export class TaskFactory {
    static types = Object.keys(TASK_CLASSES);

    static create(data) {
        const type = data.type ?? "general";

        if (!TaskFactory.types.includes(type)) {
            throw new ValidationError(`Unknown task type: ${type}.`);
        }

        return new TASK_CLASSES[type](data);
    }

    static options() {
        return TaskFactory.types.map((type) => ({ value: type, label: TASK_CLASSES[type].label }));
    }

    static describe(type) {
        const TaskClass = TASK_CLASSES[type] ?? Task;

        return { label: TaskClass.label, detailLabel: TaskClass.detailLabel, detailKind: TaskClass.detailKind };
    }

    static duplicate(task) {
        const copy = structuredClone(task.toData());

        return TaskFactory.create({ ...copy, id: undefined, title: `Copy of ${copy.title}`, status: "To do" });
    }
}