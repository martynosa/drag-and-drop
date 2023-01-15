import { Component } from './base-component';
import { ProjectItem } from './project-item';

import { Project, ProjectStatus } from '../models/project';
import { DragTarget } from '../models/drag-and-drop';
import { projectState } from '../state/project-state';

export class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];
    this.configure();
    this.renderContent();
  }

  configure(): void {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('drop', this.dropHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);

    projectState.addListener((projects: Project[]) => {
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

  dragOverHandler = (event: DragEvent): void => {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      // preventDefault allows to drop an item
      event.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  };

  dropHandler = (event: DragEvent): void => {
    const pId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      pId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished
    );
  };

  dragLeaveHandler = (event: DragEvent): void => {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  };

  renderContent() {
    const listId = `${this.type}-project-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-project-list`
    ) as HTMLUListElement;

    listEl.innerHTML = '';
    for (const p of this.assignedProjects) {
      new ProjectItem(this.element.querySelector('ul')!.id, p);
    }
  }
}
