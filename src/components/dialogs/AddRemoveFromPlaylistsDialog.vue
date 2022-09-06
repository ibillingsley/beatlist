<template>
  <v-dialog
    v-model="isOpen"
    width="500"
    @click:outside="$emit('update:open', false)"
  >
    <v-card>
      <v-card-title>
        <v-container
          class="d-flex align-center pt-0 pb-0"
          style="flex-direction: row; justify-content: flex-end"
        >
          <div class="align-center flex-grow-1">Add to ...</div>
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
            style="width: 10em"
          />
          <v-btn icon @click="switchSortOrder">
            <v-icon v-if="sortOrder === 'asc'">arrow_upward</v-icon>
            <v-icon v-else>arrow_downward</v-icon>
          </v-btn>
        </v-container>
        <v-container v-if="!folderManagementDisabled">
          <v-menu v-model="menu">
            <template #activator="{ on }">
              <v-text-field
                v-model="folderName"
                label="Folder"
                messages="All playlists displayed if no folder selected."
                prepend-icon="mdi-folder"
                readonly
                clearable
                v-on="on"
                @click:clear="clearFolderSelection"
              />
            </template>
            <PlaylistsFolderViewer
              fill-background
              @update:selection="selectFolder"
            />
          </v-menu>
        </v-container>
      </v-card-title>

      <v-card-text>
        <PlaylistsListViewer :playlists="sortedPlaylists">
          <template #actions="{ playlist }">
            <PlaylistButtonAddRemoveTogglePlaylist
              :playlist="playlist"
              :beatmap="beatmap"
            />
          </template>
        </PlaylistsListViewer>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeDialog"> Close </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import store from "@/plugins/store";
import { get } from "vuex-pathify";
import PlaylistsFolderViewer from "@/components/playlist/folder/PlaylistsFolderViewer.vue";
import PlaylistsListViewer from "@/components/playlist/list/PlaylistsListViewer.vue";
import {
  PlaylistFolder,
  PlaylistLocal,
} from "@/libraries/playlist/PlaylistLocal";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import PlaylistButtonAddRemoveTogglePlaylist from "@/components/playlist/button/PlaylistButtonAddRemoveTogglePlaylist.vue";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import PlaylistSortColumnType from "@/libraries/playlist/PlaylistSortColumnType";
import PlaylistSortOrderType from "@/libraries/playlist/PlaylistSortOrderType";
import Logger from "@/libraries/helper/Logger";

export default Vue.extend({
  name: "AddRemoveFromPlaylistsDialog",
  components: {
    PlaylistsFolderViewer,
    PlaylistsListViewer,
    PlaylistButtonAddRemoveTogglePlaylist,
  },
  props: {
    open: { type: Boolean, required: true },
    beatmap: { type: Object as PropType<BeatsaverBeatmap>, required: true },
  },
  data: () => ({
    // props の値を直接 v-model に渡すべきではないので別の変数を用意する。
    isOpen: false,
    sortColumn: PlaylistSortColumnType.Title,
    sortOrder: PlaylistSortOrderType.Asc,
    sortedPlaylists: [] as PlaylistLocal[],
    menu: false,
    folderName: "", // v-model 用に変数を別途用意
  }),
  computed: {
    playlists: () => PlaylistLibrary.GetAllValidPlaylists(),
    sortColumnList: () => PlaylistLibrary.GetSortColumnList(),
    sortOrderList: () => PlaylistLibrary.GetSortOrderList(),
    folderManagementDisabled: get<boolean>(
      "settings/disablePlaylistFolderManagement"
    ),
    selectedFolderName: get<string>(
      "appState/selectedPlaylistFolderInDialog@name"
    ),
    selectedFolder: get<string>("appState/selectedPlaylistFolderInDialog@path"),
  },
  watch: {
    open() {
      if (this.isOpen !== this.open) {
        this.isOpen = this.open;
      }
    },
    isOpen() {
      if (this.isOpen !== this.open) {
        this.$emit("update:open", this.isOpen);
      }
    },
    playlists() {
      this.sortPlaylists();
    },
    sortColumn() {
      if (this.sortColumn != null) {
        store.commit("settings/SET_ADD_REMOVE_FROM_PLAYLISTS_DIALOG", {
          sortColumn: this.sortColumn,
          sortOrder: this.sortOrder,
        });
      }
      this.sortPlaylists();
    },
    sortOrder() {
      if (this.sortOrder != null) {
        store.commit("settings/SET_ADD_REMOVE_FROM_PLAYLISTS_DIALOG", {
          sortColumn: this.sortColumn,
          sortOrder: this.sortOrder,
        });
      }
      this.sortPlaylists();
    },
    selectedFolderName() {
      this.folderName = this.selectedFolderName;
    },
  },
  mounted(): void {
    this.isOpen = this.open;

    const myPlaylistsSettings: {
      sortColumn: PlaylistSortColumnType.Title;
      sortOrder: PlaylistSortOrderType.Asc;
    } = store.getters["settings/addRemoveFromPlaylistsDialog"];

    this.sortColumn =
      myPlaylistsSettings.sortColumn ?? PlaylistSortColumnType.Title;
    this.sortOrder = myPlaylistsSettings.sortOrder ?? PlaylistSortOrderType.Asc;

    this.folderName = this.selectedFolderName;
    this.sortPlaylists();
  },
  methods: {
    closeDialog() {
      this.$emit("update:open", false);
    },
    sortPlaylists(): void {
      let list = PlaylistLibrary.SortPlaylists(
        this.playlists,
        this.sortColumn,
        this.sortOrder
      );
      if (!this.folderManagementDisabled && this.selectedFolder != null) {
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
    selectFolder(selectedFolder: PlaylistFolder): void {
      if (selectedFolder == null) {
        // 選択なしは clearFolderSelection() で行う。PlaylistsFolderViewer からの undefined 通知は無視。
        Logger.debug(`Ignore empty selection.`, "AddRemoveFromPlaylistsDialog");
        return;
      }
      Logger.debug(
        `folder selected: ${selectedFolder?.path}`,
        "AddRemoveFromPlaylistsDialog"
      );
      store.commit("appState/SET_SELECTED_PLAYLIST_FOLDER_IN_DIALOG", {
        name: selectedFolder.name,
        path: selectedFolder.path,
      });
      this.sortPlaylists();
    },
    clearFolderSelection(): void {
      store.commit("appState/SET_SELECTED_PLAYLIST_FOLDER_IN_DIALOG", {
        name: "",
        path: undefined,
      });
      this.sortPlaylists();
    },
  },
});
</script>
