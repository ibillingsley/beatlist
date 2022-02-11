<template>
  <v-container>
    <p class="display-1">
      Installation path
    </p>
    <v-form v-model="installationPathValid">
      <v-text-field
        v-model="installationPath"
        label="Installation path"
        append-icon="folder"
        :color="installationPathValid ? 'primary' : 'red'"
        :prepend-icon="installationPathValid ? 'done' : 'warning'"
        :rules="rules.validInstallationPath"
        hint="The folder where Beat Saber is installed, must have a 'Beat Saber.exe' file there"
        solo
        @click:append="openFileExplorer"
      />
      <v-btn
        text
        color="accent"
        class="mb-4"
        :disabled="installationPathValid"
        :loading="resolveBtnLoading"
        @click="detectPath()"
      >
        <v-icon class="pr-3">
          fa-magic
        </v-icon>
        Detect installation path
      </v-btn>
    </v-form>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { sync } from "vuex-pathify";
import * as remote from "@electron/remote";
import BeatSaber from "@/libraries/os/beatSaber/BeatSaber";
import PathResolver from "@/libraries/ipc/PathResolver.ipc";
import NotificationService from "@/libraries/notification/NotificationService";

export default Vue.extend({
  name: "InstallationPathForm",
  data: () => ({
    rules: {
      validInstallationPath: [
        (v: string) =>
          BeatSaber.validateInstallationPathSync(v) ||
          "Installation path is not valid",
      ],
    },
    snackbar: false,
    snackbarType: "",
    snackbarText: "",
    resolveBtnLoading: false,
  }),
  computed: {
    installationPath: sync<string>("settings/installationPath"),
    installationPathValid: sync<string>("settings/installationPathValid"),
  },
  methods: {
    async openFileExplorer() {
      const folder = await remote.dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      if (folder.filePaths.length === 0) {
        return;
      }

      [this.installationPath] = folder.filePaths;
    },
    async detectPath() {
      this.resolveBtnLoading = true;
      try {
        const path = await PathResolver.detectInstallationPath();
        if (path === "") {
          NotificationService.NotifyMessage(
            "Couldn't detect installation path :(",
            "error",
            undefined,
            5000
          );
          // this.snackbarType = "error";
          // this.snackbarText = "Couldn't detect installation path :(";
        } else {
          this.installationPath = path;
          NotificationService.NotifyMessage(
            "Installation path found :)",
            "success",
            undefined,
            5000
          );
          // this.snackbarType = "success";
          // this.snackbarText = "Installation path found :)";
        }

        this.resolveBtnLoading = false;
        // this.snackbar = true;
      } catch (error) {
        console.error(error);
        NotificationService.NotifyMessage(
          "Couldn't detect installation path :(",
          "error",
          undefined,
          5000
        );
        this.resolveBtnLoading = false;
      }
    },
  },
});
</script>
