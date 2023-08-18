<template>
  <span class="d-flex justify-center">
    <BeatmapDownloadButton
      v-if="actions.has('download')"
      :beatmap="beatmap"
      :auto-hide="actions.has('remove')"
      small
    />
    <BeatmapButtonRemoveBeatmap
      v-if="actions.has('remove')"
      :beatmap="beatmap"
      :auto-hide="actions.has('download')"
      small
    />
    <BeatmapButtonAddToNPlaylists
      v-if="actions.has('add') && !playlist"
      :beatmap="beatmap"
      small
    />
    <PlaylistButtonAddToPlaylist
      v-if="actions.has('add') && playlist && !(playlistMapIndex >= 0)"
      :playlist="playlist"
      :beatmap="beatmap"
      small
    />
    <PlaylistButtonRemoveFromPlaylist
      v-if="actions.has('add') && playlist && playlistMapIndex >= 0"
      :playlist="playlist"
      :beatmap="beatmap"
      :playlist-map-index="playlistMapIndex"
      small
    />
    <BeatmapButtonPlaySong
      v-if="actions.has('play')"
      :beatmap="beatmap"
      small
    />
    <BeatmapButtonOpenPreview
      v-if="actions.has('preview')"
      :beatmap="beatmap"
      small
    />
    <BeatmapButtonOpenFolder
      v-if="actions.has('folder')"
      :beatmap="beatmap"
      small
    />
    <BeatmapButtonOpenBeatsaver
      v-if="actions.has('beatsaver')"
      :beatmap="beatmap"
      small
    />
    <BeatmapButtonCopyBsr v-if="actions.has('bsr')" :beatmap="beatmap" small />
  </span>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import { PlaylistLocal } from "@/libraries/playlist/PlaylistLocal";
import { BeatmapTableActions } from "@/store/settings";
import BeatmapDownloadButton from "@/components/downloads/BeatmapDownloadButton.vue";
import BeatmapButtonAddToNPlaylists from "@/components/beatmap/button/BeatmapButtonAddToNPlaylists.vue";
import BeatmapButtonCopyBsr from "@/components/beatmap/info/button/BeatmapButtonCopyBsr.vue";
import BeatmapButtonOpenBeatsaver from "@/components/beatmap/info/button/BeatmapButtonOpenBeatsaver.vue";
import BeatmapButtonOpenFolder from "@/components/beatmap/info/button/BeatmapButtonOpenFolder.vue";
import BeatmapButtonOpenPreview from "@/components/beatmap/info/button/BeatmapButtonOpenPreview.vue";
import BeatmapButtonPlaySong from "@/components/beatmap/info/button/BeatmapButtonPlaySong.vue";
import BeatmapButtonRemoveBeatmap from "@/components/beatmap/info/button/BeatmapButtonRemoveBeatmap.vue";
import PlaylistButtonAddToPlaylist from "@/components/playlist/button/PlaylistButtonAddToPlaylist.vue";
import PlaylistButtonRemoveFromPlaylist from "@/components/playlist/button/PlaylistButtonRemoveFromPlaylist.vue";

export default Vue.extend({
  name: "BeatmapsTableActionsRow",
  components: {
    BeatmapDownloadButton,
    BeatmapButtonRemoveBeatmap,
    BeatmapButtonAddToNPlaylists,
    PlaylistButtonAddToPlaylist,
    PlaylistButtonRemoveFromPlaylist,
    BeatmapButtonPlaySong,
    BeatmapButtonOpenPreview,
    BeatmapButtonOpenFolder,
    BeatmapButtonOpenBeatsaver,
    BeatmapButtonCopyBsr,
  },
  props: {
    beatmap: { type: Object as PropType<BeatsaverBeatmap>, required: true },
    playlist: { type: Object as PropType<PlaylistLocal>, default: undefined },
    playlistMapIndex: { type: Number, default: undefined },
    actions: {
      type: Set as PropType<Set<BeatmapTableActions>>,
      required: true,
    },
  },
});
</script>
