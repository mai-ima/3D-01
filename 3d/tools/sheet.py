"""監査画像を一覧シートにまとめる: python sheet.py <audit_dir> <out_prefix> [per_sheet=3]"""
import sys,glob,os
from PIL import Image,ImageDraw
d,outp=sys.argv[1],sys.argv[2];n=int(sys.argv[3]) if len(sys.argv)>3 else 3
ids=sorted({os.path.basename(f).split('__')[0] for f in glob.glob(d+'/*__all.png')})
W,H=420,510
for si in range(0,len(ids),n):
    grp=ids[si:si+n];sh=Image.new('RGB',(W*len(grp),H*2+26),(20,22,26));dr=ImageDraw.Draw(sh)
    for c,i in enumerate(grp):
        for r,v in enumerate(['all','lamp']):
            im=Image.open(f'{d}/{i}__{v}.png').convert('RGB').resize((W,H));sh.paste(im,(c*W,r*H+(26 if r==0 else 26)))
        dr.text((c*W+8,6),i,fill=(255,200,60))
    sh.save(f'{outp}_{si//n+1}.png')
print(len(ids),'models')
