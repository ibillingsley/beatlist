<template>
  <div>
    <BeatmapsTableOuterHeader
      :shown-column.sync="shownColumn"
      :search.sync="search"
    />
    <BeatmapsTableInPlaylist
      :items="beatmaps"
      :shown-column="shownColumn"
      :items-per-page.sync="itemsPerPage"
      :selected.sync="selectedBeatmap"
      :search="search"
      :see-more-route-name="seeMoreRouteName"
    >
      <template #actions="{ beatsaver }">
        <BeatmapDownloadButton :beatmap="beatsaver" small />
        <BeatmapButtonOpenPreview :beatmap="beatsaver" small />
      </template>
    </BeatmapsTableInPlaylist>
    <BeatmapsTableBulkActions
      :playlist="playlist"
      :selected="[]"
      :selected-index="selectedBeatmap"
      bulk-download
      @onDone="selectedBeatmap = []"
    />
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import BeatmapsTableInPlaylist from "@/components/beatmap/table/BeatmapsTableInPlaylist.vue";
import BeatmapsTableOuterHeader from "@/components/beatmap/table/core/BeatmapsTableOuterHeader.vue";
import BeatmapsTableBulkActions from "@/components/beatmap/table/core/BeatmapsTableBulkActions.vue";
import { sync } from "vuex-pathify";
import PlaylistMapsLibrary from "@/libraries/playlist/PlaylistMapsLibrary";
import { PlaylistLocal } from "@/libraries/playlist/PlaylistLocal";
import BeatmapDownloadButton from "@/components/downloads/BeatmapDownloadButton.vue";
import BeatmapButtonOpenPreview from "@/components/beatmap/info/button/BeatmapButtonOpenPreview.vue";
import route from "@/plugins/route/route";
import { BeatmapsTableDataUnit } from "@/components/beatmap/table/core/BeatmapsTableDataUnit";

export default Vue.extend({
  name: "BeastsaberPlaylistContentTable",
  components: {
    // BeatmapsTable,
    BeatmapsTableInPlaylist,
    BeatmapsTableOuterHeader,
    BeatmapsTableBulkActions,
    BeatmapDownloadButton,
    BeatmapButtonOpenPreview,
  },
  props: {
    playlist: { type: Object as PropType<PlaylistLocal>, required: true },
  },
  data: () => ({
    // selectedBeatmap: [] as BeatsaverBeatmap[],
    selectedBeatmap: [] as number[],
    search: "",
    beatmaps: [] as BeatmapsTableDataUnit[],
  }),
  computed: {
    shownColumn: sync<string[]>(
      "settings/beatmapsTable@beastsaberPlaylistContent.shownColumn"
    ),
    itemsPerPage: sync<string[]>(
      "settings/beatmapsTable@beastsaberPlaylistContent.itemsPerPage"
    ),
    // beatmaps() {
    //   return PlaylistMapsLibrary.GetAllValidMapAsTableDataFor(this.playlist);
    // },
    seeMoreRouteName: () => route.BEATMAPS_ONLINE_UNIT,
  },
  mounted(): void {
    this.fetchData();
  },
  methods: {
    async fetchData(): Promise<void> {
      this.beatmaps = await PlaylistMapsLibrary.GetAllValidMapAsTableDataFor(
        this.playlist
      );
    },
  },
});
</script>
