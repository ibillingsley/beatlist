<template>
  <Tooltip text="Open on beatsaver">
    <v-btn
      icon
      :disabled="beatmap.key == null || beatmap.key === ''"
      :small="small"
      @click="openBeatsaver"
    >
      <v-icon :small="small">open_in_new</v-icon>
    </v-btn>
  </Tooltip>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { shell } from "electron";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import Tooltip from "@/components/helper/Tooltip.vue";
import BeatsaverUtilities from "@/libraries/net/beatsaver/BeatsaverUtilities";

export default Vue.extend({
  name: "BeatmapButtonOpenBeatsaver",
  components: { Tooltip },
  props: {
    beatmap: { type: Object as PropType<BeatsaverBeatmap>, required: true },
    small: { type: Boolean, default: false },
  },
  methods: {
    openBeatsaver(): void {
      shell.openExternal(BeatsaverUtilities.GetPageUrl(this.beatmap));
    },
  },
});
</script>
