<template>
  <v-container class="pa-0">
    <v-row align="center">
      <v-col cols="6">
        <table
          aria-describedby="infos about the beatmap (1st column)"
          class="align-first-column-left"
        >
          <tr>
            <td class="text-body-2 pr-2">Name</td>
            <td class="text-body-1 pl-2">
              {{ beatmap.metadata.songName | emptyCheck }}
            </td>
          </tr>
          <tr>
            <td class="text-body-2 pr-2">Subname</td>
            <td class="text-body-1 pl-2">
              {{ beatmap.metadata.songSubName | emptyCheck }}
            </td>
          </tr>
          <tr>
            <td class="text-body-2 pr-2">Author</td>
            <td class="text-body-1 pl-2">
              {{ beatmap.metadata.songAuthorName | emptyCheck }}
            </td>
          </tr>
          <tr>
            <td class="text-body-2 pr-2">Mapper</td>
            <td class="text-body-1 pl-2">
              {{ beatmap.metadata.levelAuthorName | emptyCheck }}
            </td>
          </tr>
          <tr>
            <td class="text-body-2 pr-2">BPM</td>
            <td class="text-body-1 pl-2">
              {{ beatmap.metadata.bpm }}
            </td>
          </tr>
          <tr>
            <td class="text-body-2 pr-2">Song Length</td>
            <td class="text-body-1 pl-2">
              {{ duration }}
            </td>
          </tr>
          <tr>
            <td class="text-body-2 pr-2">Key</td>
            <td class="text-body-1 pl-2">
              {{ beatmap.key }}
            </td>
          </tr>
        </table>
      </v-col>
      <v-col cols="6">
        <table
          aria-describedby="infos about the beatmap (second column)"
          class="align-first-column-left"
        >
          <tr>
            <td class="text-body-2 pr-2">Uploaded</td>
            <td class="text-body-1 pl-2">
              {{ beatmap.uploaded | toDate }}
            </td>
          </tr>
          <!-- <tr>
            <td class="body-2 pr-2">
              Downloads
            </td>
            <td class="body-1 pl-2">
              {{ beatmap.stats.downloads }}
            </td>
          </tr> -->
          <!-- <tr>
            <td class="body-2 pr-2">
              Plays
            </td>
            <td class="body-1 pl-2">
              {{ beatmap.stats.plays }}
            </td>
          </tr> -->
          <tr>
            <td class="text-body-2 pr-2">Up votes</td>
            <td class="text-body-1 pl-2">
              {{ beatmap.stats.upVotes }}
            </td>
          </tr>
          <tr>
            <td class="text-body-2 pr-2">Down votes</td>
            <td class="text-body-1 pl-2">
              {{ beatmap.stats.downVotes }}
            </td>
          </tr>
          <tr>
            <td class="text-body-2 pr-2">Rating</td>
            <td class="text-body-1 pl-2">
              <Tooltip :text="beatmap.stats.rating.toString()" right>
                {{ beatmap.stats.rating | toPercent }}
              </Tooltip>
            </td>
          </tr>
          <tr>
            <td class="text-body-2 pr-2">Difficulties</td>
            <td class="pl-2">
              <DifficultiesChips
                :diff="beatmap.metadata.difficulties"
                short
                small
              />
            </td>
          </tr>
          <tr>
            <td class="text-body-2 pr-2">Hash</td>
            <td class="text-body-1 pl-2">
              {{ beatmap.hash }}
            </td>
          </tr>
        </table>
      </v-col>
      <v-col cols="12">
        <v-expansion-panels
          v-if="beatmap.description"
          v-model="descriptionPanel"
          flat
          popout
        >
          <v-expansion-panel>
            <v-expansion-panel-header>Description</v-expansion-panel-header>
            <v-expansion-panel-content>
              <span v-html="Linkify(FormatNewLine(beatmap.description))" />
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        <p v-else class="grey--text font-italic">No description given.</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import linkifyHtml from "linkify-html";
import { BeatsaverBeatmap } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import DifficultiesChips from "@/components/beatmap/DifficultiesChips.vue";
import Tooltip from "@/components/helper/Tooltip.vue";
import Utilities from "@/libraries/helper/Utilities";

export default Vue.extend({
  name: "BeatmapSummaryBaseInfo",
  components: { DifficultiesChips, Tooltip },
  filters: {
    toDate(value: string): string {
      return new Date(value).toLocaleString();
    },
    toPercent(value: number): string {
      return `${(value * 100).toFixed(2)}%`;
    },
    emptyCheck(value: string): string {
      return value || "-";
    },
  },
  props: {
    beatmap: { type: Object as PropType<BeatsaverBeatmap>, required: true },
  },
  data: () => ({
    descriptionPanel: 0,
  }),
  computed: {
    duration(): string {
      return Utilities.convertTimeHHMMSS(this.beatmap.metadata?.duration);
    },
  },
  methods: {
    Linkify(str: string): string {
      return linkifyHtml(str, { target: "_blank" });
    },
    FormatNewLine(str: string): string {
      return str.replace(/\r\n/g, "<br>").replace(/\n/g, "<br>");
    },
  },
});
</script>

<style>
a.linkified {
  color: cornflowerblue !important;
}

table.align-first-column-left > tr > td:first-child {
  text-align: right;
}
</style>
