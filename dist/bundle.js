"use strict";
var App;
(function (App) {
    class Component {
        constructor(templateId, hostElementId, insertAtStart, newElementId) {
            // SELECT HOST ELEMENT
            this.templateElement = document.getElementById(templateId);
            this.hostElement = document.getElementById(hostElementId);
            // IMPORT ELEMENT
            const importedNode = document.importNode(this.templateElement.content, true);
            this.element = importedNode.firstElementChild;
            if (newElementId) {
                this.element.id = newElementId;
            }
            this.attach(insertAtStart);
        }
        attach(insertAtBeginning) {
            if (insertAtBeginning) {
                this.hostElement.insertAdjacentElement('afterbegin', this.element);
                return;
            }
            this.hostElement.insertAdjacentElement('beforeend', this.element);
        }
    }
    App.Component = Component;
})(App || (App = {}));
var App;
(function (App) {
    function validate(validatableInput) {
        let isValid = true;
        if (validatableInput.required) {
            isValid =
                isValid && validatableInput.value.toString().trim().length !== 0;
        }
        if (validatableInput.minLength != null &&
            typeof validatableInput.value === 'string') {
            isValid =
                isValid && validatableInput.value.length >= validatableInput.minLength;
        }
        if (validatableInput.maxLength != null &&
            typeof validatableInput.value === 'string') {
            isValid =
                isValid && validatableInput.value.length <= validatableInput.maxLength;
        }
        if (validatableInput.min != null &&
            typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value >= validatableInput.min;
        }
        if (validatableInput.max != null &&
            typeof validatableInput.value === 'number') {
            isValid = isValid && validatableInput.value <= validatableInput.max;
        }
        return isValid;
    }
    App.validate = validate;
})(App || (App = {}));
var App;
(function (App) {
    function AutoBind(target, method, descriptor) {
        const originalMethod = descriptor.value;
        const adjDescriptor = {
            configurable: true,
            get() {
                const boundFn = originalMethod.bind(this);
                return boundFn;
            },
        };
        return adjDescriptor;
    }
    App.AutoBind = AutoBind;
})(App || (App = {}));
var App;
(function (App) {
    class ProjectState {
        constructor() {
            this.projects = [];
            this.listeners = [];
        }
        static getInstance() {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new ProjectState();
            return this.instance;
        }
        addListener(listenerFn) {
            this.listeners.push(listenerFn);
        }
        addProject(title, description, people) {
            const newProject = new App.Project(Math.random().toString(), title, description, people, App.ProjectStatus.Active);
            this.projects.push(newProject);
            this.updateListeners();
        }
        moveProject(projectId, newStatus) {
            const project = this.projects.find((p) => p.id === projectId);
            if (project && project.status !== newStatus) {
                project.status = newStatus;
                this.updateListeners();
            }
        }
        updateListeners() {
            for (const listenerFn of this.listeners) {
                // slice to return copy of the array
                listenerFn(this.projects.slice());
            }
        }
    }
    App.ProjectState = ProjectState;
    App.projectState = ProjectState.getInstance();
})(App || (App = {}));
/// <reference path="base-component.ts" />
/// <reference path="../util/validate.ts" />
/// <reference path="../decorators/autobind.ts" />
/// <reference path="../state/project-state.ts" />
var App;
(function (App) {
    // PROJECT INPUT
    class ProjectInput extends App.Component {
        configure() {
            this.element.addEventListener('submit', this.submitHandler);
        }
        renderContent() { }
        constructor() {
            super('project-input', 'app', true, 'user-input');
            this.submitHandler = (event) => {
                event.preventDefault();
                const userInput = this.gatherUserInput();
                if (Array.isArray(userInput)) {
                    const [title, description, people] = userInput;
                    App.projectState.addProject(title, description, people);
                    this.clearUserInput();
                }
            };
            this.titleInputElement = this.element.querySelector('#title');
            this.descriptionInputElement = this.element.querySelector('#description');
            this.peopleInputElement = this.element.querySelector('#people');
            this.configure();
        }
        gatherUserInput() {
            const enteredTitle = this.titleInputElement.value;
            const enteredDescription = this.descriptionInputElement.value;
            const enteredPeople = this.peopleInputElement.value;
            const titleValidatable = {
                value: enteredTitle,
                required: true,
            };
            const descriptionValidatable = {
                value: enteredDescription,
                required: true,
                minLength: 5,
            };
            const peopleValidatable = {
                value: +enteredPeople,
                required: true,
                min: 1,
                max: 5,
            };
            if (!App.validate(titleValidatable) ||
                !App.validate(descriptionValidatable) ||
                !App.validate(peopleValidatable)) {
                alert('Invalid input, please try again!');
                return;
            }
            else {
                return [enteredTitle, enteredDescription, +enteredPeople];
            }
        }
        clearUserInput() {
            this.titleInputElement.value = '';
            this.descriptionInputElement.value = '';
            this.peopleInputElement.value = '';
        }
    }
    App.ProjectInput = ProjectInput;
})(App || (App = {}));
var App;
(function (App) {
    let ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
        ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
    })(ProjectStatus = App.ProjectStatus || (App.ProjectStatus = {}));
    class Project {
        constructor(id, title, description, people, status) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.people = people;
            this.status = status;
        }
    }
    App.Project = Project;
})(App || (App = {}));
/// <reference path="base-component.ts" />
/// <reference path="../state/project-state.ts" />
/// <reference path="../state/project-state.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../models/drag-and-drop.ts" />
var App;
(function (App) {
    class ProjectList extends App.Component {
        constructor(type) {
            super('project-list', 'app', false, `${type}-projects`);
            this.type = type;
            this.dragOverHandler = (event) => {
                if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                    // preventDefault allows to drop an item
                    event.preventDefault();
                    const listEl = this.element.querySelector('ul');
                    listEl.classList.add('droppable');
                }
            };
            this.dropHandler = (event) => {
                const pId = event.dataTransfer.getData('text/plain');
                App.projectState.moveProject(pId, this.type === 'active' ? App.ProjectStatus.Active : App.ProjectStatus.Finished);
            };
            this.dragLeaveHandler = (event) => {
                const listEl = this.element.querySelector('ul');
                listEl.classList.remove('droppable');
            };
            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }
        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('drop', this.dropHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            App.projectState.addListener((projects) => {
                const relevantProjects = projects.filter((p) => {
                    if (this.type === 'active') {
                        return p.status === App.ProjectStatus.Active;
                    }
                    return p.status === App.ProjectStatus.Finished;
                });
                this.assignedProjects = relevantProjects;
                this.renderProjects();
            });
        }
        renderContent() {
            const listId = `${this.type}-project-list`;
            this.element.querySelector('ul').id = listId;
            this.element.querySelector('h2').textContent =
                this.type.toUpperCase() + ' PROJECTS';
        }
        renderProjects() {
            const listEl = document.getElementById(`${this.type}-project-list`);
            listEl.innerHTML = '';
            for (const p of this.assignedProjects) {
                new App.ProjectItem(this.element.querySelector('ul').id, p);
            }
        }
    }
    App.ProjectList = ProjectList;
})(App || (App = {}));
/// <reference path="components/project-input.ts" />
/// <reference path="components/project-list.ts" />
var App;
(function (App) {
    new App.ProjectInput();
    new App.ProjectList('active');
    new App.ProjectList('finished');
})(App || (App = {}));
/// <reference path="base-component.ts" />
/// <reference path="../models/project.ts" />
/// <reference path="../models/drag-and-drop.ts" />
var App;
(function (App) {
    class ProjectItem extends App.Component {
        get persons() {
            if (this.project.people === 1) {
                return '1 person assigned.';
            }
            return `${this.project.people} persons assigned.`;
        }
        constructor(hostId, project) {
            super('single-project', hostId, false, project.id);
            // DRAGGABLE
            this.configure = () => {
                this.element.addEventListener('dragstart', this.dragStartHandler);
                this.element.addEventListener('dragend', this.dragEndHandler);
            };
            this.dragStartHandler = (event) => {
                event.dataTransfer.setData('text/plain', this.project.id);
                event.dataTransfer.effectAllowed = 'move';
            };
            this.project = project;
            this.configure();
            this.renderContent();
        }
        renderContent() {
            this.element.querySelector('h2').textContent = this.project.title;
            this.element.querySelector('h3').textContent = this.persons;
            this.element.querySelector('p').textContent = this.project.description;
        }
        dragEndHandler(event) { }
    }
    App.ProjectItem = ProjectItem;
})(App || (App = {}));
