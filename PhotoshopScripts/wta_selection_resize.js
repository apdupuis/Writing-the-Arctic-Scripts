// Attempt to contract a selection automatically 

var originalUnit = preferences.rulerUnits
preferences.rulerUnits = Units.PIXELS

var docRef = app.activeDocument

docRef.activeLayer = docRef.layers[0]

// docRef.selection.select(shapeRef)

var selRef = app.activeDocument.selection

docRef.resizeCanvas(1920, 1080)

preferences.rulerUnits = Units.PERCENT
docRef.resizeCanvas(200, 200)
preferences.rulerUnits = Units.PIXELS

app.doAction("SelectMask","PolarBearScripts.atn")

var contractLowerEnd = 0
selRef.contract(contractLowerEnd)

var isSelectionActive = false

try { isSelectionActive = (selRef.bounds) ? true : false; }
catch(e) { isSelectionActive = false; }

while(
    isSelectionActive
) {
	app.doAction("SelectMask","PolarBearScripts.atn")
	contractLowerEnd += 50
	selRef.contract(contractLowerEnd)

	try      { isSelectionActive = (selRef.bounds) ? true : false; }
    catch(e) { isSelectionActive = false; }
}

app.doAction("SelectMask","PolarBearScripts.atn")
contractLowerEnd -= 50
selRef.contract(contractLowerEnd)


// preferences.rulerUnits = Units.PERCENT
// docRef.resizeCanvas(50, 50)
// preferences.rulerUnits = Units.PIXELS

app.preferences.rulerUnits = originalUnit

// if the limit for contracting is 200
// the limit for growth is ~450 pixels 