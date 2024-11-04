<template>
  <v-container fluid>
    <p class="text-h4">Preferences</p>
    <p class="text-h6">Application</p>
    <v-switch
      v-model="darkTheme"
      color="accent"
      label="Dark theme"
      dense
      inset
    />
    <v-switch
      v-model="enableDiscordRichPresence"
      color="accent"
      label="Discord Rich Presence"
      dense
      inset
    />
    <p class="text-h6 pt-5">Playlists</p>
    <v-select
      v-model="defaultExportFormat"
      color="accent"
      :items="exportFormatList"
      label="Playlist export format"
      messages="The default format used to save new playlist."
      dense
      filled
    />
    <v-select
      v-model="playlistIndentType"
      color="accent"
      :items="playlistIndentTypeList"
      item-text="text"
      item-value="value"
      label="Indent"
      messages="The type of indentation used to save a playlist."
      dense
      filled
    />
    <v-switch
      v-model="disablePlaylistFolderManagement"
      color="accent"
      label="Disable playlist folder management"
      dense
      inset
    >
      <template #label>
        <div>
          <div>Disable playlist folder management</div>
          <div
            v-if="disablePlaylistFolderManagement"
            class="warning--text text-caption"
          >
            Be aware that the playlists in the subfolders will not be displayed.
          </div>
        </div>
      </template>
    </v-switch>
    <p class="text-h6 pt-5">Beatsaver</p>
    <v-select
      v-model="beatsaverServerUrl"
      :items="beatsaverUrlList"
      class="pt-7"
      color="accent"
      label="Beatsaver server url"
      messages="Where the request are made. This allow the usage of mirror server."
      dense
      inset
      @change="updateServerUrl"
    />
    <p v-if="isBeatSaverPlus()" class="warning--text text-caption">
      Be aware that BeatSaberPlus is an unofficial mirror of Beatsaver.
    </p>
    <OneClickSettings />
    <p class="text-h6 pt-5">Accessibility</p>
    <v-switch
      v-model="showLetterInDifficulty"
      color="accent"
      label="Show text in difficulty label"
      messages="This will show a letter in difficulty label to make it easier to distinguish them."
      dense
      inset
    />
    <v-select
      v-model="colorBlindMode"
      :items="colorBlindModeList"
      class="pt-7"
      color="accent"
      label="Colorblind mode"
      messages="This changes the way color is shown on difficulty labels"
      dense
      inset
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { sync } from "vuex-pathify";
import DiscordRichPresence from "@/libraries/ipc/DiscordRichPresence";
import PlaylistFormatType from "@/libraries/playlist/PlaylistFormatType";
import OneClickSettings from "@/pages/settings/components/OneClickSettings.vue";
import { ColorblindMode } from "@/libraries/app/Colorblind";
import BeatsaverAPI from "@/libraries/net/beatsaver/BeatsaverAPI";
import BeatsaverServerUrl from "@/libraries/net/beatsaver/BeatsaverServerUrl";
import PlaylistIndentType from "@/libraries/playlist/loader/serializer/PlaylistIndentType";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import ScannerService from "@/libraries/scanner/ScannerService";

export default Vue.extend({
  name: "Preferences",
  components: { OneClickSettings },
  computed: {
    enableDiscordRichPresence: sync<boolean>(
      "settings/enableDiscordRichPresence"
    ),
    darkTheme: sync<boolean>("settings/darkTheme"),
    installationPathValid: sync<boolean>("settings/installationPathValid"),
    beatsaverServerUrl: sync<BeatsaverServerUrl>("settings/beatsaverServerUrl"),
    defaultExportFormat: sync<PlaylistFormatType>(
      "settings/defaultExportFormat"
    ),
    playlistIndentType: sync<PlaylistIndentType>("settings/playlistIndentType"),
    disablePlaylistFolderManagement: sync<boolean>(
      "settings/disablePlaylistFolderManagement"
    ),
    showLetterInDifficulty: sync<boolean>(
      "settings/accessibility@showLetterInDifficulty"
    ),
    colorBlindMode: sync<ColorblindMode>(
      "settings/accessibility@colorBlindMode"
    ),
    colorBlindModeList: () =>
      Object.entries(ColorblindMode).map((entry) => ({
        text: entry[0],
        value: entry[1],
      })),
    exportFormatList: () =>
      Object.values(PlaylistFormatType).filter(
        (format) =>
          ![PlaylistFormatType.Unset, PlaylistFormatType.Blist].includes(format)
      ),
    playlistIndentTypeList: () => PlaylistLibrary.GetIndentTypeList(),
    beatsaverUrlList: () =>
      Object.entries(BeatsaverServerUrl).map((entry) => ({
        text: `${entry[0]} (${entry[1]})`,
        value: entry[1],
      })),
  },
  watch: {
    enableDiscordRichPresence() {
      DiscordRichPresence.SetVisibility(this.enableDiscordRichPresence);
    },
    disablePlaylistFolderManagement() {
      ScannerService.ScanPlaylists(); // 非同期
    },
  },
  methods: {
    isBeatSaverPlus() {
      return this.beatsaverServerUrl === BeatsaverServerUrl.BeatSaberPlus;
    },
    updateServerUrl() {
      BeatsaverAPI.Singleton.updateBaseUrl(this.beatsaverServerUrl);
    },
  },
});
</script>
