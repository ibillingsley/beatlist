<template>
  <div>
    <p class="text-h5">Browser</p>
    <BeatmapsTableOuterHeader
      :shown-column.sync="shownColumn"
      :show-local-column="true"
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
      <template #actionsHeader>
        <BeatmapsTableActionsHeader :shown-actions.sync="shownActions" />
      </template>
      <template #actions="{ beatsaver }">
        <BeatmapsTableActionsRow
          :beatmap="beatsaver"
          :playlist="playlist"
          :actions="shownActionsSet"
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
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import BeatmapsTableBulkActions from "@/components/beatmap/table/core/BeatmapsTableBulkActions.vue";
import BeatmapsTableOuterHeader from "@/components/beatmap/table/core/BeatmapsTableOuterHeader.vue";
import BeatmapsTableActionsHeader from "@/components/beatmap/table/core/BeatmapsTableActionsHeader.vue";
import BeatmapsTableActionsRow from "@/components/beatmap/table/core/BeatmapsTableActionsRow.vue";
// import route from "@/plugins/route/route";
import { BeatmapsTableDataUnit } from "@/components/beatmap/table/core/BeatmapsTableDataUnit";
import BeatmapOnlineUnitDialog from "@/components/dialogs/BeatmapOnlineUnitDialog.vue";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import Logger from "@/libraries/helper/Logger";
import { BeatmapTableActions } from "@/store/settings";

export default Vue.extend({
  name: "PlaylistEditorBeatmapBrowser",
  components: {
    BeatmapsTableOuterHeader,
    BeatmapsTable,
    BeatmapsTableActionsHeader,
    BeatmapsTableActionsRow,
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
    shownActions: sync<BeatmapTableActions[]>(
      "settings/beatmapsTable@playlistBrowser.shownActions"
    ),
    shownActionsSet(): Set<BeatmapTableActions> {
      return new Set(this.shownActions);
    },
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
