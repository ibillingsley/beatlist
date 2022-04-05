<template>
  <div :style="styles">
    {{ date.toLocaleString() }}
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Utilities from "@/libraries/helper/Utilities";
import { BeatmapsTableHeader } from "../BeatmapsTableHeaders";

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
    styles(): any {
      const { width } = this.header as BeatmapsTableHeader;
      if (width == null) {
        return null;
      }
      // US 表記の場合などで改行されるのをなるべく防ぐため min-width を指定
      return { minWidth: `${width}px` };
    },
    data(): string {
      // this.item.data でなく this.item から取得
      return Utilities.byIndex(this.item, this.header.templateItemAccess);
    },
  },
});
</script>
