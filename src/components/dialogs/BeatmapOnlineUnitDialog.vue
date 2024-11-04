<template>
  <v-dialog v-model="isOpen" max-width="80%" @click:outside="closeDialog">
    <v-card>
      <v-container>
        <v-row>
          <v-col cols="auto" align-self="center">
            <v-btn icon @click="isOpen = false">
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
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import BeatmapSummary from "@/components/beatmap/info/BeatmapSummary.vue";
import BeatsaverAPI, {
  BeatSaverAPIResponse,
  BeatSaverAPIResponseStatus,
} from "@/libraries/net/beatsaver/BeatsaverAPI";
import Logger from "@/libraries/helper/Logger";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import BeatsaverUtilities from "@/libraries/net/beatsaver/BeatsaverUtilities";
import LoadingPage from "@/components/helper/LoadingPage.vue";

export default Vue.extend({
  name: "BeatmapOnlineUnitDialog",
  components: {
    BeatmapSummary,
    LoadingPage,
  },
  props: {
    maphash: { type: String, required: true },
    open: { type: Boolean, required: true },
  },
  data: () => ({
    beatmap: undefined as BeatsaverBeatmap | undefined,
    loading: false,
    error: undefined as string | undefined,
    // props の値を直接 v-model に渡すべきではないので別の変数を用意する。
    isOpen: false,
  }),
  watch: {
    maphash() {
      if (this.maphash != null && this.maphash !== "") {
        this.fetchData();
      }
    },
    open() {
      if (this.isOpen !== this.open) {
        this.isOpen = this.open;
      }
    },
    isOpen() {
      if (this.isOpen !== this.open) {
        this.$emit("update:open", this.isOpen);
      }
    },
  },
  mounted(): void {
    this.fetchData();
  },
  // created() {
  //   Logger.debug(`created`, "BeatmapOnlineUnitDialog");
  // },
  // destroyed() {
  //   Logger.debug(`destroyed`, "BeatmapOnlineUnitDialog");
  // },
  methods: {
    fetchData(): void {
      Logger.debug(
        `methods: fetchData called. hash=${this.maphash}`,
        "BeatmapOnlineUnitDialog"
      );
      if (this.maphash == null || this.maphash === "") {
        return;
      }
      this.loading = true;
      this.beatmap = undefined;
      BeatsaverAPI.Singleton.getBeatmapByHash(this.maphash)
        .then((response: BeatSaverAPIResponse<BeatsaverBeatmap>) => {
          this.error = BeatsaverUtilities.ErrorToMessage(response);

          if (response.status === BeatSaverAPIResponseStatus.ResourceFound) {
            this.beatmap = response.data;
            /*
            // 取得したデータをキャッシュに保存
            // -> ちょっと反応重くなるので有効化はやめておく
            const hash = this.maphash.toUpperCase();
            BeatsaverCachedLibrary.Add(hash, {
              beatmap: this.beatmap,
              loadState: {
                valid: true,
                errorType: undefined,
                errorMessage: undefined,
                attemptedSource: {
                  type: BeatsaverKeyType.Hash,
                  value: hash,
                },
              },
            });
            */
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    closeDialog() {
      this.$emit("update:open", false);
    },
  },
});
</script>
