# import the necessary packages
import skimage
import numpy as np
import cv2
from shutil import copyfile
from scipy.spatial import distance as dist
import glob #reading files
import os
import re #regex

scores_list = []

directorypath = "ProcessedBears"
outputpath = "SortedBears"

# initialize the index dictionary to store the image name
# and corresponding histograms and the images dictionary
# to store the images themselves
index = {}
images = {}

def mse(imageA, imageB):
	# the 'Mean Squared Error' between the two images is the
	# sum of the squared difference between the two images;
	# NOTE: the two images must have the same dimension

	err = np.sum((imageA.astype("float") - imageB.astype("float")) ** 2)
	err /= float(imageA.shape[0] * imageA.shape[1])
	
	# return the MSE, the lower the error, the more "similar"
	# the two images are
	return err

def mseColor(imageA, imageB):
	# the 'Mean Squared Error' between the two images is the
	# sum of the squared difference between the two images;
	# NOTE: the two images must have the same dimension

	# i1b, i1g, i1r = cv2.split(imageA)
	# i2b, i2g, i2r = cv2.split(imageB)

	err = np.sum((imageA.astype("float") - imageB.astype("float")) ** 2)
	err /= float(imageA.shape[0] * imageA.shape[1])
	
	# return the MSE, the lower the error, the more "similar"
	# the two images are
	return err
 
def compare_images(imageA, imageB, i):
	global scores_list
	# compute the mean squared error and structural similarity
	# index for the images
	print("comparing image "+str(i))
	#m = mse(imageA, imageB)
	#s = skimage.measure.compare_ssim(imageA, imageB)

	scores_list.append([ m, i ])
 
	#print("mean = "+str(m))
	#print("ssim = "+str(s))

# fileprefix = "PBYellow_"

# filepath1 = directorypath+fileprefix+str(15).zfill(4)+".png"
# img1 = cv2.imread(filepath1)
# img1 = cv2.cvtColor(img1, cv2.COLOR_BGR2GRAY)

# for i in range(16,45):
# 	filepath2 = directorypath+fileprefix+str(i).zfill(4)+".png"

# 	img2 = cv2.imread(filepath2)

# 	# convert the images to grayscale
# 	img2 = cv2.cvtColor(img2, cv2.COLOR_BGR2GRAY)
# 	compare_images(img1, img2, i)

# loop over the image paths
results = {}

for imagePath in glob.glob(directorypath + "\\*.png"):
	# extract the image filename (assumed to be unique) and
	# load the image, updating the images dictionary
	filename = imagePath[imagePath.rfind("\\") + 1:]
	print("filename: "+filename)

	image = cv2.imread(imagePath)
	image_hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
	resolution_multiplier = 4 #higher is higher definition
	image_resized = cv2.resize(image_hsv, (4*resolution_multiplier, 3*resolution_multiplier), interpolation=cv2.INTER_AREA)
	images[filename] = image_resized
 
	# extract a 3D RGB color histogram from the image,
	# using 8 bins per channel, normalize, and update
	# the index

	# hist = cv2.calcHist([image_resized], [0, 1, 2], None, [8, 8, 8], [0, 256, 0, 256, 0, 256])
	# hist = cv2.normalize(hist, hist).flatten() #maybe don't use normalize?
	# hist = hist.flatten()

	#USE FOR MSE
	hist = image_resized

	index[filename] = hist

# OPENCV_METHODS = (
# 	("Correlation", cv2.HISTCMP_CORREL),
# 	("Chi-Squared", cv2.HISTCMP_CHISQR),
# 	("Intersection", cv2.HISTCMP_INTERSECT),
# 	("Hellinger", cv2.HISTCMP_BHATTACHARYYA))

for (k, hist) in index.items():
	# compute the distance between the two histograms
	# using the method and update the results dictionary
	# d = cv2.compareHist(index[list(index.keys())[40]], hist, cv2.HISTCMP_CHISQR)
	
	initial_filename = "PBProcessed_0139.png"

	# d = cv2.compareHist(index[initial_filename], hist, cv2.HISTCMP_BHATTACHARYYA)

	d = mseColor(index[initial_filename], hist)

	#d = dist.cityblock(index["PBYellow_0000.png"], hist)
	print("result: "+str(d))
	results[k] = d

# sort the results
results = sorted([(v, k) for (k, v) in results.items()], reverse = False)

for output_index, result in enumerate(results):
	print(str(result[1])+", "+str(result[0]))
	src_file = os.path.join(directorypath, result[1])

	#fine frame num
	regex = re.compile(r'\d+')
	src_frame_number = int(regex.search(result[1]).group(0))

	dst_file = os.path.join(outputpath, "BearSorted"+str(output_index).zfill(4)+"_"+str(src_frame_number).zfill(4)+".png")
	print("source file: "+src_file)
	# print("dest file: "+"BearSorted"+str(output_index).zfill(4)+".png")
	copyfile(src_file, dst_file)