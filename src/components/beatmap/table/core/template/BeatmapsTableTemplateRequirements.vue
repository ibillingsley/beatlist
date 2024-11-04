<template>
  <v-container class="pa-0 pl-3">
    <span style="margin-left: -1px; margin-right: -1px; min-width: 2em">
      {{
        data
          .filter((item) => item.enabled)
          .map((item) => item.shortName)
          .join(",")
      }}
    </span>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import Utilities from "@/libraries/helper/Utilities";
import { convertReqsMetadataToShortNameList } from "@/libraries/helper/RequirementsHelper";
import { ReqsMetadata } from "@/libraries/net/beatsaver/BeatsaverBeatmap";

export default Vue.extend({
  name: "BeatmapsTableTemplateRequirements",
  components: {},
  props: {
    item: { type: Object, required: true },
    header: { type: Object, required: true },
  },
  computed: {
    data() {
      const reqs = Utilities.byIndex(
        this.item.data,
        this.header.templateItemAccess
      );
      if (reqs == null) {
        return [];
      }
      // chroma, ne, me, cinema の順に表示
      const keys: (keyof ReqsMetadata)[] = ["chroma", "ne", "me", "cinema"];
      return convertReqsMetadataToShortNameList(keys, reqs);
    },
  },
});
</script>
