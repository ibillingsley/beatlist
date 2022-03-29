<template>
  <div style="height: 52px;">
    <v-slide-x-transition>
      <v-container v-if="selectedCount > 0" class="d-flex align-center ml-n4">
        <v-btn
          v-if="bulkAdd && playlist"
          outlined
          small
          color="success"
          class="ml-4"
          :loading="bulkAddLoading"
          @click="performBulkAdd"
        >
          Add
        </v-btn>

        <v-btn
          v-if="bulkRemove && playlist"
          outlined
          small
          color="error"
          class="ml-4"
          :loading="bulkRemoveLoading"
          @click="performBulkRemove"
        >
          Remove
        </v-btn>

        <v-btn
          v-if="bulkDownload"
          outlined
          small
          color="success"
          class="ml-4"
          :loading="bulkDownloadLoading"
          :disabled="beatmapNotDownloadedAndSelected.length === 0"
          @click="performBulkDownload"
        >
          Download ({{ beatmapNotDownloadedAndSelected.length }})
        </v-btn>

        <v-btn
          v-if="bulkCopyBsr && playlist"
          outlined
          small
          color="success"
          class="ml-4"
          @click="performBulkCopyBsr"
        >
          Copy BSR
        </v-btn>

        <span class="pl-3">
          {{ selectedCount }} item{{ selectedCount > 1 ? "s" : "" }}
          selected
        </span>
      </v-container>
    </v-slide-x-transition>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { clipboard } from "electron";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import PlaylistOperation from "@/libraries/playlist/PlaylistOperation";
import { PlaylistLocal } from "@/libraries/playlist/PlaylistLocal";
import BeatmapInstaller from "@/libraries/os/beatSaber/installer/BeatmapInstaller";
import NotificationService from "@/libraries/notification/NotificationService";
import BeatmapLibrary from "@/libraries/beatmap/BeatmapLibrary";
import DownloadLibrary from "@/libraries/net/downloader/DownloadLibrary";
import BeatsaverCachedLibrary from "@/libraries/beatmap/repo/BeatsaverCachedLibrary";
import PlaylistMapsLibrary from "@/libraries/playlist/PlaylistMapsLibrary";
import BeatmapScanner from "@/libraries/scanner/beatmap/BeatmapScanner";
import { DownloadOperationBeatmapResultStatus } from "@/libraries/net/downloader/operation/beatmap/DownloadOperationBeatmapResult";

export default Vue.extend({
  name: "BeatmapsTableBulkActions",
  props: {
    // for BeatmapsTable
    selected: { type: Array as PropType<BeatsaverBeatmap[]>, required: true },
    // for BeatmapsTableInPlaylist
    selectedIndex: { type: Array as PropType<Number[]>, default: undefined },
    playlist: {
      type: Object as PropType<PlaylistLocal | undefined>,
      default: undefined,
    },
    bulkAdd: { type: Boolean, default: false },
    bulkRemove: { type: Boolean, default: false },
    bulkDownload: { type: Boolean, default: false },
    bulkCopyBsr: { type: Boolean, default: false },
  },
  data: () => ({
    bulkAddLoading: false,
    bulkRemoveLoading: false,
    bulkDownloadLoading: false,
  }),
  computed: {
    selectedCount(): number {
      return this.selected.length + (this.selectedIndex?.length ?? 0);
    },
    beatmapNotDownloadedAndSelected(): BeatsaverBeatmap[] {
      const downloadedHashSet = new Set<string>();
      BeatmapLibrary.GetAllValidMap().forEach((value) => {
        // GetAllMaps() を取得して value.loadState.valid を条件に追加したほうが速いが
        // GetAllValidMap() の実装隠ぺいのためそのままにしておく。
        if (value.hash != null) {
          // valid な map は hash が null になることはないが一応チェック
          downloadedHashSet.add(value.hash.toUpperCase());
        }
      });
      if (this.playlist != null && this.selectedIndex != null) {
        const result = [] as BeatsaverBeatmap[];
        const validMaps = BeatsaverCachedLibrary.GetAllValid();
        const hashes = PlaylistMapsLibrary.GetMapHashesByIndex(
          this.playlist,
          this.selectedIndex
        );
        for (const hash of hashes) {
          const beatmap = validMaps.get(hash)?.beatmap;
          /*
          if (
            beatmap != null &&
            !BeatmapLibrary.HasBeatmap(beatmap) &&
            !DownloadLibrary.HasBeatmapScheduled(beatmap)
          ) {
            result.push(beatmap);
          } */
          if (
            beatmap != null &&
            !downloadedHashSet.has(beatmap.hash.toUpperCase()) &&
            !DownloadLibrary.HasBeatmapScheduled(beatmap)
          ) {
            result.push(beatmap);
          }
        }
        return result;
      }
      return this.selected.filter((beatmap: BeatsaverBeatmap) => {
        /*
        return (
          !BeatmapLibrary.HasBeatmap(beatmap) &&
          !DownloadLibrary.HasBeatmapScheduled(beatmap)
        ); */
        return (
          !downloadedHashSet.has(beatmap.hash.toUpperCase()) &&
          !DownloadLibrary.HasBeatmapScheduled(beatmap)
        );
      });
    },
  },
  methods: {
    performBulkAdd() {
      if (!this.playlist) return;

      this.bulkAddLoading = true;

      PlaylistOperation.BulkAddMapInPlaylist(
        this.playlist,
        this.selected.map((s) => s.hash)
      ).finally(() => {
        this.bulkAddLoading = false;
        this.$emit("onDone");
      });
    },
    performBulkRemove() {
      if (!this.playlist) return;

      this.bulkRemoveLoading = true;

      PlaylistOperation.BulkRemoveMapFromPlaylist(
        this.playlist,
        // this.selected.map((s) => s.hash)
        this.selectedIndex
      ).finally(() => {
        this.bulkRemoveLoading = false;
        this.$emit("onDone");
      });
    },
    performBulkDownload() {
      this.bulkDownloadLoading = true;

      const beatmapScanner = new BeatmapScanner();
      this.beatmapNotDownloadedAndSelected.forEach(
        (beatmap: BeatsaverBeatmap) => {
          BeatmapInstaller.Install(beatmap, (operation) => {
            NotificationService.NotifyBeatmapDownload(operation.result);
            if (
              operation.result.status ===
              DownloadOperationBeatmapResultStatus.Success
            ) {
              beatmapScanner.scanOne(operation.result.path); // 非同期
            }
          });
        }
      );

      this.bulkDownloadLoading = false;
      this.$emit("onDone");
    },
    performBulkCopyBsr() {
      if (!this.playlist) return;

      let text = "";

      if (this.playlist != null && this.selectedIndex != null) {
        const keySet = new Set<string>();
        const validMaps = BeatsaverCachedLibrary.GetAllValid();
        const hashes = PlaylistMapsLibrary.GetMapHashesByIndex(
          this.playlist,
          this.selectedIndex
        );
        for (const hash of hashes) {
          const beatmap = validMaps.get(hash)?.beatmap;
          if (beatmap?.key != null && beatmap?.key !== "") {
            keySet.add(beatmap.key);
          }
        }
        Array.from(keySet).forEach((key) => {
          text += `\r\n!bsr ${key}`;
        });
      } else {
        this.selected.forEach((s) => {
          if (s.key != null && s.key !== "") {
            text += `\r\n!bsr ${s.key}`;
          }
        });
      }

      if (text.length > 0) {
        text = text.substring(2);
      } else {
        NotificationService.NotifyMessage(
          "Coping BSR failed. No valid key selected.",
          "warning"
        );
        return;
      }
      try {
        clipboard.writeText(text);
        NotificationService.NotifyMessage(`BSRs copied.`, "success");
      } catch (error) {
        console.error(error);
        NotificationService.NotifyMessage("Coping BSR failed.", "warning");
      }
    },
  },
});
</script>
