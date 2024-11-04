// Initialize and add the map
let map;
export let marker;

(g=>{
    var h,a,k,p="The Google Maps JavaScript API",
        c="google",l="importLibrary",
        q="__ib__",
        m=document,
        b = window;
        b = b[c] || (b[c] = {});
        var d = b.maps || (b.maps = {}),
        r=new Set,
        e=new URLSearchParams,
        u=()=>h || (h=new Promise(async(f,n) =>
            { await (a=m.createElement("script"));
                e.set("libraries",[...r]+"");
                for(k in g)e.set(k.replace(/[A-Z]/g,t => "_"+t[0].toLowerCase()),g[k]);
                e.set("callback",c+".maps."+q);
                a.src =`https://maps.${c}apis.com/maps/api/js?`+e;
                d[q] = f;
                a.onerror = () => h = n(Error(p+" could not load."));
                a.nonce = m.querySelector("script[nonce]")?.nonce||"";
                m.head.append(a)
            })
        );
        d[l] ?
            console.warn(p+" only loads once. Ignoring:",g) :
            d[l]=(f,...n) => r.add(f)&&u().then(() => d[l](f,...n))
    }
)
({
    key: 'AIzaSyAFCBIchJVG-Cap8TybCWzFSd92DLTUQVg',
    v: "weekly",
    // Use the 'v' parameter to indicate the version to use (weekly, beta, alpha, etc.).
    // Add other bootstrap parameters as needed, using camel case.
});

async function initMap() {
    // The location of Uluru
    const position = {lat: 36.6850, lng: -6.1261};
    // Request needed libraries.
    //@ts-ignore
    const {Map} = await google.maps.importLibrary("maps");
    const {AdvancedMarkerElement} = await google.maps.importLibrary("marker");

    // The map, centered at Uluru
    map = new Map(document.getElementById("map"), {
        zoom: 4,
        center: position,
        mapId: "DEMO_MAP_ID",
    });

    // The marker, positioned at Uluru
    marker = new AdvancedMarkerElement({
        map: map,
        position: null,
        title: "Marker",
    });

    map.addListener("click", async (e) => {
        console.log("map clicked", e, e.latLng.lat(), e.latLng.lng());
        deleteMarker()
        setMarker(e.latLng.lat(), e.latLng.lng())
    })
}

marker = initMap();

console.log(marker)

export function deleteMarker() {
    marker.position = null
}

function setMarker(lat, lng) {
    marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: {lat: lat, lng: lng},
    });
}