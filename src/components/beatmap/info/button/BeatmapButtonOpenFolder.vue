<template>
  <Tooltip text="Open folder">
    <v-btn icon @click="openFolder">
      <v-icon>folder</v-icon>
    </v-btn>
  </Tooltip>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { shell } from "electron";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import Tooltip from "@/components/helper/Tooltip.vue";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";

export default Vue.extend({
  name: "BeatmapButtonOpenFolder",
  components: { Tooltip },
  props: {
    beatmap: { type: Object as PropType<BeatsaverBeatmap>, required: true },
  },
  methods: {
    async openFolder() {
      const local = BeatmapLibrary.GetMapByHash(this.beatmap.hash);

      if (local) {
        await shell.openPath(local.folderPath);
      }
    },
  },
});
</script>
