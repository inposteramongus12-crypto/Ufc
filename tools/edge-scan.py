# reads out/edge/f*.png (rendered at half size), prints the frames where a plate/bubble/card touches the 60 px band
import sys, glob, os
from PIL import Image
import numpy as np
from scipy import ndimage
M = 30  # 60 px at half scale
bad = 0
for fn in sorted(glob.glob(os.path.join(sys.argv[1], 'f*.png'))):
    im = np.asarray(Image.open(fn).convert('RGB')).astype(int)
    h, w, _ = im.shape
    def near(c, t=3): return (abs(im[..., 0] - c[0]) <= t) & (abs(im[..., 1] - c[1]) <= t) & (abs(im[..., 2] - c[2]) <= t)
    navy = near((17, 20, 44))
    cream = near((251, 248, 239)) | near((255, 246, 220))
    for name, mask, minpx in (('plate', navy, 700), ('card', cream, 1500)):
        lab, n = ndimage.label(ndimage.binary_dilation(mask, iterations=2))
        for i, sl in enumerate(ndimage.find_objects(lab), 1):
            ys, xs = sl
            area = (lab[sl] == i).sum()
            if area < minpx: continue
            bw, bh = sl[1].stop - sl[1].start, sl[0].stop - sl[0].start
            white = ((im[sl[0], sl[1], 0] > 215) & (im[sl[0], sl[1], 1] > 215) & (im[sl[0], sl[1], 2] > 200)).sum()
            if name == 'plate' and white < 0.015 * bw * bh: continue
            if name == 'plate' and (bh > 130 or area / (bw * bh) < 0.55 or bw < 2.2 * bh): continue
            if name == 'card' and area / (bw * bh) < 0.6: continue
            x0, x1, y0, y1 = xs.start, xs.stop, ys.start, ys.stop
            sides = []
            if x0 < M: sides.append(f'left {2*(M-x0)}px')
            if x1 > w - M: sides.append(f'right {2*(x1-(w-M))}px')
            if y0 < M: sides.append(f'top {2*(M-y0)}px')
            if y1 > h - M: sides.append(f'bottom {2*(y1-(h-M))}px')
            # skip things that are the frame itself / huge backgrounds
            if (x1 - x0) > w * 0.9 and (y1 - y0) > h * 0.7: continue
            if sides:
                bad += 1
                print(os.path.basename(fn), name, 'at', (2*x0, 2*y0, 2*x1, 2*y1), ', '.join(sides))
print('edge issues:', bad)
