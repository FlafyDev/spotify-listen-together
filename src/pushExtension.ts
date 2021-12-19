import path from 'path'
import { exec } from 'child_process'
import { copyFile } from 'fs'

exec("spicetify -c", (error, stdout, stderr) => {
  const spicetifyDir = path.parse(stdout).dir
  copyFile('./dist/src/bundle.js', path.join(spicetifyDir, 'Extensions', 'listenTogether.js'), (err) => {
    if (err) throw err;
    console.log('Extension has been pushed to Spotify.');
  });
})