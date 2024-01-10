
import { SubDivisionAndCityNames, SubDivisionsLatitude, SubDivisionsLongitude } from "./components/draw.mjs"

globalThis.SubDivisionAndCityNames = SubDivisionAndCityNames;

function IsMinusOne( number ) {
    return number !== -1
}

const SetSubDivisionAndCityNames = ( Areas ) => Areas.map(data => {
    const Pref = SubDivisionAndCityNames.find(v => v.pref === data.pref);
    if (!Pref) return null;
    const AddrIndex = IsMinusOne(data.addr.indexOf('市')) ? data.addr.indexOf('市') : IsMinusOne(data.addr.indexOf('区')) ? data.addr.indexOf('区') : IsMinusOne(data.addr.indexOf('町')) ? data.addr.indexOf('町') : IsMinusOne(data.addr.indexOf('村')) ? data.addr.indexOf('村') : -1
    if(data.isArea) {
        console.log(data.addr)
        const IndexofSubdivisions = Pref.Subdivisions.find( v => v.subdivistionName === data.addr ).n;
        console.log(IndexofSubdivisions)
        return { subdivisionName : data.addr , scale : data.scale, n : IndexofSubdivisions - 1 }
    }
    if(AddrIndex === -1) return console.log(data.addr)
    const Subdivision = Pref.Subdivisions.find(
        m =>
            m.areas.some(RegExp.prototype.test , new RegExp(
                data.addr.substring(
                    0,
                    AddrIndex + 1
                )
            ))
    );

    return { subdivisionName: Subdivision?.subdivistionName, scale: data.scale , n : Subdivision?.n - 1};
})

async function GetSubdivisions() {
    const response = await fetch('https://api.p2pquake.net/v2/history?codes=551')
    const P2PData = (await response.json())[0]
    
    return { p2pinfo : P2PData }
}

function resolveSindoColor(scale) {
    switch (scale) {
        case 10: return "#778899"
        case 20: return "#4682b4"
        case 30: return "#008000"
        case 40: return "#ffd700"
        case 45: return "#ffa500"
        case 50: return "#d2691e"
        case 55: return "#800000"
        case 60: return "#b22222"
        case 70: return "#4b0082"
        default: return "#000"
    }
}

async function Init() {


    const Map = L.map('map', {
        center: [37.9161, 139.0364],
        zoom: 7,
        minZoom: 5.5,
        maxZoom: 9,
        preferCanvas: true
    })
    globalThis.MapObject = Map;

    const elem = document.getElementsByClassName('leaflet-right')
    if (0 < elem.length) {
        [...elem].forEach(v => { return v.remove() })
    }
   //
   const button = document.getElementsByClassName('leaflet-control-zoom')
   if (0 < button.length) {
       [...button].forEach(v => { return v.remove() })
   }

    const P2PParsed = await GetSubdivisions()
    const P2P = P2PParsed.p2pinfo
    const Divistions = SetSubDivisionAndCityNames( P2P.points )
    const Subdivisions = Divistions.filter( x => x !== null).filter( x=> typeof x !== "undefined");
    
    console.log( Subdivisions )
    
    fetch("../../geojson/map_saibun_simplify.json").then((res) => res.ok ? res.json() : null).then(geojson => {
        const map = L.geoJSON(geojson, {
            style: function (geojson) {
                const SubDivisionName = geojson.properties.name
                const Scale = Subdivisions.find(data => SubDivisionName == data.subdivisionName)
                if(typeof Scale === "undefined") return { weight: 1, color: "#999999", fill : "#000"}
                if (Scale) return {
                        weight: 1,
                        color: "#999999",
                        fillOpacity : 1,
                        fillColor: resolveSindoColor(Scale.scale)
                }
                
            }
        }).addTo(Map);
        globalThis.MapContent = map;
        globalThis.GeoMetoryFeatures = Object.values(map._layers).map(v => v.feature)

        geojson = null;
    })

    /** @type {Array<{ name : string, lo : object , scale: number}>} */
    const Placed = []

    const h = P2P.earthquake.hypocenter
    const Epicenter = [+h.latitude ,+h.longitude]
    if(Epicenter[0] === -200) return;
    L.marker(Epicenter, {
        icon: L.icon({
          iconUrl: "./assets/a.png",
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        }),
       
      }).addTo(Map)
    Map.setView(Epicenter , 7)
    
    Subdivisions.map( subs => {
        const IsAlreadyPlaced = Placed.find( ( v ) => v.name === subs.subdivisionName )
        if(IsAlreadyPlaced) {
            if( IsAlreadyPlaced.scale < subs.scale ){
                console.log(IsAlreadyPlaced.scale , subs.scale)
                IsAlreadyPlaced.lo.delete();
                Placed.slice( Placed.indexOf(IsAlreadyPlaced) , 0)
                const index = subs.n
                const LatLng = [+SubDivisionsLatitude[index], +SubDivisionsLongitude[index]]
                if(isNaN(LatLng[0])) return;
                const lo = L.marker(LatLng, {
                    icon: L.icon({
                      iconUrl: `./assets/shindoIcons/sindo${subs.scale}.png`,
                      iconSize: [40, 40],
                      iconAnchor: [20, 20]
                    })                
                }).addTo(Map)
                Placed.push({ name : subs.subdivisionName , lo : lo , scale : subs.scale})
                return;
            } else return;
        } else {
            const index = subs.n
            const LatLng = [+SubDivisionsLatitude[index], +SubDivisionsLongitude[index]]
            if(isNaN(LatLng[0])) return;
            const lo = L.marker(LatLng, {
                icon: L.icon({
                iconUrl: `./assets/shindoIcons/sindo${subs.scale}.png`,
                iconSize: [40, 40],
                iconAnchor: [20, 20]
                }),
                keyboard: true,
                title : `${subs.subdivisionName} 震度 : ${subs.scale} index : ${index}`
            }).addTo(Map)
            Placed.push({ name : subs.subdivisionName , lo : lo , scale : subs.scale})
        }
    })

    ////////////////////////////////////////////////////////////////

    globalThis.endMade = new Date()[Symbol.toPrimitive]("number")
    const { firstMade , endMade } = globalThis;
    console.log(`Successfully summoned at ${+endMade - +firstMade}ms`)

    ////////////////////////////////////////////////////////////////

}


globalThis.GetSubdivisions = GetSubdivisions;



window.onload = () => {
    globalThis.firstMade = new Date()[Symbol.toPrimitive]("number")
    Init();
    //CheckSubdivisionLatLot()
    //GetSubdivisions();
}
