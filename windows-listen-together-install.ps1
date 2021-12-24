Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/khanhas/spicetify-cli/master/install.ps1" | Invoke-Expression
spicetify config extensions listenTogether.js
Invoke-WebRequest "https://github.com/FlafyDev/spotify-listen-together/releases/download/vX/listenTogether.js" -OutFile ($( Split-Path $( spicetify -c ) ) + "\Extensions\listenTogether.js")
spicetify backup apply