import { Component } from './base-component.js';
import { ProjectItem } from './project-item.js';
import { ProjectStatus } from '../models/project.js';
import { projectState } from '../state/project-state.js';
export class ProjectList extends Component {
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
            projectState.moveProject(pId, this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
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
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((p) => {
                if (this.type === 'active') {
                    return p.status === ProjectStatus.Active;
                }
                return p.status === ProjectStatus.Finished;
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
            new ProjectItem(this.element.querySelector('ul').id, p);
        }
    }
}
