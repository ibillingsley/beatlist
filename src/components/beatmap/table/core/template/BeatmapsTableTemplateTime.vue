<template>
  <span>
    {{ time }}
  </span>
</template>

<script lang="ts">
import Vue from "vue";
import Utilities from "@/libraries/helper/Utilities";

export default Vue.extend({
  name: "BeatmapsTableTemplateTime",
  props: {
    item: { type: Object, required: true },
    header: { type: Object, required: true },
  },
  computed: {
    time(): string {
      return Utilities.convertTimeHHMMSS(this.data);
    },
    data(): number {
      return Utilities.byIndex(this.item.data, this.header.templateItemAccess);
    },
  },
});
</script>
