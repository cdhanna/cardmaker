import data from '../services/data';
import project from '../services/project';
import {remote} from 'electron';

const projectNameInput = document.getElementById('project-name-input');
const projectNameBind = data.bindElem(projectNameInput);

const projectCSVFileInput = document.getElementById('project-csv-file-button');
const projectCSVFileText = document.getElementById('project-csv-file-text');
const csvBinder = data.bindElem(projectCSVFileText);

projectCSVFileText.addEventListener('click', selectDataFile)
projectCSVFileInput.addEventListener('click', selectDataFile)

function selectDataFile(){
    const result = remote.dialog.showOpenDialogSync(remote.getCurrentWindow(), {
        title: 'Open Data Sheet',
        buttonLabel: 'Open',
        filters: [
            { name: 'Data', extensions: ['csv']}
        ],
        properties: [
            'openFile'
        ]
    });
    if (!result && result[0]) return;
    if (!result[0].startsWith(project.getProjectPath())){
        console.error('cannot select a data file that is not within the project directory');
        return;
    }

    console.log('selecting data sheet', result[0])
    const relativePath = result[0].substr(project.getProjectPath().length);
    data.write(csvBinder.symbol, relativePath);
}