<template>
  <v-container class="py-0">
    <div class="d-flex align-center flex-column">
      <v-img :src="titleImage" width="200" />
      <div class="text-center grey--text text-caption">
        Current version: {{ currentVersion }}
      </div>
      <div>
        <v-btn
          href="https://github.com/ibillingsley/beatlist/releases/latest"
          target="_blank"
          text
          style="background-color: primary"
        >
          <span class="mr-2">Latest Release</span>
          <v-icon>mdi-open-in-new</v-icon>
        </v-btn>
      </div>
      <div class="pt-2">
        <!-- <v-btn icon color="rgb(114, 137, 218)" @click="openDiscordInvitation()">
          <v-icon class="mx-2">
            mdi-discord
          </v-icon>
        </v-btn> -->
        <v-btn icon @click="openGithubRepo()">
          <v-icon> mdi-github </v-icon>
        </v-btn>
      </div>
    </div>
    <ChangelogDisplayer />
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { shell } from "electron";
import { get } from "vuex-pathify";
import ChangelogDisplayer from "@/components/github/changelog/ChangelogDisplayer.vue";
import DiscordRichPresence from "@/libraries/ipc/DiscordRichPresence";
import * as remote from "@electron/remote";

const titleWhite = require("@/assets/title_white.png");
const titleDark = require("@/assets/title_dark.png");

export default Vue.extend({
  name: "Home",
  components: { ChangelogDisplayer },
  beforeRouteEnter(to, from, next) {
    DiscordRichPresence.UpdateStatus("Home");
    next();
  },
  computed: {
    darkTheme: get<boolean>("settings/darkTheme"),
    titleImage() {
      return this.darkTheme ? titleDark : titleWhite;
    },
    currentVersion() {
      return remote.app.getVersion();
    },
  },
  methods: {
    openGithubRepo() {
      shell.openExternal("https://github.com/ibillingsley/beatlist");
    },
    openDiscordInvitation() {
      // shell.openExternal("https://discord.gg/f5AmKSH");
    },
  },
});
</script>
