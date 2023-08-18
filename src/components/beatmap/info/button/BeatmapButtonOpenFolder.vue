<template>
  <Tooltip text="Open folder">
    <v-btn icon :small="small" :disabled="!localBeatmap" @click="openFolder">
      <v-icon :small="small">folder</v-icon>
    </v-btn>
  </Tooltip>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { shell } from "electron";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import { BeatmapLocal } from "@/libraries/beatmap/BeatmapLocal";
import Tooltip from "@/components/helper/Tooltip.vue";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";

export default Vue.extend({
  name: "BeatmapButtonOpenFolder",
  components: { Tooltip },
  props: {
    beatmap: { type: Object as PropType<BeatsaverBeatmap>, required: true },
    small: { type: Boolean, default: false },
  },
  computed: {
    localBeatmap(): BeatmapLocal | undefined {
      return BeatmapLibrary.GetMapByHash(this.beatmap.hash);
    },
  },
  methods: {
    async openFolder() {
      const local = this.localBeatmap;
      if (local) {
        await shell.openPath(local.folderPath);
      }
    },
  },
});
</script>
