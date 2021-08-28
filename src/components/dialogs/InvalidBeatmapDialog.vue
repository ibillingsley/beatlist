<template>
  <v-dialog v-model="isOpen" max-width="80%" @click:outside="closeDialog">
    <v-card>
      <v-card-title>
        Invalid beatmaps
      </v-card-title>
      <v-card-text>
        <v-simple-table dense fixed-header>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">
                  Folder
                </th>
                <th class="text-left">
                  Reason
                </th>
                <th class="text-left">
                  More info
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in invalidBeatmap" :key="item.folderPath">
                <td>{{ item.folderPath }}</td>
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
        <v-btn text @click="closeDialog">
          Ok
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import BeatmapLoadStateError from "@/libraries/beatmap/BeatmapLoadStateError";

export default Vue.extend({
  name: "InvalidBeatmapDialog",
  filters: {
    errorTranslated: (error: BeatmapLoadStateError): string => {
      switch (error) {
        case BeatmapLoadStateError.FailedToComputeHash:
          return "Failed to compute the hash";
        case BeatmapLoadStateError.NoInfoDatFileFound:
          return "No info.dat file found";
        case BeatmapLoadStateError.NoCoverImageFound:
          return "No cover image found";
        case BeatmapLoadStateError.NoSoundFileFound:
          return "No music file found";
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
    invalidBeatmap: () => BeatmapLibrary.GetAllInvalidMap(),
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
