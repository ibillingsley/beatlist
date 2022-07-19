<template>
  <v-edit-dialog>
    <v-btn icon small :color="!isModified() ? '' : 'success'">
      <v-icon>filter_list</v-icon>
    </v-btn>
    <template v-slot:input>
      <v-switch
        v-model="chromaFilter"
        color="accent"
        label="Chroma"
        hide-details="auto"
        dense
        inset
        @change="update"
      />
      <v-switch
        v-model="noodleFilter"
        color="accent"
        label="Noodle"
        hide-details="auto"
        dense
        inset
        @change="update"
      />
      <v-switch
        v-model="meFilter"
        color="accent"
        label="Mapping Extensions"
        hide-details="auto"
        dense
        inset
        @change="update"
      />
      <v-switch
        v-model="cinemaFilter"
        color="accent"
        label="Cinema"
        hide-details="auto"
        dense
        inset
        @change="update"
      />
    </template>
  </v-edit-dialog>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { BeatmapsTableHeader } from "@/components/beatmap/table/core/BeatmapsTableHeaders";

export default Vue.extend({
  name: "BeatmapsTableFilterRequirements",
  props: {
    value: { type: Object, required: true },
    header: { type: Object as PropType<BeatmapsTableHeader>, required: true },
  },
  data: () => ({
    chromaFilter: false,
    noodleFilter: false,
    meFilter: false,
    cinemaFilter: false,
  }),
  mounted(): void {
    this.chromaFilter = this.value.chroma;
    this.noodleFilter = this.value.ne;
    this.meFilter = this.value.me;
    this.cinemaFilter = this.value.cinema;
  },
  methods: {
    update() {
      this.$emit("input", {
        chroma: this.chromaFilter,
        ne: this.noodleFilter,
        me: this.meFilter,
        cinema: this.cinemaFilter,
      });
    },
    isModified() {
      return (
        this.chromaFilter ||
        this.noodleFilter ||
        this.meFilter ||
        this.cinemaFilter
      );
    },
  },
});
</script>
