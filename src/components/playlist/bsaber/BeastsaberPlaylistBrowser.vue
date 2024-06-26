<template>
  <v-container fluid>
    <v-alert v-if="errorPlaylists" type="warning" class="mt-5">
      Couldn't load playlists
      <v-icon>sentiment_dissatisfied</v-icon>
    </v-alert>

    <BeastsaberPlaylistSlider
      v-else
      v-slot="{ playlist }"
      :playlists="playlists"
      :loading="loading"
      @playlistClick="onPlaylistSelected"
    >
      <v-btn
        icon
        x-large
        :disabled="!currentPlaylistLocal || isPlaylistDownloaded(playlist)"
        @click.stop="installPlaylist()"
      >
        <v-icon color="success" x-large>
          {{ isPlaylistDownloaded(playlist) ? "done" : "file_download" }}
        </v-icon>
      </v-btn>
    </BeastsaberPlaylistSlider>

    <BeastsaberPlaylistContent
      :playlist-local="currentPlaylistLocal"
      :playlist-beastsaber="currentPlaylistBeast"
      :progress="progress"
      :error="errorPlaylist"
      :loading="loadingPlaylistLocal"
    />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import BeastsaberAPI from "@/libraries/net/bsaber/BeastsaberAPI";
import BeastsaberPlaylist from "@/libraries/net/bsaber/BeastsaberPlaylist";
import { BeastsaberAPIResponseStatus } from "@/libraries/net/bsaber/BeastsaberAPIResponse";
import BeastsaberPlaylistSlider from "@/components/playlist/bsaber/BeastsaberPlaylistSlider.vue";
import PlaylistFetcher from "@/libraries/net/playlist/PlaylistFetcher";
import Progress from "@/libraries/common/Progress";
import { PlaylistLocal } from "@/libraries/playlist/PlaylistLocal";
import BeastsaberPlaylistContent from "@/components/playlist/bsaber/BeastsaberPlaylistContent.vue";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import PlaylistFormatType from "@/libraries/playlist/PlaylistFormatType";
import NotificationService, {
  NOTIFICATION_ICON_FAILED,
  NOTIFICATION_ICON_SUCCESS,
} from "@/libraries/notification/NotificationService";
import PlaylistFilename from "@/libraries/playlist/PlaylistFilename";

export default Vue.extend({
  name: "BeastsaberPlaylistBrowser",
  components: { BeastsaberPlaylistSlider, BeastsaberPlaylistContent },
  data() {
    return {
      loading: true,
      playlists: [] as BeastsaberPlaylist[],
      currentPlaylistBeast: undefined as BeastsaberPlaylist | undefined,
      currentPlaylistLocal: undefined as PlaylistLocal | undefined,
      errorPlaylists: undefined as string | undefined,
      errorPlaylist: undefined as string | undefined,
      progress: undefined as Progress | undefined,
      loadingPlaylistLocal: false,
      loadingPlaylistInstall: false,
    };
  },
  mounted(): void {
    this.loading = true;
    this.loadPlaylist().then(() => {
      this.loading = false;
    });
  },
  methods: {
    async loadPlaylist() {
      this.errorPlaylists = undefined;
      this.playlists = [];

      const apiResponse = await BeastsaberAPI.Singleton.GetPlaylists();

      switch (apiResponse.status) {
        case BeastsaberAPIResponseStatus.Success:
          this.playlists = apiResponse.data;
          break;

        case BeastsaberAPIResponseStatus.Failed:
          this.errorPlaylists = apiResponse.error;
          break;

        default:
          this.errorPlaylists = "Unexpected error";
      }
    },
    onPlaylistSelected(playlist: BeastsaberPlaylist) {
      this.progress = new Progress();
      this.currentPlaylistLocal = undefined;
      this.currentPlaylistBeast = playlist;
      this.loadingPlaylistLocal = true;

      PlaylistFetcher.Fetch(playlist.playlistURL, this.progress)
        .then((pl: PlaylistLocal) => {
          this.progress = undefined;
          this.currentPlaylistLocal = pl;
        })
        .catch((e: Error) => {
          this.errorPlaylist = e.message;
          NotificationService.NotifyMessage(
            `${e?.message ?? e}`,
            "warning",
            NOTIFICATION_ICON_FAILED,
            2500
          );
        })
        .finally(() => {
          this.loadingPlaylistLocal = false;
        });
    },
    isPlaylistDownloaded(playlist: BeastsaberPlaylist) {
      return (
        PlaylistLibrary.GetAllValidPlaylists().find(
          (p: PlaylistLocal) =>
            playlist.playlistTitle === p.title &&
            playlist.playlistAuthor === p.author
        ) !== undefined
      );
    },
    // installPlaylist(playlist: PlaylistLocal) {
    installPlaylist() {
      if (!this.currentPlaylistBeast) {
        return;
      }

      let filename = this.currentPlaylistBeast.playlistTitle
        .replace(/[\s]/g, "-")
        .replace(/[^a-zA-Z0-9-]*/g, "");
      // PlaylistLocal 画面で編集した時のファイル名に合わせる
      filename = PlaylistFilename.computeFilenameFor(filename);

      this.loadingPlaylistInstall = true;
      PlaylistFetcher.Install(
        this.currentPlaylistBeast.playlistURL,
        filename,
        PlaylistFormatType.Json
      )
        .then(() => {
          NotificationService.NotifyMessage(
            `${this.currentPlaylistBeast?.playlistTitle} has been installed`,
            "success",
            NOTIFICATION_ICON_SUCCESS,
            2500
          );
        })
        .catch((e: Error) => {
          this.errorPlaylist = e.message;
          NotificationService.NotifyMessage(
            `${this.currentPlaylistBeast?.playlistTitle} installation failed`,
            "warning",
            NOTIFICATION_ICON_FAILED,
            2500
          );
        })
        .finally(() => {
          this.loadingPlaylistInstall = false;
        });

      /*
      this.loadingPlaylistInstall = true;
      PlaylistInstaller.Install(
        playlist,
        PlaylistFormatType.Json,
        filename
      ).finally(() => {
        this.loadingPlaylistInstall = false;
        NotificationService.NotifyMessage(
          `${this.currentPlaylistBeast?.playlistTitle} has been installed`,
          "success",
          NOTIFICATION_ICON_SUCCESS,
          2500
        );
      });
      */
    },
  },
});
</script>
