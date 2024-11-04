<template>
  <div class="text-center">
    <v-dialog v-model="isOpen" width="500">
      <v-card>
        <v-card-title> Input playlist title </v-card-title>

        <v-text-field
          ref="title"
          v-model="playlistTitle"
          class="ma-5"
          color="secondary"
          label="Title"
          outlined
          dense
          hide-details
          clearable
          @change="checkCreateDisabled"
        />
        <v-card-text>FileName: {{ filename }}</v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn color="secondary" text @click="closeDialog()"> CANCEL </v-btn>
          <v-btn
            color="primary"
            text
            :disabled="isCreateDisabled"
            @click="doAction()"
          >
            CREATE
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import NotificationService from "@/libraries/notification/NotificationService";
import PlaylistInstaller from "@/libraries/os/beatSaber/installer/PlaylistInstaller";
import Vue from "vue";

export default Vue.extend({
  name: "NewPlaylistDialog",
  props: {
    open: { type: Boolean, required: false, default: false },
    onAction: {
      type: Function,
      default: (playlistTitle: string) => {
        // ダミー処理
        console.log(playlistTitle);
      },
    },
  },
  data() {
    return {
      isOpen: false,
      playlistTitle: "",
      isCreateDisabled: false,
      filename: "",
    };
  },
  watch: {
    open() {
      if (this.isOpen !== this.open) {
        this.isOpen = this.open;
        if (this.isOpen) {
          this.setDefaultTitle();
          // URL に fragment がある場合 autofocus は block されるようなので setTimeout でフォーカス実行
          setTimeout(() => {
            if (this.$refs.title != null) {
              const inputElm = (this.$refs.title as any).$el.querySelector(
                "input"
              );
              if (inputElm != null) {
                inputElm.select();
              }
            }
          }, 0);
        }
      }
    },
    isOpen() {
      if (this.isOpen !== this.open) {
        this.$emit("update:open", this.isOpen);
      }
    },
    playlistTitle() {
      this.filename = PlaylistInstaller.GetFilename(this.playlistTitle);
    },
  },
  mounted(): void {
    this.setDefaultTitle();
  },
  methods: {
    setDefaultTitle() {
      const randNum = Math.floor(Math.random() * 1e6 - 1) + 1e5;
      const name = `new_playlist_${randNum}`;
      this.playlistTitle = name;
    },
    async checkCreateDisabled() {
      if (this.playlistTitle == null || this.playlistTitle.trim() === "") {
        this.isCreateDisabled = true;
        return;
      }
      this.isCreateDisabled = false;
    },
    closeDialog() {
      this.$emit("update:open", false);
    },
    async doAction() {
      if (await PlaylistInstaller.ExistsPlaylist(this.playlistTitle)) {
        NotificationService.NotifyMessage(
          "Duplicate file name. Please enter a different title.",
          "error",
          "save",
          5000
        );
        return;
      }
      this.closeDialog();

      if (this.onAction !== undefined) {
        this.onAction(this.playlistTitle);
      }
    },
  },
});
</script>
