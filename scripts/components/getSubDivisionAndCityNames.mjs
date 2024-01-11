
function IsMinusOne( number ) {
    return number !== -1
}

export const SetSubDivisionAndCityNames = ( Areas ) => Areas.map(data => {
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