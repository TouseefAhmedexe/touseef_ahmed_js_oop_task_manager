import { addDaysIso } from "../js/shared/dates.js";

export const sampleData = {
    currentUserId: 6,
    users: [
        { id: 1, name: "Ayesha Khan", email: "ayesha.khan@example.com", role: "Project Manager" },
        { id: 2, name: "Hamza Ali", email: "hamza.ali@example.com", role: "Developer" },
        { id: 3, name: "Sara Ahmed", email: "sara.ahmed@example.com", role: "Developer" },
        { id: 4, name: "Bilal Hussain", email: "bilal.hussain@example.com", role: "Tester" },
        { id: 5, name: "Maryam Noor", email: "maryam.noor@example.com", role: "Technical Writer" },
        { id: 6, name: "Touseef Ahmed", email: "touseef.ahmed@example.com", role: "Intern" }
    ],
    projects: [
        {
            id: 1,
            title: "Website Redesign",
            description: "Rebuild the public website.",
            startDate: addDaysIso(-20),
            dueDate: addDaysIso(25),
            status: "Active",
            maxTasks: 8,
            memberIds: [1, 2, 3, 5, 6],
            tasks: [
                {
                    id: 101,
                    type: "development",
                    title: "Build the home page layout",
                    description: "Create the responsive layout of the home page.",
                    priority: "High",
                    status: "In progress",
                    dueDate: addDaysIso(3),
                    estimatedHours: 12,
                    detail: "feature/home-layout",
                    assigneeIds: [2],
                    comments: [{ authorId: 1, text: "Please check the layout on a phone." }]
                },
                {
                    id: 102,
                    type: "development",
                    title: "Add the contact form",
                    description: "Add a contact form with clear error messages.",
                    priority: "Medium",
                    status: "To do",
                    dueDate: addDaysIso(9),
                    estimatedHours: 6,
                    detail: "",
                    assigneeIds: [3]
                },
                {
                    id: 103,
                    type: "testing",
                    title: "Test the navigation menu",
                    description: "Check the menu on phones, tablets and desktops.",
                    priority: "Medium",
                    status: "To do",
                    dueDate: addDaysIso(-2),
                    estimatedHours: 4,
                    detail: 8,
                    assigneeIds: []
                },
                {
                    id: 104,
                    type: "documentation",
                    title: "Write the style guide",
                    description: "Document colors, type and spacing for the team.",
                    priority: "Low",
                    status: "Done",
                    dueDate: addDaysIso(-6),
                    estimatedHours: 8,
                    detail: "Designers",
                    assigneeIds: [5],
                    attachments: [{ fileName: "style-guide.pdf", sizeKb: 420, addedById: 5 }]
                },
                {
                    id: 105,
                    title: "Choose the color palette",
                    description: "Pick the brand colors and check their contrast.",
                    priority: "High",
                    status: "Done",
                    dueDate: addDaysIso(-12),
                    estimatedHours: 3,
                    assigneeIds: [1]
                },
                {
                    id: 106,
                    type: "development",
                    title: "Fix the footer links",
                    description: "Repair the broken links in the footer.",
                    priority: "Low",
                    status: "In progress",
                    dueDate: addDaysIso(-1),
                    estimatedHours: 2,
                    detail: "fix/footer-links",
                    assigneeIds: [3, 6]
                }
            ]
        },
        {
            id: 2,
            title: "Mobile App",
            description: "Build the first version of the mobile app.",
            startDate: addDaysIso(-10),
            dueDate: addDaysIso(60),
            status: "Planning",
            maxTasks: 6,
            memberIds: [2, 3, 4, 6],
            tasks: [
                {
                    id: 107,
                    type: "development",
                    title: "Set up the project",
                    description: "Create the repository and the build setup.",
                    priority: "High",
                    status: "Done",
                    dueDate: addDaysIso(-8),
                    estimatedHours: 5,
                    detail: "setup/project",
                    assigneeIds: [2]
                },
                {
                    id: 108,
                    type: "development",
                    title: "Build the login screen",
                    description: "Create the screen where users sign in.",
                    priority: "High",
                    status: "In progress",
                    dueDate: addDaysIso(5),
                    estimatedHours: 10,
                    detail: "feature/login",
                    assigneeIds: [3]
                },
                {
                    id: 109,
                    type: "testing",
                    title: "Write login test cases",
                    description: "List the cases to test for the sign-in flow.",
                    priority: "Medium",
                    status: "To do",
                    dueDate: addDaysIso(12),
                    estimatedHours: 6,
                    detail: 0,
                    assigneeIds: [4]
                },
                {
                    id: 110,
                    title: "Plan the release",
                    description: "Plan the first store release.",
                    priority: "Low",
                    status: "To do",
                    dueDate: addDaysIso(30),
                    estimatedHours: 2,
                    assigneeIds: []
                }
            ]
        },
        {
            id: 3,
            title: "Documentation Handbook",
            description: "Write the handbook for new interns.",
            startDate: addDaysIso(-40),
            dueDate: addDaysIso(10),
            status: "Active",
            maxTasks: 5,
            memberIds: [1, 5, 6],
            tasks: [
                {
                    id: 111,
                    type: "documentation",
                    title: "Draft the onboarding guide",
                    description: "Write the first guide for new interns.",
                    priority: "High",
                    status: "In progress",
                    dueDate: addDaysIso(2),
                    estimatedHours: 9,
                    detail: "New interns",
                    assigneeIds: [5],
                    comments: [{ authorId: 5, text: "The first draft is ready for review." }]
                },
                {
                    id: 112,
                    type: "documentation",
                    title: "Review the glossary",
                    description: "Check the terms and fix unclear definitions.",
                    priority: "Medium",
                    status: "To do",
                    dueDate: addDaysIso(6),
                    estimatedHours: 3,
                    detail: "",
                    assigneeIds: [6]
                },
                {
                    id: 113,
                    title: "Collect feedback",
                    description: "Ask the team for feedback on the handbook.",
                    priority: "Low",
                    status: "Done",
                    dueDate: addDaysIso(-3),
                    estimatedHours: 1.5,
                    assigneeIds: [1]
                }
            ]
        }
    ]
};