import {remote} from 'electron';
import project from './project';

const { resolve } = remote.require('path');
const { readdir, readFile } = remote.require('fs').promises;
const { extname } = remote.require('path');
// const fs = remote.require('fs')

const artPopup = document.getElementById('art-selection');
const modal = artPopup.querySelector('.modal');
const titleElement = artPopup.querySelector('.modal-card-title');
const artPreviewArchetype = document.getElementById('art-preview-archetype');
const artPreviewParent = artPreviewArchetype.parentElement;
artPreviewArchetype.remove();

const artDeleteButton = document.getElementById('art-close-button');
const artCancelButton = document.getElementById('art-cancel-button');

modal.classList.remove('is-active');

artDeleteButton.addEventListener('click', cancelArt);
artCancelButton.addEventListener('click', cancelArt);

let promise: Promise<ArtFile>;
let rejectPromise: (reason: any) => void;

export interface ArtFile {
    readonly full: string;
    readonly relative: string;
    readonly data: string;
}

export function pickArt(title: string=undefined):Promise<ArtFile> {
    
    while (artPreviewParent.firstChild) {
        artPreviewParent.removeChild(artPreviewParent.lastChild);
    }
    let selected: ArtFile = undefined;

    modal.classList.add('is-active');
    titleElement.textContent = `Art Picker${title ? ` - ${title}`: ''}`;
    promise = new Promise<ArtFile>((resolve, reject) => {
        rejectPromise = reject;

        (async () => {
            const baseDir = project.getProjectPath();
            for await (const f of getFiles(baseDir)) {

                readFile(f, 'base64').then( (data:any) => {
                    const relative = f.substr(baseDir.length);
                    const clone = artPreviewArchetype.cloneNode(true) as Element;
                    
                    var imageAsBase64 = `data:image/png;base64,${data}`;

                    clone.setAttribute('title', relative)
                    clone.querySelector('img').setAttribute('src', imageAsBase64);
                    clone.addEventListener('click', (evt) => {
                        selected = {
                            full: f,
                            relative,
                            data: imageAsBase64
                        };
                    });
                    clone.addEventListener('dblclick', (evt => {
                        selected = {
                            full: f,
                            relative,
                            data: imageAsBase64
                        };
                        resolve(selected);
                    }));
                    artPreviewParent.appendChild(clone);
                });
                
            }
        })();


    });
    promise.finally(() => {
        modal.classList.remove('is-active');
    })

    return promise;
}

export function cancelArt() {
    if (rejectPromise){
        rejectPromise({
            reason: 'cancelled'
        })
    }

}

const validImageExtensions = ['.png'];
async function* getFiles(dir: string): any {
  const dirents = await readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    const res = resolve(dir, dirent.name);
    if (dirent.isDirectory()) {
      yield* getFiles(res);
    } else if (validImageExtensions.indexOf(extname(res).toLowerCase()) > -1) {
      
      yield res;
    }
  }
}