import {remote} from 'electron';
import nav from './navigation';
import { Project } from '../models/project';
import data from './data';

const fs = remote.require('fs');
const path = remote.require('path');

let cachedStorage: Storage = getStorageData();
let cachedProject: Project;

const openProjectButton = document.getElementById('project-open-button');
const newProjectButton = document.getElementById('project-new-button');

if (isProjectLoaded()){
    nav.existingProjectButton.classList.add('shown');
    nav.existingProjectButton.classList.remove('hidden');

    cachedProject = loadProject();
    bindProjectData();
    console.log('loaded project', cachedProject)
    nav.showMain();
}

openProjectButton.addEventListener('click', (evt: Event) => {
    const result = remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        title: 'Open Project',
        buttonLabel: 'Open Project',
        filters: [
            { name: 'Project', extensions: ['cardmaker.json']}
        ],
        properties: [
            'openFile'
        ]
    });
    if (!result || !result[0]) return;
    const projectDirectory = path.dirname(result[0]);
    console.log('loading project at', projectDirectory);
    setStorageData({
        projectDirectory: projectDirectory
    });
    cachedProject = loadProject();
    bindProjectData();
    nav.showProjectSettings();

});

newProjectButton.addEventListener('click', (evt:Event) => {

    console.log('new project!');
    const result = remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        title: 'New Project',
        buttonLabel: 'Create Project',
        properties: [
            'openDirectory',
            'createDirectory',
            'promptToCreate'
        ]
    });
    if (!result || !result[0]) return;
    console.log('creating project at', result);
    setStorageData({
        projectDirectory: result[0]
    });
    cachedProject = createNewProject()
    bindProjectData();
    nav.showProjectSettings();

});

function setStorageData(data: Partial<Storage>) {
    const folded = {...cachedStorage, ...data};
    const json = JSON.stringify(folded);
    window.localStorage.setItem('storage', json);
    cachedStorage = folded;
}

function getStorageData(): Storage {
    const json = window.localStorage.getItem('storage');
    let storage = (JSON.parse(json) as Storage);
    if (!storage){
        storage = {
            projectDirectory: undefined
        }
    }
    return storage;
}

function getProjectFilePath(): string {
    return `${getStorageData().projectDirectory}/project.cardmaker.json`;
}

function getProjectPath(): string {
    return `${getStorageData().projectDirectory}`
}

function createNewProject(): Project {
    const project = new Project();
    project.csvPath = './data.csv',
    project.name = 'my project';
    project.templates = [];

    saveProject(project);
    return project;
}

function bindProjectData() {
    data.provide('project.name', 
        () => cachedProject.name,
        v => {
            cachedProject.name = v;
            saveProject(cachedProject);
        }
    );
    data.provide('project.csvPath', 
        () => cachedProject.csvPath,
        v => {
            cachedProject.csvPath = v;
            saveProject(cachedProject);
        }
    );
    data.provide('project.templates', 
        () => cachedProject.templates,
        v => {

        });
    data.refreshElements();
}

function loadProject(): Project {
    // load from disk
    if (!isProjectLoaded()) throw 'no available project file';

    try {
        const json = fs.readFileSync(getProjectFilePath(), 'utf-8');
        const project = JSON.parse(json) as Project;
        console.log('loaded project', project);

        return project;
    } catch (ex){
        console.error('failed to load project', ex);
        throw ex;
    }
}

function saveProject(project: Project): void {
    const json = JSON.stringify(project, null, 2);
    try {
        fs.writeFileSync(getProjectFilePath(), json, 'utf-8')
    } catch (ex){
        console.error('failed to write project file', ex);
        throw ex;
    }

}

export function isProjectLoaded(){
    const isLoaded = cachedStorage.projectDirectory !== undefined;
    return isLoaded;
}


export interface Storage {
    readonly projectDirectory: string;
}

export default {
    getStorageData,
    isProjectLoaded,
    getProjectPath
}