import shutil
import re
import os
from os import path
import subprocess

NAME = 'listenTogether'

popen = subprocess.Popen("spicetify -c", stdout=subprocess.PIPE, shell=True)
popen.wait()
spicetify_folder = path.dirname(popen.stdout.readline().decode("utf-8").strip())
ts_file = f'{NAME}.ts'
ts_precompile_file = f'{NAME}.precompiled.ts'
js_file = path.join(spicetify_folder, "Extensions", f'{NAME}.mjs')

with open(ts_file, 'r') as file :
  ts_contents = file.read()

p = re.compile("^.*import\\s.*$", flags=re.MULTILINE)
imports = p.findall(ts_contents)

for imp in imports:
  ts_contents = ts_contents.replace(imp, "")

with open(ts_precompile_file, 'w') as file:
  file.write(ts_contents)

popen = subprocess.Popen(f"tsc --out {js_file} {ts_precompile_file}", shell=True)
popen.wait()
os.remove(ts_precompile_file)

with open(js_file, 'r+') as f:
  content = f.read()
  f.seek(0, 0)
  imports = filter(lambda imp: '//ts' not in imp, imports)
  imports = map(lambda imp: imp.replace('//mjs', ''), imports)
  f.write("\n".join(imports).rstrip('\r\n') + '\n' + content)
