require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/TileLayer",
    "esri/layers/VectorTileLayer",
    "esri/layers/BaseTileLayer",
    "esri/core/promiseUtils"
],
function(
    Map, MapView, TileLayer, VectorTileLayer,
    BaseTileLayer, promiseUtils
){

    const BLEND_MODE_RECIPE = {
        "Chiffon": {
            blendLayerOptions: {
                blendMode: "luminosity",
                imageryLayerCssFilter: "brightness(1.3) hue-rotate(-45deg) contrast(5) saturate(0.5)",
                hillShadeLayerCssFilter: "brightness(0.9) contrast(1.15)"
            },
            labelLayerOptions: {
                itemID: "ba52238d338745b1a355407ec9df6768",
                // modifierClass: "Human-Geography-Label-Chiffon",
                opacity: .75
            },
            deatiledLayerOptions: {
                itemID: "97fa1365da1e43eabb90d0364326bc2d",
                // modifierClass: "Human-Geography-Detail-Chiffon",
                opacity: .25
            }
        },
        "Bumpify": {
            blendLayerOptions: {
                blendMode: "color-burn",
                imageryLayerCssFilter: "",
                hillShadeLayerCssFilter: ""
            },
            labelLayerOptions: {
                itemID: "4a3922d6d15f405d8c2b7a448a7fbad2",
                // modifierClass: "Human-Geography-Label-Dark",
                opacity: .5
            },
            deatiledLayerOptions: {
                itemID: "1ddbb25aa29c4811aaadd94de469856a",
                // modifierClass: "Human-Geography-Detail-Dark",
                opacity: .25
            }
        },
        "War Room": {
            blendLayerOptions: {
                blendMode: "luminosity",
                imageryLayerCssFilter: ": brightness(1.25) saturate(0.3) hue-rotate(-25deg)",
                hillShadeLayerCssFilter: "invert(0.9)"
            },
            labelLayerOptions: {
                itemID: "4a3922d6d15f405d8c2b7a448a7fbad2",
                // modifierClass: "Human-Geography-Label-Dark",
                opacity: .5
            }
        }
    };

    const MapControl = function(){

        let mapView = null;

        const DOM_ID_MAP_CONTAINER = 'viewDiv';
        const CENTER_COORD = [-95, 40];
        const ZOOM = 5;


        const init = (options={})=>{
            initMapView();

            if(options.styleRecipe){
                addBlendLayer(options.styleRecipe);
            }
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
                    snapToZoom: false,
                    rotationEnabled: false
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
                blendLayers: [
                    imageryLayer,
                    hillShadeLayer
                ],
                title: "Blended World Imagery Map",
                // blendMode: 'luminosity' 
                blendMode: blendMode 
            });

            return blendLayer;
        };

        const getVectorTileLayer = (options={})=>{

            const itemID = options.itemID || null;

            const vtlLayer = new VectorTileLayer({
                portalItem: {  // autocasts as new PortalItem()
                    id: itemID
                },
                opacity: options.opacity || 1,
            });
              
            return vtlLayer;

        };

        const addBlendLayer = (styleRecipe={})=>{

            const blendLayer = getBlendLayer(styleRecipe.blendLayerOptions);

            const labelLayer = styleRecipe.labelLayerOptions ? getVectorTileLayer(styleRecipe.labelLayerOptions) : null;

            const deatiledLayer = styleRecipe.deatiledLayerOptions ? getVectorTileLayer(styleRecipe.deatiledLayerOptions) : null;

            const layersToAdd = [blendLayer, deatiledLayer, labelLayer].filter(d=>d !== null);

            mapView.map.layers.removeAll();

            mapView.map.layers.addMany(layersToAdd);

        };

        const BlendLayer = BaseTileLayer.createSubclass({

            properties: {
                blendLayers: null,
                blendMode: null
            },

            load: function() {
                this.blendLayers.forEach(function(layer) {
                    this.addResolvingPromise(layer.load());
                }, this);
            },

            fetchTile: function(level, row, col) {

                // console.log(level);

                const tilePromises = this.blendLayers.map(function(layer) {
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

                        const cssFilter = this.blendLayers[index].cssFilter || null;

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

    const CustomizedLayerList = function(options={}){

        const container = options.container ? document.getElementById(options.container) : null;
        const layers = options.layers || [];
        const layerOnSelectHandler = options.layerOnSelectHandler || null;

        const init = ()=>{

            if(!container){
                console.error('container is required to initiate layer list');
                return;
            }

            render();
            addEventHandler();
        };

        const render = ()=>{

            const layersHtml = layers.map( (d, i)=>{
                const isActive = i === 0 ? 'is-active' : '';
                return `<a class="layer-list-link crumb link-white js-set-blend-layer ${isActive}" data-value='${d}'>${d}</a>`;
            }).join('');

            const layerListHtml = `<div class='panel panel-black'><nav class="breadcrumbs">${layersHtml}</nav><div>`;

            container.innerHTML = layerListHtml;
        };

        const addEventHandler = ()=>{
            container.addEventListener('click', function (event){
                if (event.target.classList.contains('js-set-blend-layer')) {
                    const targetLayer = event.target.dataset.value;
                    layerOnSelectHandler(targetLayer);
                    setActiveItem(targetLayer);
                }
            })
        };

        const setActiveItem = (layerName)=>{
            document.querySelectorAll('.layer-list-link').forEach(d=>{
                if(d.dataset.value === layerName){
                    d.classList.add('is-active');
                } else {
                    d.classList.remove('is-active');
                }
            });
        };

        init();
    };

    const initApp = function(){

        const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

        const availableStyleRecipes = iOS ? Object.keys(BLEND_MODE_RECIPE).filter(d=>{return d !== 'War Room'}) : Object.keys(BLEND_MODE_RECIPE);

        const defaultStyleRecipe = BLEND_MODE_RECIPE[availableStyleRecipes[0]];
        
        const mapControl = new MapControl();

        const layerList = new CustomizedLayerList({
            container: 'layerListDiv',
            layers: availableStyleRecipes,
            layerOnSelectHandler: (layerName)=>{
                const styleRecipe = BLEND_MODE_RECIPE[layerName];
                mapControl.addBlendLayer(styleRecipe);
            }
        });

        mapControl.init({
            styleRecipe: defaultStyleRecipe
        });

    };

    initApp();

});