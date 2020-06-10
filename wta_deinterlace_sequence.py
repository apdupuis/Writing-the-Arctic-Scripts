# Given an input sequence, output a new image sequence consisting of every other frame

import os
from shutil import copyfile
import math

src_directory = ""
dst_directory = ""
output_file_prefix = "filename"

for dirName, subdirs, fileList in os.walk(src_directory):
	src_filelist = sorted(fileList)
	for idx, filename in enumerate(src_filelist):
		# Get the path to the file
		if(idx % 2 == 0):
			halved_index = int(math.floor(idx / 2))
			src_filepath = os.path.join(dirName, filename)
			dst_filepath = os.path.join(dst_directory, output_file_prefix+"_"+str(halved_index).zfill(4)+".png")
			copyfile(src_filepath, dst_filepath)