// Transition between two masked sequences 
// this is done by expanding one mask from nothingness to exclude the other 

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

// for padding with leading zeros
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

app.displayDialogs = DialogModes.NO

var footage_path_prefix = ""

var first_clip_episode = "02"
var first_clip_number = "25"

var second_clip_episode = "02"
var second_clip_number = "31"

var transition_length = 24 // one second transition 
var current_frame = 0
var contractLowerEnd = 0 // how much can the selection be contracted without being empty
var expandUpperEnd = 0
var expand_amt = 0

var first_episode_string = "S01E"+first_clip_episode
var first_clip_string = first_episode_string+"_"+first_clip_number
var first_clip_directory = footage_path_prefix+first_episode_string+"/"+first_episode_string+"_masks/"+first_clip_string+"/"

var firstClipFolder = Folder(first_clip_directory)
var firstClipFileList = firstClipFolder.getFiles()
var firstClipNumFrames = firstClipFileList.length


var second_episode_string = "S01E"+second_clip_episode
var second_clip_string = second_episode_string+"_"+second_clip_number
var second_clip_directory = footage_path_prefix+second_episode_string+"/"+second_episode_string+"_masks/"+second_clip_string+"/"

var secondClipFolder = Folder(second_clip_directory)
var secondClipFileList = secondClipFolder.getFiles()
var secondClipNumFrames = secondClipFileList.length

// THE LOOP
while(current_frame < transition_length ) {

var first_clip_path = firstClipFileList[firstClipNumFrames-transition_length+current_frame]
var firstClipFile = File(first_clip_path)
var firstClipDoc = app.open(firstClipFile)

var second_clip_path = secondClipFileList[current_frame]
var secondClipFile = File(second_clip_path)
var secondClipDoc = app.open(secondClipFile)

// select everything in the second document, copy it, close the document, paste it in place in the first
app.activeDocument = secondClipDoc
activeDocument.selection.selectAll()
activeDocument.artLayers[0].copy()
activeDocument.close(SaveOptions.DONOTSAVECHANGES)

app.activeDocument = firstClipDoc
pasteInPlace()

// rename the layers for clarity
//app.activeDocument.activeLayer = app.activeDocument.layers.itemByName("Layer 1")
var firstFootageLayer = app.activeDocument.layers["Layer 1"]
var secondFootageLayer = app.activeDocument.layers["Layer 2"]

firstFootageLayer.name = "FirstFootage"
secondFootageLayer.name = "SecondFootage"

var firstMaskLayer = firstFootageLayer.duplicate()
firstMaskLayer.name = "FirstMask"

var secondMaskLayer = secondFootageLayer.duplicate()
secondMaskLayer.name = "SecondMask"

// move the mask layers, resize the canvas 
preferences.rulerUnits = Units.PIXELS
firstMaskLayer.translate(0, -1080)
secondMaskLayer.translate(0, -1080)

firstClipDoc.resizeCanvas( 1920, 1080, AnchorPosition.TOPCENTER )

// crop all the layers
firstClipDoc.crop( [
	0, 0, 1920, 1080
])

// set layers to in-visible except the second mask
firstFootageLayer.visible = false 
secondFootageLayer.visible = false 
firstMaskLayer.visible = false 

// select the mask
preferences.rulerUnits = Units.PERCENT
firstClipDoc.resizeCanvas(200, 200)
preferences.rulerUnits = Units.PIXELS

var selectionRef = app.activeDocument.selection
app.doAction("SelectMask","PolarBearScripts.atn")

if(current_frame == 0) {

	selectionRef.contract(contractLowerEnd)

	var isSelectionActive = false

	try { isSelectionActive = (selectionRef.bounds) ? true : false; }
	catch(e) { isSelectionActive = false; }

	while(isSelectionActive) {
		app.doAction("SelectMask","PolarBearScripts.atn")
		contractLowerEnd += 20
		var contract_amt = contractLowerEnd

		while(contract_amt > 500) {
			selectionRef.contract(500)
			contract_amt -= 500
		}

		selectionRef.contract(contract_amt)

		try      { isSelectionActive = (selectionRef.bounds) ? true : false; }
    	catch(e) { isSelectionActive = false; }
	}

	contractLowerEnd -= 40 // should be 40. might need to make sure the contract is minned at zero 

	// do the same thing, except expand the mask, then invert the selection in order to find the edge 
	// first we'll need to resize the canvas 
	preferences.rulerUnits = Units.PERCENT
	firstClipDoc.resizeCanvas(50, 50)
	preferences.rulerUnits = Units.PIXELS

	app.doAction("SelectMask","PolarBearScripts.atn")
	selectionRef.expand(expandUpperEnd)
	selectionRef.invert()

	try { isSelectionActive = (selectionRef.bounds) ? true : false; }
	catch(e) { isSelectionActive = false; }

	while(isSelectionActive) {
		app.doAction("SelectMask","PolarBearScripts.atn")
		expandUpperEnd += 20

		var expand_amt = expandUpperEnd

		while(expand_amt > 500) {
			selectionRef.expand(500)
			expand_amt -= 500
		}

		selectionRef.expand(expand_amt)
		selectionRef.invert()

		try      { isSelectionActive = (selectionRef.bounds) ? true : false; }
    	catch(e) { isSelectionActive = false; }
	}

	//expandUpperEnd -= 20

	preferences.rulerUnits = Units.PERCENT
	firstClipDoc.resizeCanvas(200, 200)
	preferences.rulerUnits = Units.PIXELS

	app.doAction("SelectMask","PolarBearScripts.atn")
	selectionRef.contract(contractLowerEnd)
	// selectionRef.expand(200)

} else {
	var percentage_time = current_frame / transition_length
	percentage_time = Math.pow(percentage_time, 2)

	var fade_cutoff = contractLowerEnd / (contractLowerEnd + expandUpperEnd)

	if(percentage_time < fade_cutoff ) {
		var contract_amt = (1 - percentage_time * (1/fade_cutoff) ) * contractLowerEnd
		selectionRef.contract(contract_amt)
	} else {
		expand_amt = ( (percentage_time - fade_cutoff) * (1/(1-fade_cutoff)) ) * expandUpperEnd
		while(expand_amt > 500) {
			selectionRef.expand(500)
			expand_amt -= 500
		}
		selectionRef.expand(expand_amt)
	}

	// if(percentage_time < 0.5) {
	// 	var contract_amt = (1 - percentage_time * 2) * contractLowerEnd
	// 	selectionRef.contract(contract_amt)
	// } else {
	// 	expand_amt = ( (percentage_time - 0.5) * 2. ) * expandUpperEnd
	// 	while(expand_amt > 500) {
	// 		selectionRef.expand(500)
	// 		expand_amt -= 500
	// 	}
	// 	selectionRef.expand(expand_amt)
	// }
}

// make a new layer for the overall mask, fill it in
var secondFootageMaskLayer = activeDocument.artLayers.add()
secondFootageMaskLayer.name = "SecondFootageMask"

app.activeDocument.activeLayer = secondFootageMaskLayer

var whiteColor = new SolidColor;  
whiteColor.rgb.red = 255  
whiteColor.rgb.green = 255  
whiteColor.rgb.blue = 255

selectionRef.fill(whiteColor)

// make the new bear mask for the second layer 
// make a new layer with the original second layer bear mask, copy the new overall mask, invert selection, and delete 
var secondBearMaskNewLayer = secondMaskLayer.duplicate()
secondBearMaskNewLayer.name = "SecondBearMaskNew"
secondMaskLayer.visible = false
secondBearMaskNewLayer.visible = false
app.activeDocument.activeLayer = secondFootageMaskLayer

app.doAction("SelectMask","PolarBearScripts.atn")
selectionRef.invert()
secondFootageMaskLayer.visible = false
secondBearMaskNewLayer.visible = true
app.activeDocument.activeLayer = secondBearMaskNewLayer
selectionRef.clear() // was cut ad.edit

// make the new overall bear mask 
var overallBearMaskLayer = firstMaskLayer.duplicate()
overallBearMaskLayer.name = "OverallBearMask"
overallBearMaskLayer.visible = false
secondBearMaskNewLayer.visible = false
secondFootageMaskLayer.visible = true
app.doAction("SelectMask","PolarBearScripts.atn")
secondFootageMaskLayer.visible = false
overallBearMaskLayer.visible = true
app.activeDocument.activeLayer = overallBearMaskLayer
selectionRef.clear()
overallBearMaskLayer.visible = false
secondBearMaskNewLayer.visible = true
app.doAction("SelectMask","PolarBearScripts.atn")
overallBearMaskLayer.visible = true
secondBearMaskNewLayer.visible = false
selectionRef.fill(whiteColor)

// copy the second layer footage into a new layer 
var maskedSecondFootageLayer = secondFootageLayer.duplicate()
maskedSecondFootageLayer.name = "MaskedSecondFootage"
maskedSecondFootageLayer.visible = false
overallBearMaskLayer.visible = false
secondFootageMaskLayer.visible = true
app.doAction("SelectMask","PolarBearScripts.atn")
selectionRef.feather(10 + expand_amt * 0.1)
secondFootageMaskLayer.visible = false
maskedSecondFootageLayer.visible = true
app.activeDocument.activeLayer = maskedSecondFootageLayer
selectionRef.invert()
selectionRef.clear()

// rearrange everything into mask arrangement 
preferences.rulerUnits = Units.PERCENT
firstClipDoc.resizeCanvas(50, 50)
preferences.rulerUnits = Units.PIXELS
firstFootageLayer.visible = true
overallBearMaskLayer.visible = true

preferences.rulerUnits = Units.PERCENT
firstClipDoc.resizeCanvas(100, 200, AnchorPosition.TOPCENTER)
preferences.rulerUnits = Units.PIXELS
overallBearMaskLayer.translate(0, 1080)

// save as a mask document here 

// copy to new document, run the script to generate output footage
selectionRef.selectAll()
selectionRef.copy(true)

var outputDoc = app.documents.add(1920, 2160)
app.activeDocument = outputDoc
pasteInPlace()
app.activeDocument.layers["Background"].remove()
//app.doAction("PBBatch1","PolarBearProcesses.atn")

// THE NEW OUTPUT CODE
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

// OLD CODE: SAVE OUTPUT
var output_file_path = footage_path_prefix+"Transitions/transition_"+pad(current_frame, 4)+".png"
var mask_file_path = footage_path_prefix+"TransitionMasks/transition_"+pad(current_frame, 4)
var mask_file = new File(mask_file_path)
var output_file = new File(output_file_path)
var pngSaveOptions = new PNGSaveOptions()
outputDoc.saveAs(output_file, pngSaveOptions)
app.activeDocument = firstClipDoc
firstClipDoc.saveAs(mask_file)
app.activeDocument = outputDoc
outputDoc.close(SaveOptions.DONOTSAVECHANGES)
firstClipDoc.close(SaveOptions.DONOTSAVECHANGES)

current_frame += 1
expand_amt = 0 // reset so feather doesn't do anything weird 
}