# given one or more source folders, interleave their contents with a consistent filename in the new folder (copy, don't move)
# if files exist in the dst folder, add to the end 

# Used in this case when rendering multiple processed versions of a sequence, then interleaving these processed 
# versions together

import os
from shutil import copyfile 

root_directory = ""
dst_directory = "ImagesInterleaved"
src_directories = [ "ImageRendered_00", "ImageRendered_01", "ImageRendered_02" ]
dst_directory_path = os.path.join(root_directory, dst_directory)
num_existing_files = 0

for dirName, subdirs, fileList in os.walk(dst_directory_path):
	num_existing_files = len(fileList)

for src_directory_index, src_directory in enumerate(src_directories):
	src_directory_path = os.path.join(root_directory, src_directory)
	for dirName, subdirs, fileList in os.walk(src_directory_path):
		fileListSorted = sorted(fileList)
		for file_index, filename in enumerate(fileListSorted):
			filepath = os.path.join(dirName, filename)
			interleaved_index = file_index * len(src_directories) + src_directory_index + num_existing_files
			interleaved_filename = "OnlineImagesInterleaved_"+str(interleaved_index).zfill(4)+".png"
			interleaved_filepath = os.path.join(dst_directory_path, interleaved_filename)
			copyfile(filepath, interleaved_filepath)
			print(str(src_directory_index)+", "+str(interleaved_index))