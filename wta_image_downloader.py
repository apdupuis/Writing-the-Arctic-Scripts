from google_images_download import google_images_download

output_directory = ""

base_argument_set = {"size":">2MP", "aspect_ratio":"wide", "output_directory":output_directory}

custom_arguments = [
	# 3.14.19
	# { "keywords":"polar bears" },
	# { "keywords":"polar bears meat" },
	# { "keywords":"polar bears eating" },
	# { "keywords":"polar bear reflection" },
	# { "keywords":"polar bears", "color":"red"},
	# { "keywords":"polar bears", "color":"orange"},
	# { "keywords":"polar bears", "color":"yellow"},
	# { "keywords":"polar bears", "color":"green"},
	# { "keywords":"polar bears", "color":"teal"},
	# { "keywords":"polar bears", "color":"blue"},
	# { "keywords":"polar bears", "color":"purple"},
	# { "keywords":"polar bears", "color":"pink"},
	# { "keywords":"polar bears", "color":"white"},
	# { "keywords":"polar bears", "color":"gray"},
	# { "keywords":"polar bears", "color":"black"},
	# { "keywords":"polar bears", "color":"brown"}

	# 3.15.19
	# { "keywords":"polar bears fighting" }

	# 3.16.19
	{ "keywords":"polar bear swimming" },
	{ "keywords":"polar bear underwater" }

]

response = google_images_download.googleimagesdownload()

for argument_list in custom_arguments:
	arguments = base_argument_set.copy()
	arguments.update(argument_list)
	absolute_image_paths = response.download(arguments)

#color: red, orange, yellow, green, teal, blue, purple, pink, white, gray, black, brown
