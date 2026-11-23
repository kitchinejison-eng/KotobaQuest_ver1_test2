#!/usr/bin/env python3
"""ことばクエスト: Lv別問題ファイルの検査・一覧出力・編集。標準ライブラリのみ。"""
import argparse,csv,json,pathlib,re,sys
ROOT=pathlib.Path(__file__).resolve().parent
PAT=re.compile(r'\(window\.KotobaLevelFiles\["([^\"]+)"\]=window\.KotobaLevelFiles\["[^\"]+"\]\|\|\{\}\)\[(\d+)\]=(\[.*\]);\s*$',re.S)
def load(path):
 s=path.read_text(encoding='utf-8');m=PAT.search(s)
 if not m: raise ValueError('問題ファイル形式が違います: '+str(path))
 data=json.loads(m.group(3));return m.group(1),int(m.group(2)),data

def save(path,genre,level,rows):
 data=json.dumps(rows,ensure_ascii=False,indent=2)
 path.write_text(f'/* {genre} / Lv.{level} : 問題データ。変更前にバックアップを取ってください。 */\nwindow.KotobaLevelFiles=window.KotobaLevelFiles||{{}};\n(window.KotobaLevelFiles[{json.dumps(genre)}]=window.KotobaLevelFiles[{json.dumps(genre)}]||{{}})[{level}]={data};\n',encoding='utf-8')
def all_files():return sorted(ROOT.glob('*/lv[0-9][0-9].js'))
def validate():
 errors=[];summary=[];total=0
 for path in all_files():
  try:
   genre,level,rows=load(path)
   if genre!=path.parent.name or level!=int(path.stem[2:]):errors.append(f'{path}: ジャンル・Lvがファイル名と不一致')
   if not isinstance(rows,list):errors.append(f'{path}: 配列ではありません');continue
   for i,row in enumerate(rows,1):
    if not isinstance(row,dict):errors.append(f'{path} #{i}: オブジェクトではありません');continue
    if not (row.get('question') or row.get('prompt') or row.get('voiceText') or row.get('statement')):errors.append(f'{path} #{i}: 問題文・刺激がありません')
    if genre not in ('aiConversation','voiceRead') and not any(k in row for k in ('answer','choices','target')):errors.append(f'{path} #{i}: 正解・選択肢・対象がありません')
    if 'difficultyLevel' in row and row['difficultyLevel']!=level:errors.append(f'{path} #{i}: difficultyLevelが不一致')
   summary.append((genre,level,len(rows)));total+=len(rows)
  except Exception as e:errors.append(str(e))
 print(f'検査: {len(summary)}ファイル / {total}問 / {len(errors)}件の注意・エラー')
 for e in errors[:80]:print(' -',e)
 return bool(errors)
def export(dest):
 dest=pathlib.Path(dest);dest.parent.mkdir(parents=True,exist_ok=True)
 with dest.open('w',encoding='utf-8-sig',newline='') as f:
  w=csv.writer(f);w.writerow(['ジャンルID','Lv','問題番号','問題文','正解','ヒント','選択肢','画像','ファイル'])
  for p in all_files():
   genre,level,rows=load(p)
   for i,q in enumerate(rows,1):
    w.writerow([genre,level,i,q.get('question',q.get('prompt','')),q.get('answer',''),q.get('hint',''),' / '.join(map(str,q.get('choices',[]))),q.get('image',''),str(p.relative_to(ROOT))])
 print('CSV出力:',dest)
def main():
 p=argparse.ArgumentParser(description='ことばクエスト Lv別問題ファイル管理')
 sub=p.add_subparsers(dest='cmd',required=True);sub.add_parser('check');ex=sub.add_parser('export');ex.add_argument('path',nargs='?',default='question_list.csv');show=sub.add_parser('show');show.add_argument('genre');show.add_argument('level',type=int)
 args=p.parse_args()
 if args.cmd=='check':sys.exit(1 if validate() else 0)
 if args.cmd=='export':export(args.path)
 if args.cmd=='show':
  path=ROOT/args.genre/f'lv{args.level:02}.js';genre,lv,rows=load(path);print(json.dumps(rows,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
