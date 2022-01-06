# Spotify Listen Together
### This project is still in development and testing. Please keep this in mind!
Spotify Listen Together is an extension for [Spicetify](https://spicetify.app/) and an alternative solution to Spotify's Group Session.

## Manual Installation
1. Download and install [Spicetify](https://spicetify.app/docs/getting-started/installation).
2. Download the [latest release](https://github.com/FlafyDev/spotify-listen-together/releases/latest) of this extension.
3. Paste `listenTogether.js` in `...\.spicetify\Extensions`(Find the `.spicetify` folder by doing `spicetify -c` in CMD/Powershell)).
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
- DONE (not tested) | Show if a listener is the host/is watching an AD (on the website).
- DONE (not tested) | Ping server every few minutes (In case it's Heroku or something so it won't close).
- DONE (not tested) | Handle listeners who joined while a song was playing.
- DONE (not tested) | Wait if a listener is watching an AD.
- DONE (not tested) | Have some sort of visualizer inside Spotify which shows who's listening with you and if you're connected to a server.
- DONE (not tested) | Send song requests to the host.