import {Template} from './template';

export class Project {

    public name: string;
    public csvPath: string;
    public templateTypeColumn: string;

    public templates: Array<Template>
}