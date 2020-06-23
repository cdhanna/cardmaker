import data from './data';
import project from './project';
import {remote} from 'electron';

const csv = remote.require('csv-parser')
const fs = remote.require('fs')
let results: Array<any> = [];
let headers: Array<string> = [];
 
data.on<string>('project.csvPath', filePath => {
    console.log('data sheet file is', filePath);
    loadData(filePath);
});

export function getHeaders(): Array<string>{
    return headers;
}

function loadData(filePath: string){
    const fullPath = `${project.getProjectPath()}${filePath}`;
    if (!fs.existsSync(fullPath)) return;
    
    console.log('loading data from ', fullPath, csv, csv());
    let rows: Array<any> = [];

    try {
        fs.createReadStream(fullPath)
            .pipe(csv())
            .on('end', () => {
                headers = rows.length > 0 ? Object.keys(rows[0]) : [];
                results = rows;
                console.log('LOADED DATA', headers, results);
            })
            .on('data', (row:any) => {
                rows.push(row);
            })
    } catch (ex){
        console.error('could not read csv', ex);
        throw ex;
    }
}