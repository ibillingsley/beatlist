enum PlaylistIndentType {
  None = "none",
  Space2 = "2",
  Space4 = "4",
  Tab = "tab",
}

export function getIndentTypeDisplayNameFor(
  sortType: PlaylistIndentType
): string {
  switch (sortType) {
    case PlaylistIndentType.None:
      return "None (No indentation, No line feed)";
    case PlaylistIndentType.Space2:
      return "Space (2)";
    case PlaylistIndentType.Space4:
      return "Space (4)";
    case PlaylistIndentType.Tab:
      return "Tab";
    default:
      break;
  }
  return "";
}

export default PlaylistIndentType;
