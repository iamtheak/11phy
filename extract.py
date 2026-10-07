import re,json,fitz,shutil
from pathlib import Path
pdf=fitz.open('/workspace/scratch/84b5d9ea1752/upload/neb-class-11-physics-book.pdf')
starts=[1,21,41,73,103,132,154,184,208,222,246,270,289,307,319,336,345,364,378,387,403,416,431,459,487,496,517]
raw=open('/tmp/physics.txt').read();parts=re.split(r'\f\s*Chapter\s+(\d+)\s*\n',raw);out=[]
for i in range(1,len(parts),2):
 n=int(parts[i]);t=parts[i+1]
 clean=re.sub(r'^\s*Physics, Grade 11\s*\|\s*\d+\s*$','',t,flags=re.M).replace('\f','\n')
 ex=re.search(r'^\s*Exercises?\s*$',clean,re.M|re.I)
 body=clean[:ex.start()] if ex else clean
 exercise=clean[ex.end():] if ex else ''
 keymap={}
 table_pattern=r'(?m)^[ \t]*Q[ .]*N[ .]*([0-9. \t]+)\n[ \t]*Ans[ .:]*([A-Da-d \t]+)'
 for km in re.finditer(table_pattern,exercise):
  numbers=re.findall(r'\d+',km.group(1));letters=re.findall(r'[A-Da-d]',km.group(2))
  if len(numbers)==len(letters):keymap.update({int(n):a.upper() for n,a in zip(numbers,letters)})
 exercise=re.sub(table_pattern,'',exercise)
 # Hide bare printed answer rows too; the PDF remains the authoritative complete key.
 exercise=re.sub(r'(?m)^[ \t]*Ans[ \t]+(?:[A-Da-d][ \t]+){2,}[A-Da-d][ \t]*$','',exercise)
 
 # Printed answer tables are kept in the PDF; avoid treating them as question text.
 exercise=re.sub(r'(?ms)^\s*Answer(?:s| to the Multiple Choice Questions:)[^\n]*\n.*?(?=^\s*\d{1,2}\.\s+[A-Z]|\Z)','',exercise)
 matches=list(re.finditer(r'^[ \t]*(\d{1,2})[.)][ \t]+(?=\S)',exercise,re.M));questions=[]
 matches=[m for m in matches if not (n==24 and int(m.group(1))<18)]
 if n==18:
  seen=set(); filtered=[]
  for m in matches:
   num=int(m.group(1))
   if num==3 and num in seen:continue
   filtered.append(m);seen.add(num)
  matches=filtered
 for j,m in enumerate(matches):
  num=int(m.group(1));block=exercise[m.end():matches[j+1].start() if j+1<len(matches) else len(exercise)].strip()
  if not block or num>80:continue
  ans=[]
  # Remove balanced printed answer parentheses without losing the question.
  pos=0;spans=[]
  for am in re.finditer(r'\(\s*Ans(?:wer)?\s*[:;.]?',block,re.I):
   depth=1;k=am.end()
   while k<len(block) and depth:
    if block[k]=='(':depth+=1
    elif block[k]==')':depth-=1
    k+=1
   # Unclosed extraction is retained as a printed-answer excerpt.
   end=k
   ans.append(block[am.end():end-1 if depth==0 else end].strip());spans.append((am.start(),end))
  for a,b in reversed(spans):block=block[:a]+block[b:]
  if num in keymap and len(re.findall(r'\b[a-dA-D]\.[ \t]',block))>=3:
   ans.append('Multiple-choice key (printed): '+keymap[num])
  questions.append({'number':num,'text':block.strip(),'printed':ans})
 sections=[]
 for m in re.finditer(r'^\s*('+str(n)+r'\.\d+(?:\.\d+)?)\s+([^\n]{4,110})',body,re.M):
  title=m.group(2).strip()
  if '×' in title or '→' in title or '=' in title:continue
  if m.group(1) not in [s['number'] for s in sections]:sections.append({'number':m.group(1),'title':title})
 out.append({'id':n,'pdfPage':starts[n-1]+5,'lastPage':starts[n]-1,'text':body.strip(),'sections':sections,'questions':questions})
Path('dist/book.json').write_text(json.dumps(out,ensure_ascii=False))
shutil.copy('/workspace/scratch/84b5d9ea1752/upload/neb-class-11-physics-book.pdf','dist/source.pdf')
print('Extracted',len(out),'chapters;',sum(len(c['questions']) for c in out),'question cards;',sum(bool(q['printed']) for c in out for q in c['questions']),'cards with printed answer excerpts')
