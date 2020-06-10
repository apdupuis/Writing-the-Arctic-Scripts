import os
from shutil import copyfile 

# start with a list of #s corresponding to frames 
# get the filename 
# copy the filename, iterating, to another folder

sequence = [ 139, 261, 31, 136, 153,  ]

input_directory = "C:/Users/alexa/OneDrive/Pictures/Mine/PolarBears/1440PolarBearsProcessed"
output_directory = "C:/Users/alexa/OneDrive/Pictures/Mine/PolarBears/Seq1"

def makeOutputFilename( directory, frame_num ):
	filename = "PBSeq"+str(frame_num).zfill(4)+".png"
	return os.path.join(directory, filename)

def getInputFilename( directory, frame_num):
	filename = "PBProcessed_"+str(frame_num).zfill(4)+".png"
	return os.path.join(directory, filename)

for idx, frame_num in enumerate(sequence):
	copyfile(getInputFilename(input_directory, frame_num), makeOutputFilename(output_directory, idx))