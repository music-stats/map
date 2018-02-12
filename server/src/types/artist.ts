export interface Artist {
  name: string;
  playcount: number;
  mbid: string; // MusicBrainz id
}

export interface ArtistArea {
  artist: string;
  area: string;
}
