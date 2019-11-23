import {Country, CountryProperties, WorldGeoJson, CountryGeoJson, Artist, PackedArtist} from 'src/types/models';

interface CountryCodeMapping {
  [code: string]: string;
}

interface CountryGroupping {
  [countryName: string]: CountryProperties;
}

export function unpackArtists(packedArtists: PackedArtist[], world: WorldGeoJson): Artist[] {
  const countryCodeToCountry: CountryCodeMapping = world.features.reduce(
    (acc: CountryCodeMapping, {properties: {name_long, iso_a2}}: CountryGeoJson) => {
      acc[iso_a2] = name_long;
      return acc;
    },
    {},
  );

  return packedArtists
    .map(([name, playcount, countryCode]) => ({
      name,
      playcount,
      countryName: countryCodeToCountry[countryCode],
    }))
    .sort((a, b) => b.playcount - a.playcount);
}

export function groupArtistsByCountryName(artists: Artist[]): CountryGroupping {
  const countries: CountryGroupping = {};

  artists.forEach((artist, index) => {
    const rankedArtist = {
      ...artist,
      rank: index + 1, // assuming that "artists" are already ordered by "playcount" (descending)
    };

    if (!(artist.countryName in countries)) {
      (countries[artist.countryName] as CountryProperties) = {
        name: artist.countryName,
        artists: [
          rankedArtist,
        ],
      };
    } else {
      (countries[artist.countryName] as CountryProperties).artists.push(rankedArtist);
    }
  });

  return countries;
}

export function getArtistsCountries(artists: Artist[], world: WorldGeoJson): Country[] {
  const artistsCountries = groupArtistsByCountryName(artists);
  const worldCountries = world.features;

  return worldCountries
    .filter((countryGeoJson) => countryGeoJson.properties.name_long in artistsCountries)
    .map((countryGeoJson) => ({
      ...countryGeoJson,
      properties: {
        ...artistsCountries[countryGeoJson.properties.name_long],
        code: countryGeoJson.properties.iso_a2,
      },
    }));
}

export function getCountryArtistCount(country: Country): number {
  return country.properties.artists.length;
}

export function getCountryScrobbleCount(country: Country): number {
  return country.properties.artists.reduce((sum, artist) => sum + artist.playcount, 0);
}
