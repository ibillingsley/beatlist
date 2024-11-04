<template>
  <v-dialog v-model="isOpen" max-width="80%" @click:outside="closeDialog">
    <v-card>
      <v-card-title> Invalid Playlists </v-card-title>
      <v-card-text>
        <v-simple-table dense fixed-header>
          <template #default>
            <thead>
              <tr>
                <th class="text-left">Folder</th>
                <th class="text-left">Reason</th>
                <th class="text-left">More info</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in invalidPlaylist" :key="item.path">
                <td>{{ item.path }}</td>
                <td class="error--text">
                  {{ item.loadState.errorType | errorTranslated }}
                </td>
                <td>
                  {{ item.loadState.errorMessage }}
                </td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeDialog"> Ok </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import PlaylistLibrary from "@/libraries/playlist/PlaylistLibrary";
import PlaylistLoadStateError from "@/libraries/playlist/loader/PlaylistLoadStateError";

export default Vue.extend({
  name: "InvalidPlaylistDialog",
  filters: {
    errorTranslated: (error: PlaylistLoadStateError): string => {
      switch (error) {
        case PlaylistLoadStateError.PathDoesntExist:
          return "The playlist doesn't even exist";
        case PlaylistLoadStateError.FormatDoesntExist:
          return "This playlist format doesn't exist (judging from the file extension name).";
        case PlaylistLoadStateError.FailedToParse:
          return "Failed to parse the playlist.";
        case PlaylistLoadStateError.Unknown:
        default:
          return "Unknown error";
      }
    },
  },
  props: {
    open: { type: Boolean, required: true },
  },
  data: () => ({
    // props の値を直接 v-model に渡すべきではないので別の変数を用意する。
    isOpen: false,
  }),
  computed: {
    invalidPlaylist: () => PlaylistLibrary.GetAllInvalidPlaylists(),
  },
  watch: {
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
  methods: {
    closeDialog() {
      this.$emit("update:open", false);
    },
  },
});
</script>
