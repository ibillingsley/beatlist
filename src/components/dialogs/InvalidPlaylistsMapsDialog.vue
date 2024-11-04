<template>
  <v-dialog v-model="isOpen" max-width="80%" @click:outside="closeDialog">
    <v-card>
      <v-card-title> Invalid beatmaps in playlists </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="headers"
          :items="invalidPlaylistsMaps"
          item-key="key"
          hide-default-footer
          disable-pagination
          fixed-header
          height="500"
          group-by="filename"
          aria-describedby="All invalid beatmaps inside playlists"
          dense
        >
          <template #[`item.error`]="{ item }">
            <span class="error--text">
              {{ item.error | errorTranslated }}
            </span>
          </template>
        </v-data-table>
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
import path from "path";
import PlaylistMapsLibrary from "@/libraries/playlist/PlaylistMapsLibrary";
import { PlaylistMapImportError } from "@/libraries/playlist/PlaylistLocal";

export default Vue.extend({
  name: "InvalidPlaylistsMapsDialog",
  filters: {
    errorTranslated: (error: PlaylistMapImportError): string => {
      switch (error) {
        case PlaylistMapImportError.BeatmapTypeLevelIdNotSupported:
          return "Beatmap type level id is currently not supported";
        case PlaylistMapImportError.BeatsaverInexistent:
          return "The beatmap was not found on beatsaver.";
        case PlaylistMapImportError.BeatsaverRequestError:
          return "Request error while retrieving data on beatsaver";
        case PlaylistMapImportError.Unknown:
        default:
          return "Unknown error";
      }
    },
  },
  props: {
    open: { type: Boolean, required: true },
  },
  data: () => ({
    headers: [
      { text: "Filename", value: "filename" },
      { text: "Key type", value: "keyType" },
      { text: "Key value", value: "keyValue" },
      { text: "Error", value: "error" },
      { text: "Details", value: "errorInfo" },
    ],
    // props の値を直接 v-model に渡すべきではないので別の変数を用意する。
    isOpen: false,
  }),
  computed: {
    invalidPlaylistsMaps: () =>
      PlaylistMapsLibrary.GetAllInvalidMapFlatten().map((entry) => ({
        key: `${
          (entry.playlist.path ?? "") +
          (entry.map.errorInfo ?? "") +
          entry.map.attemptedSource.type +
          entry.map.attemptedSource.value
        }-${entry.index}`,
        path: entry.playlist.path,
        filename: path.basename(entry.playlist.path ?? ""),
        keyType: entry.map.attemptedSource.type,
        keyValue: entry.map.attemptedSource.value,
        error: entry.map.error,
        errorInfo: entry.map.errorInfo,
      })),
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
