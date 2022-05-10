<template>
  <v-edit-dialog large save-text="OK" @open="reset" @save="update">
    <v-row
      no-gutters
      align="center"
      justify="center"
      dense
      align-content="center"
    >
      <v-col align-self="center" style="padding-top: 6px;">
        <v-btn
          icon
          small
          :color="
            enabled &&
            (aiFilter ||
              rankFilter ||
              curatedFilter ||
              verifiedMapperFilter ||
              fsFilter ||
              chromaFilter ||
              noodleFilter ||
              meFilter ||
              cinemaFilter)
              ? 'success'
              : ''
          "
        >
          <v-icon>filter_list</v-icon>
        </v-btn>
      </v-col>
      <v-col align-self="center" style="padding-top: 6px;">
        {{ filterText }}
      </v-col>
    </v-row>
    <template v-slot:input>
      <v-switch
        v-model="rankFilter"
        color="accent"
        label="Ranked"
        hide-details="auto"
        dense
        inset
      />
      <!-- automapper フィルターは仕様変更するかもしれないそうなので現時点では無効にしておく -->
      <!-- <v-switch v-model="aiFilter" color="accent" label="AI" dense inset /> -->
      <v-switch
        v-model="curatedFilter"
        color="accent"
        label="Curated"
        hide-details="auto"
        dense
        inset
      />
      <v-switch
        v-model="verifiedMapperFilter"
        color="accent"
        label="Verified Mapper"
        hide-details="auto"
        dense
        inset
      />
      <v-switch
        v-model="fsFilter"
        color="accent"
        label="Full Spread"
        hide-details="auto"
        dense
        inset
      />
      <br />
      <hr />
      <v-switch
        v-model="chromaFilter"
        color="accent"
        label="Chroma"
        hide-details="auto"
        dense
        inset
      />
      <v-switch
        v-model="noodleFilter"
        color="accent"
        label="Noodle"
        hide-details="auto"
        dense
        inset
      />
      <v-switch
        v-model="meFilter"
        color="accent"
        label="Mapping Extensions"
        hide-details="auto"
        dense
        inset
      />
      <v-switch
        v-model="cinemaFilter"
        color="accent"
        label="Cinema"
        hide-details="auto"
        dense
        inset
      />
    </template>
  </v-edit-dialog>
</template>

<script lang="ts">
import { BeatsaverFilter } from "@/libraries/net/beatsaver/BeatsaverFilter";
import Vue from "vue";

export default Vue.extend({
  name: "BeatmapsTableOnlineFilter",
  props: {
    enabled: { type: Boolean, required: true },
    enableAIFilter: { type: Boolean, required: true },
    enableRankFilter: { type: Boolean, required: true },
    enableCuratedFilter: { type: Boolean, required: true },
    enableVerifiedMapperFilter: { type: Boolean, required: true },
    enableFSFilter: { type: Boolean, required: true },
    enableChromaFilter: { type: Boolean, required: true },
    enableNoodleFilter: { type: Boolean, required: true },
    enableMEFilter: { type: Boolean, required: true },
    enableCinemaFilter: { type: Boolean, required: true },
  },
  data: () => ({
    filterText: "Filter",
    aiFilter: false,
    rankFilter: false,
    curatedFilter: false,
    verifiedMapperFilter: false,
    fsFilter: false,
    chromaFilter: false,
    noodleFilter: false,
    meFilter: false,
    cinemaFilter: false,
  }),
  watch: {
    enableAIFilter() {
      if (this.aiFilter !== this.enableAIFilter) {
        this.aiFilter = this.enableAIFilter;
      }
    },
    enableRankFilter() {
      if (this.rankFilter !== this.enableRankFilter) {
        this.rankFilter = this.enableRankFilter;
      }
    },
    enableCuratedFilter() {
      if (this.curatedFilter !== this.enableCuratedFilter) {
        this.curatedFilter = this.enableCuratedFilter;
      }
    },
    enableVerifiedMapperFilter() {
      if (this.verifiedMapperFilter !== this.enableVerifiedMapperFilter) {
        this.verifiedMapperFilter = this.enableVerifiedMapperFilter;
      }
    },
    enableFSFilter() {
      if (this.fsFilter !== this.enableFSFilter) {
        this.fsFilter = this.enableFSFilter;
      }
    },
    enableChromaFilter() {
      if (this.chromaFilter !== this.enableChromaFilter) {
        this.chromaFilter = this.enableChromaFilter;
      }
    },
    enableNoodleFilter() {
      if (this.noodleFilter !== this.enableNoodleFilter) {
        this.noodleFilter = this.enableNoodleFilter;
      }
    },
    enableMEFilter() {
      if (this.meFilter !== this.enableMEFilter) {
        this.meFilter = this.enableMEFilter;
      }
    },
    enableCinemaFilter() {
      if (this.cinemaFilter !== this.enableCinemaFilter) {
        this.cinemaFilter = this.enableCinemaFilter;
      }
    },
  },
  activated(): void {
    this.reset();
    this.updateFilterText();
  },
  mounted(): void {
    this.reset();
    this.updateFilterText();
  },
  methods: {
    reset() {
      this.aiFilter = this.enableAIFilter;
      this.rankFilter = this.enableRankFilter;
      this.curatedFilter = this.enableCuratedFilter;
      this.verifiedMapperFilter = this.enableVerifiedMapperFilter;
      this.fsFilter = this.enableFSFilter;
      this.chromaFilter = this.enableChromaFilter;
      this.noodleFilter = this.enableNoodleFilter;
      this.meFilter = this.enableMEFilter;
      this.cinemaFilter = this.enableCinemaFilter;
    },
    updateFilterText() {
      const filters: string[] = [];
      if (this.aiFilter) {
        filters.push("bot");
      }
      if (this.rankFilter) {
        filters.push("ranked");
      }
      if (this.curatedFilter) {
        filters.push("curated");
      }
      if (this.verifiedMapperFilter) {
        filters.push("verified");
      }
      if (this.fsFilter) {
        filters.push("fs");
      }
      if (this.chromaFilter) {
        filters.push("chroma");
      }
      if (this.noodleFilter) {
        filters.push("noodle");
      }
      if (this.meFilter) {
        filters.push("me");
      }
      if (this.cinemaFilter) {
        filters.push("cinema");
      }
      const text = filters.join(",");
      if (text === "") {
        this.filterText = "Filter";
      } else {
        this.filterText = text.length > 22 ? `${text.slice(0, 20)}...` : text;
      }
    },
    update() {
      this.updateFilterText();
      const filter: BeatsaverFilter = {
        mode: "filter",
        ai: this.aiFilter,
        ranked: this.rankFilter,
        curated: this.curatedFilter,
        verified: this.verifiedMapperFilter,
        fs: this.fsFilter,
        chroma: this.chromaFilter,
        noodle: this.noodleFilter,
        me: this.meFilter,
        cinema: this.cinemaFilter,
      };
      this.$emit("input", filter);
    },
  },
});
</script>
