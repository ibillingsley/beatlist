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

    <BeatmapSummary v-if="beatmap" :beatmap="beatmap" />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import BeatmapSummary from "@/components/beatmap/info/BeatmapSummary.vue";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import BeatmapLoader from "@/libraries/beatmap/BeatmapLoader";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import route from "@/plugins/route/route";

export default Vue.extend({
  name: "BeatmapLocalUnit",
  components: { BeatmapSummary },
  data: () => ({
    beatmap: undefined as BeatsaverBeatmap | undefined,
  }),
  computed: {
    cacheLastUpdated() {
      // console.log(`[BeatmapLocalUnit] computed: cacheLastUpdated`);
      return BeatsaverCachedLibrary.GetCacheLastUpdated();
    },
  },
  watch: {
    $route() {
      if (
        this.$route.name === route.BEATMAPS_LOCAL_UNIT ||
        this.$route.name === route.BEATMAPS_ONLINE_UNIT
      ) {
        this.fetchData();
      }
    },
    cacheLastUpdated() {
      // console.log(`[BeatmapLocalUnit] watch: cacheLastUpdated`);
      if (
        this.$route.name === route.BEATMAPS_LOCAL_UNIT ||
        this.$route.name === route.BEATMAPS_ONLINE_UNIT
      ) {
        this.fetchData();
      }
    },
  },
  mounted(): void {
    this.fetchData();
  },
  methods: {
    async fetchData(): Promise<void> {
      // Saved Beatmaps 画面では /beatmaps/local/:hash
      // My Playlists 画面では /beatmaps/online/:hash で呼ばれる。
      // -> v1.2.6 で My Playlists 画面からは呼ばれないようにしたが念のため条件は残しておく。
      this.beatmap = undefined;
      if (
        (this.$route.name !== route.BEATMAPS_LOCAL_UNIT &&
          this.$route.name !== route.BEATMAPS_ONLINE_UNIT) ||
        this.$route.params.hash == null
      ) {
        return;
      }
      const { hash } = this.$route.params;
      this.beatmap = BeatsaverCachedLibrary.GetByHash(hash)?.beatmap;
      if (this.beatmap) return;
      // Generate local beatmap info
      const local = BeatmapLibrary.GetMapByHash(hash);
      const beatmap = await BeatmapLibrary.GenerateBeatmap(local);
      if (beatmap && local) {
        beatmap.coverURL = (await BeatmapLoader.LoadCover(local)) || "";
      }
      this.beatmap = beatmap;
    },
    backHistory(): void {
      this.$router.go(-1);
    },
  },
});
</script>
