// ==UserScript==
// @name         Emby 本地PotPlayer播放
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  在emby web端，调用本地的PotPlayer播放本地的视频
// @author       zhanq、修改Cybit的代码
// @grant        none
// @match        none
// ==/UserScript==

/* jshint esversion:8 */

class PotPlayer {
  constructor() {
    this.id = 'potplayer'
    this.type = 'mediaplayer'
    this.name = 'Pot Player'

    function dummy() {}

    for (const k of ['volume', 'isMuted', 'paused', 'currentTime', 'currentSrc']) {
      this[k] = dummy;
    }
  }

  canPlayMediaType(mediaType) {
    return (mediaType || '').toLowerCase() === 'video';
  }

  canPlayItem() {
    return true;
  }

  async play(item, options) {
    const potUrl = `emby://${item.mediaSource.Path}`; //采用本地化的方式播放视频
    window.location.href = potUrl;
  }


  async stop() {}

  async getDeviceProfile(item, options) {
    return null;
  }
}

(async function() {
  'use strict';

  while (!window.require || !window.ConnectionManager) {
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  window.require(['pluginManager'], (pluginManager) => {
    pluginManager.register(new PotPlayer());

    console.log('Pot Player plugin registered');
  })
})();