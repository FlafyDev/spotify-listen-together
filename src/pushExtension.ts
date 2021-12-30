import path from 'path'
import { exec } from 'child_process'
import { copyFile } from 'fs'

exec("spicetify -c", (error, stdout, stderr) => {
  const spicetifyDir = path.parse(stdout).dir
  const spotifyDir = path.join(process.env.APPDATA!, "Spotify")
  const extensionFile = path.join(spicetifyDir, "Extensions", "listenTogether.js")
  const appExtensionFile = path.join(spotifyDir, "Apps", "xpui", "extensions", "listenTogether.js")

  copyFile('./dist/src/bundle.js', extensionFile, (err) => {
    if (err) throw err;
    copyFile(extensionFile, appExtensionFile, (err) => {
      if (err) throw err;
      console.log('Extension has been pushed to Spotify.');
    })
  });
})