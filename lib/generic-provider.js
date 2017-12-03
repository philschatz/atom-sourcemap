const fs = require('fs');
const path = require('path');

module.exports = class GenericProvider {

  transform(code, filePath) {
    // Loop through the matches until we find the last match
    // (bottom of the file because the <style> tag in HTML could have a sourceMappingURL)
    const re = /\ sourceMappingURL=([^\ \n]*)/g;
    let match = re.exec(code);
    let newMatch = match;
    while (newMatch) {
      newMatch = re.exec(code);
      if (newMatch) {
        match = newMatch;
      }
    }

    if (match) {
      // load the sourcemap file relative to the path of the code
      const sourceMapFile = match[1];
      const sourceMapPath = path.resolve(path.dirname(filePath), sourceMapFile);
      const sourceMapText = fs.readFileSync(sourceMapPath, 'utf8');
      const sourceMapJson = JSON.parse(sourceMapText);
      // rewrite all the filenames in the sourceMap to be absolute
      sourceMapJson.sources = sourceMapJson.sources.map(filename => {
        return path.resolve(path.dirname(sourceMapPath), filename);
      });
      return sourceMapJson;
    } else {
      return null;
    }
  }
};
