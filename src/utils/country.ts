import {Country, CountryProperties, CountryGeoJson, Artist} from 'src/types/models';

interface CountriesGroupping {
  [countryName: string]: CountryProperties;
}

export function groupArtistsByCountryName(artists: Artist[]): CountriesGroupping {
  const countries: CountriesGroupping = {};

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

export function getArtistsCountries(artists: Artist[], world: any): Country[] {
  const artistsCountries = groupArtistsByCountryName(artists);
  const worldCountries = world.features;

  return worldCountries
    .filter((countryGeoJson: CountryGeoJson) => countryGeoJson.properties.name_long in artistsCountries)
    .map((countryGeoJson: CountryGeoJson) => ({
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
