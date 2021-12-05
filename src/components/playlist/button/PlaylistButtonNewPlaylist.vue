<template>
  <Tooltip text="New playlist">
    <v-btn icon :loading="loading" @click="OpenDialog">
      <v-icon>add</v-icon>
    </v-btn>
    <NewPlaylistDialog
      :open.sync="openNewPlaylistDialog"
      :on-action="MakeNewPlaylist"
    />
  </Tooltip>
</template>

<script lang="ts">
import Vue from "vue";
import Tooltip from "@/components/helper/Tooltip.vue";
import PlaylistOperation from "@/libraries/playlist/PlaylistOperation";
import NewPlaylistDialog from "@/components/dialogs/NewPlaylistDialog.vue";

export default Vue.extend({
  name: "PlaylistButtonNewPlaylist",
  components: {
    NewPlaylistDialog,
    Tooltip,
  },
  data: () => ({
    loading: false,
    openNewPlaylistDialog: false,
  }),
  methods: {
    OpenDialog() {
      this.openNewPlaylistDialog = true;
    },
    MakeNewPlaylist(playlistTitle: string) {
      this.loading = true;
      PlaylistOperation.CreateNewPlaylist(playlistTitle).then(() => {
        this.loading = false;
      });
    },
  },
});
</script>
