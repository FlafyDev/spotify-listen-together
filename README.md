# Spotify Listen Together (Client)
### This project is still in development and testing. Please keep this in mind!
Spotify Listen Together is an extension for [Spicetify](https://spicetify.app/) and an alternative solution to Spotify's Group Session.

## Installation
1. Download and Install [Spicetify](https://spicetify.app/docs/getting-started/installation).
2. Download the [latest release](/releases/latest) of this extension.
3. Extract its contents to `...\.spicetify\Extensions`.
4. Run `spicetify config extensions listenTogether.mjs` and `spicetify apply`.

## Usage
<sup>The menu appears after left-clicking on your avatar at the top-right of Spotify's window.</sup>

### Creating a Server
To listen together with others, you must first create a server for everyone to join to.
To get started, go to [Spotify Listen Together Server](https://github.com/FlafyDev/spotify-listen-together-server).

### Joining a Server
Open the menu and under "Listen Together" there will be a "Connect to server" item. You'll need to enter the server's address and your name.

### Playing, Seeking, and Pausing Songs
After joining a server you might have realized that you can't play anything. Only the hosts are able to change, seek, and pause songs. To gain access to be a host, open the menu and under "Listen Together" there will be a "Request host" item. You'll need to enter the password set by the server.

### Disconnecting From a Server
Open the menu and under "Listen Together" there will be a "Disconnect from server" item.
