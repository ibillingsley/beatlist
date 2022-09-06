<template>
  <v-edit-dialog large save-text="OK" @open="reset" @save="update">
    <v-row
      no-gutters
      align="center"
      justify="center"
      dense
      align-content="center"
    >
      <v-col align-self="center" style="padding-top: 6px">
        <v-btn
          icon
          small
          :color="
            enabled && (dateMin != null || dateMax != null) ? 'success' : ''
          "
        >
          <v-icon>filter_list</v-icon>
        </v-btn>
      </v-col>
      <v-col align-self="center" style="padding-top: 6px; white-space: nowrap">
        {{ filterText }}
      </v-col>
    </v-row>
    <template #input>
      <v-menu
        ref="menuMin"
        v-model="menuMin"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template #activator="{ on }">
          <v-text-field
            v-model="stringMin"
            label="From"
            prepend-icon="event"
            readonly
            clearable
            @click:clear="clearMin"
            v-on="on"
          />
        </template>
        <v-date-picker
          v-model="stringMin"
          no-title
          type="date"
          min="2018-05-01"
          @change="$refs.menuMin.save(stringMin)"
        />
      </v-menu>
      <v-menu
        ref="menuMax"
        v-model="menuMax"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="290px"
      >
        <template #activator="{ on }">
          <v-text-field
            v-model="stringMax"
            label="To"
            prepend-icon="event"
            readonly
            clearable
            @click:clear="clearMax"
            v-on="on"
          />
        </template>
        <v-date-picker
          v-model="stringMax"
          no-title
          type="date"
          min="2018-05-01"
          @change="$refs.menuMax.save(stringMax)"
        />
      </v-menu>
    </template>
  </v-edit-dialog>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { BeatsaverFilter } from "@/libraries/net/beatsaver/BeatsaverFilter";
import { DateRange } from "@/libraries/common/Range";

export default Vue.extend({
  name: "BeatmapsTableOnlineDateFilter",
  props: {
    enabled: { type: Boolean, required: true },
    // Object as PropType<Date> はエラーになる
    value: { type: Object as PropType<DateRange>, required: true },
  },
  data: () => ({
    filterText: "StartDate - EndDate",
    stringMin: undefined as string | undefined,
    stringMax: undefined as string | undefined,
    dateMin: undefined as Date | undefined,
    dateMax: undefined as Date | undefined,
    menuMin: false,
    menuMax: false,
  }),
  watch: {
    stringMin() {
      this.dateMin =
        this.stringMin != null ? new Date(this.stringMin) : undefined;
    },
    stringMax() {
      this.dateMax =
        this.stringMax != null ? new Date(this.stringMax) : undefined;
    },
  },
  activated(): void {
    this.reset();
    this.updateFilterText();
  },
  mounted(): void {
    this.reset();
    this.updateFilterText();
  },
  methods: {
    reset() {
      this.dateMin = this.value.min;
      this.dateMax = this.value.max;
      this.stringMin = this.value.min?.toISOString().substring(0, 10);
      this.stringMax = this.value.max?.toISOString().substring(0, 10);
    },
    updateFilterText() {
      let text = "";
      if (this.dateMin != null) {
        text += this.dateMin.toISOString().substring(0, 10);
      } else {
        text += "StartDate";
      }
      text += " - ";
      if (this.dateMax != null) {
        text += this.dateMax.toISOString().substring(0, 10);
      } else {
        text += "EndDate";
      }
      this.filterText = text;
    },
    update() {
      this.checkForValidMinMax();
      this.convertNullToUndefined();
      this.updateFilterText();
      const filter: BeatsaverFilter = {
        mode: "date",
      };
      if (this.dateMin != null) {
        filter.minDate = this.dateMin;
      }
      if (this.dateMax != null) {
        filter.maxDate = this.dateMax;
      }
      this.$emit("input", filter);
    },
    checkForValidMinMax() {
      if (
        this.dateMin !== undefined &&
        this.dateMax !== undefined &&
        this.dateMin?.getTime() > this.dateMax?.getTime()
      ) {
        this.dateMax = this.dateMin;
      }
    },
    convertNullToUndefined() {
      if (this.stringMin === null) {
        this.stringMin = undefined;
      }

      if (this.stringMax === null) {
        this.stringMax = undefined;
      }
    },
    clearMin() {
      this.stringMin = undefined;
    },
    clearMax() {
      this.stringMax = undefined;
    },
  },
});
</script>
