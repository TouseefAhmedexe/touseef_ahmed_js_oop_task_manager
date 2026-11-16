import { formatDate, formatDateTime } from "../shared/dates.js";
import { fillSelect, makeButton, makeElement } from "./dom.js";
import { makeBadge, priorityBadge, statusBadge } from "./render-lists.js";

const HISTORY_LIMIT = 8;

function block(title, ...children) {
    const section = makeElement("section", "details__block");

    section.append(makeElement("h4", "details__heading", title), ...children);
    return section;
}

function buildFacts(project, task) {
    const facts = [
        ["Project", project.title],
        ["Type", task.typeLabel],
        ["Due date", formatDate(task.dueDate)],
        ["Estimated hours", String(task.estimatedHours)]
    ];
    const list = makeElement("dl", "fact-list");

    if (task.detailLabel !== "") {
        facts.push([task.detailLabel, String(task.detail) || "Not set"]);
    }

    facts.forEach(([label, value]) => {
        list.append(makeElement("dt", "", label), makeElement("dd", "", value));
    });
    return list;
}

function buildActions(task) {
    const check = task.canComplete();
    const row = makeElement("div", "button-row");
    const elements = [row];

    if (task.status === "To do") {
        row.append(makeButton("Start", "start"));
    }

    if (task.status !== "Done") {
        const complete = makeButton("Complete", "complete", "btn btn--small btn--success");

        complete.disabled = !check.ok;
        row.append(complete);
    }

    if (task.status === "Done") {
        row.append(makeButton("Reopen", "reopen"));
    }

    row.append(
        makeButton("Edit", "edit", "btn btn--small btn--secondary"),
        makeButton("Duplicate", "duplicate", "btn btn--small btn--secondary"),
        makeButton("Delete", "delete", "btn btn--small btn--danger")
    );

    if (task.status !== "Done" && !check.ok) {
        elements.push(makeElement("p", "hint", check.reason));
    }

    return elements;
}

function buildAssignees(task, availableMembers) {
    const wrapper = makeElement("div", "stack");

    if (task.assigneeCount === 0) {
        wrapper.append(makeElement("p", "hint", "Nobody is assigned yet."));
    } else {
        const list = makeElement("ul", "chip-list");

        task.getAssignees().forEach((user) => {
            const item = makeElement("li", "chip");
            const remove = makeButton("Remove", "unassign", "btn btn--tiny btn--secondary", { userId: user.id });

            remove.setAttribute("aria-label", `Remove ${user.name}`);
            item.append(makeElement("span", "", `${user.name} (${user.role})`), remove);
            list.append(item);
        });
        wrapper.append(list);
    }

    if (availableMembers.length > 0) {
        const form = makeElement("form", "inline-form");
        const label = makeElement("label", "visually-hidden", "Person to assign");
        const select = makeElement("select");
        const submit = makeElement("button", "btn btn--small", "Assign");

        form.dataset.form = "assign";
        label.htmlFor = "assign-select";
        select.id = "assign-select";
        select.name = "userId";
        fillSelect(select, availableMembers.map((user) => ({ value: user.id, label: user.name })));
        submit.type = "submit";
        form.append(label, select, submit);
        wrapper.append(form);
    }

    return wrapper;
}

function buildChecklist(task) {
    const list = makeElement("ul");

    task.getChecklist().forEach((item) => list.append(makeElement("li", "", item)));
    return list;
}

function buildComments(task) {
    const wrapper = makeElement("div", "stack");
    const comments = task.getComments();
    const form = makeElement("form", "stack");
    const label = makeElement("label", "", "Add a comment");
    const textarea = makeElement("textarea");
    const submit = makeElement("button", "btn btn--small", "Post comment");

    if (comments.length === 0) {
        wrapper.append(makeElement("p", "hint", "No comments yet."));
    }

    comments.forEach((comment) => {
        const item = makeElement("article", "comment");
        const meta = makeElement("p", "comment__meta");
        const time = document.createElement("time");

        time.dateTime = comment.createdAt;
        time.textContent = formatDateTime(comment.createdAt);
        meta.append(`${comment.author.name} | `, time);
        item.append(meta, makeElement("p", "comment__text", comment.text));
        wrapper.append(item);
    });

    form.dataset.form = "comment";
    label.htmlFor = "comment-text";
    textarea.id = "comment-text";
    textarea.name = "text";
    textarea.rows = 3;
    textarea.maxLength = 300;
    textarea.required = true;
    textarea.placeholder = "Write a comment";
    submit.type = "submit";
    form.append(label, textarea, submit);
    wrapper.append(form);
    return wrapper;
}

function buildAttachments(task) {
    const wrapper = makeElement("div", "stack");
    const attachments = task.getAttachments();
    const form = makeElement("form", "stack");
    const label = makeElement("label", "", "Attach a file");
    const input = makeElement("input");
    const submit = makeElement("button", "btn btn--small", "Attach file");

    if (attachments.length === 0) {
        wrapper.append(makeElement("p", "hint", "No attachments yet."));
    } else {
        const list = makeElement("ul");

        attachments.forEach((attachment) => {
            list.append(makeElement("li", "", `${attachment.fileName} (${attachment.sizeKb} KB), added by ${attachment.addedBy.name}`));
        });
        wrapper.append(list);
    }

    form.dataset.form = "attachment";
    label.htmlFor = "attachment-file";
    input.type = "file";
    input.id = "attachment-file";
    input.name = "file";
    input.required = true;
    submit.type = "submit";
    form.append(label, input, submit, makeElement("p", "hint", "Only the file name and size are recorded. Nothing is uploaded."));
    wrapper.append(form);
    return wrapper;
}

function buildHistory(task) {
    const history = task.getHistory();
    const list = makeElement("ol", "history");

    history.slice(0, HISTORY_LIMIT).forEach((entry) => {
        const item = makeElement("li", "", `${entry.actorName}: ${entry.message} (${formatDateTime(entry.at)})`);

        list.append(item);
    });

    if (history.length > HISTORY_LIMIT) {
        list.append(makeElement("li", "hint", `Showing the latest ${HISTORY_LIMIT} of ${history.length} entries.`));
    }

    return list;
}

export function renderDetails(container, entry, today) {
    container.textContent = "";

    if (entry === undefined) {
        container.append(makeElement("p", "hint", "Choose a task from the list to see its details."));
        return;
    }

    const { project, task } = entry;
    const availableMembers = project.getMembers().filter((member) => !task.isAssignedTo(member.id));
    const header = makeElement("div", "details__header");
    const badges = makeElement("div", "badge-row");

    badges.append(makeBadge(task.typeLabel, "type"), priorityBadge(task.priority), statusBadge(task.status));

    if (task.isOverdue(today)) {
        badges.append(makeBadge("Overdue", "overdue"));
    }

    header.append(makeElement("h3", "details__title", task.title), badges);
    container.append(header);

    if (task.description !== "") {
        container.append(makeElement("p", "", task.description));
    }

    container.append(
        buildFacts(project, task),
        block("Actions", ...buildActions(task)),
        block("Assignees", buildAssignees(task, availableMembers)),
        block("Suggested checklist", buildChecklist(task)),
        block("Comments", buildComments(task)),
        block("Attachments", buildAttachments(task)),
        block("Activity", buildHistory(task))
    );
}