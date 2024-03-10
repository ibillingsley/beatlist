<template>
  <v-container class="py-0">
    <v-row>
      <v-col
        v-if="changelogRaw !== '' && !hasErr"
        id="markdown"
        v-html="changelog"
      />
      <v-col v-if="hasErr">
        <v-alert text type="warning" icon="warning" class="mt-5">
          <span>Unfortunately, we weren't able to fetch the CHANGELOG.md</span>
          <br />
          <span class="text-caption">
            You can always check the
            <a
              href="https://github.com/ibillingsley/beatlist"
              target="_blank"
              class="warning--text"
              rel="noopener noreferrer"
              >Github repo</a
            >.
          </span>
        </v-alert>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { marked } from "marked";
import BeatlistRepo from "@/libraries/net/github/BeatlistRepo";

export default Vue.extend({
  name: "ChangelogDisplayer",
  data: () => ({
    changelogRaw: "",
    hasErr: false,
  }),
  computed: {
    changelog() {
      return marked(this.changelogRaw, { breaks: true, headerIds: false });
    },
  },
  mounted(): void {
    let currentLanguage = navigator.language;
    if (currentLanguage?.toLowerCase().indexOf("ja") >= 0) {
      currentLanguage = "ja";
    }
    new BeatlistRepo().GetChangelogContent(currentLanguage).then((content) => {
      if (content) {
        this.changelogRaw = content;
        this.hasErr = false;
      } else {
        this.hasErr = true;
      }
    });
  },
});
</script>

<style scoped>
#markdown:first-child {
  margin-top: 0px !important;
}

#markdown :deep(h1),
#markdown :deep(h2),
#markdown :deep(h3),
#markdown :deep(h4),
#markdown :deep(h5),
#markdown :deep(h6) {
  margin-bottom: 15px;
  margin-top: 15px;
}

#markdown :deep(p),
#markdown :deep(li) {
  font-weight: 400;
}

#markdown :deep(ul) {
  margin-bottom: 15px;
}

#markdown :deep(p) {
  margin-bottom: 5px;
}
</style>
