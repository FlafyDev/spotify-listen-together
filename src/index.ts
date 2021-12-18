/// <reference path="./globals.d.ts" />

import LTPlayer from './ltPlayer';

(function listenTogetherMain() {
  if (!Spicetify.CosmosAsync || !Spicetify.Platform || !Spicetify.LocalStorage) {
    setTimeout(listenTogetherMain, 1000);
    return;
  }
  
  const ltPlayer = new LTPlayer()
})()