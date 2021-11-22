enum PlaylistSortColumnType {
  Title = "title",
  Author = "author",
  DateModified = "modified",
}

export function getSortTypeDisplayNameFor(
  sortType: PlaylistSortColumnType
): string {
  switch (sortType) {
    case PlaylistSortColumnType.Title:
      return "Title";
    case PlaylistSortColumnType.Author:
      return "Author";
    case PlaylistSortColumnType.DateModified:
      return "Date modified";
    default:
      break;
  }
  return "";
}

export default PlaylistSortColumnType;
