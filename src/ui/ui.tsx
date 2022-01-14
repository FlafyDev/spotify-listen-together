import React from 'react';
import { renderToStaticMarkup } from "react-dom/server"
import LTPlayer from '../ltPlayer'
import BottomInfo from './bottomInfo';
import { Popup } from './popup';
import iconSvg from './ListenTogetherIconSimplified'
import pJson from '../../package.json';

const css = require('../public/ui.css')

export default class UI {
  bottomInfoContainer: Element | null = null

  constructor(public ltPlayer: LTPlayer) {
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
    Popup.create("Listen Together", (btn) => { if (btn === "Play") permitted(); Popup.close(); }, ["Play"], [
      <Popup.Text text={`${fromListener} wants to play "${trackName}".`} />
    ])
  }

  openMenu() {
    Popup.create("Listen Together", () => Popup.close(), [], [
      <Popup.Button text={(this.ltPlayer.client.connected || this.ltPlayer.client.connecting) ? "Leave the server" : "Join a server"} onClick={() => this.onClickJoinAServer()}/>,
      <Popup.Button text={(this.ltPlayer.isHost ? "Stop hosting" : "Request host")} onClick={() => this.onClickRequestHost()} disabled={!this.ltPlayer.client.connected}/>,
      <Popup.Button text={"About"} onClick={() => this.onClickAbout() } />,
    ])
  }



  windowMessage(message: string) {
    Popup.create("Listen Together", () => Popup.close(), ["OK"], [
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
      Popup.close()
    }, ["Reconnect"], [
      <Popup.Text text={"Disconnected from the server."}/>
    ])
  }

  joinAServerQuick(address: string) {
    if (!this.ltPlayer.client.connected && !this.ltPlayer.client.connecting && !!address) {
      this.ltPlayer.settingsManager.settings.server = address
      this.ltPlayer.settingsManager.saveSettings()
      if (!this.ltPlayer.settingsManager.settings.name) {
        this.onClickJoinAServer()
      } else {
        this.ltPlayer.client.connect()
      }
    }
  }

  private onClickJoinAServer() {
    if (this.ltPlayer.client.connected || this.ltPlayer.client.connecting) {
      this.ltPlayer.client.disconnect()
    } else {
      this.joinServerPopup((btn, address, name) => {
        if (btn === "Host a server") {
          window.location.href="https://heroku.com/deploy?template=https://github.com/FlafyDev/spotify-listen-together-server"
        } else {
          Popup.close()
          if (!!address && !!name) {
            this.ltPlayer.settingsManager.settings.server = address
            this.ltPlayer.settingsManager.settings.name = name
            this.ltPlayer.settingsManager.saveSettings()
            this.ltPlayer.client.connect()
          }
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
          Popup.close()
        })
      }
    } else {
      this.windowMessage("Please connect to a server before requesting host.")
    }
  }

  private onClickAbout() {
    Popup.create("Listen Together", () => {Popup.close()}, [], [
      <Popup.Text text={
`Listen Together v${pJson.version} created by FlafyDev`
} centered={false} />,
      <Popup.Button text={"Github"} onClick={() => window.location.href="https://github.com/FlafyDev/spotify-listen-together"} />,
    ])
  }

  private joinServerPopup(callback: (btn: string | null, address: string, name: string) => void) {
    let address = ""
    let name = ""
    Popup.create("Listen Together", (btn) => callback(btn, address, name), ["Join", "Host a server"], [
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
