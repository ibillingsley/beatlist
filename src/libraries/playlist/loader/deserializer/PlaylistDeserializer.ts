import { PlaylistRaw } from "@/libraries/playlist/PlaylistLocal";
import Progress from "@/libraries/common/Progress";

export default abstract class PlaylistDeserializer {
  protected filepath: string;

  protected withImageType: boolean;

  public constructor(filepath: string, withImageType = false) {
    this.filepath = filepath;
    this.withImageType = withImageType;
  }

  // public abstract deserialize(progress?: Progress): Promise<PlaylistBase>;

  public abstract deserializeAsRaw(progress?: Progress): Promise<PlaylistRaw>;
}
