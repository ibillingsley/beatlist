<template>
  <div>
    <p class="headline">
      Browser
    </p>
    <BeatmapsTableOuterHeader
      :shown-column.sync="shownColumn"
      :search.sync="search"
    />
    <BeatmapsTable
      ref="browserBeatmapsTable"
      :items="beatmaps"
      :shown-column="shownColumn"
      :items-per-page.sync="itemsPerPage"
      :selected.sync="selectedBeatmap"
      :search="search"
      :in-playlist="true"
      :loading="loading"
      @openInformation="openInformation"
    >
      <template #actions="{ beatsaver }">
        <PlaylistButtonAddToPlaylist
          :playlist="playlist"
          :beatmap="beatsaver"
          small
        />
      </template>
    </BeatmapsTable>
    <BeatmapsTableBulkActions
      :playlist="playlist"
      :selected="selectedBeatmap"
      bulk-add
      @onDone="selectedBeatmap = []"
    />
    <BeatmapOnlineUnitDialog
      :v-if="showDialog"
      :open.sync="showDialog"
      :maphash="targetHash"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { sync } from "vuex-pathify";
import store from "@/plugins/store";
import { PlaylistLocal } from "@/libraries/playlist/PlaylistLocal";
import BeatmapsTable from "@/components/beatmap/table/BeatmapsTable.vue";
import PlaylistButtonAddToPlaylist from "@/components/playlist/button/PlaylistButtonAddToPlaylist.vue";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import BeatmapsTableBulkActions from "@/components/beatmap/table/core/BeatmapsTableBulkActions.vue";
import BeatmapsTableOuterHeader from "@/components/beatmap/table/core/BeatmapsTableOuterHeader.vue";
// import route from "@/plugins/route/route";
import { BeatmapsTableDataUnit } from "@/components/beatmap/table/core/BeatmapsTableDataUnit";
import BeatmapOnlineUnitDialog from "@/components/dialogs/BeatmapOnlineUnitDialog.vue";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import Logger from "@/libraries/helper/Logger";

export default Vue.extend({
  name: "PlaylistEditorBeatmapBrowser",
  components: {
    BeatmapsTableOuterHeader,
    BeatmapsTable,
    PlaylistButtonAddToPlaylist,
    BeatmapsTableBulkActions,
    BeatmapOnlineUnitDialog,
  },
  props: {
    playlist: { type: Object as PropType<PlaylistLocal>, required: true },
  },
  data: () => ({
    selectedBeatmap: [] as BeatsaverBeatmap[],
    search: "",
    beatmaps: [] as BeatmapsTableDataUnit[],
    targetHash: "",
    showDialog: false,
    loading: false,
  }),
  computed: {
    shownColumn: sync<string[]>(
      "settings/beatmapsTable@playlistBrowser.shownColumn"
    ),
    itemsPerPage: sync<string[]>(
      "settings/beatmapsTable@playlistBrowser.itemsPerPage"
    ),
    // beatmaps: () => BeatmapLibrary.GetAllValidBeatmapAsTableData(),
    // seeMoreRouteName: () => route.BEATMAPS_ONLINE_UNIT,
    cacheLastUpdated() {
      return BeatsaverCachedLibrary.GetCacheLastUpdated();
    },
  },
  watch: {
    cacheLastUpdated(newValue: Date, oldValue: Date) {
      if (store.getters["appState/lockPlaylistModification"]) {
        Logger.debug(
          `watch cacheLastUpdated called. but skip. ${oldValue?.toISOString()} -> ${newValue?.toISOString()}`,
          "PlaylistEditorBeatmapBrowser"
        );
        return;
      }
      Logger.debug(
        `watch cacheLastUpdated called. ${oldValue?.toISOString()} -> ${newValue?.toISOString()}`,
        "PlaylistEditorBeatmapBrowser"
      );
      this.fetchData();
    },
  },
  // ここでは watch playlist は今のところ必要ないと思われる
  activated() {
    (this.$refs.browserBeatmapsTable as any).moveFirst();
  },
  mounted(): void {
    this.fetchData();
  },
  methods: {
    async fetchData(): Promise<void> {
      this.loading = true;
      try {
        // TODO playlist.maps に含まれている譜面は除外すべき？
        this.beatmaps = await BeatmapLibrary.GetAllValidBeatmapAsTableData();
      } finally {
        this.loading = false;
      }
    },
    openInformation(hash: string) {
      this.showDialog = true;
      this.targetHash = hash;
    },
  },
});
</script>
