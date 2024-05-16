let Draw=ol.interaction.Draw
let Map=ol.Map;
let View=ol.View;
let OSM=ol.source.OSM
let Vector=ol.source.Vector
let VectorSource=ol.source.Vector
let TileLayer=ol.layer.Tile
let VectorLayer=ol.layer.Vector
let Modify=ol.interaction.Modify
let Select=ol.interaction.Select
let defaultInteractions=ol.interaction.defaults
let transform=ol.proj.transform
let GeoJSON=ol.format.GeoJSON
let Snap=ol.interaction.Snap
let coordinates=[[90.30893907434015,23.788872676223903],[90.30903427018818,23.78747894362307],[90.31041460998462,23.788959784015248],[90.30893907434015,23.788872676223903]];

var transformedCoordinates = coordinates.map(coord => transform(coord, 'EPSG:4326', 'EPSG:3857'));
const geojsonObject = {
    'type': 'FeatureCollection',
    'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Polygon',
          'coordinates': 
          [
            transformedCoordinates
          ]
        }
      }
    ]
  };
  
  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojsonObject),
  });

  
const raster = new TileLayer({source: new OSM()});
const vector = new VectorLayer({
    //source: new VectorSource(),
    source: source,
    style: {
        'fill-color': 'rgba(255, 255, 255, 0.2)',
        'stroke-color': '#ffcc33',
        'stroke-width': 2,
        'circle-radius': 7,
        'circle-fill-color': '#ffcc33',
    }
    
});
function transform_geo_array_3857_to_4326(current_locations){
    let lat_long_collection=[];
    let i=0;
    for(i=0;i<current_locations.length;i++){
        let lt= transform(current_locations[i], 'EPSG:3857', 'EPSG:4326')
        lat_long_collection[i]=lt;
    }
    return lat_long_collection;
}



const map = new Map({
    layers: [
        raster, vector],
    target: 'map',
    view: new View({
        center:transform([90.309352,23.787357], 'EPSG:4326', 'EPSG:3857'),
        zoom: 16,
    }),
});
const modify_poly = {
    init: function () {
        this.select = new Select();
        map.addInteraction(this.select);

        this.modify = new Modify({
        features: this.select.getFeatures(),
        });
        map.addInteraction(this.modify);

        this.setEvents();

        
        this.modify.on('modifyend',function(e){
            let features = e.features.getArray()[0];
            let geom = features.getGeometry().getCoordinates()[0];
            //coordinate
            console.log('geom',transform(geom, 'EPSG:4326', 'EPSG:3857'),)
            console.log(JSON.stringify(geom));
            document.getElementById('coordinate').value=JSON.stringify(geom)
            let long_lat=transform_geo_array_3857_to_4326(geom)
            document.getElementById('coordinate_to_lat_long').value=JSON.stringify(long_lat)
        });
    },
    setEvents: function () {
        const selectedFeatures = this.select.getFeatures();
        this.select.on('change:active', function () {
        selectedFeatures.forEach(function (each) {
            selectedFeatures.remove(each);
        });
        });
    },
    setActive: function (active) {
        this.select.setActive(active);
        this.modify.setActive(active);
    }
    };
modify_poly.init();