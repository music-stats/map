// @see: https://musicbrainz.org/doc/Artist
// @see: https://musicbrainz.org/ws/2/artist/28503ab7-8bf2-4666-a7bd-2644bfc7cb1d?fmt=json
export interface Artist {
  id: string;
  name: string;
  type: ArtistType;
  area: Area;
  isnis: ISNI;
  disambiguation: string;
}

type ArtistType =
  'Person' |
  'Group' |
  'Orchestra' |
  'Choir' |
  'Character' |
  'Other';

// International Standard Name Identifier
// @see: https://musicbrainz.org/doc/ISNI
type ISNI = string;

interface Area {
  id: string;
  name: string;
  disambiguation: string;
}
