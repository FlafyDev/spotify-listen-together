class Settings {
  settingsVersion? = "1"
  server = ""
  name = "Unnamed"
}

export default class SettingsManager {
  settings: Settings;

  constructor() {
    let settingsString = Spicetify.LocalStorage.get("listenTogether")
    let newSettings = new Settings()
    if (settingsString !== null) {
      this.settings = JSON.parse(settingsString)
      if (this.settings.settingsVersion !== newSettings.settingsVersion) {
        this.settings = newSettings
        this.saveSettings()
      }
    } else {
      this.settings = newSettings
      this.saveSettings()
    }
  }

  saveSettings() {
    Spicetify.LocalStorage.set("listenTogether", JSON.stringify(this.settings))
  }
}