
const pageTags = document.getElementById('page-tabs');

const templatesTab = pageTags.querySelector('li#templates-tab');
const symbolsTab = pageTags.querySelector('li#symbols-tab');
const cardsTab = pageTags.querySelector('li#cards-tab');
const exportTab = pageTags.querySelector('li#export-tab');

const projectSelection = document.getElementById('project-selector');
const projectContent = document.getElementById('project-content');
const mainContent = document.getElementById('main-content');
const contentViews = [projectSelection, projectContent, mainContent];


const projectOkayButton = projectContent.querySelector('#project-okay-button');
projectOkayButton.addEventListener('click', (evt: Event) => {
    showMain();
});

const projectPickButton = projectContent.querySelector('#project-pick-button');
projectPickButton.addEventListener('click', (evt: Event) => {
    showProjectSelection();
});

const mainProjectButton = mainContent.querySelector('#main-project-button');
mainProjectButton.addEventListener('click', (evt: Event) => {
    showProjectSettings();
});

const existingProjectButton = document.getElementById('project-existing-button');
existingProjectButton.addEventListener('click', (evt: Event) => {
    showProjectSettings();
});


function showContentView(elem: Element){
    contentViews.forEach(e => {
        e.classList.remove('shown');
        e.classList.add('hidden');
    })
    elem.classList.remove('hidden');
    elem.classList.add('shown');
}

export function showProjectSelection() {
    showContentView(projectSelection);
}
export function showProjectSettings() {
    showContentView(projectContent);
}
export function showMain(){
    showContentView(mainContent);
}

const tabs = [
    templatesTab,
    symbolsTab,
    cardsTab,
    exportTab
];

tabs.forEach(initTab);
clearTabs();
showTab(tabs[0]);

function clearTabs(){
    tabs.forEach(tab => {
        tab.classList.remove('is-active');
        const contentAttr = tab.getAttribute('data-content');
        if (!contentAttr) return;
        const contentElement = document.getElementById(contentAttr);
        if (!contentElement) return;

        contentElement.classList.remove("shown");
        contentElement.classList.add("hidden");
    });
    
}

function showTab(tab: Element){
    tab.classList.add('is-active')
    const contentAttr = tab.getAttribute('data-content');
    if (!contentAttr) return;
    const contentElement = document.getElementById(contentAttr);
    if (!contentElement) return;

    contentElement.classList.remove("hidden");
    contentElement.classList.add("shown");
}

function initTab(tab: Element){


    console.log('init tab', tab)
    tab.addEventListener('click', (evt: Event) => {
        clearTabs();
        showTab(tab);
    });

}



export default {
    showProjectSelection,
    showProjectSettings,
    existingProjectButton
}