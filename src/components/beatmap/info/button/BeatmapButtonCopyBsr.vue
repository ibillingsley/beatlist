<template>
  <Tooltip text="Copy BSR">
    <v-btn
      icon
      :disabled="beatmap.key == null || beatmap.key === ''"
      :small="small"
      @click="copyBSR"
    >
      <v-icon :small="small">content_copy</v-icon>
    </v-btn>
  </Tooltip>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { clipboard } from "electron";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import Tooltip from "@/components/helper/Tooltip.vue";
import NotificationService from "@/libraries/notification/NotificationService";

export default Vue.extend({
  name: "BeatmapButtonCopyBsr",
  components: { Tooltip },
  props: {
    beatmap: { type: Object as PropType<BeatsaverBeatmap>, required: true },
    small: { type: Boolean, default: false },
  },
  methods: {
    copyBSR(): void {
      const key = this.beatmap.key ?? "";
      if (key !== "") {
        try {
          clipboard.writeText(`!bsr ${key}`);
          NotificationService.NotifyMessage(
            `BSR copied. [!bsr ${key}]`,
            "success"
          );
        } catch (error) {
          console.error(error);
          NotificationService.NotifyMessage("Coping BSR failed.", "warning");
        }
      } else {
        NotificationService.NotifyMessage(
          "Coping BSR failed, because the key is empty.",
          "warning"
        );
      }
    },
  },
});
</script>
