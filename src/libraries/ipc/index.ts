import Base64FileReader from "@/libraries/ipc/Base64FileReader";
import DiscordRichPresence from "@/libraries/ipc/DiscordRichPresence";
import PathResolver from "./PathResolver.ipc";
import BeatsaverLinkOpener from "./BeatsaverLinkOpener";
import FileRemover from "./FileRemover";

export default function registerIpc() {
  PathResolver.register();
  BeatsaverLinkOpener.register();
  Base64FileReader.register();
  FileRemover.register();
  DiscordRichPresence.register();
}
