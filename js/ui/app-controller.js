import { Task } from "../models/task.js";
import { sortEntries } from "../patterns/sort-strategies.js";
import { collectEntries, filterEntries } from "../services/task-query.js";
import { todayIso } from "../shared/dates.js";
import { pluralize } from "../shared/text.js";
import { DeleteDialog } from "./delete-dialog.js";
import { DetailsPanel } from "./details-panel.js";
import { requireElement } from "./dom.js";
import { FilterPanel } from "./filter-panel.js";
import { renderProjects, renderSummary, renderTaskList } from "./render-lists.js";
import { TaskDialog } from "./task-dialog.js";
import { announceChange } from "./toast.js";

export class AppController {
    #service;
    #elements;
    #filters;
    #details;
    #taskDialog;
    #deleteDialog;
    #selected = null;

    constructor(service) {
        this.render = this.render.bind(this);
        this.handleServiceChange = this.handleServiceChange.bind(this);
        this.handleProjectClick = this.handleProjectClick.bind(this);
        this.handleTaskClick = this.handleTaskClick.bind(this);
        this.handleNewTask = this.handleNewTask.bind(this);
        this.handleEditTask = this.handleEditTask.bind(this);
        this.handleDeleteTask = this.handleDeleteTask.bind(this);

        this.#service = service;
        this.#elements = {
            currentUser: requireElement("current-user"),
            summaryScope: requireElement("summary-scope"),
            summaryGrid: requireElement("summary-grid"),
            projectList: requireElement("project-list"),
            taskList: requireElement("task-list"),
            resultCount: requireElement("result-count"),
            emptyState: requireElement("empty-state"),
            newTaskButton: requireElement("new-task-button")
        };

        this.#filters = new FilterPanel(service, this.render);
        this.#details = new DetailsPanel(service, {
            onEdit: this.handleEditTask,
            onDelete: this.handleDeleteTask
        });
        this.#taskDialog = new TaskDialog(service);
        this.#deleteDialog = new DeleteDialog(service);

        this.#bindEvents();
        this.#service.subscribe(this.handleServiceChange);
    }

    init() {
        const user = this.#service.currentUser;

        this.#elements.currentUser.textContent = `${user.name} (${user.role})`;
        this.#selectFirstTask();
        this.render();
    }

    handleServiceChange(change) {
        announceChange(change);

        if (change.type === "task-added" || change.type === "task-duplicated") {
            this.#selected = { projectId: change.projectId, taskId: change.taskId };
        }

        if (change.type === "task-deleted" && this.#selected !== null && this.#selected.taskId === change.taskId) {
            this.#selected = null;
        }

        this.render();
    }

    handleProjectClick(event) {
        const card = event.target.closest("[data-action='pick-project']");

        if (card === null) {
            return;
        }

        this.#filters.setProject(card.dataset.projectId);
    }

    handleTaskClick(event) {
        const card = event.target.closest(".task-card");

        if (card === null) {
            return;
        }

        this.#selected = {
            projectId: Number(card.dataset.projectId),
            taskId: Number(card.dataset.taskId)
        };
        this.render();

        if (event.target.closest("[data-action='select']") !== null) {
            this.#details.focus();
        }
    }

    handleNewTask() {
        this.#taskDialog.open("create", undefined, this.#filters.filters.projectId);
    }

    handleEditTask(entry) {
        this.#taskDialog.open("edit", entry);
    }

    handleDeleteTask(entry) {
        this.#deleteDialog.open(entry);
    }

    render() {
        const today = todayIso();
        const projects = this.#service.getProjects();
        const filters = this.#filters.filters;
        const allEntries = collectEntries(projects);
        const visibleEntries = sortEntries(filterEntries(allEntries, filters), filters.sort);
        const activeProject = filters.projectId === "all" ? undefined : this.#service.getProject(Number(filters.projectId));

        if (this.#selected !== null && this.#service.findEntry(this.#selected.projectId, this.#selected.taskId) === undefined) {
            this.#selected = null;
        }

        if (this.#selected === null && visibleEntries.length > 0) {
            const first = visibleEntries[0];

            this.#selected = { projectId: first.project.id, taskId: first.task.id };
        }

        const summary = activeProject === undefined ? Task.summarize(allEntries.map((item) => item.task), today) : activeProject.getSummary(today);
        const selectedEntry = this.#selected === null ? undefined : this.#service.findEntry(this.#selected.projectId, this.#selected.taskId);

        this.#elements.summaryScope.textContent = activeProject === undefined ? "All projects" : activeProject.title;
        renderSummary(this.#elements.summaryGrid, summary);
        renderProjects(this.#elements.projectList, projects, filters.projectId, today);
        renderTaskList(this.#elements.taskList, visibleEntries, this.#selected, today);

        this.#elements.resultCount.textContent = `Showing ${pluralize(visibleEntries.length, "task")} of ${allEntries.length}`;
        this.#elements.emptyState.hidden = visibleEntries.length > 0;
        this.#details.render(selectedEntry, today);
    }

    #bindEvents() {
        const { projectList, taskList, newTaskButton } = this.#elements;

        projectList.addEventListener("click", this.handleProjectClick);
        taskList.addEventListener("click", this.handleTaskClick);
        newTaskButton.addEventListener("click", this.handleNewTask);
    }

    #selectFirstTask() {
        const entries = collectEntries(this.#service.getProjects());

        if (entries.length > 0) {
            this.#selected = { projectId: entries[0].project.id, taskId: entries[0].task.id };
        }
    }
}