<template>
  <v-chip-group
    v-model="shownColumn"
    mandatory
    multiple
    show-arrows
    color="success"
  >
    <v-chip
      v-for="column in availableColumn"
      :key="column.value"
      :value="column.value"
      outlined
      small
    >
      {{ column.name }}
    </v-chip>
  </v-chip-group>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export default Vue.extend({
  name: "BeatmapsTableColumnSelector",
  props: {
    value: { type: Array as PropType<string[]>, required: true },
    showLocalColumn: { type: Boolean, default: false },
  },
  data: () => ({
    shownColumn: [] as string[],
    // isLocal = true は Custom Levels 用
    headers: [
      { value: "cover", text: "Cover" },
      { value: "name", text: "Song name" },
      { value: "artist", text: "Artist" },
      { value: "mapper", text: "Mapper" },
      { value: "difficulties", text: "Difficulties" },
      { value: "bpm", text: "BPM" },
      { value: "duration", text: "Song Length" },
      { value: "requirements", text: "Requirements" },
      { value: "downloaded", text: "Download Date", isLocal: true },
      { value: "playlists", text: "Playlists" },
      // { value: "dl", text: "Downloads" },
      // { value: "plays", text: "Plays" },
      { value: "upvotes", text: "Up votes" },
      { value: "downvotes", text: "Down votes" },
      { value: "rating", text: "Rating" },
      { value: "uploaded", text: "Uploaded" },
      { value: "key", text: "Key" },
      { value: "hash", text: "Hash" },
    ],
  }),
  computed: {
    availableColumn(): { name: string; value: string }[] {
      return this.headers
        .filter((header) => {
          if (header.isLocal) {
            return this.showLocalColumn;
          }
          return true;
        })
        .map((header) => ({
          name: header.text,
          value: header.value,
        }));
    },
  },
  watch: {
    shownColumn(): void {
      this.$emit("input", this.shownColumn);
    },
  },
  mounted(): void {
    this.shownColumn = this.value;
  },
});
</script>
