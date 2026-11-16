export function collectEntries(projects) {
    return projects.reduce((all, project) => {
        return [...all, ...project.getTasks().map((task) => ({ project, task }))];
    }, []);
}

export function filterEntries(entries, { query, status, priority, projectId, assigneeId }) {
    const text = query.trim().toLowerCase();

    return entries.filter(({ project, task }) => {
        const searchable = `${task.title} ${task.description} ${project.title} ${task.typeLabel}`.toLowerCase();
        const matchesText = text === "" || searchable.includes(text);
        const matchesStatus = status === "all" || task.status === status;
        const matchesPriority = priority === "all" || task.priority === priority;
        const matchesProject = projectId === "all" || project.id === Number(projectId);
        const matchesAssignee = assigneeId === "all"
            || (assigneeId === "none" ? task.assigneeCount === 0 : task.isAssignedTo(Number(assigneeId)));

        return matchesText && matchesStatus && matchesPriority && matchesProject && matchesAssignee;
    });
}