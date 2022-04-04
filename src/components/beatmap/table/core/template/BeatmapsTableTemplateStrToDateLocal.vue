<template>
  <span>
    {{ date.toLocaleString() }}
  </span>
</template>

<script lang="ts">
import Vue from "vue";
import Utilities from "@/libraries/helper/Utilities";

export default Vue.extend({
  name: "BeatmapsTableTemplateStrToDateLocal",
  components: {},
  props: {
    item: { type: Object, required: true },
    header: { type: Object, required: true },
  },
  computed: {
    date(): Date {
      return new Date(this.data);
    },
    data(): string {
      // this.item.data でなく this.item から取得
      return Utilities.byIndex(this.item, this.header.templateItemAccess);
    },
  },
});
</script>
