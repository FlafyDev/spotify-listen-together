import React from 'react';
import { renderToStaticMarkup } from "react-dom/server"
import LTPlayer from '../ltPlayer'
import BottomInfo from './bottomInfo';
import { Popup } from './popup';
import iconSvg from './ListenTogetherIconSimplified'

const css = require('../public/ui.css')

export default class UI {
  bottomInfoContainer: Element | null = null

  constructor(public ltPlayer: LTPlayer) {
    // this.menuItems = {
    //   joinServer: new Spicetify.Menu.Item("Join a server", false, () => {
    //   }),
    //   requestHost: new Spicetify.Menu.Item("Request host", false, () => {
    //   }),
    //   test: new Spicetify.Menu.Item("Debug", false, () => {
    //     switch (window.prompt("code")) {
    //       case "1": {
    //         this.openMenu()

    //         break;
    //       }
    //       case "2": {
    //         break;
    //       }
    //     }
    //   })
    // }
    // new Spicetify.Menu.SubMenu("Listen Together", Object.values(this.menuItems)).register();

    new Spicetify.Topbar.Button("Listen Together", iconSvg, () => this.openMenu())
    
    let loop = setInterval(() => {
      let playingBar = document.getElementsByClassName("main-nowPlayingBar-nowPlayingBar").item(0)
      if (playingBar) {
        clearInterval(loop)
        this.bottomInfoContainer = document.createElement("div")
        this.bottomInfoContainer.id = "listenTogether-bottomInfo"
        playingBar.appendChild(this.bottomInfoContainer)
        this.renderBottomInfo(<BottomInfo server=""/>)
      }
    }, 100)
  }

  songRequestPopup(trackName: string, fromListener: string, permitted: () => void) {
    Popup.create("Listen Together", (btn) => { if (btn === "Play") permitted()}, ["Play"], [
      <Popup.Text text={`${fromListener} wants to play "${trackName}".`} />
    ])
  }

  openMenu() {
    Popup.create("Listen Together", () => {}, [], [
      <Popup.Button text={(this.ltPlayer.client.connected || this.ltPlayer.client.connecting) ? "Leave the server" : "Join a server"} onClick={() => this.onClickJoinAServer()}/>,
      <Popup.Button text={(this.ltPlayer.isHost ? "Stop hosting" : "Request host")} onClick={() => this.onClickRequestHost()} disabled={!this.ltPlayer.client.connected}/>,
      <Popup.Button text={"Github"} onClick={() => window.location.href="https://github.com/FlafyDev/spotify-listen-together"} />,
    ])
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
    }, ["Reconnect"], [
      <Popup.Text text={"Disconnected from the server."}/>
    ])
  }

  private onClickJoinAServer() {
    if (this.ltPlayer.client.connected || this.ltPlayer.client.connecting) {
      this.ltPlayer.client.disconnect()
    } else {
      this.joinServerPopup((address, name) => {
        if (!!address && !!name) {
          this.ltPlayer.settingsManager.settings.server = address
          this.ltPlayer.settingsManager.settings.name = name
          this.ltPlayer.settingsManager.saveSettings()
          this.ltPlayer.client.connect()
        }
      })
    }
  }

  private onClickRequestHost() {
    if (this.ltPlayer.client.connected) {
      if (this.ltPlayer.isHost) {
        this.ltPlayer.client.socket?.emit("cancelHost")
        Popup.close()
      } else {
        this.requestHostPopup((password) => {
          if (!!password) {
            this.ltPlayer.client.socket?.emit("requestHost", password)
          }
        })
      }
    } else {
      this.windowMessage("Please connect to a server before requesting host.")
    }
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

  renderBottomInfo(bottomInfo: JSX.Element) {
    if (this.bottomInfoContainer) {
      this.bottomInfoContainer.innerHTML = renderToStaticMarkup(bottomInfo)
    }
  }
}
