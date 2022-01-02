import React from 'react';
import { renderToStaticMarkup } from "react-dom/server"
import LTPlayer from '../ltPlayer'
import BottomInfo from './bottomInfo';
import { Popup } from './popup';

interface IMenuItems {
  joinServer?: Spicetify.Menu.Item,
  requestHost?: Spicetify.Menu.Item,
  test?: Spicetify.Menu.Item
}

export default class UI {
  menuItems: IMenuItems
  bottomInfoContainer: Element | null = null

  constructor(public ltPlayer: LTPlayer) {
    this.menuItems = {
      joinServer: new Spicetify.Menu.Item("Join a server", false, () => {
        if (ltPlayer.client.connected || ltPlayer.client.connecting) {
          ltPlayer.client.disconnect()
        } else {
          this.joinServerPopup((address, name) => {
            if (!!address && !!name) {
              ltPlayer.settingsManager.settings.server = address
              ltPlayer.settingsManager.settings.name = name
              ltPlayer.settingsManager.saveSettings()
              ltPlayer.client.connect()
            }
          })
        }
      }),
      requestHost: new Spicetify.Menu.Item("Request host", false, () => {
        if (ltPlayer.client.connected) {
          if (this.ltPlayer.isHost) {
            this.ltPlayer.client.socket?.emit("cancelHost")
          } else {
            this.requestHostPopup((password) => {
              if (!!password) {
                ltPlayer.client.socket?.emit("requestHost", password)
              }
            })
          }
        } else {
          this.windowMessage("Please connect to a server before requesting host.")
        }
    
      }),
      test: new Spicetify.Menu.Item("Debug", false, () => {
        switch (window.prompt("code")) {
          case "1": {


            break;
          }
          case "2": {
            break;
          }
        }
      })
    }
    new Spicetify.Menu.SubMenu("Listen Together", Object.values(this.menuItems)).register();
    
    const playingBar = document.getElementsByClassName("main-nowPlayingBar-nowPlayingBar").item(0)
    if (playingBar) {
      this.bottomInfoContainer = document.createElement("div")
      this.bottomInfoContainer.id = "listenTogether-bottomInfo"
      playingBar.appendChild(this.bottomInfoContainer)
      this.renderBottomInfo("")
    }
  }

  windowMessage(message: string) {
    Popup.create("Listen Together", () => {}, ["OK"], [
      <Popup.Text text={message}/>
    ])
  }

  bottomMessage(message: string) {
    Spicetify.showNotification(message)
  }

  disconnectedPopup() {
    Popup.create("Listen Together", (btn) => {
      if (btn === "Reconnect") {
        this.ltPlayer.client.connect()
      }
    }, ["Close", "Reconnect"], [
      <Popup.Text text={"Disconnected from the server."}/>
    ])
  }

  private joinServerPopup(callback: (address: string, name: string) => void) {
    let address = ""
    let name = ""
    Popup.create("Listen Together", () => callback(address, name), ["Join"], [
      <Popup.Textbox name="Server address" example="https://www.server.com/" defaultValue={this.ltPlayer.settingsManager.settings.server} onInput={(text) => {
        address = text;
      }}/>,
      <Popup.Textbox name="Your name" example="Joe" defaultValue={this.ltPlayer.settingsManager.settings.name} onInput={(text) => {
        name = text;
      }}/>,
    ])
  }

  private requestHostPopup(callback: (password: string) => void) {
    let password = ""
    Popup.create("Listen Together", () => callback(password), ["Request"], [
      <Popup.Text text="Request host"/>,
      <Popup.Textbox name="Password" onInput={(text) => password = text}/>
    ])
  }

  renderBottomInfo(server: string, listeners: string[] = [], loading: boolean = false) {
    if (this.bottomInfoContainer) {
      this.bottomInfoContainer.innerHTML = renderToStaticMarkup(<BottomInfo server={server} listeners={listeners} loading={loading}/>)
    }
  }
}
