import { Task } from "../models/task.js";
import { SORT_STRATEGIES } from "../patterns/sort-strategies.js";
import debounce from "../shared/debounce.js";
import { fillSelect, requireElement } from "./dom.js";

const SEARCH_DELAY_MS = 300;

export const DEFAULT_FILTERS = Object.freeze({
    query: "",
    status: "all",
    priority: "all",
    projectId: "all",
    assigneeId: "all",
    sort: "due-soon"
});

export class FilterPanel {
    #elements;
    #filters = { ...DEFAULT_FILTERS };
    #onChange;

    constructor(service, onChange) {
        this.handleChange = this.handleChange.bind(this);
        this.handleClear = this.handleClear.bind(this);

        this.#onChange = onChange;
        this.#elements = {
            form: requireElement("filter-form"),
            search: requireElement("search-input"),
            status: requireElement("status-select"),
            priority: requireElement("priority-select"),
            project: requireElement("project-select"),
            assignee: requireElement("assignee-select"),
            sort: requireElement("sort-select"),
            clear: requireElement("clear-filters"),
            emptyClear: requireElement("empty-clear")
        };

        this.#fillOptions(service);
        this.#bindEvents();
    }

    get filters() {
        return { ...this.#filters };
    }

    setProject(projectId) {
        this.#filters = { ...this.#filters, projectId };
        this.#write();
        this.#onChange();
    }

    handleChange() {
        this.#filters = this.#read();
        this.#onChange();
    }

    handleClear() {
        this.#filters = { ...DEFAULT_FILTERS };
        this.#write();
        this.#onChange();
        this.#elements.search.focus();
    }

    #fillOptions(service) {
        const { status, priority, project, assignee, sort } = this.#elements;
        const choice = (value) => ({ value, label: value });

        fillSelect(status, [{ value: "all", label: "All statuses" }, ...Task.STATUSES.map(choice)]);
        fillSelect(priority, [{ value: "all", label: "All priorities" }, ...Task.PRIORITIES.map(choice)]);
        fillSelect(project, [
            { value: "all", label: "All projects" },
            ...service.getProjects().map((item) => ({ value: item.id, label: item.title }))
        ]);
        fillSelect(assignee, [
            { value: "all", label: "Anyone" },
            { value: "none", label: "Unassigned" },
            ...service.getUsers().map((user) => ({ value: user.id, label: user.name }))
        ]);
        fillSelect(sort, Object.entries(SORT_STRATEGIES).map(([value, strategy]) => ({ value, label: strategy.label })));
    }

    #bindEvents() {
        const { form, search, status, priority, project, assignee, sort, clear, emptyClear } = this.#elements;

        form.addEventListener("submit", (event) => event.preventDefault());
        search.addEventListener("input", debounce(this.handleChange, SEARCH_DELAY_MS));
        [status, priority, project, assignee, sort].forEach((select) => {
            select.addEventListener("change", this.handleChange);
        });
        clear.addEventListener("click", this.handleClear);
        emptyClear.addEventListener("click", this.handleClear);
    }

    #read() {
        const { search, status, priority, project, assignee, sort } = this.#elements;

        return {
            query: search.value.trim(),
            status: status.value,
            priority: priority.value,
            projectId: project.value,
            assigneeId: assignee.value,
            sort: sort.value
        };
    }

    #write() {
        const { search, status, priority, project, assignee, sort } = this.#elements;

        search.value = this.#filters.query;
        status.value = this.#filters.status;
        priority.value = this.#filters.priority;
        project.value = this.#filters.projectId;
        assignee.value = this.#filters.assigneeId;
        sort.value = this.#filters.sort;
    }
}