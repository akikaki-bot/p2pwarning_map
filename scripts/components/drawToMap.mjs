import { Init, Reset } from "../index.mjs";
import { SetSubDivisionAndCityNames } from "./getSubDivisionAndCityNames.mjs"
import { resolveSindoColor } from "../utils/resolveSindoColor.mjs";
import { SubDivisionsLatitude, SubDivisionsLongitude } from "./draw.mjs";

export function DrawToMap(P2P) {
    if (typeof globalThis.MapObject !== "object") return Init();
    if (typeof globalThis.MapContent === "object") Reset();

    const Map = globalThis.MapObject

    const Divistions = SetSubDivisionAndCityNames(P2P.points)
    const Subdivisions = Divistions.filter(x => x !== null).filter(x => typeof x !== "undefined");

    console.log(Subdivisions)


    const map = L.geoJSON(globalThis.geojson, {
        style: function (geojson) {
            const SubDivisionName = geojson.properties.name
            const Scale = Subdivisions.find(data => SubDivisionName == data.subdivisionName)
            if (Scale) return {
                weight: 1,
                color: "#999999",
                fillOpacity: 1,
                fillColor: resolveSindoColor(Scale.scale)
            }
            return {
                weight: 1,
                color: "#999999",
                fillOpacity: 0.5,
                fillColor : "#081a1a"
            }
        }
    }).addTo(Map);
    globalThis.MapContent = map;
    globalThis.GeoMetoryFeatures = Object.values(map._layers).map(v => v.feature)



    /** @type {Array<{ name : string, lo : object , scale: number}>} */
    const Placed = []

    const h = P2P.earthquake.hypocenter
    const Epicenter = [+h.latitude, +h.longitude]
    if (Epicenter[0] === -200) return;
    const Epi = L.marker(Epicenter, {
        icon: L.icon({
            iconUrl: "./assets/a.png",
            iconSize: [40, 40],
            iconAnchor: [20, 20]
        }),

    }).addTo(Map)
    globalThis.Epicenter = Epi
    Map.setView(Epicenter, 7)

    Subdivisions.map(subs => {
        const IsAlreadyPlaced = Placed.find((v) => v.name === subs.subdivisionName)
        if (IsAlreadyPlaced) {
            if (IsAlreadyPlaced.scale < subs.scale) {
                console.log(IsAlreadyPlaced.scale, subs.scale)
                IsAlreadyPlaced.lo.delete();
                Placed.slice(Placed.indexOf(IsAlreadyPlaced), 0)
                const index = subs.n
                const LatLng = [+SubDivisionsLatitude[index], +SubDivisionsLongitude[index]]
                if (isNaN(LatLng[0])) return;
                const lo = L.marker(LatLng, {
                    icon: L.icon({
                        iconUrl: `./assets/shindoIcons/sindo${subs.scale}.png`,
                        iconSize: [40, 40],
                        iconAnchor: [20, 20]
                    })
                }).addTo(Map)
                globalThis.scaleMarkers.push(lo)
                Placed.push({ name: subs.subdivisionName, lo: lo, scale: subs.scale })
                return;
            } else return;
        } else {
            const index = subs.n
            const LatLng = [+SubDivisionsLatitude[index], +SubDivisionsLongitude[index]]
            if (isNaN(LatLng[0])) return;
            const lo = L.marker(LatLng, {
                icon: L.icon({
                    iconUrl: `./assets/shindoIcons/sindo${subs.scale}.png`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20]
                }),
                keyboard: true,
                title: `${subs.subdivisionName} 震度 : ${subs.scale} index : ${index}`
            }).addTo(Map)
            globalThis.scaleMarkers.push(lo)
            Placed.push({ name: subs.subdivisionName, lo: lo, scale: subs.scale })
        }
    })
}