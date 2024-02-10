async function browseGeocode(platform, at, station) {
  var geocoder = platform.getSearchService();
  var browseParameters = {
    at: at,
    limit: 10,
    radius: 8560
  };

  if (station == 'EV') {
    browseParameters.q = 'EV Charging Station';
  } 
  else if (station == 'Bike') {
    browseParameters.q = 'Bicycle Sharing Location';
  }
  else if (station == 'Solar_Charger') {
    try {
      // Read charger coordinates from CSV file asynchronously
      const chargerCoordinates = await readCoordinatesFromCSV('location.csv', 'solar_charger');
      if (chargerCoordinates) {
        browseParameters.at = chargerCoordinates;
        browseParameters.q = 'Solar Charger Location';
      } else {
        console.error("Failed to read solar charger coordinates from CSV file.");
        return;
      }
    } catch (error) {
      console.error("Error reading solar charger coordinates from CSV file:", error);
      return;
    }
  }

  else {
    var geocoder1 = platform.getSearchService(),
      browseParametersEV = {
      q: 'EV Charging Station',
      at: at,
      limit: 10,
      radius: 8560
    };
    
    var geocoder1 = platform.getSearchService(),
      browseParametersBike = {
      q: 'Bicycle Sharing Location',
      at: at,
      limit: 10,
      radius: 8560
    };

    var geocoder1 = platform.getSearchService(),
      browseParametersCharger = {
      q: 'Solar Charger Location',
      at: at,
      limit: 10,
      radius: 8560
    };

    geocoder.discover(
      browseParametersEV,
      onSuccess,
      onError
    );

    geocoder1.discover(
      browseParametersBike,
      onSuccess,
      onError
    );

    geocoder1.discover(
      browseParametersCharger,
      onSuccess,
      onError
    );

    return;
  }

  geocoder.discover(
    browseParameters,
    onSuccess,
    onError
  );
}
  
  // Shows cities to be selected from
  const cities = [
    {
        id: 0,
        value: "chi",
        name: "Chicago, IL",
        position: "41.87188,-87.64925",
        mapZoom: 15,
        mapCenter: {lat:41.87188, lng:-87.64925}
    }
  ]

  // Show what information/stations are displayed 
  const stations = [
    {
      id: 0,
      value: "ALL",
      name: "All Stations"
    },
    {
      id: 0,
      value: "EV",
      name: "EV Charging Stations"
    },
    {
      id: 1,
      value: "Bike",
      name: "Divvy Stations"
    },
    {
      id: 2,
      value: "Charger",
      name: "Solar Charging Stations"
    },
    {
      id: 3,
      value: "Garbage",
      name: "Recycling Location"
    }

  ]
  
  function createUIforDropdown() {
    
    var subTitle = document.createElement('p');
    subTitle.innerHTML= "Choose station type";
    discoveryTitleContainer.appendChild(subTitle);
  
    var cityDropdown = document.createElement("SELECT");
    cityDropdown.setAttribute("id", "cityDropDown");
    discoveryTitleContainer.appendChild(cityDropdown);
  
    for (var i = 0; i < stations.length; i++) {
      var option = document.createElement("option");
      option.value = stations[i].value;
      option.text = stations[i].name;
      document.getElementById("cityDropDown").appendChild(option);
    }

    var space = document.createElement('p');
    discoveryTitleContainer.appendChild(space);
    
    function eventCities(){
      clearMap();
      stationIndex = this.selectedIndex;
      browseGeocode(platform, "41.87188,-87.64925", stations[stationIndex].value);
    }
    
    document.getElementById("cityDropDown").onchange = eventCities;
    
  }
  
  function clearMap(){
    locationsContainer.innerHTML = '';
    map.removeObjects(map.getObjects())
  }
  
  function onSuccess(result) {
    var locations = result.items;
    addLocationsToMap(locations);
    addLocationsToPanel(locations);
  }
  
  //This function will be called if a communication error occurs during the JSON-P request
  function onError(error) {
    alert('Can\'t reach the remote server');
  }
  
  var citiesIndex = 0;
  var stationIndex = 0;

  //Boilerplate map initialization code starts below:
  var platform = new H.service.Platform({
    apikey: 'DTz9Ao3p7GyFqeg0XAIma6xw0RKfyilQHzpKdptHYfA'
  });
  var defaultLayers = platform.createDefaultLayers();
  
  //Initialize a map
  var map = new H.Map(document.getElementById('maps'),
    defaultLayers.vector.normal.map,{
    center: {lat:41.87188, lng:-87.64925},
    zoom: 13,
    pixelRatio: window.devicePixelRatio || 1
  });
  // add a resize listener to make sure that the map occupies the whole container
  window.addEventListener('resize', () => map.getViewPort().resize());
  
  var locationsContainer = document.getElementById('discoveryPanel');
  var discoveryTitleContainer = document.getElementById('discoveryTitle');
  
  // MapEvents enables the event system
  // Behavior implements default interactions for pan/zoom (also on mobile touch environments)
  var behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  
  // Create the default UI components
  var ui = H.ui.UI.createDefault(map, defaultLayers);
  
  // Hold a reference to any infobubble opened
  var bubble;
  
  /**
   * Opens/Closes a infobubble
   * @param  {H.geo.Point} position     The location on the map.
   * @param  {String} text              The contents of the infobubble.
   */
  function openBubble(position, text){
   if(!bubble){
      bubble =  new H.ui.InfoBubble(
        position,
        {content: text});
      ui.addBubble(bubble);
    } else {
      bubble.setPosition(position);
      bubble.setContent(text);
      bubble.open();
    }
  }
  
  /**
   * Creates a series of list items for each location found, and adds it to the panel.
   * @param {Object[]} locations An array of locations as received from the
   *                             H.service.GeocodingService
   */
  function addLocationsToPanel(locations){
  
    var nodeOL = document.createElement('ul'),
        i;
  
    nodeOL.style.fontSize = 'small';
    nodeOL.style.marginLeft ='5%';
    nodeOL.style.marginRight ='5%';
  
  
    for (i = 0;  i < locations.length; i += 1) {
      let location = locations[i],
          li = document.createElement('li'),
          divLabel = document.createElement('div'),
          content =  '<strong style="font-size: large;">' + location.title  + '</strong></br>';
          position = location.position;
  
        content += '<strong>street:</strong> '  + location.address.label + '<br/>';
        content += '<strong>district:</strong> '  + location.address.district + '<br/>';
        content += '<strong>position:</strong> ' +
          Math.abs(position.lat.toFixed(4)) + ((position.lat > 0) ? 'N' : 'S') +
          ' ' + Math.abs(position.lng.toFixed(4)) + ((position.lng > 0) ? 'E' : 'W') + '<br/>';
  
        divLabel.innerHTML = content;
        li.appendChild(divLabel);
  
        nodeOL.appendChild(li);
    }
  
    locationsContainer.appendChild(nodeOL);
  }
  
  
  /**
   * Creates a series of H.map.Markers for each location found, and adds it to the map.
   * @param {Object[]} locations An array of locations as received from the
   *                             H.service.GeocodingService
   */
  function addLocationsToMap(locations){
    var group = new  H.map.Group(),
        i;
  
    // Add a marker for each location found
    for (i = 0;  i < locations.length; i += 1) {
      let location = locations[i];
      marker = new H.map.Marker(location.position);
      marker.label = location.title;
      group.addObject(marker);
    }
  
    group.addEventListener('tap', function (evt) {
      map.setCenter(evt.target.getGeometry());
      openBubble(
         evt.target.getGeometry(), evt.target.label);
    }, false);
  
    // Add the locations group to the map
    map.addObject(group);
    map.setCenter(cities[citiesIndex].mapCenter);
    map.setZoom(cities[citiesIndex].mapZoom);
  }
  
  // Now use the map as required...
  
  browseGeocode(platform, "41.87188,-87.64925");
  createUIforDropdown();


  // ##################################################
// Function to asynchronously read coordinates for a specific station from CSV file
function readCoordinatesFromCSV(filename, station) {
  return new Promise((resolve, reject) => {
    const csvFile = 'location.csv';
    const stationCoordinates = [];
    const reader = new FileReader();
    reader.onload = (event) => {
      const csvData = event.target.result;
      const lines = csvData.split('\n');
      let found = false;
      for (const line of lines) {
        const [name, latitude, longitude] = line.split(',');
        if (name && latitude && longitude) {
          if (name === station) {
            stationCoordinates.push({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
            found = true;
          } else if (found) {
            break; // Stop reading after finding the station and its coordinates
          }
        }
      }
      if (stationCoordinates.length > 0) {
        resolve(`${stationCoordinates[0].latitude},${stationCoordinates[0].longitude}`);
      } else {
        reject("Station not found in CSV file.");
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(csvFile);
  });


  async function addLocationsFromCSVToMap(station) {
    try {
      const coordinatesString = await readCoordinatesFromCSV('location.csv', station);
      const [latitude, longitude] = coordinatesString.split(',');
      const location = {
        position: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
        title: station
      };
  
      addLocationsToMap([location]);
    } catch (error) {
      console.error(error);
      // Handle error, e.g., display an alert or log a message
    }
  }
  
  // Example usage
  // const stationName = ''; // Replace with the actual station name
  // addLocationsFromCSVToMap(stationName);


}