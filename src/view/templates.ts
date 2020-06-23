import data from '../services/data';
import {Template} from '../models/template';
import {pickArt} from '../services/art';

const templateEntryArchetype = document.getElementById('template-entry-archetype');
const templateEntryParent = templateEntryArchetype.parentElement;
templateEntryArchetype.remove();

interface TemplateElement {
    readonly elem: Element;
    readonly template: Template;
    readonly anchor: Element;
}

let templateElements:Array<TemplateElement> = [];



console.log(templateEntryArchetype, templateEntryArchetype.querySelector('a'))

document.getElementById('template-card-container').addEventListener('click', evt => {
    pickArt('Background').then(file => {
        console.log('file path', file);
    }).catch(err => {
        // do nothing?
        console.log('cancelled art selection', err)
    })
});

data.on<Array<Template>>('project.templates', templates => {
    refreshTemplateEntries(templates);
});

function refreshTemplateEntries(templates: Array<Template>){

    while (templateEntryParent.firstChild) {
        templateEntryParent.removeChild(templateEntryParent.lastChild);
    }
    templateElements = [];
    for (var i = 0 ; i < templates.length; i ++){
        
        const clone = templateEntryArchetype.cloneNode(true) as Element;
        clone.querySelector('a').textContent = templates[i].name;
        templateEntryParent.appendChild(clone);
        const templateElement: TemplateElement = {
            template: templates[i],
            anchor: clone.querySelector('a'),
            elem: clone
        };
        templateElements.push(templateElement);
        clone.addEventListener('click', evt => selectTemplate(templateElement))
    }

    unselectAllTemplates();
    if (templateElements.length > 0){
        selectTemplate(templateElements[0]);
    }
}

function unselectAllTemplates(){
    templateElements.forEach(te => te.anchor.classList.remove('is-active'));
}

function selectTemplate(templateElement: TemplateElement){
    unselectAllTemplates();
    templateElement.anchor.classList.add('is-active');
}