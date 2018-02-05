export interface Artist {
  name: string;
  playcount: number;
  mbid: string; // musicbrainz id
}

export interface ArtistArea {
  artist: string;
  area: string;
}
