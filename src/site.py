import subprocess,re
h=open('index.html').read().replace('<meta name="claude:viewport-fit-sides" content="cover">\n','')
i=h.index('<main'); head,body=h[:i],h[i:]
d=('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
 '<meta property="og:title" content="Abdalrahman\'s Room">\n<meta property="og:description" content="Walk around my pixel room in Amman: networks, AI, video and web.">\n'
 '<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 8 8%22 shape-rendering=%22crispEdges%22%3E%3Crect width=%228%22 height=%228%22 fill=%22%231b1e33%22/%3E%3Cpath d=%22M2 1h4v1H2zM1 2h6v2H1zM2 4h4v3H2z%22 fill=%22%23ff8a2a%22/%3E%3C/svg%3E">\n'
 +head+'</head>\n<body>\n'+body+'</body>\n</html>\n')
a=d.index('<script>')+8; b=d.rindex('</script>')
open('_g.js','w').write(d[a:b])
out=subprocess.run(['terser','_g.js','-c','-m'],capture_output=True,text=True); assert out.returncode==0,out.stderr
ca=d.index('<style>')+7; cb=d.index('</style>')
css=re.sub(r'/\*.*?\*/','',d[ca:cb],flags=re.S); css=re.sub(r'\s*\n\s*','',css)
d=d[:ca]+css+d[cb:a]+out.stdout+d[b:]
open('site/index.html','w').write(d); print(len(d))
