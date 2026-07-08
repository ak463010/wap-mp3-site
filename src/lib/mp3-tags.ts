export interface Mp3Tags {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: number;
}

const TEXT_FRAME_KEYS: Record<string, keyof Mp3Tags> = {
  TIT2: 'title',
  TT2: 'title',
  TPE1: 'artist',
  TP1: 'artist',
  TALB: 'album',
  TAL: 'album',
  TCON: 'genre',
  TCO: 'genre',
  TYER: 'year',
  TYE: 'year',
  TDRC: 'year',
};

const ID3V1_GENRES = [
  'Blues', 'Classic Rock', 'Country', 'Dance', 'Disco', 'Funk', 'Grunge', 'Hip-Hop',
  'Jazz', 'Metal', 'New Age', 'Oldies', 'Other', 'Pop', 'R&B', 'Rap', 'Reggae',
  'Rock', 'Techno', 'Industrial', 'Alternative', 'Ska', 'Death Metal', 'Pranks',
  'Soundtrack', 'Euro-Techno', 'Ambient', 'Trip-Hop', 'Vocal', 'Jazz+Funk', 'Fusion',
  'Trance', 'Classical', 'Instrumental', 'Acid', 'House', 'Game', 'Sound Clip',
  'Gospel', 'Noise', 'Alternative Rock', 'Bass', 'Soul', 'Punk', 'Space', 'Meditative',
  'Instrumental Pop', 'Instrumental Rock', 'Ethnic', 'Gothic', 'Darkwave',
  'Techno-Industrial', 'Electronic', 'Pop-Folk', 'Eurodance', 'Dream', 'Southern Rock',
  'Comedy', 'Cult', 'Gangsta', 'Top 40', 'Christian Rap', 'Pop/Funk', 'Jungle',
  'Native American', 'Cabaret', 'New Wave', 'Psychedelic', 'Rave', 'Showtunes',
  'Trailer', 'Lo-Fi', 'Tribal', 'Acid Punk', 'Acid Jazz', 'Polka', 'Retro',
  'Musical', 'Rock & Roll', 'Hard Rock'
];

function latin1(bytes: Uint8Array): string {
  return Array.from(bytes, b => String.fromCharCode(b)).join('');
}

function trimTagValue(value: string): string {
  return value.replace(/\u0000/g, ' ').replace(/\s+/g, ' ').trim();
}

function readSynchsafe(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] & 0x7f) << 21) |
    ((bytes[offset + 1] & 0x7f) << 14) |
    ((bytes[offset + 2] & 0x7f) << 7) |
    (bytes[offset + 3] & 0x7f);
}

function readUInt32(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] << 24) >>> 0) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3];
}

function readUInt24(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 16) | (bytes[offset + 1] << 8) | bytes[offset + 2];
}

function decodeTextFrame(data: Uint8Array): string {
  if (data.length === 0) return '';

  const encoding = data[0];
  const body = data.slice(1);

  try {
    if (encoding === 1) {
      if (body[0] === 0xfe && body[1] === 0xff) {
        return trimTagValue(new TextDecoder('utf-16be').decode(body.slice(2)));
      }
      if (body[0] === 0xff && body[1] === 0xfe) {
        return trimTagValue(new TextDecoder('utf-16le').decode(body.slice(2)));
      }
      return trimTagValue(new TextDecoder('utf-16le').decode(body));
    }

    if (encoding === 2) {
      return trimTagValue(new TextDecoder('utf-16be').decode(body));
    }

    if (encoding === 3) {
      return trimTagValue(new TextDecoder('utf-8').decode(body));
    }
  } catch {
    // Fall through to latin1 for malformed frame encodings.
  }

  return trimTagValue(latin1(body));
}

function cleanGenre(value: string): string {
  const match = value.match(/^\((\d+)\)(.*)$/);
  if (!match) return value;

  const mapped = ID3V1_GENRES[Number(match[1])];
  const suffix = match[2]?.trim();
  return suffix || mapped || value;
}

function setTag(tags: Mp3Tags, key: keyof Mp3Tags, value: string) {
  const cleaned = key === 'genre' ? cleanGenre(value) : value;
  if (!cleaned) return;

  if (key === 'year') {
    const year = cleaned.match(/\d{4}/)?.[0];
    if (year) tags.year = Number(year);
    return;
  }

  tags[key] = cleaned as never;
}

function parseId3v2(bytes: Uint8Array): Mp3Tags {
  const tags: Mp3Tags = {};

  if (bytes.length < 10 || latin1(bytes.slice(0, 3)) !== 'ID3') return tags;

  const version = bytes[3];
  const flags = bytes[5];
  const tagSize = readSynchsafe(bytes, 6);
  const tagEnd = Math.min(bytes.length, 10 + tagSize);
  let offset = 10;

  if (flags & 0x40) {
    if (version === 3 && offset + 4 <= tagEnd) {
      offset += 4 + readUInt32(bytes, offset);
    } else if (version === 4 && offset + 4 <= tagEnd) {
      offset += readSynchsafe(bytes, offset);
    }
  }

  while (offset < tagEnd) {
    let frameId = '';
    let frameSize = 0;
    let headerSize = 0;

    if (version === 2) {
      if (offset + 6 > tagEnd) break;
      frameId = latin1(bytes.slice(offset, offset + 3));
      frameSize = readUInt24(bytes, offset + 3);
      headerSize = 6;
    } else {
      if (offset + 10 > tagEnd) break;
      frameId = latin1(bytes.slice(offset, offset + 4));
      frameSize = version === 4 ? readSynchsafe(bytes, offset + 4) : readUInt32(bytes, offset + 4);
      headerSize = 10;
    }

    if (!frameId.trim() || frameSize <= 0) break;

    const frameStart = offset + headerSize;
    const frameEnd = Math.min(frameStart + frameSize, tagEnd);
    const tagKey = TEXT_FRAME_KEYS[frameId];

    if (tagKey && frameStart < frameEnd) {
      setTag(tags, tagKey, decodeTextFrame(bytes.slice(frameStart, frameEnd)));
    }

    offset = frameEnd;
  }

  return tags;
}

function parseId3v1(bytes: Uint8Array): Mp3Tags {
  const tags: Mp3Tags = {};
  if (bytes.length < 128) return tags;

  const start = bytes.length - 128;
  if (latin1(bytes.slice(start, start + 3)) !== 'TAG') return tags;

  setTag(tags, 'title', trimTagValue(latin1(bytes.slice(start + 3, start + 33))));
  setTag(tags, 'artist', trimTagValue(latin1(bytes.slice(start + 33, start + 63))));
  setTag(tags, 'album', trimTagValue(latin1(bytes.slice(start + 63, start + 93))));
  setTag(tags, 'year', trimTagValue(latin1(bytes.slice(start + 93, start + 97))));

  const genre = ID3V1_GENRES[bytes[start + 127]];
  if (genre) tags.genre = genre;

  return tags;
}

export function extractMp3Tags(bytes: Uint8Array): Mp3Tags {
  const v1 = parseId3v1(bytes);
  const v2 = parseId3v2(bytes);
  return { ...v1, ...v2 };
}

export function titleFromFileName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Untitled Song';
}
