<template>
  <v-container fluid>
    <transition name="slide-x-transition" mode="out-in">
      <keep-alive exclude="BeatmapOnlineUnit,BeatmapLocalUnit,Settings,*Dialog">
        <router-view :key="$route.name" />
      </keep-alive>
    </transition>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "Playlists",
});
</script>
