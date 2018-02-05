// @see: https://www.last.fm/api/show/library.getArtists
export interface LibraryResponse {
  artists: {
    artist: Artist[];
    '@attr': {
      user: string;
      page: string;
      perPage: string;
      totalPages: string;
      total: string;
    };
  };
}

export interface Artist {
  name: string;
  playcount: string;
  tagcount: string;
  mbid: string;
  url: string;
  streamable: string;
  image: ArtistImage[];
}

interface ArtistImage {
  '#text': string;
  size: ArtistImageSize;
}

type ArtistImageSize =
  'small' |
  'medium' |
  'large' |
  'extralarge' |
  'mega';
