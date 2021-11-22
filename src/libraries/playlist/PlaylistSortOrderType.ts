enum PlaylistSortOrderType {
  Asc = "asc",
  Desc = "desc",
}

export function getSortOrderDisplayNameFor(
  sortOrder: PlaylistSortOrderType
): string {
  switch (sortOrder) {
    case PlaylistSortOrderType.Asc:
      return "Asc";
    case PlaylistSortOrderType.Desc:
      return "Desc";
    default:
      break;
  }
  return "";
}

export default PlaylistSortOrderType;
