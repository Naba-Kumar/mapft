import './style.css';
import './modules/style.css'
import 'ol-layerswitcher/dist/ol-layerswitcher.css';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS.js';
import View from 'ol/View.js';


import scl from 'ol/control/ScaleLine.js';

import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';




// import Map from 'ol/Map.js';
// import View from 'ol/View.js';
import {
  Circle as CircleStyle,
  Fill,
  RegularShape,
  Stroke,
  Style,
  Text,
} from 'ol/style.js';
import { Draw, Modify } from 'ol/interaction.js';
import { LineString, Point } from 'ol/geom.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { getArea, getLength } from 'ol/sphere.js';




const typeSelect = document.getElementById('type');
const showSegments = document.getElementById('segments');
const clearPrevious = document.getElementById('clear');

const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  }),
});

const labelStyle = new Style({
  text: new Text({
    font: '14px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [3, 3, 3, 3],
    textBaseline: 'bottom',
    offsetY: -15,
  }),
  image: new RegularShape({
    radius: 8,
    points: 3,
    angle: Math.PI,
    displacement: [0, 10],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
  }),
});

const tipStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
  }),
});

const modifyStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
  text: new Text({
    text: 'Drag to modify',
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
  }),
});

const segmentStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textBaseline: 'bottom',
    offsetY: -12,
  }),
  image: new RegularShape({
    radius: 6,
    points: 3,
    angle: Math.PI,
    displacement: [0, 8],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
});

const segmentStyles = [segmentStyle];

const formatLength = function (line) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' km';
  } else {
    output = Math.round(length * 100) / 100 + ' m';
  }
  return output;
};

const formatArea = function (polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
  } else {
    output = Math.round(area * 100) / 100 + ' m\xB2';
  }
  return output;
};

const raster = new TileLayer({
  source: new OSM(),
});

const source = new VectorSource();

const modify = new Modify({ source: source, style: modifyStyle });

let tipPoint;

function styleFunction(feature, segments, drawType, tip) {
  const styles = [];
  const geometry = feature.getGeometry();
  const type = geometry.getType();
  let point, label, line;
  if (!drawType || drawType === type || type === 'Point') {
    styles.push(style);
    if (type === 'Polygon') {
      point = geometry.getInteriorPoint();
      label = formatArea(geometry);
      line = new LineString(geometry.getCoordinates()[0]);
    } else if (type === 'LineString') {
      point = new Point(geometry.getLastCoordinate());
      label = formatLength(geometry);
      line = geometry;
    }
  }
  if (segments && line) {
    let count = 0;
    line.forEachSegment(function (a, b) {
      const segment = new LineString([a, b]);
      const label = formatLength(segment);
      if (segmentStyles.length - 1 < count) {
        segmentStyles.push(segmentStyle.clone());
      }
      const segmentPoint = new Point(segment.getCoordinateAt(0.5));
      segmentStyles[count].setGeometry(segmentPoint);
      segmentStyles[count].getText().setText(label);
      styles.push(segmentStyles[count]);
      count++;
    });
  }
  if (label) {
    labelStyle.setGeometry(point);
    labelStyle.getText().setText(label);
    styles.push(labelStyle);
  }
  if (
    tip &&
    type === 'Point' &&
    !modify.getOverlay().getSource().getFeatures().length
  ) {
    tipPoint = geometry;
    tipStyle.getText().setText(tip);
    styles.push(tipStyle);
  }
  return styles;
}

const vector = new VectorLayer({
  source: source,
  style: function (feature) {
    return styleFunction(feature, showSegments.checked);
  },
});

// const map = new Map({
//   target: 'map',
//   view: viewMap,
// });

const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [26.578402, 91.971251],
    zoom: 4,
  }),
});

map.addInteraction(modify);

let draw; // global so we can remove it later







// let addInteractionDisabled = false;

// anotherButton.addEventListener('click', function () {
//   addInteractionDisabled = true;
// });


function addInteraction(measure_option) {

    // if (addInteractionDisabled) {
    //   return; // Exit if disabled
    // }

    // ... Rest of the addInteraction() logic ...

    const drawType = measure_option;

    console.log("drawType-------------->");

    console.log(drawType)
    const activeTip =
      'Click to continue drawing the ' +
      (drawType === 'Polygon' ? 'polygon' : 'line');
    const idleTip = 'Click to start measuring';
    let tip = idleTip;
    draw = new Draw({
      source: source,
      type: drawType,
      style: function (feature) {
        return styleFunction(feature, showSegments.checked, drawType, tip);
      },
    });
    draw.on('drawstart', function () {
      if (clearPrevious.checked) {
        source.clear();
      }
      // Remove this line to prevent deactivating the Modify interaction
      modify.setActive(false);
      tip = activeTip;
    });
    draw.on('drawend', function () {
      modifyStyle.setGeometry(tipPoint);
      modify.setActive(true);
      map.once('pointermove', function () {
        modifyStyle.setGeometry();
      });
      tip = idleTip;
    });
    modify.setActive(true);
    map.addInteraction(draw);
  }



// typeSelect.onchange = function () {
//   map.removeInteraction(draw);
//   if(typeSelect.value !== 'none')
//   addInteraction();
// };

// addInteraction();






function toggMesure(event) {
    var measure_option = event.target.id;
    console.log(measure_option)
  
  
      map.removeInteraction(draw);
      if (measure_option !== 'erase_icon')
        addInteraction(measure_option);
  
    }
  
  window.handleMesureToggle = function (event) {
    toggMesure(event);
  };
  


  

showSegments.onchange = function () {
  vector.changed();
  draw.getOverlay().changed();
};

















// const viewMap = new View({
//     center: [80.438207, 24.188132],
//     zoom: 3,
// });

// const map = new Map({
//     target: 'map',
//     view: viewMap,
// });

const osmTile = new TileLayer({
  title: 'Open_street_Map',
  visible: true,
  source: new OSM(),
});
map.addLayer(osmTile);

const nonTile = new TileLayer({
  title: 'none',
  type: 'base',
  visible: false,
});
map.addLayer(nonTile);


const india_ds_pgis = new TileLayer({
  title: 'india_ds_pgis',
  // type: 'base',
  visible: false,
  source: new TileWMS({
    url: 'http://127.0.0.1:8080/geoserver/WS_ONE/wms',
    params: { 'LAYERS': 'WS_ONE:india_ds_pgis', 'TILED': true },
  }),
  serverType: 'geoserver',
});
map.addLayer(india_ds_pgis);



const indian_dams = new TileLayer({
  title: 'indian_dams',
  type: 'base',
  visible: false,
  source: new TileWMS({
    url: 'http://127.0.0.1:8080/geoserver/WS_ONE/wms',
    params: { 'LAYERS': 'WS_ONE:indian_dams', 'TILED': true },
  }),
  serverType: 'geoserver',
});
map.addLayer(indian_dams);



const rivers_pgis = new TileLayer({
  title: 'rivers_pgis',
  type: 'base',
  visible: false,
  source: new TileWMS({
    url: 'http://127.0.0.1:8080/geoserver/WS_ONE/wms',
    params: { 'LAYERS': 'WS_ONE:rivers_pgis', 'TILED': true },
  }),
  serverType: 'geoserver',
});
map.addLayer(rivers_pgis);


const india_st_pgis = new TileLayer({
  title: 'india_st_pgis',
  // type: 'base',
  visible: false,
  source: new TileWMS({
    url: 'http://127.0.0.1:8080/geoserver/WS_ONE/wms',
    params: { 'LAYERS': 'WS_ONE:india_st_pgis', 'TILED': true },
  }),
});

map.addLayer(india_st_pgis);


// const overlayGroup = new LayerGroup({
//     title: 'Overlay Maps',
//     layers: [osmTile, india_ds_pgis, india_st_pgis],
// });


// map.addLayer(overlayGroup);



// function toggleLayer(val){
//     var getval = val.target.value;
//     var checkedstatus = val.target.checked;
//     var dl = map.getLayers();
//     dl.forEach(function(element){
//         if(getval==element.get('title')){
//             element.setVisible(checkedstatus);
//         }
//     })
// }




// Function to handle click events outside of layer controls
function handleClickOutside(event) {
  var layersContainer = document.getElementById('layers_container');
  if (!layersContainer.contains(event.target)) {
    // Click occurred outside of layers container, hide the layers
    var layerList = document.getElementById('layer_list');
    layerList.style.display = 'none';
  }
}

// Attach event listener to handle click events on the document body
document.body.addEventListener('click', handleClickOutside);

function toggleLayer(event) {
  var getval = event.target.value;
  var checkedstatus = event.target.checked;
  var dl = map.getLayers();
  dl.forEach(function (element) {


    if (getval == element.get('title')) {

      element.setVisible(checkedstatus);
    }
  });
}

window.handleLayerToggle = function (event) {
  toggleLayer(event);
};





// function toggMesure(event) {
//   var getval = event.target.id;
//   console.log(getval)
  // var checkedstatus = event.target.checked;
  // var dl = map.getLayers();
  // dl.forEach(function (element) {

  //   if (getval == element.get('title')) {

  //     element.setVisible(checkedstatus);
  //   }
  // }
  // );
// }
// window.handleMesureToggle = function (event) {
//   toggMesure(event);
// };

























let scalcontrol = new scl({
  bar: true,
  text: true
})
map.addControl(scalcontrol)





let mousePositionControl = new MousePosition({
  className: 'co_ordinate_pose',
  coordinateFormat: createStringXY(6),
  projection: 'EPSG:4326',
  className: 'custom-mouse-position',
  // target: document.getElementById('mouse-position'),
  // undefinedHTML: '&nbsp;'
});

map.addControl(mousePositionControl);

map.on('click', function (event) {
  handleFeatureInfoRequest(event.coordinate);
});


// Function to handle feature info requests
function handleFeatureInfoRequest(coordinate) {
  // Clear any existing popups
  document.querySelectorAll('.ol-popup').forEach(popup => popup.remove());

  // Perform a forEachFeatureAtPixel to retrieve information about features at the clicked coordinate
  map.forEachFeatureAtPixel(map.getPixelFromCoordinate(coordinate), function (feature, layer) {
    if (feature) {
      var featureProperties = feature.getProperties();
      var popupContent = '<ul>';
      for (var key in featureProperties) {
        if (featureProperties.hasOwnProperty(key) && key !== 'geometry') {
          popupContent += '<li><strong>' + key + '</strong>: ' + featureProperties[key] + '</li>';
        }
      }
      popupContent += '</ul>';

      // Display the feature info in a popup
      var popup = new ol.Overlay.Popup({
        element: document.createElement('div'),
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -15]
      });
      popup.getElement().innerHTML = popupContent;
      popup.setPosition(coordinate);
      map.addOverlay(popup);
    }
  });
}

// Event listener to trigger the function when the user clicks on the map
map.on('click', function (event) {
  handleFeatureInfoRequest(event.coordinate);
});

