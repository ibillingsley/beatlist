<template>
  <v-container fluid>
    <BeatmapsTableOuterHeader
      :shown-column.sync="shownColumn"
      :show-local-column="true"
      :search.sync="search"
      :show-refresh-button="true"
      @refresh="refreshBeatmap"
    />
    <v-card>
      <BeatmapsTable
        :items="beatmaps"
        :shown-column="shownColumn"
        :items-per-page.sync="itemsPerPage"
        :search="search"
        :page.sync="page"
        :see-more-route-name="seeMoreRouteName"
        :loading="loading"
      >
        <template #actions="{ beatsaver }">
          <BeatmapButtonRemoveBeatmap :beatmap="beatsaver" small />
          <BeatmapButtonAddToNPlaylists :beatmap="beatsaver" small />
          <BeatmapButtonCopyBsr :beatmap="beatsaver" small />
        </template>
      </BeatmapsTable>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { sync } from "vuex-pathify";
import BeatmapsTable from "@/components/beatmap/table/BeatmapsTable.vue";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import BeatmapsTableOuterHeader from "@/components/beatmap/table/core/BeatmapsTableOuterHeader.vue";
import BeatmapButtonAddToNPlaylists from "@/components/beatmap/button/BeatmapButtonAddToNPlaylists.vue";
import BeatmapButtonRemoveBeatmap from "@/components/beatmap/info/button/BeatmapButtonRemoveBeatmap.vue";
import BeatmapButtonCopyBsr from "@/components/beatmap/info/button/BeatmapButtonCopyBsr.vue";
import route from "@/plugins/route/route";
import { BeatmapLocal } from "@/libraries/beatmap/BeatmapLocal";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import Logger from "@/libraries/helper/Logger";
import BeatSaber from "@/libraries/os/beatSaber/BeatSaber";
import { BeatmapsTableDataUnit } from "./core/BeatmapsTableDataUnit";

export default Vue.extend({
  name: "BeatmapsTableLocal",
  components: {
    BeatmapsTable,
    BeatmapsTableOuterHeader,
    BeatmapButtonAddToNPlaylists,
    BeatmapButtonRemoveBeatmap,
    BeatmapButtonCopyBsr,
  },
  data: () => ({
    search: "",
    page: 1,
    beatmaps: [] as BeatmapsTableDataUnit[],
    loading: false,
  }),
  computed: {
    shownColumn: sync<string[]>(
      "settings/beatmapsTable@localBeatmaps.shownColumn"
    ),
    itemsPerPage: sync<number>(
      "settings/beatmapsTable@localBeatmaps.itemsPerPage"
    ),
    storedMaps(): BeatmapLocal[] {
      return BeatmapLibrary.GetAllMaps();
    },
    cacheLastUpdated() {
      return BeatsaverCachedLibrary.GetCacheLastUpdated();
    },
    // beatmaps: () => BeatmapLibrary.GetAllValidBeatmapAsTableData(),
    seeMoreRouteName: () => route.BEATMAPS_LOCAL_UNIT,
  },
  watch: {
    search() {
      this.page = 1;
    },
    storedMaps() {
      Logger.debug(`change detected: storedMaps`, "BeatmapsTableLocal");
      this.fetchData();
    },
    cacheLastUpdated() {
      Logger.debug(`change detected: cacheLastUpdated`, "BeatmapsTableLocal");
      this.fetchData();
    },
  },
  mounted(): void {
    this.fetchData();
  },
  methods: {
    async fetchData(): Promise<void> {
      this.loading = true;
      try {
        // console.log(`[BeatmapsTableLocal] fetchData called`);
        this.beatmaps = await BeatmapLibrary.GetAllValidBeatmapAsTableData();
      } finally {
        this.loading = false;
      }
    },
    async refreshBeatmap(): Promise<void> {
      const kept: string[] = [];
      this.loading = true;
      try {
        BeatmapLibrary.GetAllValidMap().forEach((map) => {
          kept.push(map.folderPath.toLowerCase());
        });
        Logger.debug(`start getDownloadDate`, "BeatmapsTableLocal");
        const downloadDateMap = await BeatSaber.getDownloadDate(kept);
        Logger.debug(`end   getDownloadDate`, "BeatmapsTableLocal");
        if (downloadDateMap.size > 0) {
          BeatmapLibrary.UpdateDownloadDate(downloadDateMap);
        }
        Logger.debug(
          `end   BeatmapLibrary.UpdateDownloadDate`,
          "BeatmapsTableLocal"
        );
        await this.fetchData();
      } finally {
        this.loading = false;
      }
    },
  },
});
</script>
