import * as fs from 'fs';

export function readFile<DataType>(filePath: string): Promise<DataType> {
  return fs.promises.readFile(filePath, 'utf8')
    .then(JSON.parse);
}

export function writeFile<DataType>(filePath: string, data: DataType): Promise<DataType> {
  return fs.promises.writeFile(filePath, JSON.stringify(data, null, 2))
    .then(() => data);
}
