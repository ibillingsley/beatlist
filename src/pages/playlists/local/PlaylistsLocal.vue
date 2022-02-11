<template>
  <v-container>
    <p class="display-2">
      My Playlists
    </p>
    <v-container class="d-flex align-center">
      <v-subheader>actions</v-subheader>
      <PlaylistButtonNewPlaylist :selected-folder="selectedFolder" />
      <PlaylistButtonOpenFolder />
      <v-container
        class="d-flex align-center"
        style="flex-direction: row; justify-content: flex-end;"
      >
        <v-select
          v-model="sortColumn"
          :items="sortColumnList"
          item-text="text"
          item-value="value"
          class="ml-2 flex-grow-0"
          color="accent"
          label="Sort"
          dense
          inset
          hide-details="auto"
          style="width: 10em;"
        />
        <v-btn icon @click="switchSortOrder">
          <v-icon v-if="sortOrder === 'asc'">arrow_upward</v-icon>
          <v-icon v-else>arrow_downward</v-icon>
        </v-btn>
        <v-text-field
          v-model="search"
          solo
          dense
          hide-details
          append-icon="search"
          clearable
          class="flex-grow-0"
          @input="sortPlaylists"
          @click:clear="search = ''"
        />
      </v-container>
    </v-container>

    <v-container class="d-flex flex-row pa-0" style="flex-wrap: nowrap;">
      <PlaylistsFolderViewer
        class="flex-grow-0 flex-shrink-0"
        style="min-width: 200px; width: 25%;"
        prevent-click-on-active-node
        :default-active="'root'"
        @update:selection="selectFolder"
      />
      <PlaylistsListViewer
        :playlists="sortedPlaylists"
        :action="openPlaylist"
        class="flex-grow-1 flex-shrink-1"
        style="width: 75%;"
      >
        <template #actions="{ playlist }">
          <div class="d-flex">
            <PlaylistButtonRemovePlaylist :playlist="playlist" />
            <Tooltip text="See more">
              <v-btn
                icon
                :to="{
                  name: playlistLocalUnitRouteName,
                  params: { hash: playlist.hash },
                }"
              >
                <v-icon>chevron_right</v-icon>
              </v-btn>
            </Tooltip>
          </div>
        </template>
      </PlaylistsListViewer>
    </v-container>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import store from "@/plugins/store";
import PlaylistsFolderViewer from "@/components/playlist/folder/PlaylistsFolderViewer.vue";
import PlaylistsListViewer from "@/components/playlist/list/PlaylistsListViewer.vue";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import {
  PlaylistFolder,
  PlaylistLocal,
} from "@/libraries/playlist/PlaylistLocal";
import PlaylistButtonNewPlaylist from "@/components/playlist/button/PlaylistButtonNewPlaylist.vue";
import PlaylistButtonRemovePlaylist from "@/components/playlist/button/PlaylistButtonRemovePlaylist.vue";
import Tooltip from "@/components/helper/Tooltip.vue";
import NotificationService, {
  NOTIFICATION_ICON_FAILED,
} from "@/libraries/notification/NotificationService";
import PlaylistButtonOpenFolder from "@/components/playlist/button/PlaylistButtonOpenFolder.vue";
import DiscordRichPresence from "@/libraries/ipc/DiscordRichPresence";
import route from "@/plugins/route/route";
import PlaylistSortColumnType from "@/libraries/playlist/PlaylistSortColumnType";
import PlaylistSortOrderType from "@/libraries/playlist/PlaylistSortOrderType";
import Logger from "@/libraries/helper/Logger";

export default Vue.extend({
  name: "PlaylistsLocal",
  components: {
    PlaylistsFolderViewer,
    PlaylistsListViewer,
    PlaylistButtonNewPlaylist,
    PlaylistButtonRemovePlaylist,
    PlaylistButtonOpenFolder,
    Tooltip,
  },
  beforeRouteEnter(to, from, next) {
    const amount = PlaylistLibrary.GetAllValidPlaylists().length;
    const amountText = `${amount} playlist${amount > 1 ? "s" : ""}`;
    DiscordRichPresence.UpdateStatus("Browsing local playlist", amountText);
    next();
  },
  data: () => ({
    search: "",
    sortColumn: PlaylistSortColumnType.Title,
    sortOrder: PlaylistSortOrderType.Asc,
    sortedPlaylists: [] as PlaylistLocal[],
    selectedFolder: undefined as string | undefined,
  }),
  computed: {
    playlists: () => PlaylistLibrary.GetAllValidPlaylists(),
    playlistLocalUnitRouteName: () => route.PLAYLISTS_LOCAL_UNIT,
    sortColumnList: () => PlaylistLibrary.GetSortColumnList(),
    sortOrderList: () => PlaylistLibrary.GetSortOrderList(),
  },
  watch: {
    playlists() {
      this.sortPlaylists();
    },
    sortColumn() {
      if (this.sortColumn != null) {
        store.commit("settings/SET_MY_PLAYLISTS", {
          sortColumn: this.sortColumn,
          sortOrder: this.sortOrder,
        });
      }
      this.sortPlaylists();
    },
    sortOrder() {
      if (this.sortOrder != null) {
        store.commit("settings/SET_MY_PLAYLISTS", {
          sortColumn: this.sortColumn,
          sortOrder: this.sortOrder,
        });
      }
      this.sortPlaylists();
    },
  },
  mounted(): void {
    const myPlaylistsSettings: {
      sortColumn: PlaylistSortColumnType.Title;
      sortOrder: PlaylistSortOrderType.Asc;
    } = store.getters["settings/myPlaylists"];

    this.sortColumn =
      myPlaylistsSettings.sortColumn ?? PlaylistSortColumnType.Title;
    this.sortOrder = myPlaylistsSettings.sortOrder ?? PlaylistSortOrderType.Asc;

    this.sortPlaylists();
  },
  methods: {
    sortPlaylists(): void {
      let list = PlaylistLibrary.SortPlaylists(
        this.playlists,
        this.sortColumn,
        this.sortOrder
      );
      if (this.search != null && this.search !== "") {
        list = list.filter((entry) => {
          const searchText = this.search.toLowerCase();
          return (
            entry.title?.toLowerCase().includes(searchText) ||
            entry.author?.toLowerCase().includes(searchText) ||
            entry.description?.toLowerCase().includes(searchText)
          );
        });
      }
      if (this.selectedFolder != null) {
        list = PlaylistLibrary.FilterPlaylistByPath(list, this.selectedFolder);
      }
      this.sortedPlaylists = list;
    },
    switchSortOrder(): void {
      this.sortOrder =
        this.sortOrder === PlaylistSortOrderType.Asc
          ? PlaylistSortOrderType.Desc
          : PlaylistSortOrderType.Asc;
    },
    openPlaylist(playlist: PlaylistLocal): void {
      if (playlist.hash) {
        this.$router.push({
          name: route.PLAYLISTS_LOCAL_UNIT,
          params: { hash: playlist.hash },
        });
      } else {
        NotificationService.NotifyMessage(
          "Somehow this map doesn't have hash, can't open the link",
          "error",
          NOTIFICATION_ICON_FAILED,
          2500
        );
      }
    },
    selectFolder(selectedFolder: PlaylistFolder): void {
      Logger.debug(`folder selected: ${selectedFolder.path}`, "PlaylistsLocal");
      this.selectedFolder = selectedFolder.path;
      this.sortPlaylists();
    },
  },
});
</script>
