<template>
  <v-container :class="short ? 'pa-0 pl-3' : 'pa-1 ml-n2'">
    <v-tooltip v-for="value in difficulties" :key="value.key" top>
      <template #activator="{ on }">
        <v-chip
          :color="value.color"
          :small="small"
          :class="chipClass(value.highlight)"
          style="border: solid; border-width: 1px"
          v-on="on"
        >
          <span style="margin-left: -1px; margin-right: -1px">
            {{
              short ? (showShortLetter ? value.shortName : "") : value.chipName
            }}
          </span>
        </v-chip>
      </template>
      <span>{{ value.chipName }}</span>
    </v-tooltip>
  </v-container>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { DifficultiesSimple } from "@/libraries/net/beatsaver/BeatsaverBeatmap";
import {
  getColorFor,
  getNameFor,
  getWeightFor,
} from "@/libraries/helper/DifficultiesHelper";
import { get } from "vuex-pathify";
import Colorblind, { ColorblindMode } from "@/libraries/app/Colorblind";

export default Vue.extend({
  name: "DifficultiesChips",
  props: {
    diff: { type: Object as PropType<DifficultiesSimple>, required: true },
    // diffHighlight は { [key: string]: DifficultiesSimple } を想定
    diffHighlight: { type: Object, default: undefined },
    small: { type: Boolean, default: false },
    short: { type: Boolean, default: false },
  },
  data: () => ({
    difficulties: [] as any,
  }),
  computed: {
    showShortLetter: get<boolean>(
      "settings/accessibility@showLetterInDifficulty"
    ),
    colorBlindMode: get<ColorblindMode>(
      "settings/accessibility@colorBlindMode"
    ),
  },
  watch: {
    diff: {
      handler(): void {
        this.computeDifficulties();
      },
      immediate: true,
    },
    colorBlindMode(): void {
      this.computeDifficulties();
    },
  },
  methods: {
    chipClass(highlight: boolean) {
      let classes = `${this.short ? "ml-n3" : "ma-1"}`;
      if (highlight) {
        classes += ` ${
          this.$vuetify.theme.dark
            ? "chip-highlight-dark"
            : "chip-highlight-light"
        }`;
      }
      return classes;
    },
    computeDifficulties(): void {
      const highlight = {} as DifficultiesSimple;
      if (this.diffHighlight != null) {
        // Ignore characteristic (standard/onesaber/etc) in difficulties.
        for (const values of Object.values(
          this.diffHighlight as { [key: string]: DifficultiesSimple }
        )) {
          for (const key of Object.keys(values)) {
            if (values[key]) {
              highlight[key] = true;
            }
          }
        }
      }
      this.difficulties = Object.entries(this.diff)
        .map(([key, value]) => ({
          name: key,
          enabled: value,
          chipName: getNameFor(key),
          shortName: Colorblind.getShortNameFor(key),
          color:
            this.colorBlindMode === ColorblindMode.Greyscale
              ? Colorblind.getColorGreyScaled(key)
              : getColorFor(key),
          highlight: highlight[key],
          weight: getWeightFor(key),
        }))
        .sort((a: any, b: any) => a.weight - b.weight);

      // to force the v-for to re-render on different state, we create an unique key
      const keyBase = Object.values(this.difficulties)
        .map((d: any) => d.enabled)
        .join();

      this.difficulties = this.difficulties
        .map((d: any) => {
          d.key = `${keyBase} - ${d.name}`;
          return d;
        })
        .filter((d: any) => d.enabled);
    },
  },
});
</script>

<style scoped>
span.v-chip.chip-highlight-dark {
  border-color: white !important;
}
span.v-chip.chip-highlight-light {
  border-width: 2px 2px;
  border-color: black !important;
}
</style>
