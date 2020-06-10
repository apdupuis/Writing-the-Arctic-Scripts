# downsample an image to 1/5 its size and display it 

import os, sys
import cv2

if __name__ == '__main__':
	if len(sys.argv) > 1:
    		src_file = sys.argv[1]
		img = cv2.imread(src_file)
		downScale1 = 0.2
		img_downScaled1 = cv2.resize(img, (int(img.shape[1] * downScale1), int(img.shape[0] * downScale1)), interpolation=cv2.INTER_AREA)

		img_superDownScale = cv2.resize(img_downScaled1, (16, 12), interpolation=cv2.INTER_AREA)
		img_upScale = cv2.resize(img_superDownScale, (int(img.shape[1] * downScale1), int(img.shape[0] * downScale1)), interpolation=cv2.INTER_NEAREST)

		cv2.imshow("polar bear", img_upScale)
		cv2.waitKey(0)