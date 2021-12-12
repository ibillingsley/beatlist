<template>
  <v-container>
    <v-row>
      <v-col cols="auto" align-self="center">
        <v-btn-toggle v-model="selectedMode" mandatory>
          <v-btn
            v-for="mode in modes"
            :key="mode.name"
            :value="mode.name"
            class="px-0"
            small
            icon
          >
            <Tooltip :text="mode.value">
              <v-icon v-if="mode.icon" small>
                {{ mode.icon }}
              </v-icon>
              <span v-else>{{ mode.text }}</span>
            </Tooltip>
          </v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col cols="auto">
        <BeatmapsTableOnlineFilter
          :enabled="isFilterEnabled"
          :enable-a-i-filter="enableAIFilter"
          :enable-rank-filter="enableRankFilter"
          :enable-f-s-filter="enableFSFilter"
          :enable-chroma-filter="enableChromaFilter"
          :enable-noodle-filter="enableNoodleFilter"
          :enable-m-e-filter="enableMEFilter"
          :enable-cinema-filter="enableCinemaFilter"
          @input="updateFilter"
        />
      </v-col>
      <v-col cols="auto">
        <BeatmapsTableOnlineNpsFilter
          :enabled="isFilterEnabled"
          :min-nps="minNps"
          :max-nps="maxNps"
          @input="updateFilter"
        />
      </v-col>
      <v-col cols="auto">
        <BeatmapsTableOnlineDateFilter
          :enabled="isFilterEnabled"
          :value="dateRange"
          @input="updateFilter"
        />
      </v-col>
      <v-col>
        <v-text-field
          v-model="search"
          placeholder="Search"
          append-icon="search"
          height="20px"
          class="pa-0"
          single-line
          hide-details
          filled
          rounded
          clearable
          dense
          @click:append="performSearch"
          @keydown.enter="performSearch"
          @click:clear="clearPage"
        />
      </v-col>
    </v-row>
    <BeatmapsTableColumnSelector v-model="shownColumn" />
    <v-card>
      <BeatmapsTable
        :items="beatmaps"
        :shown-column="shownColumn"
        :items-per-page="20"
        :server-items-length="totalDocs"
        :loading="loading"
        :page.sync="page"
        :see-more-route-name="seeMoreRouteName"
        no-item-per-page-choice
        no-filter
        no-sort
      >
        <template #actions="{ beatsaver }">
          <BeatmapButtonAddToNPlaylists :beatmap="beatsaver" small />
          <BeatmapDownloadButton :beatmap="beatsaver" auto-hide small />
          <BeatmapButtonRemoveBeatmap :beatmap="beatsaver" auto-hide small />
          <BeatmapButtonOpenPreview :beatmap="beatsaver" small />
          <BeatmapButtonCopyBsr :beatmap="beatsaver" small />
        </template>
      </BeatmapsTable>
    </v-card>
    <v-alert v-if="error" type="warning" border="left" class="mt-3" text>
      {{ error }}
    </v-alert>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { sync } from "vuex-pathify";
import BeatmapsTable from "@/components/beatmap/table/BeatmapsTable.vue";
import BeatmapsTableColumnSelector from "@/components/beatmap/table/core/BeatmapsTableColumnSelector.vue";
import Tooltip from "@/components/helper/Tooltip.vue";
import BeatsaverAPI, {
  BeatSaverAPIResponse,
  BeatSaverAPIResponseStatus,
} from "@/libraries/net/beatsaver/BeatsaverAPI";
import {
  BeatsaverBeatmap,
  BeatsaverPage,
} from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import { BeatmapsTableDataUnit } from "@/components/beatmap/table/core/BeatmapsTableDataUnit";
import BeatsaverUtilities from "@/libraries/net/beatsaver/BeatsaverUtilities";
import BeatmapDownloadButton from "@/components/downloads/BeatmapDownloadButton.vue";
import BeatmapButtonRemoveBeatmap from "@/components/beatmap/info/button/BeatmapButtonRemoveBeatmap.vue";
import BeatmapButtonAddToNPlaylists from "@/components/beatmap/button/BeatmapButtonAddToNPlaylists.vue";
import BeatmapButtonOpenPreview from "@/components/beatmap/info/button/BeatmapButtonOpenPreview.vue";
import BeatmapButtonCopyBsr from "@/components/beatmap/info/button/BeatmapButtonCopyBsr.vue";
import BeatmapsTableOnlineFilter from "@/components/beatmap/table/core/filter/BeatmapsTableOnlineFilter.vue";
import BeatmapsTableOnlineDateFilter from "@/components/beatmap/table/core/filter/BeatmapsTableOnlineDateFilter.vue";
import BeatmapsTableOnlineNpsFilter from "@/components/beatmap/table/core/filter/BeatmapsTableOnlineNpsFilter.vue";
import route from "@/plugins/route/route";
import { BeatsaverFilter } from "@/libraries/net/beatsaver/BeatsaverFilter";
import { DateRange } from "@/libraries/common/Range";

export default Vue.extend({
  name: "BeatmapsTableOnline",
  components: {
    BeatmapsTableColumnSelector,
    BeatmapsTable,
    Tooltip,
    BeatmapDownloadButton,
    BeatmapButtonOpenPreview,
    BeatmapButtonRemoveBeatmap,
    BeatmapButtonAddToNPlaylists,
    BeatmapButtonCopyBsr,
    BeatmapsTableOnlineFilter,
    BeatmapsTableOnlineNpsFilter,
    BeatmapsTableOnlineDateFilter,
  },
  data: () => ({
    selectedMode: "search",
    modes: [
      // icon 名は material-design-icons-iconfont/dist/material-design-icons.css を参照
      { name: "search", value: "Search", icon: "search" },
      // { name: "hot", value: "Hot", icon: "whatshot" },
      { name: "rating", value: "Rating", icon: "thumb_up" },
      { name: "latest", value: "Latest", icon: "new_releases" },
      // { name: "download", value: "Download", icon: "cloud_download" },
      // { name: "plays", value: "Plays", icon: "play_arrow" },
      { name: "key", value: "Key", icon: "vpn_key" },
      { name: "hash", value: "Hash", text: "#" },
    ],
    enableAIFilter: false,
    enableRankFilter: false,
    enableFSFilter: false,
    enableChromaFilter: false,
    enableNoodleFilter: false,
    enableMEFilter: false,
    enableCinemaFilter: false,
    minNps: null as number | null,
    maxNps: null as number | null,
    dateRange: {} as DateRange,
    search: "",
    beatsaverPage: undefined as BeatsaverPage | undefined,
    totalDocs: 0,
    loading: false,
    error: undefined as string | undefined,
    page: 1,
  }),
  computed: {
    shownColumn: sync<string[]>(
      "settings/beatmapsTable@beatsaverBeatmaps.shownColumn"
    ),
    beatmaps(): BeatmapsTableDataUnit[] {
      return (
        this.beatsaverPage?.docs.map(
          (beatmap): BeatmapsTableDataUnit => ({
            local: undefined,
            data: beatmap,
            folderNameHash: undefined,
          })
        ) ?? []
      );
    },
    seeMoreRouteName: () => route.BEATMAPS_ONLINE_UNIT,
    isFilterEnabled(): boolean {
      return ["search", "rating", "latest"].indexOf(this.selectedMode) >= 0;
    },
  },
  watch: {
    beatsaverPage(): void {
      this.totalDocs = this.beatsaverPage?.totalDocs ?? 0;
    },
    page(): void {
      this.fetchData();
    },
    selectedMode(): void {
      if (
        ["hot", "rating", "latest", "download", "plays", "search"].includes(
          this.selectedMode
        )
      ) {
        this.fetchData();
      }

      this.page = 1;
      this.clearPage();
    },
  },
  mounted(): void {
    this.fetchData();
  },
  methods: {
    updateFilter(params: BeatsaverFilter): void {
      let changed = false;
      if (params.mode === "filter" || params.mode === "all") {
        if (this.enableAIFilter !== params.ai) {
          this.enableAIFilter = params.ai ?? false;
          changed = true;
        }
        if (this.enableRankFilter !== params.ranked) {
          this.enableRankFilter = params.ranked ?? false;
          changed = true;
        }
        if (this.enableFSFilter !== params.fs) {
          this.enableFSFilter = params.fs ?? false;
          changed = true;
        }
        if (this.enableChromaFilter !== params.chroma) {
          this.enableChromaFilter = params.chroma ?? false;
          changed = true;
        }
        if (this.enableNoodleFilter !== params.noodle) {
          this.enableNoodleFilter = params.noodle ?? false;
          changed = true;
        }
        if (this.enableMEFilter !== params.me) {
          this.enableMEFilter = params.me ?? false;
          changed = true;
        }
        if (this.enableCinemaFilter !== params.cinema) {
          this.enableCinemaFilter = params.cinema ?? false;
          changed = true;
        }
      }
      if (params.mode === "nps" || params.mode === "all") {
        if (this.minNps !== params.minNps) {
          this.minNps = params.minNps ?? null; // undefined or null -> null
          changed = true;
        }
        if (this.maxNps !== params.maxNps) {
          this.maxNps = params.maxNps ?? null; // undefined or null -> null
          changed = true;
        }
      }
      if (params.mode === "date" || params.mode === "all") {
        if (!this.dateEquals(this.dateRange.min, params.minDate)) {
          this.dateRange.min = params.minDate ?? undefined; // undefined or null -> undefined
          changed = true;
        }
        if (!this.dateEquals(this.dateRange.max, params.maxDate)) {
          this.dateRange.max = params.maxDate ?? undefined; // undefined or null -> undefined
          changed = true;
        }
      }
      if (
        changed &&
        ["search", "rating", "latest"].indexOf(this.selectedMode) >= 0
      ) {
        this.page = 1;
        this.clearPage();
        this.fetchData();
      }
    },
    dateEquals(date1: Date | undefined, date2: Date | undefined): boolean {
      if (date1 == null) {
        if (date2 == null) {
          return true;
        }
        return false;
      }
      if (date2 == null) {
        return false;
      }
      return date1.getTime() === date2.getTime();
    },
    fetchData(): void {
      if (this.$route.name !== route.BEATMAPS_ONLINE) {
        return;
      }

      this.loading = true;
      let requestPage = undefined as
        | Promise<BeatSaverAPIResponse<BeatsaverPage>>
        | undefined;
      let requestMap = undefined as
        | Promise<BeatSaverAPIResponse<BeatsaverBeatmap>>
        | undefined;

      switch (this.selectedMode) {
        case "search":
          requestPage = BeatsaverAPI.Singleton.searchBeatmaps(
            this.search,
            "Relevance",
            this.page - 1,
            this.createFilter()
          );
          break;

        // case "hot":
        //   requestPage = BeatsaverAPI.Singleton.getByHot(this.page - 1);
        //   break;

        case "rating":
          // requestPage = BeatsaverAPI.Singleton.getByRating(this.page - 1);
          requestPage = BeatsaverAPI.Singleton.searchBeatmaps(
            this.search,
            "Rating",
            this.page - 1,
            this.createFilter()
          );
          break;
        case "latest":
          // requestPage = BeatsaverAPI.Singleton.getByLatest(this.page - 1);
          requestPage = BeatsaverAPI.Singleton.searchBeatmaps(
            this.search,
            "Latest",
            this.page - 1,
            this.createFilter()
          );
          break;

        // case "download":
        //   requestPage = BeatsaverAPI.Singleton.getByDownloads(this.page - 1);
        //   break;

        // case "plays":
        //   requestPage = BeatsaverAPI.Singleton.getByPlays(this.page - 1);
        //   break;

        case "key":
          requestMap = BeatsaverAPI.Singleton.getBeatmapByKey(this.search);
          break;

        case "hash":
          requestMap = BeatsaverAPI.Singleton.getBeatmapByHash(this.search);
          break;

        default:
          break;
      }

      if (requestPage) {
        this.handleBeatsaverPageResponse(requestPage);
      }

      if (requestMap) {
        this.handleBeatsaverBeatmapResponse(requestMap);
      }
    },
    handleBeatsaverPageResponse(
      response: Promise<BeatSaverAPIResponse<BeatsaverPage>>
    ): void {
      response
        .then((value) => {
          this.error = BeatsaverUtilities.ErrorToMessage(value);

          if (value.status === BeatSaverAPIResponseStatus.ResourceFound) {
            this.beatsaverPage = value.data;
          } else {
            this.beatsaverPage = undefined;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleBeatsaverBeatmapResponse(
      response: Promise<BeatSaverAPIResponse<BeatsaverBeatmap>>
    ) {
      response
        .then((value) => {
          this.error = BeatsaverUtilities.ErrorToMessage(value);

          if (value.status === BeatSaverAPIResponseStatus.ResourceFound) {
            this.beatsaverPage = BeatsaverUtilities.WrapInPage(value.data);
          } else if (
            value.status === BeatSaverAPIResponseStatus.ResourceNotFound
          ) {
            this.beatsaverPage = BeatsaverUtilities.GetEmptyPage();
            this.error =
              "No beatmap was found with this search (you are in Key or Hash mode !). Search must be exact in this mode.";
          } else {
            this.beatsaverPage = undefined;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    performSearch(): void {
      if (
        !["search", "latest", "rating", "key", "hash"].includes(
          this.selectedMode
        )
      ) {
        // 想定外の selectMode の場合は "search" にリセット
        this.selectedMode = "search";
      }

      if (this.search === "") {
        if (!["search", "latest", "rating"].includes(this.selectedMode)) {
          // "key" や "hash" で検索ボックスが空欄なら "search" にリセット
          this.selectedMode = "search";
        }
        return;
      }

      this.page = 1;
      this.clearPage();
      this.fetchData();
    },
    clearPage() {
      this.beatsaverPage = undefined;
    },
    createFilter() {
      const filter: BeatsaverFilter = {
        mode: "all",
      };
      // automapper フィルターは仕様変更するかもしれないそうなので現時点では無効
      /*
      if (this.enableAIFilter) {
        filter.ai = true;
      }
      */
      if (this.enableRankFilter) {
        filter.ranked = true;
      }
      if (this.enableFSFilter) {
        filter.fs = true;
      }
      if (this.enableChromaFilter) {
        filter.chroma = true;
      }
      if (this.enableNoodleFilter) {
        filter.noodle = true;
      }
      if (this.enableMEFilter) {
        filter.me = true;
      }
      if (this.enableCinemaFilter) {
        filter.cinema = true;
      }
      if (this.minNps != null) {
        filter.minNps = this.minNps;
      }
      if (this.maxNps != null) {
        filter.maxNps = this.maxNps;
      }
      if (this.dateRange.min != null) {
        filter.minDate = this.dateRange.min;
      }
      if (this.dateRange.max != null) {
        filter.maxDate = this.dateRange.max;
      }
      if (Object.keys(filter).length === 0) {
        return undefined;
      }
      return filter;
    },
  },
});
</script>
