<template>
  <v-edit-dialog>
    <v-btn icon small :color="notInPlaylists ? 'success' : ''">
      <v-icon>filter_list</v-icon>
    </v-btn>
    <template #input>
      <v-switch
        v-model="notInPlaylists"
        color="accent"
        label="Not in playlists"
        dense
        inset
      />
    </template>
  </v-edit-dialog>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { BeatmapsTableHeader } from "@/components/beatmap/table/core/BeatmapsTableHeaders";

export default Vue.extend({
  name: "BeatmapsTableFilterPlaylists",
  props: {
    value: { type: Boolean, required: true },
    header: { type: Object as PropType<BeatmapsTableHeader>, required: true },
  },
  data: () => ({
    notInPlaylists: false,
  }),
  watch: {
    notInPlaylists() {
      this.update();
    },
  },
  mounted(): void {
    this.notInPlaylists = this.value;
  },
  methods: {
    update() {
      this.$emit("input", this.notInPlaylists);
    },
  },
});
</script>
