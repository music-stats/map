import * as fs from 'fs';
import * as path from 'path';

type TxtMultilineFileContent = string[];

export interface TxtMultilineFolderContent {
  [fileName: string]: TxtMultilineFileContent;
}

function readTxtMultilineFile(filePath: string): Promise<TxtMultilineFileContent> {
  return fs.promises.readFile(filePath, 'utf8')
    .then((content) => content.split('\n'));
}

export function readJsonFile<DataType>(filePath: string): Promise<DataType> {
  return fs.promises.readFile(filePath, 'utf8')
    .then(JSON.parse);
}

export function writeFile<DataType>(filePath: string, data: DataType): Promise<DataType> {
  return fs.promises.writeFile(filePath, JSON.stringify(data, null, 2))
    .then(() => data);
}

// Returns a Promise with something like:
//
// {
//   "australia": ["Melbourne", "Sydney"],
//   "belarus": ["Minsk"],
//   "canada": ["Quebec", "Toronto"],
//   ...
//   "united-states": ["Detroit", "Houston", ...],
// }
export function readTxtMultilineFolder(folderPath: string): Promise<TxtMultilineFolderContent> {
  const folderContent: TxtMultilineFolderContent = {};

  function appendTxtMultiliteFileContent(fileName: string): Promise<TxtMultilineFileContent> {
    return readTxtMultilineFile(path.resolve(folderPath, fileName))
      .then((fileContent) => folderContent[fileName] = fileContent);
  }

  return fs.promises.readdir(folderPath)
    .then((fileNames) => Promise.all(fileNames.map(appendTxtMultiliteFileContent)))
    .then(() => folderContent);
}
