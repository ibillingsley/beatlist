export default interface BeastsaberPlaylist {
  name: string;
  description: string;
  owner: {
    name: string;
    avatar: string;
    playlistUrl: string;
    id: number;
  };
  playlistSongCount: number;
  playlistDate: string;
  playlistCategory: string;
  downloadURL: string;
  playlistImage: string;
  playlistId: number;
}
