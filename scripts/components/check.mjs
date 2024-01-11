import { SubDivisionAndCityNames, SubDivisionsLatitude, SubDivisionsLongitude } from "./draw.mjs"

export async function CheckSubdivisionLatLot() {

    const Map = L.map('map', {
        center: [37.9161, 139.0364],
        zoom: 7,
        minZoom: 5.5,
        maxZoom: 9,
        preferCanvas: true
    })

    fetch("../../geojson/map_saibun_simplify.json").then((res) => res.ok ? res.json() : null).then(geojson => {
            const map = L.geoJSON(geojson, {
                style: function (geojson) {
                    return {
                        weight: 1,
                        color: "#000",
                        fillOpacity : 1,
                        fillColor: "#00AA00"
                    }
            }
        }).addTo(Map);
    })

    SubDivisionAndCityNames.map( prefData => {
        prefData.Subdivisions.map(( subdata ) => {
            const index = subdata.n - 1
            const LatLng = [+SubDivisionsLatitude[index], +SubDivisionsLongitude[index]]
            if(isNaN(LatLng[0])) return;
            L.marker(LatLng, {
                title : `${index}`
            }).addTo(Map).bindPopup(`${subdata.subdivistionName} index : ${index} \n Lat : ${SubDivisionsLatitude[index]} Lot : ${SubDivisionsLongitude[index]}*`)
        })
    })
}