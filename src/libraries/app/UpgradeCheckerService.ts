import * as remote from "@electron/remote";
import semver from "semver";
import localforage from "localforage";
import store from "@/plugins/store";
import MigrateTo123 from "@/libraries/app/migration/MigrationVersion1.2.3";
import MigrateTo132 from "@/libraries/app/migration/MigrationVersion1.3.2";
import MigrateTo138 from "@/libraries/app/migration/MigrationVersion1.3.8";
import MigrateTo140 from "@/libraries/app/migration/MigrationVersion1.4.0";
import MigrateTo141 from "@/libraries/app/migration/MigrationVersion1.4.1";
import ScannerService from "../scanner/ScannerService";

export default class UpgradeCheckerService {
  public static async Initialize() {
    await store.restored;

    const previousVersion = this.getRegisteredAppVersion();
    const currentVersion = this.getElectronAppVersion();

    const isNewUser = previousVersion === undefined;
    const isNewVersion =
      previousVersion && semver.gt(currentVersion, previousVersion);

    if (isNewUser) {
      store.commit("modal/SET_NEW_USER_MODAL", true);
      store.commit("settings/SET_APP_VERSION", currentVersion);

      await UpgradeCheckerService.cleanOldVuexCacheIfExist();
    }

    if (isNewVersion) {
      if (previousVersion !== undefined) {
        await UpgradeCheckerService.UpgradeFor(previousVersion);
      }

      store.commit("modal/SET_NEW_VERSION_MODAL", true);
      store.commit("settings/SET_APP_VERSION", currentVersion);
    }
  }

  private static async UpgradeFor(previousVersion: string) {
    if (semver.gt("1.2.3", previousVersion)) {
      MigrateTo123();
    }

    if (semver.gt("1.3.2", previousVersion)) {
      // previousVersion is under 1.3.2
      ScannerService.requestDialogToBeOpened();
      MigrateTo132(); // clear playlist cache
      await MigrateTo138(); // set folderNameHash, updateDownloadDate
      await MigrateTo140(); // remove beatsaver cache
      await MigrateTo141(false); // reload beatsaver cache (skip clearing playlist cache)
    } else if (semver.gt("1.3.8", previousVersion)) {
      // previousVersion is under 1.3.8
      ScannerService.requestDialogToBeOpened();
      await MigrateTo138(); // set folderNameHash, updateDownloadDate
      await MigrateTo140(); // remove beatsaver cache
      await MigrateTo141(true); // reload beatsaver cache, clear playlist cache
    } else if (semver.gt("1.4.0", previousVersion)) {
      // previousVersion is under 1.4.0
      ScannerService.requestDialogToBeOpened(true);
      await MigrateTo140(); // remove beatsaver cache
      await MigrateTo141(true); // reload beatsaver cache, clear playlist cache
    } else if (semver.gt("1.4.1", previousVersion)) {
      // previousVersion is under 1.4.1
      ScannerService.requestDialogToBeOpened(true);
      await MigrateTo141(true); // reload beatsaver cache, clear playlist cache
    }
  }

  private static getRegisteredAppVersion(): string | undefined {
    return store.getters["settings/appVersion"];
  }

  private static getElectronAppVersion(): string {
    return remote.app.getVersion();
  }

  private static async cleanOldVuexCacheIfExist() {
    const oldCache = localforage.createInstance({ name: "localforage" });
    await oldCache.removeItem("vuex");
  }
}
