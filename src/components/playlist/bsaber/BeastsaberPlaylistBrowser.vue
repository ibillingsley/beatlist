<template>
  <v-container fluid>
    <v-alert v-if="errorPlaylists" type="warning" class="mt-5">
      Couldn't load playlists
      <v-icon>sentiment_dissatisfied</v-icon>
    </v-alert>

    <template v-else>
      <p class="text-h5">Curated</p>
      <BeastsaberPlaylistSlider
        v-slot="{ playlist }"
        :playlists="curatedPlaylists"
        :selected="currentPlaylistBeast"
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

      <p class="text-h5">Verified Mapper</p>
      <BeastsaberPlaylistSlider
        v-slot="{ playlist }"
        :playlists="verifiedPlaylists"
        :selected="currentPlaylistBeast"
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
    </template>

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
import { BeatsaverFilter } from "@/libraries/net/beatsaver/BeatsaverFilter";

export default Vue.extend({
  name: "BeastsaberPlaylistBrowser",
  components: { BeastsaberPlaylistSlider, BeastsaberPlaylistContent },
  data() {
    return {
      loading: true,
      curatedPlaylists: [] as BeastsaberPlaylist[],
      verifiedPlaylists: [] as BeastsaberPlaylist[],
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
    this.curatedPlaylists = [];
    this.verifiedPlaylists = [];
    Promise.all([
      this.loadPlaylist({ curated: true }).then((result) => {
        this.curatedPlaylists = result;
      }),
      this.loadPlaylist({ verified: true }).then((result) => {
        this.verifiedPlaylists = result;
      }),
    ])
      .catch((e: Error) => {
        this.errorPlaylists = e.message;
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    async loadPlaylist(
      filters?: BeatsaverFilter
    ): Promise<BeastsaberPlaylist[]> {
      this.errorPlaylists = undefined;

      const apiResponse = await BeastsaberAPI.Singleton.GetPlaylists(filters);

      switch (apiResponse.status) {
        case BeastsaberAPIResponseStatus.Success:
          return apiResponse.data.docs;

        case BeastsaberAPIResponseStatus.Failed:
          throw new Error(apiResponse.error);

        default:
          throw new Error("Unexpected error");
      }
    },
    onPlaylistSelected(playlist: BeastsaberPlaylist) {
      this.progress = new Progress();
      this.currentPlaylistLocal = undefined;
      this.currentPlaylistBeast = playlist;
      this.loadingPlaylistLocal = true;

      PlaylistFetcher.Fetch(playlist.downloadURL, this.progress)
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
            playlist.name === p.title && playlist.owner.name === p.author
        ) !== undefined
      );
    },
    // installPlaylist(playlist: PlaylistLocal) {
    installPlaylist() {
      if (!this.currentPlaylistBeast) {
        return;
      }

      let filename = this.currentPlaylistBeast.name
        .replace(/[\s]/g, "-")
        .replace(/[^a-zA-Z0-9-]*/g, "");
      // PlaylistLocal 画面で編集した時のファイル名に合わせる
      filename = PlaylistFilename.computeFilenameFor(filename);

      this.loadingPlaylistInstall = true;
      PlaylistFetcher.Install(
        this.currentPlaylistBeast.downloadURL,
        filename,
        PlaylistFormatType.Json
      )
        .then(() => {
          NotificationService.NotifyMessage(
            `${this.currentPlaylistBeast?.name} has been installed`,
            "success",
            NOTIFICATION_ICON_SUCCESS,
            2500
          );
        })
        .catch((e: Error) => {
          this.errorPlaylist = e.message;
          NotificationService.NotifyMessage(
            `${this.currentPlaylistBeast?.name} installation failed`,
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
