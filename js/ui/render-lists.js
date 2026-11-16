import { formatDate } from "../shared/dates.js";
import { pluralize } from "../shared/text.js";
import { makeElement } from "./dom.js";

const STATUS_KINDS = { "To do": "todo", "In progress": "progress", Done: "done" };
const PRIORITY_KINDS = { Low: "low", Medium: "medium", High: "high" };

export function makeBadge(text, kind) {
    return makeElement("span", `badge badge--${kind}`, text);
}

export function statusBadge(status) {
    return makeBadge(status, STATUS_KINDS[status]);
}

export function priorityBadge(priority) {
    return makeBadge(`${priority} priority`, PRIORITY_KINDS[priority]);
}

function makeAvatar(user) {
    const avatar = makeElement("span", "avatar", user.initials);

    avatar.append(makeElement("span", "visually-hidden", user.name));
    return avatar;
}

export function renderSummary(container, summary) {
    const items = [
        { label: "Total tasks", value: summary.total },
        { label: "Completed", value: summary.completed },
        { label: "Pending", value: summary.pending },
        { label: "Overdue", value: summary.overdue, warn: summary.overdue > 0 },
        { label: "Estimated hours", value: summary.totalHours },
        { label: "Complete", value: `${summary.percentComplete}%` }
    ];

    container.textContent = "";
    items.forEach(({ label, value, warn }) => {
        const card = makeElement("div", warn ? "stat stat--warn" : "stat");

        card.append(makeElement("span", "stat__value", String(value)), makeElement("span", "stat__label", label));
        container.append(card);
    });
}

function buildProjectCard({ id, title, status, meta, due, percent, selected }) {
    const card = makeElement("button", selected ? "project-card is-selected" : "project-card");

    card.type = "button";
    card.dataset.action = "pick-project";
    card.dataset.projectId = String(id);
    card.setAttribute("aria-pressed", String(selected));
    card.append(makeElement("span", "project-card__title", title));

    if (status !== "") {
        card.append(makeElement("span", "project-card__status", status));
    }

    card.append(makeElement("span", "project-card__meta", meta));

    if (due !== "") {
        card.append(makeElement("span", "project-card__meta", due));
    }

    if (percent !== null) {
        const bar = makeElement("progress");

        bar.max = 100;
        bar.value = percent;
        bar.textContent = `${percent}%`;
        card.append(bar, makeElement("span", "project-card__meta", `${percent}% complete`));
    }

    return card;
}

export function renderProjects(container, projects, selectedId, today) {
    const taskCount = projects.reduce((total, project) => total + project.getTasks().length, 0);

    container.textContent = "";
    container.append(buildProjectCard({
        id: "all",
        title: "All projects",
        status: "",
        meta: `${pluralize(projects.length, "project")}, ${pluralize(taskCount, "task")}`,
        due: "",
        percent: null,
        selected: selectedId === "all"
    }));

    projects.forEach((project) => {
        const summary = project.getSummary(today);

        container.append(buildProjectCard({
            id: project.id,
            title: project.title,
            status: project.status,
            meta: `${pluralize(project.getMembers().length, "member")}, ${pluralize(summary.total, "task")}`,
            due: `Due ${formatDate(project.dueDate)}`,
            percent: summary.percentComplete,
            selected: selectedId === String(project.id)
        }));
    });
}

function buildTaskCard({ project, task }, selected, today) {
    const isSelected = selected !== null && selected.projectId === project.id && selected.taskId === task.id;
    const card = makeElement("article", isSelected ? "task-card is-selected" : "task-card");
    const badges = makeElement("div", "badge-row");
    const assignees = makeElement("div", "avatar-row");
    const viewButton = makeElement("button", "btn btn--small", "View details");

    card.dataset.projectId = String(project.id);
    card.dataset.taskId = String(task.id);

    badges.append(makeBadge(task.typeLabel, "type"), priorityBadge(task.priority), statusBadge(task.status));

    if (task.isOverdue(today)) {
        badges.append(makeBadge("Overdue", "overdue"));
    }

    if (task.assigneeCount === 0) {
        assignees.append(makeElement("span", "hint", "Unassigned"));
    } else {
        task.getAssignees().forEach((user) => assignees.append(makeAvatar(user)));
    }

    viewButton.type = "button";
    viewButton.dataset.action = "select";
    viewButton.setAttribute("aria-label", `View details of ${task.title}`);

    card.append(
        makeElement("h3", "task-card__title", task.title),
        badges,
        makeElement("p", "task-card__meta", `${project.title} | Due ${formatDate(task.dueDate)} | ${pluralize(task.estimatedHours, "hour")}`),
        assignees,
        viewButton
    );
    return card;
}

export function renderTaskList(container, entries, selected, today) {
    container.textContent = "";
    container.append(...entries.map((entry) => buildTaskCard(entry, selected, today)));
}