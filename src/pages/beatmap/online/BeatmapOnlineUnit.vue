<template>
  <v-container>
    <v-row>
      <v-col cols="auto" align-self="center">
        <v-btn icon @click="backHistory">
          <v-icon>chevron_left</v-icon>
        </v-btn>
      </v-col>
      <v-col cols="auto">
        <p class="text-h3 my-0">Beatmap information</p>
      </v-col>
    </v-row>

    <BeatmapSummary v-if="beatmap && !error" :beatmap="beatmap" />
    <v-alert v-else-if="error" type="warning" outlined>
      {{ error }}
    </v-alert>
    <LoadingPage v-else>
      <p class="grey--text mt-5">Loading beatmap info ...</p>
    </LoadingPage>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import BeatmapSummary from "@/components/beatmap/info/BeatmapSummary.vue";
import BeatsaverAPI, {
  BeatSaverAPIResponse,
  BeatSaverAPIResponseStatus,
} from "@/libraries/net/beatsaver/BeatsaverAPI";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import BeatsaverUtilities from "@/libraries/net/beatsaver/BeatsaverUtilities";
import LoadingPage from "@/components/helper/LoadingPage.vue";
import route from "@/plugins/route/route";

export default Vue.extend({
  name: "BeatmapOnlineUnit",
  components: { BeatmapSummary, LoadingPage },
  data: () => ({
    beatmap: undefined as BeatsaverBeatmap | undefined,
    loading: false,
    error: undefined as string | undefined,
  }),
  watch: {
    $route() {
      if (this.$route.name === route.BEATMAPS_ONLINE_UNIT) {
        this.fetchData();
      }
    },
  },
  mounted(): void {
    this.fetchData();
  },
  methods: {
    fetchData(): void {
      this.loading = true;
      this.beatmap = undefined;
      if (
        this.$route.name !== route.BEATMAPS_ONLINE_UNIT ||
        this.$route.params.hash == null
      ) {
        this.loading = false;
        // route が Online Unit でない、または hash が取得できない場合は fetch しない
        return;
      }
      BeatsaverAPI.Singleton.getBeatmapByHash(this.$route.params.hash)
        .then((response: BeatSaverAPIResponse<BeatsaverBeatmap>) => {
          this.error = BeatsaverUtilities.ErrorToMessage(response);

          if (response.status === BeatSaverAPIResponseStatus.ResourceFound) {
            this.beatmap = response.data;
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    backHistory(): void {
      this.$router.go(-1);
    },
  },
});
</script>
