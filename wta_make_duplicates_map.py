# given two directories, of which A contains the source files and B is an ordered subset 
# return an array in which the index corresponds to the position of a file in the ordered version, and its data is the index of the original in the source directory 

# also write this array to a text file

import os
import hashlib

root_directory = ""
ordered_sequence_directory = "RoughSequence"
interleaved_sequence_directory = "ImagesInterleaved"
sequence_map_filename = "image_sequence_map.txt"
sequence_map_filepath = os.path.join(root_directory, sequence_map_filename)

sequence_map_file = open(sequence_map_filepath, "w +")

interleaved_seq_hashes = []
sequence_map = []

ordered_sequence_path = os.path.join(root_directory, ordered_sequence_directory)
interleaved_sequence_path = os.path.join(root_directory, interleaved_sequence_directory)

def hashfile(path, blocksize = 65536):
    afile = open(path, 'rb')
    hasher = hashlib.md5()
    buf = afile.read(blocksize)
    while len(buf) > 0:
        hasher.update(buf)
        buf = afile.read(blocksize)
    afile.close()
    return hasher.hexdigest()

for dirName, subdirs, fileList in os.walk(interleaved_sequence_path):
	interleaved_seq_filelist = sorted(fileList)
	for filename in interleaved_seq_filelist:
		# Get the path to the file
		path = os.path.join(dirName, filename)
		print("hashing file "+filename)
		file_hash = hashfile(path)
		interleaved_seq_hashes.append(file_hash)

for dirName, subdirs, fileList in os.walk(ordered_sequence_path):
	ordered_seq_filelist = sorted(fileList)
	for filename in ordered_seq_filelist:
		# Get the path to the file
		if filename.endswith(".png"):
			path = os.path.join(dirName, filename)
			file_hash = hashfile(path)
			print("finding a match for "+filename)
			interleaved_index = interleaved_seq_hashes.index(file_hash) / 3
			sequence_map.append(interleaved_index)
			sequence_map_file.write(str(interleaved_index)+"\n")
			print("found a match at index "+str(interleaved_index))

sequence_map_file.close()

for idx in sequence_map:
	print(idx)