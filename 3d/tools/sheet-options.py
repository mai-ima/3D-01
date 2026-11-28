"""audit-options.cjs の画像を一覧シートにまとめる: python sheet-options.py <dir> <out_prefix> [cols=5] [rows=3]"""
import sys,glob,os
from PIL import Image,ImageDraw
d,outp=sys.argv[1],sys.argv[2];cols=int(sys.argv[3]) if len(sys.argv)>3 else 5;rows=int(sys.argv[4]) if len(sys.argv)>4 else 3
fs=sorted(glob.glob(d+'/*.png'));W,H=360,360;per=cols*rows
for si in range(0,len(fs),per):
    sh=Image.new('RGB',(W*cols,(H+18)*rows),(20,22,26));dr=ImageDraw.Draw(sh)
    for k,f in enumerate(fs[si:si+per]):
        c,r=k%cols,k//cols;im=Image.open(f).convert('RGB').resize((W,H));sh.paste(im,(c*W,r*(H+18)+18));
        name=os.path.basename(f)[:-4].split('__',1)[1];dr.text((c*W+4,r*(H+18)+3),name[:60],fill=(255,200,60))
    sh.save(f'{outp}_{si//per+1:02d}.png')
print(len(fs),'images')
