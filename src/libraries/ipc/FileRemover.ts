import { ipcMain, ipcRenderer, shell } from "electron";

export const ON_FILE_REMOVE_REQUEST = "on_file_remove_request";
export const ON_FILE_REMOVE_REPLY = "on_file_remove_reply";

export default class FileRemover {
  public static register(): void {
    ipcMain.on(ON_FILE_REMOVE_REQUEST, async (event: any, path: string) => {
      try {
        await shell.trashItem(path);
        event.reply(ON_FILE_REMOVE_REPLY, undefined);
      } catch (error) {
        console.error(error);
        event.reply(ON_FILE_REMOVE_REPLY, { error: (error as Error).message });
      }
    });
  }

  public static remove(path: string): Promise<void> {
    ipcRenderer.send(ON_FILE_REMOVE_REQUEST, path);

    return new Promise((resolve, reject) => {
      ipcRenderer.on(
        ON_FILE_REMOVE_REPLY,
        (event: any, data: { error: string } | undefined) => {
          if (data != null && data.error != null) {
            reject(data.error);
          } else {
            resolve();
          }
        }
      );
    });
  }
}
