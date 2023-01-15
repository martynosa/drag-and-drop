import { Component } from './base-component.js';
export class ProjectItem extends Component {
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
