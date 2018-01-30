const fs = require('fs');

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function delay(promise, wait, ...args) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      promise(...args)
        .then(resolve)
        .catch(reject);
    }, wait);
  });
}

module.exports = {
  readFile,
  delay,
};
