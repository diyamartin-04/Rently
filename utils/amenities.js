// Maps amenity names (typed by hosts) to Font Awesome icons.
// The first keyword found in the name wins; anything unknown gets a generic tick.
const ICONS = [
    [/wi-?fi|internet/i, "fa-solid fa-wifi"],
    [/kitchen|cook/i, "fa-solid fa-kitchen-set"],
    [/parking|car park/i, "fa-solid fa-car"],
    [/pool/i, "fa-solid fa-water-ladder"],
    [/\btv\b|television/i, "fa-solid fa-tv"],
    [/washing|washer|laundry/i, "fa-solid fa-washing-machine"],
    [/\bac\b|air.?condition|aircon/i, "fa-solid fa-snowflake"],
    [/workspace|desk|work/i, "fa-solid fa-laptop"],
    [/gym|fitness/i, "fa-solid fa-dumbbell"],
    [/lift|elevator/i, "fa-solid fa-elevator"],
    [/sauna|hot tub|jacuzzi/i, "fa-solid fa-temperature-high"],
    [/camera|security/i, "fa-solid fa-video"],
    [/garden|balcony|patio/i, "fa-solid fa-tree"],
    [/heating|heater/i, "fa-solid fa-fire"],
];

const iconFor = (name = "") => {
    for (const [pattern, icon] of ICONS) {
        if (pattern.test(name)) return icon;
    }
    return "fa-solid fa-circle-check";
};

module.exports = { iconFor };
