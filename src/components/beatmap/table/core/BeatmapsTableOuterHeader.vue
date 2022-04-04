<template>
  <v-row>
    <v-col :sm="showRefreshButton ? 7 : 8" :cols="showRefreshButton ? 9 : 10">
      <BeatmapsTableColumnSelector
        :value="shownColumn"
        :show-local-column="showLocalColumn"
        @input="$emit('update:shownColumn', $event)"
      />
    </v-col>
    <v-col v-if="showRefreshButton" sm="1" cols="1">
      <Tooltip text="Refresh the data">
        <v-btn icon :loading="loading" @click="$emit('refresh', $event)">
          <v-icon>refresh</v-icon>
        </v-btn>
      </Tooltip>
    </v-col>
    <v-col sm="4" cols="2">
      <BeatmapsTableSearchInput
        :value="search"
        @input="$emit('update:search', $event)"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import BeatmapsTableColumnSelector from "@/components/beatmap/table/core/BeatmapsTableColumnSelector.vue";
import BeatmapsTableSearchInput from "@/components/beatmap/table/core/BeatmapsTableSearchInput.vue";
import Tooltip from "@/components/helper/Tooltip.vue";

export default Vue.extend({
  name: "BeatmapsTableOuterHeader",
  components: {
    BeatmapsTableColumnSelector,
    BeatmapsTableSearchInput,
    Tooltip,
  },
  props: {
    shownColumn: { type: Array as PropType<string[]>, required: true },
    showLocalColumn: { type: Boolean, default: false },
    search: { type: String, required: true },
    loading: { type: Boolean, required: false },
    showRefreshButton: { type: Boolean, required: false, default: false },
  },
});
</script>
