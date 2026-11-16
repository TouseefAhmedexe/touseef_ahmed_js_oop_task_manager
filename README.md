# Task and Project Manager

A task and project management web application built with object-oriented Vanilla JavaScript, semantic HTML, and modular CSS.

## How to Run

Open `index.html` using a local development server such as VS Code **Live Server**. Because the application uses ES modules (`type="module"`), opening `index.html` directly from the file system (`file://`) is blocked by browser security rules.

## Architecture and Object-Oriented Design

### 1. Class Structure and Encapsulation
- **Models (`js/models/`)**: `IdSequence`, `ValidationError`, `User`, `Comment`, `Attachment`, `ActivityLog`, `Task`, `DevelopmentTask`, `TestingTask`, `DocumentationTask`, and `Project`.
- All internal properties use private class fields (`#id`, `#title`, `#tasks`, `#assignees`, `#log`).
- Getters and setters validate input before mutating state (for example, `task.title`, `task.estimatedHours`, and `user.email`). Read-only state properties like `task.status` expose only getters so state changes must run through domain methods (`start()`, `complete()`, `reopen()`).
- Static methods (`Task.generateId()`, `Task.summarize()`, `Project.generateId()`) provide class-level ID generation and summary calculations.

### 2. Inheritance and Polymorphism
- `DevelopmentTask`, `TestingTask`, and `DocumentationTask` inherit from `Task` using `extends` and `super()`.
- Each subclass overrides `getChecklist()` to return steps tailored to its workflow.
- `DevelopmentTask` and `TestingTask` override `canComplete()`, calling `super.canComplete()` first and enforcing type-specific completion rules (requiring a branch name or at least one test case).
- The UI relies on polymorphism by calling `task.canComplete()` and `task.getChecklist()` uniformly across all task instances without checking task types.

### 3. Composition over Deep Inheritance
- Inheritance is kept one level deep for genuine task subtypes. All other relationships use object composition:
  - `Task` composes an `ActivityLog`, `User` assignees, `Comment` objects, and `Attachment` objects.
  - `Project` composes an `ActivityLog`, `User` members, and `Task` objects.

### 4. Object References and Safe Cloning
- Collection getters (`getAssignees()`, `getTasks()`, `getMembers()`) return shallow copies (`[...array]`) so callers cannot mutate internal state directly.
- `TaskFactory.duplicate()` creates a deep clone of task data using `structuredClone(task.toData())`, generates a new ID, resets status to `"To do"`, and prevents shared-reference mutations on the original task.

### 5. Design Patterns
- **Factory (`js/patterns/task-factory.js`)**: `TaskFactory.create()` instantiates the appropriate `Task` subclass from a type key.
- **Observer (`js/patterns/observable.js`)**: `ProjectService` extends `Observable` and notifies `AppController` whenever model data changes so the UI re-renders automatically.
- **Strategy (`js/patterns/sort-strategies.js`)**: `SORT_STRATEGIES` defines interchangeable sorting comparators (`due-soon`, `priority`, `title`, `hours`, `status`).
- **Module and Singleton (`js/app.js`)**: ES modules isolate scope, and a single `ProjectService` instance coordinates application state.

### 6. Explicit Function Binding (`bind`)
- UI controller classes (`AppController`, `FilterPanel`, `DetailsPanel`, `TaskDialog`, `DeleteDialog`) bind their methods to `this` inside their constructors (`this.render = this.render.bind(this)`). Without `bind()`, callbacks passed to DOM listeners or child components would lose their class instance context and fail when accessing private fields