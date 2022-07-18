<template>
  <span>
    {{ data }}
  </span>
</template>

<script lang="ts">
import Vue from "vue";
import Utilities from "@/libraries/helper/Utilities";
import { BeatmapsTableHeader } from "@/components/beatmap/table/core/BeatmapsTableHeaders";

export default Vue.extend({
  name: "BeatmapsTableTemplateNumber",
  props: {
    item: { type: Object, required: true },
    header: { type: Object, required: true },
  },
  computed: {
    data() {
      const targetHeader = this.header as BeatmapsTableHeader;
      const value = Utilities.byIndex(
        (this.item as any).data,
        targetHeader.templateItemAccess as string
      );
      if (targetHeader.digits != null) {
        const a = 10 ** targetHeader.digits;
        return Math.floor(value * a) / a;
      }
      return value;
    },
  },
});
</script>
