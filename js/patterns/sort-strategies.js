import { Task } from "../models/task.js";

const getTime = (value) => new Date(value).getTime();

export const SORT_STRATEGIES = {
    "due-soon": {
        label: "Due date (soonest first)",
        compare: (first, second) => getTime(first.task.dueDate) - getTime(second.task.dueDate)
    },
    priority: {
        label: "Priority (highest first)",
        compare: (first, second) => Task.priorityWeight(second.task.priority) - Task.priorityWeight(first.task.priority)
    },
    title: {
        label: "Title (A to Z)",
        compare: (first, second) => first.task.title.localeCompare(second.task.title)
    },
    hours: {
        label: "Estimated hours (most first)",
        compare: (first, second) => second.task.estimatedHours - first.task.estimatedHours
    },
    status: {
        label: "Status (to do first)",
        compare: (first, second) => Task.STATUSES.indexOf(first.task.status) - Task.STATUSES.indexOf(second.task.status)
    }
};

export function sortEntries(entries, strategyName) {
    const strategy = SORT_STRATEGIES[strategyName] ?? SORT_STRATEGIES["due-soon"];

    return [...entries].sort(strategy.compare);
}