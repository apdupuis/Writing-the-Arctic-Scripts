// processes masked images and outputs the resulting png's
// there are arrays for making exceptions to the contraction amt (for instance if the contraction causes the bear to disappear)
// and one can also use a list to overwrite specific files in a sequence without rewriting the entirety of the sequence

var output_directory = ""
var source_directory = "OnlineImageMasks01"

var doc_width = 1440
var doc_height = 1080

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

// we had to delete 225 - update the processed file list accordingly 
// or, we could just skip it.. 
// delete the mask, actually. that seems easiest. 

// we should probably make an array that specifies source folder, destination folder, and contraction exceptions based on the batch 

// for images 1
// optional exceptions: 190, 204 (more), 207 (just to get a little more lightness), 212 (just a little), 215, 233, 234 (just a bit), 238 (for a bit more lightness), 245
var contraction_exceptions = [ [16, 15], [17, 15], [18, 5], [204, 15], [190, 15], [204, 8], [207,15], [212, 15], [215, 15], [233+1, 15], [234+1, 20], [238+1, 15], [245+1, 15] ]
var overwrite_files = [ 6, 11, 22 ]
// for images 2
// var contraction_exceptions = []

var start_frame = 0

function renderImage(input_path, output_frame, output_still_number, mask_adjustment) {

	var source_image_file = File(input_path)
	var image_doc = app.open(source_image_file)
	app.activeDocument = image_doc

	// renames the first layer to outputSourceLayer 
	var outputSourceLayer = image_doc.layers["Layer 1"]
	outputSourceLayer.name = "OutputSource"

	// duplicates the first layer, renames it to outputBearMaskLayer 
	var outputBearMaskLayer = outputSourceLayer.duplicate()
	outputBearMaskLayer.name = "OutputBearMask"

	// translates the outputBearMask layer so they overlap properly
	preferences.rulerUnits = Units.PIXELS
	outputBearMaskLayer.translate(0, -doc_height)

	// resize the canvas, crop all layers 
	image_doc.resizeCanvas( doc_width, doc_height, AnchorPosition.TOPCENTER )
	image_doc.crop( [
		0, 0, doc_width, doc_height
	])

	var expansion_adjustment = mask_adjustment
	var contraction_adjustment = -mask_adjustment

	// duplicate outputSourceLayer, rename to outputBackgroundLayer
	var outputBearLayer = outputSourceLayer.duplicate()
	outputBearLayer.name = "OutputBear"

	// duplicate outputSourceLayer, rename to outputBackgroundLayer
	var outputBackgroundLayer = outputSourceLayer.duplicate()
	outputBackgroundLayer.name = "OutputBackground"

	// select outputBearMask using Action
	soloLayer("OutputBearMask")
	app.doAction("SelectMask","PolarBearScripts.atn")

	// perform  the appropriate expansion and feathering on the selection 
	var outputSelectionRef = image_doc.selection
	outputSelectionRef.expand(20 + expansion_adjustment)

	// toggle outputBackgroundLayer, content fill 
	soloLayer("OutputBackground")
	image_doc.activeLayer = outputBackgroundLayer
	app.doAction("ContentFill_Hi","PolarBearScripts.atn")

	// toggle visibility for outputBearMask and select. perform contraction
	soloLayer("OutputBearMask")
	app.doAction("SelectMask","PolarBearScripts.atn")
	outputSelectionRef.feather(5)
	
	// exceptions for frames with little content 

	var contraction_amt = 30

	for( ex_idx = 0; ex_idx < contraction_exceptions.length; ex_idx++ ) {
		if( output_frame == contraction_exceptions[ex_idx][0] ) {
			contraction_amt = contraction_exceptions[ex_idx][1]
		}
	}

	outputSelectionRef.contract(contraction_amt + contraction_adjustment)
	
	outputSelectionRef.invert()

	// toggle visibility on outputBearLayer, set to active layer, run content-fill
	soloLayer("OutputBear")
	image_doc.activeLayer = outputBearLayer
	app.doAction("ContentFill_Hi","PolarBearScripts.atn")

	// make outputBackgroundLayer visible 
	outputBackgroundLayer.visible = true

	// expand canvas to twice its width 
	image_doc.resizeCanvas( doc_width*2, doc_height )

	// translate outputBackgroundLayer to the left, outputBearLayer to the right
	outputBearLayer.translate( doc_width * 0.5, 0)
	outputBackgroundLayer.translate( -doc_width * 0.5, 0)

	// OLD CODE: SAVE OUTPUT
	var output_file_name = "OnlineImageRendered01_"+pad(output_frame, 4)+"_"+pad(output_still_number, 2)+".png"
	var output_file_path = output_directory+output_file_name
	var output_file = new File(output_file_path)
	var pngSaveOptions = new PNGSaveOptions()
	// app.displayDialogs = DialogModes.NO
	image_doc.saveAs(output_file, pngSaveOptions)

	image_doc.layers["OutputBackground"].remove()
	image_doc.layers["OutputBear"].remove()

	image_doc.resizeCanvas( doc_width, doc_height )

	image_doc.close(SaveOptions.DONOTSAVECHANGES)
}

app.displayDialogs = DialogModes.NO

var source_file_list = Folder(source_directory).getFiles()
var num_source_files = source_file_list.length

for(image_index = start_frame; image_index < num_source_files; image_index++) {
	var source_image_path = source_file_list[image_index]

	// for( ex_idx = 0; ex_idx < contraction_exceptions.length; ex_idx++ ) {
	// 	if( image_index == contraction_exceptions[ex_idx][0] ) {
	// 		renderImage(source_image_path, image_index, 0, 0);
	// 	}
	// }

	if(overwrite_files.includes(image_index)) {
		renderImage(source_image_path, image_index, 2, 2);
	}

	// renderImage(source_image_path, image_index, 1, 1);
	

	// renderImage(source_image_path, image_index, 0, 0);
}