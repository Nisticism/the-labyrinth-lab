function importAll(r) {
  return r.keys().map(r);
}

const galleryData = [
  {
    id: 'labyrinths',
    title: 'Labyrinths',
    images: importAll(require.context('../assets/The-ll.com/Labyrinths', false, /\.jpe?g$/i)),
  },
  {
    id: 'chess-boards',
    title: 'Chess Boards',
    images: importAll(require.context('../assets/The-ll.com/Chess Boards', false, /\.jpe?g$/i)),
  },
  {
    id: 'charcuterie-boards',
    title: 'Charcuterie Boards',
    images: importAll(require.context('../assets/The-ll.com/Charcuterie Boards', false, /\.jpe?g$/i)),
  },
  {
    id: 'furniture',
    title: 'Furniture',
    images: importAll(require.context('../assets/The-ll.com/Furniture', false, /\.jpe?g$/i)),
  },
  {
    id: 'containers',
    title: 'Containers',
    images: importAll(require.context('../assets/The-ll.com/Containers', false, /\.jpe?g$/i)),
  },
  {
    id: 'pens',
    title: 'Pens',
    images: importAll(require.context('../assets/The-ll.com/Pens', false, /\.jpe?g$/i)),
  },
  {
    id: 'tops',
    title: 'Tops',
    images: importAll(require.context('../assets/The-ll.com/Tops', false, /\.jpe?g$/i)),
  },
  {
    id: 'paddles',
    title: 'Paddles',
    images: importAll(require.context('../assets/The-ll.com/Paddles', false, /\.jpe?g$/i)),
  },
  {
    id: 'bookmarks',
    title: 'Bookmarks',
    images: importAll(require.context('../assets/The-ll.com/Bookmarks', false, /\.jpe?g$/i)),
  },
  {
    id: 'lathe-misc',
    title: 'Lathe Misc',
    images: importAll(require.context('../assets/The-ll.com/Lathe Misc', false, /\.jpe?g$/i)),
  },
  {
    id: 'commission-work',
    title: 'Commission Work',
    images: importAll(require.context('../assets/The-ll.com/Commission Work', false, /\.jpe?g$/i)),
  },
  {
    id: 'misc',
    title: 'Miscellaneous',
    images: importAll(require.context('../assets/The-ll.com/Misc', false, /\.jpe?g$/i)),
  },
  {
    id: 'thomas-moralez',
    title: 'Photos by Thomas Moralez',
    images: importAll(require.context('../assets/The-ll.com/Photos from Thomas Moralez', false, /\.jpe?g$/i)),
  },
];

export default galleryData;
