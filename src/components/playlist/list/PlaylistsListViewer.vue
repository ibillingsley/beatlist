<template>
  <v-list v-if="playlists.length > 0" dense rounded>
    <v-list-item
      v-for="playlist in playlists"
      :key="playlist.hash"
      @click="openPlaylist(playlist)"
    >
      <v-list-item-avatar>
        <PlaylistCover :playlist="playlist" />
      </v-list-item-avatar>

      <v-list-item-content>
        <v-list-item-title>
          <span class="mr-1">{{ playlist.title }}</span>
          <span class="grey--text">{{
            playlist.author ? ` - ${playlist.author}` : ""
          }}</span>
          <span class="grey--text">{{
            ` - ${playlist.maps.length} maps`
          }}</span>
        </v-list-item-title>
        <v-list-item-subtitle class="text-no-wrap grey--text">
          {{ dateToString(playlist.modified) }}
        </v-list-item-subtitle>
        <v-list-item-subtitle class="text-no-wrap">
          {{ playlist.description }}
        </v-list-item-subtitle>
      </v-list-item-content>

      <v-list-item-action>
        <slot name="actions" :playlist="playlist" />
      </v-list-item-action>
    </v-list-item>
  </v-list>
  <v-alert v-else type="warning">
    There's no playlist available yet. Create a new one !
  </v-alert>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { PlaylistLocal } from "@/libraries/playlist/PlaylistLocal";
import PlaylistCover from "@/components/playlist/cover/PlaylistCover.vue";

export default Vue.extend({
  name: "PlaylistsListViewer",
  components: { PlaylistCover },
  props: {
    playlists: { type: Array as PropType<PlaylistLocal[]>, required: true },
    action: {
      type: Function as PropType<(playlist: PlaylistLocal) => void>,
      default: undefined,
    },
  },
  methods: {
    dateToString(value: Date): string {
      if (value == null) {
        return "";
      }
      return value.toLocaleString();
    },
    openPlaylist(playlist: PlaylistLocal): void {
      if (this.action) {
        this.action(playlist);
      }
    },
  },
});
</script>
