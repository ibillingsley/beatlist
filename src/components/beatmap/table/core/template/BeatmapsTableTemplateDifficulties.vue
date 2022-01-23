<template>
  <DifficultiesChips :diff="data" :diff-highlight="options" small short />
</template>

<script lang="ts">
import Vue from "vue";
import Utilities from "@/libraries/helper/Utilities";
import DifficultiesChips from "@/components/beatmap/DifficultiesChips.vue";

export default Vue.extend({
  name: "BeatmapsTableTemplateDifficulties",
  components: { DifficultiesChips },
  props: {
    item: { type: Object, required: true },
    header: { type: Object, required: true },
    options: { type: Object, default: undefined },
  },
  computed: {
    data() {
      return Utilities.byIndex(this.item.data, this.header.templateItemAccess);
    },
  },
});
</script>
