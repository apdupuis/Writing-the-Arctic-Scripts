# given a set of [downloaded] images 
# process them to have a standardized size 
# scaling + translated, and perhaps discarding, as necessary 
# then save these images 

import cv2
from os import listdir, path

src_directory = ""

directories_list = listdir(src_directory)

output_directory = ""

directory_index = 0
image_file_index = 0
output_file_index = 0

output_width = 1440
output_height = 1080
output_aspect_ratio = output_width / float(output_height)

# these determine how far we can move the image around 
x_offset_max = 0
y_offset_max = 0
x = 0
y = 0

current_directory_name = directories_list[directory_index]
current_directory_path = path.join(src_directory, current_directory_name)
current_directory = listdir(current_directory_path)
file_name = current_directory[image_file_index]
full_path = path.join(current_directory_path, file_name)
img = cv2.imread(full_path)
img_scaled = img

def readImage():
	global image_file_index, file_name, full_path, img, current_directory, directory_index, src_directory, current_directory_path, current_directory_name
	
	if(image_file_index >= len(current_directory)):
		print("index "+str(image_file_index)+" is too high")
		directory_index += 1
		current_directory_name = directories_list[directory_index]
		print("new directory name "+current_directory_name)
		current_directory_path = path.join(src_directory, current_directory_name)
		current_directory = listdir(current_directory_path)
		image_file_index = 0

	file_name = current_directory[image_file_index]
	full_path = path.join(current_directory_path, file_name)
	img = cv2.imread(full_path)
	if(img is None):
		image_file_index += 1
		readImage()

def findNextImage():
	global img, file_name, img_scaled, x, y, x_offset_max, y_offset_max, image_file_index
	isImageTooSmall = True
	readImage()

	while(isImageTooSmall):
		# test if image dimensions sufficiently big
		if(img.shape[1] >= output_width and img.shape[0] >= output_height):
			isImageTooSmall = False
			print("successful image "+current_directory_name+"/"+file_name+": "+str(img.shape[1])+" x "+str(img.shape[0]))

			img_width = img.shape[1]
			img_height = img.shape[0]
			img_aspect_ratio = img_width / float(img_height)

			image_scalar = 1.
			if(img_aspect_ratio < output_aspect_ratio):
				image_scalar = output_width / float(img_width)
			else:
				image_scalar = output_height / float(img_height)

			img_scaled_width = int(img.shape[1] * image_scalar)
			img_scaled_height = int(img.shape[0] * image_scalar)

			img_scaled = cv2.resize(img, (img_scaled_width, img_scaled_height))

			x = (img_scaled_width - output_width) / 2
			y = (img_scaled_height - output_height) / 2

			x_offset_max = img_scaled_width - output_width
			y_offset_max = img_scaled_height - output_height

		else:
			print("failed image "+current_directory_name+"/"+file_name+": "+str(img.shape[1])+" x "+str(img.shape[0]))
			image_file_index += 1
			readImage()

display_scalar = 0.75

findNextImage()

while(1):
	crop_img = img_scaled[y:y+output_height, x:x+output_width]
	display_img = cv2.resize(crop_img, (int(output_width * display_scalar), int(output_height * display_scalar)))
	cv2.imshow("polar bear", display_img)
	k = cv2.waitKey(33)
	if k==27:	# Esc key to stop
    		break
	elif k==-1:  # normally -1 returned,so don't print it
		continue
	elif k==97: # move image offset to the left
		x += 10
	elif k==102: # move image offset to the left
		x += 1
	elif k==100: #move image offset to the right
		x -= 10
	elif k==104: #move image offset to the right
		x -= 1
	elif k==119:
		y += 10
	elif k==116:
		y += 1
	elif k==115:
		y -= 10
	elif k==103:
		y -= 1
	elif k==13:
		output_file_name = "PBYellow_"+str(output_file_index).zfill(4)+".png"
		output_file_path = path.join(output_directory, output_file_name)
		cv2.imwrite(output_file_path, crop_img)
		image_file_index += 1
		output_file_index += 1
		findNextImage()
	elif k==8: #on backspace just skip to next image without saving
		image_file_index += 1
		findNextImage()
	else:
		print k # else print its value

	x = max(0, min(x, x_offset_max) )
	y = max(0, min(y, y_offset_max) )
