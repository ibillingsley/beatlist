<template>
  <div class="d-flex align-center">
    <Tooltip :text="audioTooltip()">
      <v-btn
        icon
        :loading="loading"
        :small="small"
        :disabled="!beatmapLocal"
        @click="togglePlay()"
      >
        <v-icon v-if="playing" :small="small"> pause_circle_outline </v-icon>
        <v-icon v-else :small="small"> play_circle_outline </v-icon>
      </v-btn>
    </Tooltip>
    <v-expand-x-transition mode="out-in">
      <div v-if="playing" class="ml-2 text-no-wrap">
        {{ currentTime }} on {{ totalTime }}
      </div>
    </v-expand-x-transition>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import Tooltip from "@/components/helper/Tooltip.vue";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import { BeatmapLocal } from "@/libraries/beatmap/BeatmapLocal";
import BeatmapLocalUtilities from "@/libraries/beatmap/BeatmapLocalUtilities";
import NotificationService from "@/libraries/notification/NotificationService";
import Utilities from "@/libraries/helper/Utilities";

export default Vue.extend({
  name: "BeatmapButtonPlaySong",
  components: { Tooltip },
  props: {
    beatmap: { type: Object as PropType<BeatsaverBeatmap>, required: true },
    small: { type: Boolean, default: false },
  },
  data: () => ({
    audio: new Audio(),
    currentSeconds: 0,
    totalSeconds: 0,
    loading: false,
    playing: false,
  }),
  computed: {
    beatmapLocal(): BeatmapLocal | undefined {
      return BeatmapLibrary.GetMapByHash(this.beatmap.hash);
    },
    currentTime(): string {
      return Utilities.convertTimeHHMMSS(this.currentSeconds);
    },
    totalTime(): string {
      return Utilities.convertTimeHHMMSS(this.totalSeconds);
    },
  },
  watch: {
    $route() {
      if (!this.audio.paused) {
        this.audio.pause();
        this.audio.currentTime = 0;
      }
    },
  },
  beforeDestroy(): void {
    if (!this.audio.paused) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  },
  methods: {
    async LoadAudioSrc(): Promise<void> {
      this.loading = true;

      if (this.beatmapLocal) {
        return BeatmapLocalUtilities.GetAudioSrcBase64(this.beatmapLocal).then(
          (data: string) => {
            this.audio.src = data;
            this.setupAudioPlayer();
          }
        );
      }

      return undefined;
    },
    setupAudioPlayer() {
      this.audio.addEventListener("timeupdate", () => {
        this.currentSeconds = Math.ceil(this.audio.currentTime);
      });

      this.audio.addEventListener("pause", () => {
        this.playing = false;
      });

      this.audio.addEventListener("play", () => {
        this.playing = true;
      });

      this.audio.addEventListener("loadeddata", () => {
        this.loading = false;
        this.totalSeconds = Math.ceil(this.audio.duration);
      });
    },
    togglePlay(): void {
      if (!this.audio.src) {
        this.LoadAudioSrc()
          .then(() => {
            this.togglePlay();
          })
          .catch((error) => {
            console.error(error);
            NotificationService.NotifyMessage(
              "Loading audio failed.",
              "warning"
            );
          });
      } else if (this.audio.paused) {
        this.audio.play();
      } else {
        this.audio.pause();
        this.audio.currentTime = 0;
      }
    },
    audioTooltip(): string {
      return !this.playing ? "Play the song" : "Stop the song";
    },
  },
});
</script>
