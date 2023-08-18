<template>
  <v-menu offset-y :close-on-content-click="false">
    <template #activator="{ on, attrs }">
      <span>Actions</span>
      <v-btn icon small v-bind="attrs" v-on="on">
        <v-icon small>settings</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item-group
        :value="shownActions"
        multiple
        @change="$emit('update:shownActions', $event)"
      >
        <template v-for="item in actions">
          <v-list-item :key="item.value" :value="item.value">
            <template #default="{ active }">
              <v-list-item-action>
                <v-checkbox :input-value="active"></v-checkbox>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>{{ item.text }}</v-list-item-title>
              </v-list-item-content>
            </template>
          </v-list-item>
        </template>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { BeatmapTableActions } from "@/store/settings";

interface SelectAction {
  value: BeatmapTableActions;
  text: string;
}

export default Vue.extend({
  name: "BeatmapsTableActionsHeader",
  props: {
    shownActions: {
      type: Array as PropType<BeatmapTableActions[]>,
      required: true,
    },
  },
  data: () => ({
    actions: [
      { value: "download", text: "Download" },
      { value: "remove", text: "Delete" },
      { value: "add", text: "Add/Remove from playlists" },
      { value: "play", text: "Play song" },
      { value: "preview", text: "Preview" },
      { value: "folder", text: "Open folder" },
      { value: "beatsaver", text: "Open on BeatSaver" },
      { value: "bsr", text: "Copy BSR" },
    ] as SelectAction[],
  }),
});
</script>
