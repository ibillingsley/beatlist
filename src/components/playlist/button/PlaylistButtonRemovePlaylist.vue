<template>
  <div>
    <Tooltip text="Remove this playlist">
      <v-btn icon @click.stop="dialog = true">
        <v-icon color="error"> delete_forever </v-icon>
      </v-btn>
    </Tooltip>
    <ConfirmDialog
      :open.sync="dialog"
      title="Confirm"
      action-text="Delete"
      action-color="error"
      :on-action="deletePlaylist"
    >
      Are you sure you want to
      <strong><span class="error--text">delete</span> this playlist ?</strong>
    </ConfirmDialog>
  </div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import Tooltip from "@/components/helper/Tooltip.vue";
import ConfirmDialog from "@/components/dialogs/ConfirmDialog.vue";
import { PlaylistLocal } from "@/libraries/playlist/PlaylistLocal";
import NotificationService, {
  NOTIFICATION_ICON_DELETE,
} from "@/libraries/notification/NotificationService";
import PlaylistOperation from "@/libraries/playlist/PlaylistOperation";

export default Vue.extend({
  name: "PlaylistButtonRemovePlaylist",
  components: { Tooltip, ConfirmDialog },
  props: {
    playlist: { type: Object as PropType<PlaylistLocal>, required: true },
  },
  data: () => ({
    dialog: false,
  }),
  methods: {
    async deletePlaylist() {
      await PlaylistOperation.DeletePlaylist(this.playlist);
      NotificationService.NotifyMessage(
        "The playlist has been moved to recycle bin",
        "",
        NOTIFICATION_ICON_DELETE
      );
    },
  },
});
</script>
