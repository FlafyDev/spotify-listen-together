# Spotify Listen Together
## ⚠️ Not working anymore ⚠️ 
I'm not using Spotify anymore so I have no real motivation to continue maintaining this project.

<br/>
<br/>
<br/>
<br/>
### This project is still in development and testing. Please keep this in mind!
Spotify Listen Together is an extension for [Spicetify](https://spicetify.app/) and an alternative solution to Spotify's Group Session.

## Download
### Marketplace 
Download [Spicetify Marketplace](https://github.com/CharlieS1103/spicetify-marketplace)
### OR: Manual Installation
1. Download and install [Spicetify](https://spicetify.app/docs/getting-started/installation).
2. Download [listenTogether.js](https://raw.githubusercontent.com/FlafyDev/spotify-listen-together/main/compiled/listenTogether.js).
3. Paste `listenTogether.js` in `%userprofile%\.spicetify\Extensions`(Find the folder `.spicetify` by doing `spicetify -c` in the CMD/Powershell).
4. Run `spicetify config extensions listenTogether.js` and `spicetify apply`.

## Usage
<sup>Press the "Listen Together" button in the top left to open the extension's menu.</sup>

### Creating a Server
To listen together with others, you must first create a server for everyone to join to.
To get started, go to [Spotify Listen Together Server](https://github.com/FlafyDev/spotify-listen-together-server) or host with Heroku.

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/FlafyDev/spotify-listen-together-server)

### Joining a Server
Press "Join a server" in the menu and enter the server's address and your name.

### Playing, Seeking, and Pausing Songs
Only the hosts are able to change, seek, and pause songs. To become a host, press "Request host" in the menu and enter the password set by the server.

### Disconnecting From a Server
Press "Leave the server" in the menu.

## Examples
Example of the website:
![Website](examples/web.png)

## TODOs (For both the client and the server)
- Change "server" to "room". Have multiple rooms per server.
- Fix unexpected behavior when selecting the song that is currently playing.
