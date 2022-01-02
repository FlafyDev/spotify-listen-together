((taskkill //IM "Spotify.exe" //F) || (echo "")) &&
sleep 2 &&
start %APPDATA%/Spotify/Spotify.exe --remote-debugging-port=9222 &&
D:/Programs/Sandboxie-Plus/Start.exe cmd.exe //c "start %APPDATA%/Spotify/Spotify.exe --remote-debugging-port=9223" &&
sleep 2 &&
(echo -e "$(curl http://localhost:9222/json/list | json -ga webSocketDebuggerUrl)\n$(curl http://localhost:9223/json/list | json -ga webSocketDebuggerUrl)") > debuggerUrls.txt

