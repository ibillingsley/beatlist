<template>
  <v-dialog v-model="isOpen" persistent width="300">
    <v-card>
      <v-card-title>
        {{ title }}
      </v-card-title>
      <v-card-text>
        <slot />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn text @click="closeDialog"> Cancel </v-btn>
        <v-btn text :color="actionColor" @click="doAction()">
          {{ actionText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "ConfirmDialog",
  props: {
    open: { type: Boolean, required: true },
    title: { type: String, default: undefined },
    actionText: { type: String, default: "Confirm" },
    actionColor: { type: String, default: "" },
    onAction: { type: Function, default: () => {} },
  },
  data: () => ({
    // props の値を直接 v-model に渡すべきではないので別の変数を用意する。
    isOpen: false,
  }),
  watch: {
    open() {
      if (this.isOpen !== this.open) {
        this.isOpen = this.open;
      }
    },
    isOpen() {
      if (this.isOpen !== this.open) {
        this.$emit("update:open", this.isOpen);
      }
    },
  },
  mounted(): void {
    this.isOpen = this.open;
  },
  methods: {
    closeDialog() {
      this.$emit("update:open", false);
    },
    doAction() {
      this.closeDialog();

      if (this.onAction !== undefined) {
        this.onAction();
      }
    },
  },
});
</script>
