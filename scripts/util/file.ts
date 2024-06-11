import { existsSync, readFileSync, writeFileSync } from 'fs';

const defaultPath = 'deployed.json';

function saveData(data: Object, path = defaultPath) {
  let fileData = {};

  // Check if the file exists
  if (existsSync(path)) {
    // Read the existing data from the file
    const fileContent = readFileSync(path, 'utf8');
    fileData = JSON.parse(fileContent);
  }

  // Update the file data with the new data
  fileData = { ...fileData, ...data };

  // Write the updated data back to the file
  writeFileSync(path, JSON.stringify(fileData, null, 2));
}

function readData(path = defaultPath) {
  try {
    const fileContent = readFileSync(path, 'utf8');
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new Error(`File ${path} not found.`);
    } else {
      throw error;
    }
  }
}

export { saveData, readData }
