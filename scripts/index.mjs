
import { SubDivisionAndCityNames } from "./components/draw.mjs"
import { DrawToMap } from "./components/drawToMap.mjs";

async function GetSubdivisions() {
    const response = await fetch('https://api.p2pquake.net/v2/history?codes=551')
    const P2PData = (await response.json())[0]
    
    return { p2pinfo : P2PData }
}


export async function Init() {

    globalThis = {
        scaleMarkers : [],
        MapObject : undefined,
        MapContent : undefined,
        GeoMetoryFeatures : [],
        Epicenter : undefined,
        endMade : 0
    }


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

   fetch("../../geojson/map_saibun_simplify.json").then((res) => res.ok ? res.json() : null).then(geojson => {
        globalThis.geojson = geojson;
        geojson = null;
    })

    const P2PParsed = await GetSubdivisions()
    const P2P = P2PParsed.p2pinfo

    await DrawToMap( P2P )
}

export function WebSocketManager(){

    const ws = new WebSocket("wss://api.p2pquake.net/v2/ws")
    ws.onopen = () => console.log(`WebSocketService Start...`);

    ws.onmessage = async ( Rawdata ) => {
        const data = JSON.parse( Rawdata.data );
        if(data.code === 551) {
            await DrawToMap( data )
        }
    }
}

export function Reset() {
    const {
        scaleMarkers,
        MapContent,
        Epicenter
    } = globalThis;
    scaleMarkers.map( ( v ) => typeof v === "object" && v.remove());
    typeof MapContent === "object" && MapContent.remove();
    typeof Epicenter === "object" && Epicenter.remove();
}



globalThis.GetSubdivisions = GetSubdivisions;



window.onload = () => {
    Init();
    WebSocketManager();
    //CheckSubdivisionLatLot()
    //GetSubdivisions();
}
