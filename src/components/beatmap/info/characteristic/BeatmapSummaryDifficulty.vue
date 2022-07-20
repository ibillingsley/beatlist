<template>
  <v-row align="center">
    <v-col cols="auto">
      <table
        aria-describedby="infos about the difficulty (1st column)"
        class="align-first-column-left"
      >
        <tr>
          <td class="body-2 pr-2">
            Duration
          </td>
          <td class="body-1 pl-2">
            <Tooltip :text="difficulty.duration.toString()" right>
              {{ difficulty.duration.toFixed(2) }}
            </Tooltip>
          </td>
        </tr>
        <tr>
          <td class="body-2 pr-2">
            length
          </td>
          <td class="body-1 pl-2">
            {{ difficulty.length }}
          </td>
        </tr>
        <tr>
          <td class="body-2 pr-2">
            Bombs
          </td>
          <td class="body-1 pl-2">
            {{ difficulty.bombs }}
          </td>
        </tr>
        <tr>
          <td class="body-2 pr-2">
            Notes
          </td>
          <td class="body-1 pl-2">
            {{ difficulty.notes }}
          </td>
        </tr>
      </table>
    </v-col>
    <v-col cols="auto">
      <table
        aria-describedby="infos about the difficulty (2nd column)"
        class="align-first-column-left"
      >
        <tr>
          <td class="body-2 pr-2">
            Obstacles
          </td>
          <td class="body-1 pl-2">
            {{ difficulty.obstacles }}
          </td>
        </tr>
        <tr>
          <td class="body-2 pr-2">
            njs
          </td>
          <td class="body-1 pl-2">
            {{ difficulty.njs }}
          </td>
        </tr>
        <tr>
          <td class="body-2 pr-2">
            njs offset
          </td>
          <td class="body-1 pl-2">
            {{ difficulty.njsOffset }}
          </td>
        </tr>
        <tr>
          <td class="body-2 pr-2">
            nps
          </td>
          <td class="body-1 pl-2">
            {{
              difficulty.nps != null
                ? Math.floor(difficulty.nps * 100) / 100
                : ""
            }}
          </td>
        </tr>
      </table>
    </v-col>
    <v-col cols="auto">
      <table
        aria-describedby="infos about the difficulty (3rd column)"
        class="align-first-column-left"
      >
        <tr v-for="req in reqs" :key="req.key">
          <td class="body-2 pr-2">
            {{ req.name }}
          </td>
          <td class="body-1 pl-2">
            <v-icon v-if="req.enabled" small>
              check_circle
            </v-icon>
            <v-icon v-else small>
              radio_button_unchecked
            </v-icon>
          </td>
        </tr>
      </table>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { convertReqsMetadataToNameList } from "@/libraries/helper/RequirementsHelper";
import {
  Difficulty,
  ReqsMetadata,
} from "@/libraries/net/beatsaver/BeatsaverBeatmap";
// import Tooltip from "@/components/helper/Tooltip.vue";

export default Vue.extend({
  name: "BeatmapSummaryDifficulty",
  // components: { Tooltip },
  components: {},
  props: {
    difficulty: { type: Object as PropType<Difficulty>, required: true },
  },
  computed: {
    reqs() {
      // chroma, ne, me, cinema の順に表示
      const keys: (keyof ReqsMetadata)[] = ["chroma", "ne", "me", "cinema"];
      return convertReqsMetadataToNameList(keys, this.difficulty);
    },
  },
});
</script>
