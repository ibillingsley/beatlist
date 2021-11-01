<template>
  <v-edit-dialog large save-text="OK" @open="reset" @save="update">
    <v-row
      no-gutters
      align="center"
      justify="center"
      dense
      align-content="center"
    >
      <v-col align-self="center" style="padding-top: 6px;">
        <v-btn
          icon
          small
          :color="
            enabled && (minNpsInputValue != null || maxNpsInputValue != null)
              ? 'success'
              : ''
          "
        >
          <v-icon>filter_list</v-icon>
        </v-btn>
      </v-col>
      <v-col align-self="center" style="padding-top: 6px; white-space: nowrap;">
        {{ filterText }}
      </v-col>
    </v-row>
    <template v-slot:input>
      <span>NPS</span>
      <v-text-field
        ref="minNpsElm"
        v-model="minNpsInput"
        placeholder="from"
        type="number"
        label="from"
        min="0"
        max="99"
        maxlength="5"
        outlined
        hide-details="auto"
        class="mt-3"
        clearable
        @keydown="preventKey"
      />
      <v-text-field
        ref="maxNpsElm"
        v-model="maxNpsInput"
        placeholder="to"
        type="number"
        label="to"
        min="0"
        max="99"
        maxlength="5"
        outlined
        hide-details="auto"
        class="mt-3"
        clearable
        @keydown="preventKey"
      />
    </template>
  </v-edit-dialog>
</template>

<script lang="ts">
import { BeatsaverFilter } from "@/libraries/net/beatsaver/BeatsaverFilter";
import Vue from "vue";

interface ValidateResult {
  valid: boolean;
  lazyValue?: string;
  value?: number | null;
}
export default Vue.extend({
  name: "BeatmapsTableOnlineNpsFilter",
  props: {
    enabled: { type: Boolean, required: true },
    minNps: { type: Number, required: false, default: null },
    maxNps: { type: Number, required: false, default: null },
  },
  data: () => ({
    filterText: "NPS: 0-∞",
    minNpsInputValue: null as number | null,
    maxNpsInputValue: null as number | null,
  }),
  computed: {
    minNpsInput: {
      // eslint-disable-next-line func-names, object-shorthand
      get: function (): number | null {
        return this.minNpsInputValue;
      },
      // eslint-disable-next-line func-names, object-shorthand
      set: function (newValue: string) {
        const result = this.validateValue(newValue);
        if (
          result.valid &&
          result.value != null &&
          this.maxNpsInputValue != null
        ) {
          if (result.value > this.maxNpsInputValue) {
            result.value = this.maxNpsInputValue;
            result.lazyValue = `${result.value}`;
          }
        }
        if (typeof result.lazyValue !== "undefined") {
          (this.$refs.minNpsElm as any).lazyValue = result.lazyValue;
        }
        if (typeof result.value !== "undefined") {
          this.minNpsInputValue = result.value;
        }
      },
    },
    maxNpsInput: {
      // eslint-disable-next-line func-names, object-shorthand
      get: function (): number | null {
        return this.maxNpsInputValue;
      },
      // eslint-disable-next-line func-names, object-shorthand
      set: function (newValue: string) {
        const result = this.validateValue(newValue);
        if (
          result.valid &&
          result.value != null &&
          this.minNpsInputValue != null
        ) {
          if (result.value < this.minNpsInputValue) {
            result.value = this.minNpsInputValue;
            result.lazyValue = `${result.value}`;
          }
        }
        if (typeof result.lazyValue !== "undefined") {
          (this.$refs.maxNpsElm as any).lazyValue = result.lazyValue;
        }
        if (typeof result.value !== "undefined") {
          this.maxNpsInputValue = result.value;
        }
      },
    },
  },
  watch: {
    minNps() {
      if (this.minNpsInputValue !== this.minNps) {
        this.minNpsInputValue = this.minNps;
      }
    },
    maxNps() {
      if (this.maxNpsInputValue !== this.maxNps) {
        this.maxNpsInputValue = this.maxNps;
      }
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
      this.minNpsInputValue = this.minNps;
      this.maxNpsInputValue = this.maxNps;
    },
    preventKey(event: KeyboardEvent) {
      if (event.defaultPrevented) {
        return;
      }
      if (event.key === "e" || event.key === "E") {
        event.preventDefault();
      }
    },
    updateFilterText() {
      let text = "NPS: ";
      if (this.minNpsInputValue == null) {
        text += "0-";
      } else {
        text += `${this.minNpsInputValue}-`;
      }
      if (this.maxNpsInputValue == null) {
        text += "∞";
      } else {
        text += `${this.maxNpsInputValue}`;
      }
      this.filterText = text;
    },
    validateValue(newValue: string): ValidateResult {
      if (newValue == null || newValue === "") {
        return {
          valid: true,
          lazyValue: "",
          value: null,
        };
      }
      if (newValue.length > 5) {
        newValue = newValue.slice(0, 5);
      }
      let numValue = Number.parseFloat(newValue);
      if (Number.isNaN(numValue)) {
        return {
          valid: false,
          lazyValue: `${this.minNpsInputValue ?? ""}`,
          // value は変更しない
        };
      }
      if (numValue < 0) {
        numValue = 0;
      } else if (numValue > 99) {
        numValue = 99;
      }
      return {
        valid: true,
        lazyValue: `${numValue}`,
        value: numValue,
      };
    },
    update() {
      if (this.minNpsInputValue != null && this.maxNpsInputValue != null) {
        if (this.minNpsInputValue > this.maxNpsInputValue) {
          return;
        }
      }
      this.updateFilterText();
      const filter: BeatsaverFilter = {
        mode: "nps",
      };
      if (this.minNpsInputValue != null) {
        filter.minNps = this.minNpsInputValue;
      }
      if (this.maxNpsInputValue != null) {
        filter.maxNps = this.maxNpsInputValue;
      }
      this.$emit("input", filter);
    },
  },
});
</script>
