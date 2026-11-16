import { Task } from "./task.js";
import { ValidationError, optionalText, requireNumber } from "./validation.js";

export class DevelopmentTask extends Task {
    static typeKey = "development";
    static label = "Development";
    static detailLabel = "Branch name";

    #branch = "";

    constructor(data) {
        super(data);
        this.detail = data.detail ?? "";
    }

    get detail() {
        return this.#branch;
    }

    set detail(value) {
        const branch = optionalText(value, "Branch name", 60);

        if (branch.includes(" ")) {
            throw new ValidationError("A branch name cannot contain spaces.");
        }

        this.#branch = branch;
    }

    getChecklist() {
        return ["Create a branch", "Write the code", "Test it locally", "Open a pull request"];
    }

    canComplete() {
        const base = super.canComplete();

        if (!base.ok) {
            return base;
        }

        if (this.#branch === "") {
            return { ok: false, reason: "Add a branch name before completing a development task." };
        }

        return base;
    }
}

export class TestingTask extends Task {
    static typeKey = "testing";
    static label = "Testing";
    static detailLabel = "Number of test cases";
    static detailKind = "number";

    #testCases = 0;

    constructor(data) {
        super(data);
        this.detail = data.detail ?? 0;
    }

    get detail() {
        return this.#testCases;
    }

    set detail(value) {
        const count = value === "" ? 0 : value;

        this.#testCases = requireNumber(count, "Test cases", { min: 0, max: 500, integer: true });
    }

    getChecklist() {
        return ["Write the test cases", "Run the tests", "Report the failures", "Run the tests again"];
    }

    canComplete() {
        const base = super.canComplete();

        if (!base.ok) {
            return base;
        }

        if (this.#testCases < 1) {
            return { ok: false, reason: "A testing task needs at least one test case before it can be completed." };
        }

        return base;
    }
}

export class DocumentationTask extends Task {
    static typeKey = "documentation";
    static label = "Documentation";
    static detailLabel = "Audience";

    #audience = "";

    constructor(data) {
        super(data);
        this.detail = data.detail ?? "";
    }

    get detail() {
        return this.#audience;
    }

    set detail(value) {
        this.#audience = optionalText(value, "Audience", 60);
    }

    getChecklist() {
        return ["Outline the document", "Write the first draft", "Check the examples", "Ask for a review"];
    }
}