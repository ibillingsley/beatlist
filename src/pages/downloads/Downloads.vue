<template>
  <v-container>
    <p class="text-h3">Downloads</p>

    <v-card>
      <v-card-text>
        <DownloadsListGroup
          sub-header="Ongoing"
          type="ongoing"
          :operations="ongoing"
        />
        <DownloadsListGroup
          sub-header="Queued"
          type="queued"
          :operations="queued"
        />
        <DownloadsListGroup
          sub-header="Completed"
          type="completed"
          :operations="completed"
        >
          <Tooltip text="Clear the following download history">
            <v-btn
              :disabled="completed == null || completed.length === 0"
              color="warning"
              class="ml-2"
              small
              @click="clearResult"
              >CLEAR</v-btn
            >
          </Tooltip>
        </DownloadsListGroup>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import DownloadsListGroup from "@/components/downloads/list/DownloadsListGroup.vue";
import DownloadLibrary from "@/libraries/net/downloader/DownloadLibrary";
import DownloadManager from "@/libraries/net/downloader/DownloadManager";
import { DownloadOperation } from "@/libraries/net/downloader/operation/DownloadOperation";
import DiscordRichPresence from "@/libraries/ipc/DiscordRichPresence";
import Tooltip from "@/components/helper/Tooltip.vue";

export default Vue.extend({
  name: "Downloads",
  components: { Tooltip, DownloadsListGroup },
  beforeRouteEnter(to, from, next) {
    DiscordRichPresence.UpdateStatus("Checking their downloads");
    next();
  },
  data: () => ({
    queued: [] as DownloadOperation[],
    ongoing: [] as DownloadOperation[],
    completed: [] as DownloadOperation[],
  }),
  mounted(): void {
    DownloadManager.OnQueueUpdated(this.updateDownloadData);
    this.updateDownloadData();
  },
  beforeDestroy(): void {
    DownloadManager.RemoveOnQueueUpdatedListener(this.updateDownloadData);
  },
  methods: {
    updateDownloadData() {
      this.queued = DownloadLibrary.queuedOperation;
      this.ongoing = DownloadLibrary.ongoingOperation;
      this.completed = DownloadLibrary.completedOperation;
    },
    clearResult() {
      DownloadManager.Clear();
    },
  },
});
</script>
