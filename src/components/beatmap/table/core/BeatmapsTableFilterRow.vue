<!-- eslint-disable vue/no-mutating-props -->
<!-- TODO 上記警告はいったん保留 -->
<template>
  <tr>
    <td v-for="index in [...Array(shiftLeft)].map((_, i) => i)" :key="index" />
    <td v-for="header in headers" :key="header.value" :align="header.align">
      <component
        :is="`BeatmapsTableFilter${header.filterType}`"
        v-if="header.filterType !== undefined"
        v-model="filtersValue[header.value]"
        :header="header"
      />
    </td>
  </tr>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { BeatmapsTableHeader } from "@/components/beatmap/table/core/BeatmapsTableHeaders";
import BeatmapsTableFilterText from "@/components/beatmap/table/core/filter/BeatmapsTableFilterText.vue";
import BeatmapsTableFilterRange from "@/components/beatmap/table/core/filter/BeatmapsTableFilterRange.vue";
import BeatmapsTableFilterDifficulties from "@/components/beatmap/table/core/filter/BeatmapsTableFilterDifficulties.vue";
import BeatmapsTableFilterDate from "@/components/beatmap/table/core/filter/BeatmapsTableFilterDate.vue";
import BeatmapsTableFilterPlaylists from "@/components/beatmap/table/core/filter/BeatmapsTableFilterPlaylists.vue";
import BeatmapsTableFilterRequirements from "@/components/beatmap/table/core/filter/BeatmapsTableFilterRequirements.vue";

export default Vue.extend({
  name: "BeatmapsTableFilterRow",
  components: {
    BeatmapsTableFilterText,
    BeatmapsTableFilterRange,
    BeatmapsTableFilterDifficulties,
    BeatmapsTableFilterDate,
    BeatmapsTableFilterPlaylists,
    BeatmapsTableFilterRequirements,
  },
  props: {
    headers: { type: Array as PropType<BeatmapsTableHeader[]>, required: true },
    filtersValue: { type: Object, required: true },
    shiftLeft: { type: Number, default: 0 },
  },
});
</script>
