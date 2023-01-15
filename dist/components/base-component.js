export class Component {
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
