// Color scheme borrowed from OWID:
// https://github.com/owid/owid-grapher/blob/master/packages/%40ourworldindata/grapher/src/color/CustomSchemes.ts
const OwidDistinctColors: Record<string, string> = {
    Purple: '#6D3E91',
    DarkOrange: '#C05917',
    LightTeal: '#58AC8C',
    Blue: '#286BBB',
    Maroon: '#883039',
    Camel: '#BC8E5A',
    MidnightBlue: '#00295B',
    DustyCoral: '#C15065',
    DarkOliveGreen: '#18470F',
    DarkCopper: '#9A5129',
    Peach: '#E56E5A',
    Mauve: '#A2559C',
    Turquoise: '#38AABA',
    OliveGreen: '#578145',
    Cherry: '#970046',
    Teal: '#00847E',
    RustyOrange: '#B13507',
    Denim: '#4C6A9C',
    Fuchsia: '#CF0A66',
    TealishGreen: '#00875E',
    Copper: '#B16214',
    DarkMauve: '#8C4569',
    Lime: '#3B8E1D',
    Coral: '#D73C50',
};

const DarkerOwidDistinctColors: Record<string, string> = {
    DarkOrangeDarker: '#BE5915',
    PeachDarker: '#C4523E',
    LightTealDarker: '#2C8465',
    TurquoiseDarker: '#008291',
    CamelDarker: '#996D39',
    LimeDarker: '#338711',
};

export const OwidDistinctLinesPalette = [
    OwidDistinctColors.DustyCoral,
    DarkerOwidDistinctColors.LightTealDarker,
    DarkerOwidDistinctColors.DarkOrangeDarker,
    OwidDistinctColors.Purple,
    OwidDistinctColors.Fuchsia,
    OwidDistinctColors.DarkOliveGreen,
    OwidDistinctColors.Blue,
    OwidDistinctColors.Maroon,
    DarkerOwidDistinctColors.CamelDarker,
    OwidDistinctColors.MidnightBlue,
    OwidDistinctColors.DarkCopper,
    DarkerOwidDistinctColors.PeachDarker,
    OwidDistinctColors.Mauve,
    DarkerOwidDistinctColors.TurquoiseDarker,
    OwidDistinctColors.OliveGreen,
    OwidDistinctColors.Cherry,
    OwidDistinctColors.Teal,
    OwidDistinctColors.RustyOrange,
    OwidDistinctColors.Denim,
    OwidDistinctColors.TealishGreen,
    OwidDistinctColors.Copper,
    OwidDistinctColors.DarkMauve,
    DarkerOwidDistinctColors.LimeDarker,
    OwidDistinctColors.Coral,
];