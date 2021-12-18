import LTPlayer from './ltPlayer'

interface IMenuItems {
  connectToServer?: Spicetify.Menu.Item,
  requestHost?: Spicetify.Menu.Item
}

export default class UI {
  menuItems: IMenuItems

  constructor (public ltPlayer: LTPlayer) {
    this.menuItems = {
      connectToServer: new Spicetify.Menu.Item("Connect to server", false, () => {
        if (ltPlayer.client.connected || ltPlayer.client.connecting) {
          ltPlayer.client.stopClient()
        } else {
          let newServer = prompt("Enter the server's address:", ltPlayer.settingsManager.settings.server)?.replace(" ", "");
          if (!!newServer) {
            ltPlayer.settingsManager.settings.server = newServer
            ltPlayer.settingsManager.saveSettings()
            ltPlayer.client.connectToServer(newServer)
          }
        }
      }),
      requestHost: new Spicetify.Menu.Item("Request host", false, () => {
        if (ltPlayer.client.connected) {
          let password = window.prompt("Password to access host:")
          if (!!password) {
            ltPlayer.client.socket?.emit("requestHost", password, (permitted: boolean) => {
              if (permitted) {
                alert("You're now the host.")
                ltPlayer.isHost = true
              } else {
                alert("Host request denied.")
              }
            })
          }
        } else {
          alert("Please connect to a server.")
        }
    
      })
    }
    new Spicetify.Menu.SubMenu("Listen Together", Object.values(this.menuItems)).register();
  }
}
