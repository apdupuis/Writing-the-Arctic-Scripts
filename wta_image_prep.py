# given a set of [downloaded] images (src)
# process them to have a standardized size 
# scaling + translated, and perhaps discarding, as necessary 
# save these processed images to (output)
# sort the original images into those which were used, those which went unused, and those which are,
# by the standards of the output images, unusuable

# todo: mark all the various key commands 

import cv2
import os
import sys
from shutil import move

src_directory = ""
output_directory = ""
used_directory = ""
unused_directory = ""
unusable_directory = ""

output_file_index = 0

output_width = 1440
output_height = 1080
output_aspect_ratio = output_width / float(output_height)

display_scalar = 0.75 #how large is the image we see when editing 

# should delete dups here 

# make a list of files in our directories 
file_list = []
for root, dirnames, filenames in os.walk(src_directory):
    for filename in filenames:
        file_list.append((os.path.join(root, filename), filename))

# iterate over files 
for (file_path, file_name) in file_list:
	img = cv2.imread(file_path)
	if(img is not None):
		# test if too small 
		if(img.shape[1] >= output_width and img.shape[0] >= output_height):
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

			img_scaled = cv2.resize(img, (img_scaled_width, img_scaled_height), interpolation=cv2.INTER_AREA)

			x = (img_scaled_width - output_width) / 2
			y = (img_scaled_height - output_height) / 2

			x_offset_max = img_scaled_width - output_width
			y_offset_max = img_scaled_height - output_height

			image_zoom = image_scalar
			zoom_increase = 1.01
			zoom_decrease = 1/zoom_increase

			# edit image until you save it 

			while(1):
				crop_img = img_scaled[y:y+output_height, x:x+output_width]
				display_img = cv2.resize(crop_img, (int(output_width * display_scalar), int(output_height * display_scalar)), interpolation=cv2.INTER_AREA)
				cv2.imshow("polar bear", display_img)
				k = cv2.waitKey(33)
				if k==27:	# Esc key to stop
			    		sys.exit()
				elif k==-1:  # normally -1 returned,so don't print it
					continue
				elif k==97: # move image offset to the left
					x -= 10
				elif k==102: # move image offset to the left
					x += 1
				elif k==100: #move image offset to the right
					x += 10
				elif k==104: #move image offset to the right
					x -= 1
				elif k==119:
					y -= 10
				elif k==116:
					y += 1
				elif k==115:
					y += 10
				elif k==103:
					y -= 1
				elif k==120: #if x zoom in
					image_zoom *= zoom_increase
					image_zoom = min(image_zoom, 1.)
					img_scaled_width = int(img.shape[1] * image_zoom)
					img_scaled_height = int(img.shape[0] * image_zoom)

					img_scaled = cv2.resize(img, (img_scaled_width, img_scaled_height), interpolation=cv2.INTER_AREA)

					x = (img_scaled_width - output_width) / 2
					y = (img_scaled_height - output_height) / 2

					x_offset_max = img_scaled_width - output_width
					y_offset_max = img_scaled_height - output_height
				elif k==122: #if z zoom out
					image_zoom *= zoom_decrease
					image_zoom = max(image_zoom, image_scalar)
					img_scaled_width = int(img.shape[1] * image_zoom)
					img_scaled_height = int(img.shape[0] * image_zoom)

					img_scaled = cv2.resize(img, (img_scaled_width, img_scaled_height), interpolation=cv2.INTER_AREA)

					x = (img_scaled_width - output_width) / 2
					y = (img_scaled_height - output_height) / 2

					x_offset_max = img_scaled_width - output_width
					y_offset_max = img_scaled_height - output_height
				elif k==13:
					output_file_name = "PBProcessed_"+str(output_file_index).zfill(4)+".png"
					output_file_path = os.path.join(output_directory, output_file_name)
					cv2.imwrite(output_file_path, crop_img)
					output_file_index += 1
					move(file_path, os.path.join(used_directory, file_name))
					break
				elif k==8: #on backspace just skip to next image without saving
					move(file_path, os.path.join(unused_directory, file_name))
					break
				elif k==48: #0, move to the unusable bin
					move(file_path, os.path.join(unusable_directory, file_name))
					break
				else:
					print k # else print its value

				x = max(0, min(x, x_offset_max) )
				y = max(0, min(y, y_offset_max) )
			else:
				move(file_path, os.path.join(unusable_directory, file_name))
		else:
			move(file_path, os.path.join(unusable_directory, file_name))