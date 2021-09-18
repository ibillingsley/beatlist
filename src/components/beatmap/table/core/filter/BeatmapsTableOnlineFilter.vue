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
            enabled && (aiFilter || rankFilter || fsFilter) ? 'success' : ''
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
        dense
        inset
      />
      <!-- automapper フィルターは仕様変更するかもしれないそうなので現時点では無効にしておく -->
      <!-- <v-switch v-model="aiFilter" color="accent" label="AI" dense inset /> -->
      <v-switch
        v-model="fsFilter"
        color="accent"
        label="Full Spread"
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
    enableFSFilter: { type: Boolean, required: true },
  },
  data: () => ({
    filterText: "",
    aiFilter: false,
    rankFilter: false,
    fsFilter: false,
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
    enableFSFilter() {
      if (this.fsFilter !== this.enableFSFilter) {
        this.fsFilter = this.enableFSFilter;
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
      this.fsFilter = this.enableFSFilter;
    },
    updateFilterText() {
      const filters: string[] = [];
      if (this.aiFilter) {
        filters.push("bot");
      }
      if (this.rankFilter) {
        filters.push("ranked");
      }
      if (this.fsFilter) {
        filters.push("fs");
      }
      this.filterText = filters.join(",");
    },
    update() {
      this.updateFilterText();
      const filter: BeatsaverFilter = {
        ai: this.aiFilter,
        ranked: this.rankFilter,
        fs: this.fsFilter,
      };
      this.$emit("input", filter);
    },
  },
});
</script>
