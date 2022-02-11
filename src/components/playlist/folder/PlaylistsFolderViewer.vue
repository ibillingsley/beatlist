<template>
  <!-- open-on-click を有効にするとクリックで activate できない -->
  <v-treeview
    v-if="!disabled && folders != null"
    ref="folderTree"
    v-model="tree"
    :items="folders"
    item-key="id"
    activatable
    open-all
    :active.sync="activeList"
    :class="fillBackground ? 'app' : ''"
    @update:active="activeChanged"
  >
    <template v-slot:label="{ item, active, open }">
      <Tooltip :text="item.name">
        <div
          style="width: 100%; margin: -5px; padding: 5px;"
          @click="
            active && preventClickOnActiveNode ? $event.stopPropagation() : null
          "
        >
          <v-icon
            @click="
              active && preventClickOnActiveNode
                ? $event.stopPropagation()
                : null
            "
            >{{ open ? "mdi-folder-open" : "mdi-folder" }}</v-icon
          >
          {{ item.name }}
        </div>
      </Tooltip>
    </template>
  </v-treeview>
</template>

<script lang="ts">
import Vue from "vue";
import { get } from "vuex-pathify";
import {
  PlaylistFolder,
  PLAYLIST_FOLDER_ID_ROOT,
} from "@/libraries/playlist/PlaylistLocal";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import Tooltip from "@/components/helper/Tooltip.vue";
import Logger from "@/libraries/helper/Logger";

export default Vue.extend({
  name: "PlaylistsFolderViewer",
  components: {
    Tooltip,
  },
  props: {
    // 背景を塗りつぶすかどうか
    fillBackground: { type: Boolean, default: false },
    // mount 時に active にするノードの id
    defaultActive: { type: String, default: undefined },
    // activate 済の treenode の click を防ぐかどうか
    // * [My playlists]画面のツリーで setTimeout の使用頻度を減らすため click を無効にする。
    // * AddRemoveFromPlaylistsDialog は click を無効にすると再選択できなくなるので無効にしない。
    preventClickOnActiveNode: { type: Boolean, default: false },
  },
  data: () => ({
    folders: undefined as PlaylistFolder[] | undefined,
    tree: [],
    activeList: [] as string[],
  }),
  computed: {
    disabled: get<boolean>("settings/disablePlaylistFolderManagement"),
    rootFolder(): PlaylistFolder {
      return PlaylistLibrary.GetPlaylistFolders();
    },
  },
  watch: {
    rootFolder() {
      this.folders = [this.rootFolder];
      if (this.rootFolder.allChildren != null && this.activeList?.length > 0) {
        const currentActive = this.activeList[0];
        if (
          currentActive !== PLAYLIST_FOLDER_ID_ROOT &&
          this.rootFolder.allChildren.get(currentActive) == null
        ) {
          // root 以外の folder が選択されており、かつその folder が消えた場合(rename or delete)は root を選択
          this.activeList = [PLAYLIST_FOLDER_ID_ROOT];
        }
      }
    },
  },
  async mounted(): Promise<void> {
    if (this.defaultActive != null && this.defaultActive !== "") {
      this.activeList = [this.defaultActive];
    }
    this.folders = [this.rootFolder];
    this.activeChanged(this.activeList);
    // (this.$refs.folderTree as any).updateAll(true);
  },
  methods: {
    activeChanged(value: string[]): void {
      if (this.folders == null || this.folders.length === 0) {
        Logger.debug(`not initialized`, "PlaylistsFolderViewer");
        return;
      }
      const prevActive = (this.$refs.folderTree as any)?.active;
      if (Logger.isDebugEnabled()) {
        Logger.debug(
          `prevActive: ${JSON.stringify(prevActive)}`,
          "PlaylistsFolderViewer"
        );
        Logger.debug(
          `activeChanged: ${JSON.stringify(value)}`,
          "PlaylistsFolderViewer"
        );
      }
      let selected: PlaylistFolder | undefined;
      if (value.length > 0) {
        const rootFolder = this.folders[0];
        let selectedFolder: PlaylistFolder | undefined;
        if (value[0] === PLAYLIST_FOLDER_ID_ROOT) {
          selectedFolder = rootFolder;
        } else {
          selectedFolder = rootFolder.allChildren?.get(value[0]);
        }
        if (selectedFolder != null) {
          // 通知用に copy を作成
          selected = {
            id: selectedFolder.id,
            name: selectedFolder.name,
            path: selectedFolder.path,
            modified: selectedFolder.modified,
            children: [],
          };
        }
      } else {
        // activate 済のノードをクリックすると active が解除されてしまうので元に戻す
        // eslint-disable-next-line no-lonely-if
        if (prevActive != null && prevActive.length > 0) {
          setTimeout(() => {
            this.activeList = prevActive;
          }, 0);
          return;
        }
      }

      this.$emit("update:selection", selected);
    },
    dateToString(value: Date): string {
      if (value == null) {
        return "";
      }
      return value.toLocaleString();
    },
  },
});
</script>
