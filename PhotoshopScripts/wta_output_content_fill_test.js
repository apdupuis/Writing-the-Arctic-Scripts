// Given an input image and masks for separating bears and background 
// create the two images which are filled to create the background-only image 
// as well as the bear-only image 

var doc_width = 1920
var doc_height = 1080

// variables for pasting in place
cTID = function(s) { return app.charIDToTypeID(s); };
sTID = function(s) { return app.stringIDToTypeID(s); };

function pasteInPlace(enabled, withDialog) {
    if (enabled != undefined && !enabled)
      return;
    var dialogMode = (withDialog ? DialogModes.ALL : DialogModes.NO);
    var desc1 = new ActionDescriptor();
    desc1.putBoolean(sTID("inPlace"), true);
    desc1.putEnumerated(cTID('AntA'), cTID('Annt'), cTID('Anno'));
    executeAction(cTID('past'), desc1, dialogMode);
  };

var whiteColor = new SolidColor;  
whiteColor.rgb.red = 255  
whiteColor.rgb.green = 255  
whiteColor.rgb.blue = 255

var firstClipDoc = app.activeDocument
var selectionRef = app.activeDocument.selection

preferences.rulerUnits = Units.PIXELS
var outputDoc = app.documents.add(doc_width, doc_height*2)

function soloLayer(layer_name) {
	for(i = 0; i < app.activeDocument.layers.length; i++) {
		var currentLayer = app.activeDocument.layers[i]
		if(currentLayer.name == layer_name) {
			currentLayer.visible = true
		} else {
			currentLayer.visible = false
		}
	}
}


selectionRef.selectAll()
selectionRef.copy(true)


app.activeDocument = outputDoc
pasteInPlace()
app.activeDocument.layers["Background"].remove()


// things we need

var outputSelectionRef = outputDoc.selection

// renames the first layer to outputBearLayer 
var outputBearLayer = outputDoc.layers["Layer 1"]
outputBearLayer.name = "OutputBearLayer"

// duplicates the first layer, renames it to outputBearMaskLayer 
var outputBearMaskLayer = outputBearLayer.duplicate()
outputBearMaskLayer.name = "OutputBearMask"

// translates the outputBearMask layer so they overlap properly
preferences.rulerUnits = Units.PIXELS
outputBearMaskLayer.translate(0, -doc_height)

// goes back to firstClipDoc, copies the secondFootageMaskLayer, pastes in place into a new layer in outputDoc (outputBackgroundMaskLayer)
app.activeDocument = firstClipDoc
soloLayer("SecondFootageMask")
firstClipDoc.activeLayer = firstClipDoc.layers["SecondFootageMask"]
selectionRef.selectAll()
selectionRef.copy()
app.activeDocument = outputDoc
var outputBackgroundMaskLayer = outputDoc.artLayers.add()
outputBackgroundMaskLayer.name = "OutputBackgroundMask"
pasteInPlace()

// resize the canvas, crop all layers 
outputDoc.resizeCanvas( doc_width, doc_height, AnchorPosition.TOPCENTER )
outputDoc.crop( [
	0, 0, doc_width, doc_height
])

// duplicate outputBearLayer, rename to outputBackgroundLayer
var outputBackgroundLayer = outputBearLayer.duplicate()
outputBackgroundLayer.name = "OutputBackground"

// select outputBearMask using Action
soloLayer("OutputBearMask")
app.doAction("SelectMask","PolarBearScripts.atn")

// perform  the appropriate expansion and feathering on the selection 
outputSelectionRef.expand(20)

// make new layer for storing all of the background mask
var outputBackgroundTotalMaskLayer = outputDoc.artLayers.add()
outputBackgroundTotalMaskLayer.name = "OutputBackgroundMaskTotal"

// toggle visibility and select only the OutputBackgroundMaskTotal and fill it
soloLayer("OutputBackgroundMaskTotal")
outputDoc.activeLayer = outputBackgroundTotalMaskLayer
outputSelectionRef.fill(whiteColor)

// toggle visibility only on outputBackgroundMaskLayer
soloLayer("OutputBackgroundMask")

// select, add a border or stroke, expand, optionally feather 
app.doAction("SelectMask","PolarBearScripts.atn")
outputSelectionRef.selectBorder(50)
outputSelectionRef.expand(20)

// toggle visibility and select only the OutputBackgroundMaskTotal and fill it
soloLayer("OutputBackgroundMaskTotal")
outputDoc.activeLayer = outputBackgroundTotalMaskLayer
outputSelectionRef.fill(whiteColor)

// select output mask
app.doAction("SelectMask","PolarBearScripts.atn")

// toggle outputBackgroundLayer, content fill 
soloLayer("OutputBackground")
outputDoc.activeLayer = outputBackgroundLayer
app.doAction("ContentFill_VHi","PolarBearScripts.atn")

//app.doAction("ContentFill_VHi_RLo","PolarBearScripts.atn")
//app.doAction("ContentFill_VHi","PolarBearScripts.atn")

// toggle visibility for outputBearMask and select. perform contraction
soloLayer("OutputBearMask")
app.doAction("SelectMask","PolarBearScripts.atn")
outputSelectionRef.feather(5)
outputSelectionRef.contract(30)
outputSelectionRef.invert()

// toggle visibility on outputBearLayer, set to active layer, run content-fill
soloLayer("OutputBear")
outputDoc.activeLayer = outputBearLayer
app.doAction("ContentFill_Hi","PolarBearScripts.atn")

// make outputBackgroundLayer visible 
outputBackgroundLayer.visible = true

// expand canvas to twice its width 
outputDoc.resizeCanvas( doc_width*2, doc_height )

// translate outputBackgroundLayer to the left, outputBearLayer to the right
outputBearLayer.translate( doc_width * 0.5, 0)
outputBackgroundLayer.translate( -doc_width * 0.5, 0)

// cleanup: toggle visibility on the input doc's layers to return them to their original state
app.activeDocument = firstClipDoc
firstClipDoc.layers["SecondFootageMask"].visible = false
firstClipDoc.layers["SecondBearMaskNew"].visible = false
firstClipDoc.layers["SecondMask"].visible = false
firstClipDoc.layers["MaskedSecondFootage"].visible = true
firstClipDoc.layers["SecondFootage"].visible = false
firstClipDoc.layers["OverallBearMask"].visible = true
firstClipDoc.layers["FirstMask"].visible = false
firstClipDoc.layers["FirstFootage"].visible = true
app.activeDocument = outputDoc