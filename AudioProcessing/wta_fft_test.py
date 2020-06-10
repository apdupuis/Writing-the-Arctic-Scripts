# Translate an audio file into a FFT representation, saved as an OpenEXR image
# And the complement - interpret an OpenEXR image as FFT, invert it, and save the resulting audio file

# We'll need numpy for some mathematical operations
import numpy as np

# Librosa for audio
import librosa
import cmath
# OpenEXR to read/write images with floating-point pixel values
import OpenEXR
import Imath
import array

# input audio 
audio_path = ''
# output audio
output_path = ''

# input exr file
input_exr_path = ''
# output exr
output_exr_path = ''

y, sr = librosa.load(audio_path, sr=48000)

exrfile = OpenEXR.InputFile(input_exr_path)

dw = exrfile.header()['dataWindow']
sz = (dw.max.x - dw.min.x + 1, dw.max.y - dw.min.y + 1) # sz 1 is the number of slices, sz 0 number of bins 

# Read the three color channels as 32-bit floats
FLOAT = Imath.PixelType(Imath.PixelType.FLOAT)
(Rf,Gf,Bf) = [array.array('f', exrfile.channel(Chan, FLOAT)).tolist() for Chan in ("R", "G", "B") ]

n_fft = 8192
n = len(y)
y_pad = librosa.util.fix_length(y, n + n_fft // 2)
C = librosa.stft(y=y, n_fft=n_fft)

# # C_converted = []

R = []
G = []
B = []

# todo: use phase difference instead of just the phase
previous_phases = []

for slice_idx, c_slice in enumerate(C):
	new_slice = []
	for bin_idx, c_bin in enumerate(c_slice):
		r, phi = cmath.polar(c_bin)
		r /= 3
		R.append(r)

		# delta phase 
		if(slice_idx == 0):
			previous_phases.append(phi)

		else:
			diff_phi = (phi - previous_phases[bin_idx]) % (np.pi * 2.)
			previous_phases[bin_idx] = phi
			phi = diff_phi

		phi += (np.pi * 2.)
		phi /= 1800
		G.append(phi)
		B.append(0)
		# new_bin = cmath.rect(r, phi)

(Rs, Gs, Bs) = [ array.array('f', Chan).tostring() for Chan in (R, G, B) ]

# CONVERT BACK TO SOUND 

out = OpenEXR.OutputFile(output_exr_path, OpenEXR.Header(len(C[0]), len(C)))
out.writePixels({'R' : Rs, 'G' : Gs, 'B' : Bs })

C_output = []

o_previous_phases = []

for o_slice in range(sz[1]):
	new_slice = []
	for o_bin in range(sz[0]):
		index = o_slice * sz[0] + o_bin
		r = Rf[index]
		r *= 3
		phi = Gf[index]
		phi *= 1800
		phi -= (np.pi * 2.)

		# delta phase
		if(o_slice != 0):
			phi += o_previous_phases[o_bin]
			phi = phi % (np.pi * 2.)
			o_previous_phases[o_bin] = phi
		else:
			o_previous_phases.append(phi)

		new_bin = cmath.rect(r, phi)
		new_slice.append(new_bin)
	C_output.append(new_slice)


C_output_np = np.asarray(C_output)

y_hat = librosa.istft(C_output_np, length=n)

librosa.output.write_wav(output_path, y_hat, sr)