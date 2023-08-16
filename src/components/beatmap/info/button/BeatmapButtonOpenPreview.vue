<template>
  <Tooltip text="Preview beatmap">
    <v-btn icon :small="small" @click="openPreview">
      <v-icon :small="small">remove_red_eye</v-icon>
    </v-btn>
  </Tooltip>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { get } from "vuex-pathify";
import { shell } from "electron";
import { execFile } from "child_process";
import { pathExistsSync } from "fs-extra";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import Tooltip from "@/components/helper/Tooltip.vue";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";

export default Vue.extend({
  name: "BeatmapButtonOpenPreview",
  components: { Tooltip },
  props: {
    beatmap: { type: Object as PropType<BeatsaverBeatmap>, required: true },
    small: { type: Boolean, default: false },
  },
  computed: {
    arcviewerPath: get<string>("settings/arcviewerPath"),
  },
  methods: {
    openPreview(): void {
      if (this.arcviewerPath && pathExistsSync(this.arcviewerPath)) {
        const local = BeatmapLibrary.GetMapByHash(this.beatmap.hash);
        const params = local
          ? [`path=${local.folderPath}`]
          : [`id=${this.beatmap.key}`];
        execFile(this.arcviewerPath, params);
      } else {
        shell.openExternal(
          `https://allpoland.github.io/ArcViewer/?id=${this.beatmap.key}`
        );
      }
    },
  },
});
</script>
