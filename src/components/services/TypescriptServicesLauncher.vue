<template>
  <div />
</template>

<script lang="ts">
import * as remote from "@electron/remote";
import Vue from "vue";
import { get } from "vuex-pathify";
import url from "url";
import DiscordRichPresence from "@/libraries/ipc/DiscordRichPresence";
import AutoScanLibHandler from "@/libraries/scanner/AutoScanLibHandler";
import NotificationServiceScanner from "@/libraries/notification/NotificationServiceScanner";
import UpgradeCheckerService from "@/libraries/app/UpgradeCheckerService";
import DownloadManager from "@/libraries/net/downloader/DownloadManager";
import AutoContinueAfterRateLimitedScan from "@/libraries/scanner/AutoContinueAfterRateLimitedScan";
import BeatsaverAPI from "@/libraries/net/beatsaver/BeatsaverAPI";
import store from "@/plugins/store";
import BeatsaverServerUrl from "@/libraries/net/beatsaver/BeatsaverServerUrl";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";

export default Vue.extend({
  name: "TypescriptServicesLauncher",
  computed: {
    enableDiscordRichPresence: get<boolean>(
      "settings/enableDiscordRichPresence"
    ),
  },
  mounted(): void {
    this.LaunchServices();
  },
  methods: {
    async LaunchServices() {
      await store.restored;

      BeatmapLibrary.GenerateBeatmapHashSet();
      this.DiscordRichPresence();
      const serverUrl = this.BeatsaverServerUrl();
      const cdnHost = await this.GetCdnHost(serverUrl);
      await BeatsaverCachedLibrary.LoadAll(cdnHost);

      await UpgradeCheckerService.Initialize(); // Scanner サービスが動く前に処理を行う

      AutoScanLibHandler.register();
      AutoContinueAfterRateLimitedScan.register();
      NotificationServiceScanner.Initialize();
      DownloadManager.Initialize();
    },
    DiscordRichPresence() {
      DiscordRichPresence.SetVisibility(this.enableDiscordRichPresence);
    },
    BeatsaverServerUrl() {
      const server =
        store.getters["settings/beatsaverServerUrl"] ??
        BeatsaverServerUrl.Beatsaver;
      BeatsaverAPI.Singleton.updateBaseUrl(server);
      return server;
    },
    async GetCdnHost(serverUrl: string) {
      let cdnHost;
      try {
        // 対応する CDN の host が何かを返す API はないので、若干無駄だが
        // 検索APIの応答から cover 画像用の CDN の host 名を取得
        const res = await fetch(`${serverUrl}/search/text/1`, {
          headers: {
            "User-Agent": remote.session.defaultSession?.getUserAgent(),
            "Accept-Language": "en",
          },
        });
        if (res.ok) {
          const result = await res.json();
          if (result?.docs?.length > 0) {
            const doc = result.docs[0];
            if (doc.versions?.length > 0) {
              const cdn = url.parse(doc.versions[0].coverURL);
              cdnHost = cdn.host;
            }
          }
        }
      } catch (e) {
        console.warn(e);
      }
      return cdnHost ?? undefined;
    },
  },
});
</script>
