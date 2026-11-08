cd /workspaces/kelvora/kelvora
python3 - <<'EOF'
import os,re,time
OUT='KELVORA_FULL_CODE.txt'
SKIPD={'node_modules','dist','.git','.firebase','.wrangler','.vscode','__pycache__'}
SKIPF={OUT,'package-lock.json','sa.json','.DS_Store'}
TEXTX={'.js','.jsx','.ts','.tsx','.mjs','.cjs','.css','.html','.json','.md','.txt','.rules','.toml','.webmanifest','.svg','.yml','.yaml','.sh'}
TEXTN={'.firebaserc','.gitignore'}
def skip(n,isd):
    if isd: return n in SKIPD
    return n in SKIPF or n.startswith('.env')
def red(t):
    t=re.sub(r'(gsk_|tvly-|cfut_|sk-ant-)[A-Za-z0-9_-]+',r'\1***HIDDEN***',t)
    t=re.sub(r'-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----','***PRIVATE KEY HIDDEN***',t)
    t=re.sub(r'("private_key"\s*:\s*")[^"]+(")',r'\1***HIDDEN***\2',t)
    return t
def kb(n): return f'{n/1024:.1f} KB'
files=[];binf=[]
for r,ds,fs in os.walk('.'):
    ds[:]=sorted(d for d in ds if not skip(d,True))
    for f in sorted(fs):
        if skip(f,False): continue
        p=os.path.relpath(os.path.join(r,f),'.').replace(os.sep,'/')
        ext=os.path.splitext(f)[1].lower()
        (files if (ext in TEXTX or f in TEXTN) else binf).append(p)
def key(p): return (0 if '/' not in p else 1 if p.startswith('src/') else 2 if p.startswith('worker/') else 3,p)
files.sort(key=key)
sizes={p:os.path.getsize(p) for p in files+binf}
def tree(d,pre=''):
    out=[]
    its=[n for n in os.listdir(d) if not skip(n,os.path.isdir(os.path.join(d,n)))]
    its.sort(key=lambda n:(not os.path.isdir(os.path.join(d,n)),n.lower()))
    for i,n in enumerate(its):
        last=i==len(its)-1;pth=os.path.join(d,n);br='└── ' if last else '├── '
        if os.path.isdir(pth):
            out.append(pre+br+n+'/');out+=tree(pth,pre+('    ' if last else '│   '))
        else:
            rel=os.path.relpath(pth,'.').replace(os.sep,'/')
            tag=' [binary, content not included]' if rel in binf else ''
            out.append(pre+br+n+f'  ({kb(os.path.getsize(pth))}){tag}')
    return out
body=[];lines={}
for p in files:
    t=red(open(p,encoding='utf-8',errors='replace').read());lines[p]=t.count('\n')+1
    body.append('\n'+'#'*80+f'\n# FILE: {p}   ({kb(sizes[p])}, {lines[p]} lines, {os.path.splitext(p)[1] or "no-ext"})\n'+'#'*80+'\n'+t+('' if t.endswith('\n') else '\n')+f'# ===== END OF {p} =====\n')
tot=sum(sizes[p] for p in files)
H=['KELVORA FULL CODE DUMP','Generated: '+time.strftime('%Y-%m-%d %H:%M:%S'),f'Text files included: {len(files)}   Binary files listed only: {len(binf)}   Code size: {kb(tot)}','Secrets (api keys, private keys) are replaced with ***HIDDEN***.','','='*80,'1) FOLDER STRUCTURE','='*80,'kelvora/']+tree('.')+['','='*80,'2) FILE INDEX (path | size | lines)','='*80]+[f'{p}  |  {kb(sizes[p])}  |  {lines[p]} lines' for p in files]+['','='*80,'3) FULL CODE','='*80]
open(OUT,'w',encoding='utf-8').write('\n'.join(H)+'\n'+''.join(body)+'\n===== END OF DUMP =====\n')
print('✅',OUT);print('   files:',len(files),'| code:',kb(tot),'| file:',kb(os.path.getsize(OUT)),'| approx tokens:',os.path.getsize(OUT)//3)
EOF
grep -qx "KELVORA_FULL_CODE.txt" .gitignore 2>/dev/null || echo "KELVORA_FULL_CODE.txt" >> .gitignore
head -60 KELVORA_FULL_CODE.txt