<template>
  <div>
    <p class="headline">
      Content
    </p>
    <BeatmapsTableOuterHeader
      :shown-column.sync="shownColumn"
      :search.sync="search"
    />
    <BeatmapsTable
      ref="editorBeatmapsTable"
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
        <BeatmapDownloadButton :beatmap="beatsaver" small />
        <PlaylistButtonRemoveFromPlaylist
          :playlist="playlist"
          :beatmap="beatsaver"
          small
        />
        <BeatmapButtonCopyBsr :beatmap="beatsaver" small />
      </template>
    </BeatmapsTable>
    <BeatmapsTableBulkActions
      :playlist="playlist"
      :selected="selectedBeatmap"
      bulk-remove
      bulk-download
      bulk-copy-bsr
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
import PlaylistButtonRemoveFromPlaylist from "@/components/playlist/button/PlaylistButtonRemoveFromPlaylist.vue";
import PlaylistMapsLibrary from "@/libraries/playlist/PlaylistMapsLibrary";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import BeatmapsTableBulkActions from "@/components/beatmap/table/core/BeatmapsTableBulkActions.vue";
import BeatmapsTableOuterHeader from "@/components/beatmap/table/core/BeatmapsTableOuterHeader.vue";
import BeatmapDownloadButton from "@/components/downloads/BeatmapDownloadButton.vue";
import BeatmapButtonCopyBsr from "@/components/beatmap/info/button/BeatmapButtonCopyBsr.vue";
// import route from "@/plugins/route/route";
import { BeatmapsTableDataUnit } from "@/components/beatmap/table/core/BeatmapsTableDataUnit";
import BeatmapOnlineUnitDialog from "@/components/dialogs/BeatmapOnlineUnitDialog.vue";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import Logger from "@/libraries/helper/Logger";

export default Vue.extend({
  name: "PlaylistEditorBeatmapList",
  components: {
    BeatmapsTable,
    BeatmapsTableOuterHeader,
    BeatmapsTableBulkActions,
    PlaylistButtonRemoveFromPlaylist,
    BeatmapDownloadButton,
    BeatmapOnlineUnitDialog,
    BeatmapButtonCopyBsr,
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
      "settings/beatmapsTable@playlistContent.shownColumn"
    ),
    itemsPerPage: sync<string[]>(
      "settings/beatmapsTable@playlistContent.itemsPerPage"
    ),
    // beatmaps() {
    //   return PlaylistMapsLibrary.GetAllValidMapAsTableDataFor(this.playlist);
    // },
    // seeMoreRouteName: () => route.BEATMAPS_ONLINE_UNIT,
    cacheLastUpdated() {
      return BeatsaverCachedLibrary.GetCacheLastUpdated();
    },
  },
  watch: {
    async playlist() {
      Logger.debug(`watch playlist called.`, "PlaylistEditorBeatmapList");
      this.fetchData();
    },
    cacheLastUpdated(newValue: Date, oldValue: Date) {
      if (store.getters["appState/lockPlaylistModification"]) {
        Logger.debug(
          `watch cacheLastUpdated called. but skip. ${oldValue?.toISOString()} -> ${newValue?.toISOString()}`,
          "PlaylistEditorBeatmapList"
        );
        return;
      }
      Logger.debug(
        `watch cacheLastUpdated called. ${oldValue?.toISOString()} -> ${newValue?.toISOString()}`,
        "PlaylistEditorBeatmapList"
      );
      this.fetchData();
    },
  },
  activated() {
    (this.$refs.editorBeatmapsTable as any).moveFirst();
  },
  mounted(): void {
    Logger.debug(`mounted called.`, "PlaylistEditorBeatmapList");
    this.fetchData();
  },
  methods: {
    async fetchData(): Promise<void> {
      this.loading = true;
      try {
        Logger.debug(`fetchData called.`, "PlaylistEditorBeatmapList");
        this.beatmaps = await PlaylistMapsLibrary.GetAllValidMapAsTableDataFor(
          this.playlist
        );
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
