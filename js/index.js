require([
    "esri/Map",
    "esri/views/MapView",
    "esri/widgets/LayerList",
    "esri/layers/TileLayer",
    "esri/layers/VectorTileLayer",
    "esri/layers/BaseTileLayer",
    "esri/core/promiseUtils"
],
function(
    Map, MapView, LayerList, TileLayer, VectorTileLayer,
    BaseTileLayer, promiseUtils
){

    // // **********************************************
    // //  Create a subclass of BaseTileLayer
    // // **********************************************

    // var BlendLayer = BaseTileLayer.createSubclass({

    //     // Add a multiplyLayers property. Its value will be used
    //     // store tile layers that will be used to create
    //     // a blended layer. Layers stored in this property
    //     // will be blended using "multiply" operation.
    //     properties: {
    //         multiplyLayers: null,
    //         blendMode: null
    //     },

    //     // The load() method is called when the layer is added to the map
    //     // prior to it being rendered in the view.
    //     load: function() {
    //         // call load method on each tile layer stored in multiple property
    //         this.multiplyLayers.forEach(function(layer) {
    //             // The tile layers must load() prior to the BlendLayer
    //             // resolving and moving to the "loaded" status.
    //             this.addResolvingPromise(layer.load());
    //         }, this);
    //     },

    //     // Fetches the tile(s) visible in the view
    //     fetchTile: function(level, row, col) {

    //         var tilePromises = this.multiplyLayers.map(function(layer) {
    //             // calls fetchTile() on the tile layers returned in multiplyLayers property
    //             // for the tiles visible in the view
    //             // console.log(layer);
    //             return layer.fetchTile(level, row, col);
    //         });

    //         return promiseUtils.eachAlways(tilePromises).then(function(results) {
        
    //             // create a canvas
    //             var width = this.tileInfo.size[0];
    //             var height = this.tileInfo.size[0];
    //             var canvas = document.createElement("canvas");
    //             var context = canvas.getContext("2d");

    //             canvas.width = width;
    //             canvas.height = height;

    //             // context.globalCompositeOperation = "luminosity";
    //             context.globalCompositeOperation = this.blendMode || 'normal';

    //             // console.log(this.blendMode);

    //             // const layers = this.multiplyLayers;
            
    //             results.forEach(function(result, index) {
    //                 var image = result.value;

    //                 const cssFilter = this.multiplyLayers[index].cssFilter || null;

    //                 context.filter = cssFilter || 'none';

    //                 // console.log(image);

    //                 context.drawImage(image, 0, 0, width, height);
    //             }, this);

    //             return canvas;
    //         }.bind(this));
    //     }
    // });

    // // **********************************************
    // // Start of JS application
    // // **********************************************

    // // natGeoLayer and hillShadeLayer are added to
    // // multiplyLayers property of the BlendLayer

    // var imageryLayer = new TileLayer({
    //     url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
    //     // cssFilter: 'brightness(1.3) hue-rotate(-45deg) contrast(5) saturate(0.5)'
    // });

    // var hillShadeLayer = new TileLayer({
    //     url: "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer",
    //     // cssFilter: 'brightness(0.9) contrast(1.15)'
    // });

    // // Create a new instance of BlendLayer
    // // add natGeoLayer and hillShadeLayer to multiplyLayers property
    // var blendLayer = new BlendLayer({
    //     multiplyLayers: [
    //         imageryLayer,
    //         hillShadeLayer
    //     ],
    //     title: "Blended World Imagery Map",
    //     // blendMode: 'luminosity' 
    //     blendMode: 'color-burn' 
    // });

    // // Add natGeoLayer and blendLayer to the map
    // var map = new Map({
    //     layers: [
    //         blendLayer
    //     ]
    // });

    // var view = new MapView({
    //     container: "viewDiv",
    //     map: map,
    //     center: [-117.0431, 34.0336],
    //     zoom: 12,
    //     constraints: {
    //         snapToZoom: false
    //     }
    // });

    const Controller = function(){

    };
    
    const MapControl = function(){

        let mapView = null;

        const DOM_ID_MAP_CONTAINER = 'viewDiv';
        const CENTER_COORD = [-117.0431, 34.0336];
        const ZOOM = 12;

        const init = ()=>{
            initMapView();

            addBlendLayer({
                styleName: 'War Room'
            });
        };

        const initMapView = ()=>{

            const map = new Map({
                layers: []
            });

            mapView = new MapView({
                container: DOM_ID_MAP_CONTAINER,
                map: map,
                center: CENTER_COORD,
                zoom: ZOOM,
                constraints: {
                    snapToZoom: false
                }
            });
        };

        const getBlendLayer = (options={})=>{

            const blendMode = options.blendMode || 'normal';
            const imageryLayerCssFilter = options.imageryLayerCssFilter || 'none';
            const hillShadeLayerCssFilter = options.hillShadeLayerCssFilter || 'none';

            const imageryLayer = new TileLayer({
                url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
                cssFilter: imageryLayerCssFilter
            });
    
            const hillShadeLayer = new TileLayer({
                url: "https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer",
                cssFilter: hillShadeLayerCssFilter
            });
    
            const blendLayer = new BlendLayer({
                multiplyLayers: [
                    imageryLayer,
                    hillShadeLayer
                ],
                title: "Blended World Imagery Map",
                // blendMode: 'luminosity' 
                blendMode: blendMode 
            });

            return blendLayer;
        };

        const getLabelLayer = (options={})=>{

            const blendMode = options.blendMode || 'normal';
            
            // const darkLayer = new TileLayer({
            //     url: "https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer"
            // });
            
            // const blendLabelLayer = new BlendLayer({
            //     multiplyLayers: [
            //         darkLayer
            //     ],
            //     blendMode: blendMode 
            // });

            const vtlLayer = new VectorTileLayer({
                id: 'darkLabelLayer',
                // visible: false,
                opacity: .75,
                url: "https://www.arcgis.com/sharing/rest/content/items/4a3922d6d15f405d8c2b7a448a7fbad2/resources/styles/root.json?f=pjson"
            });
              
            return vtlLayer;

        };

        const addBlendLayer = (options={})=>{

            const styleName = options.styleName || "Chiffon";

            const recipes = {
                "Chiffon": {
                    blendLayerOptions: {
                        blendMode: "luminosity",
                        imageryLayerCssFilter: "brightness(1.3) hue-rotate(-45deg) contrast(5) saturate(0.5)",
                        hillShadeLayerCssFilter: "brightness(0.9) contrast(1.15)"
                    }
                },
                "Bumpify": {
                    blendLayerOptions: {
                        blendMode: "color-burn",
                        imageryLayerCssFilter: "",
                        hillShadeLayerCssFilter: ""
                    },
                    labelLayerOptions: {
                        blendMode: "soft-light",
                    }
                },
                "War Room": {
                    blendLayerOptions: {
                        blendMode: "luminosity",
                        imageryLayerCssFilter: ": brightness(1.25) saturate(0.3) hue-rotate(-25deg)",
                        hillShadeLayerCssFilter: "invert(0.9)"
                    },
                    labelLayerOptions: {
                        blendMode: "soft-light",
                    }
                }
            };

            const blendLayer = getBlendLayer(recipes[styleName].blendLayerOptions);

            // const labelLayer = recipes[styleName].labelLayerOptions ? getLabelLayer(recipes[styleName].labelLayerOptions) : null;

            mapView.map.layers.addMany([blendLayer]);

        };

        const BlendLayer = BaseTileLayer.createSubclass({

            properties: {
                multiplyLayers: null,
                blendMode: null
            },

            load: function() {
                this.multiplyLayers.forEach(function(layer) {
                    this.addResolvingPromise(layer.load());
                }, this);
            },

            fetchTile: function(level, row, col) {

                // console.log(level);

                const tilePromises = this.multiplyLayers.map(function(layer) {
                    return layer.fetchTile(level, row, col);
                });

                return promiseUtils.eachAlways(tilePromises).then(function(results) {

                    const width = this.tileInfo.size[0];
                    const height = this.tileInfo.size[0];
                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d");

                    canvas.width = width;
                    canvas.height = height;

                    context.globalCompositeOperation = this.blendMode || 'normal';

                    results.forEach(function(result, index) {
                        const image = result.value;

                        const cssFilter = this.multiplyLayers[index].cssFilter || null;

                        context.filter = cssFilter || 'none';

                        context.drawImage(image, 0, 0, width, height);
                    }, this);

                    return canvas;
                }.bind(this));
            }
        });

        return {
            init,
            addBlendLayer
        };

    };

    const View = function(){

    };

    const initApp = function(){
        const controller = new Controller();
        const mapControl = new MapControl();

        mapControl.init();
    };

    initApp();

});