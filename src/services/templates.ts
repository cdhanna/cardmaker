import { Template } from "../models/template";
import data from './data';

let selectedTemplate: Template

data.provide('template', () => selectedTemplate, t => {
    selectedTemplate = t;
});

