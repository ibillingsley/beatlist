<template>
  <Tooltip text="Refresh the data">
    <v-btn icon :loading="loading" @click="refreshData">
      <v-icon>refresh</v-icon>
    </v-btn>
  </Tooltip>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import Tooltip from "@/components/helper/Tooltip.vue";
import NotificationService from "@/libraries/notification/NotificationService";
import BeatsaverCacheManager from "@/libraries/beatmap/repo/BeatsaverCacheManager";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import BeatmapScanner from "@/libraries/scanner/beatmap/BeatmapScanner";

export default Vue.extend({
  name: "BeatmapButtonRefreshData",
  components: { Tooltip },
  props: {
    beatmap: { type: Object as PropType<BeatsaverBeatmap>, required: true },
  },
  data: () => ({
    loading: false,
  }),
  methods: {
    async refreshData() {
      this.loading = true;
      const beatmapLocal = BeatmapLibrary.GetMapByHash(this.beatmap.hash);
      if (beatmapLocal) {
        await new BeatmapScanner().scanOne(beatmapLocal.folderPath);
      }
      const response = await BeatsaverCacheManager.updateOne(this.beatmap.hash);

      if (response.success) {
        NotificationService.NotifyMessage(
          "The data has been refreshed",
          "success"
        );
      } else {
        NotificationService.NotifyMessage(
          `Couldn't update the data, reason: "${response.errMsg}"`,
          "warning"
        );
      }

      this.loading = false;
    },
  },
});
</script>
