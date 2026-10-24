"""Render a 120-second film from unmodified CUA screenshots and credited media.

Screenshot crops, zooms and focus rings are editorial motion, never simulated UI.
Run with ai-service/.venv/bin/python launch-film/render-film.py [--preview]
"""
from pathlib import Path
from functools import lru_cache
import argparse
import json
import math
import re
import subprocess
import textwrap
import wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'renders'
OUT.mkdir(exist_ok=True)
W,H,FPS=1920,1080,30
CREAM='#FAF8F3'; NAVY='#203049'; GREEN='#497663'; INK='#1E2A40'; MUTED='#687382'
PLAN=json.loads((ROOT/'edit-plan.json').read_text())

@lru_cache(None)
def font(size,weight='regular'):
    if weight=='serif':
        return ImageFont.truetype('/System/Library/Fonts/Supplemental/Georgia Italic.ttf',size)
    return ImageFont.truetype('/System/Library/Fonts/Avenir Next.ttc',size,index={'regular':7,'medium':5,'bold':2}[weight])

def ease(v):
    v=min(1,max(0,v));return v*v*(3-2*v)

def centered(draw,y,text,size,color=INK,weight='regular'):
    f=font(size,weight);width=draw.textlength(text,font=f)
    draw.text(((W-width)/2,y),text,font=f,fill=color)

def wrap_pixels(text,f,width):
    lines=[];line=''
    for word in text.split():
        candidate=(line+' '+word).strip()
        if f.getlength(candidate)>width and line:lines.append(line);line=word
        else:line=candidate
    if line:lines.append(line)
    return lines

def caption_data():
    captions=[]
    for scene in PLAN['scenes']:
        words=json.loads((ROOT/'audio'/(scene['id']+'-words.json')).read_text())['words']
        script=scene['narration'].replace('L S F','LSF').split()
        norm=lambda s:re.sub(r'[^a-z0-9]','',s.lower())
        assert [norm(x) for x in script]==[norm(x['word']) for x in words],scene['id']
        chunk=[]
        def emit():
            if not chunk:return
            text=' '.join(script[i] for i in chunk)
            lines=textwrap.wrap(text,42,break_long_words=False)
            assert len(lines)<=2,text
            start=scene['voice_start']+words[chunk[0]]['start']
            end=scene['voice_start']+words[chunk[-1]]['end']+0.14
            captions.append({'start':round(start,3),'end':round(min(end,scene['end']-.15,118),3),'text':'\n'.join(lines)})
        for i,item in enumerate(words):
            proposed=' '.join(script[j] for j in chunk+[i])
            if chunk and (len(proposed)>74 or item['end']-words[chunk[0]]['start']>3.7 or item['start']-words[chunk[-1]]['end']>.45):
                emit();chunk=[]
            chunk.append(i)
            if script[i].endswith(('.', '?', '!')) and len(proposed)>=18:
                emit();chunk=[]
        emit()
    for a,b in zip(captions,captions[1:]):a['end']=min(a['end'],b['start']-.025)
    # Keep brief words such as "Pause" and the closing tagline readable.
    merged=[]
    for item in captions:
        if merged:
            previous=merged[-1]
            combined=previous['text'].replace('\n',' ')+' '+item['text'].replace('\n',' ')
            if (min(previous['end']-previous['start'],item['end']-item['start'])<1
                    and item['start']-previous['end']<1.1
                    and item['end']-previous['start']<4.5 and len(combined)<=74):
                previous['end']=item['end']
                previous['text']='\n'.join(textwrap.wrap(combined,42,break_long_words=False))
                continue
        merged.append(item)
    captions=merged
    def stamp(t):
        ms=round(t*1000);return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'
    srt='\n\n'.join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(captions))+'\n'
    (OUT/'EduSign-launch.en.srt').write_text(srt)
    (OUT/'captions.json').write_text(json.dumps(captions,indent=2))
    return captions

CAPTIONS=caption_data()

# All bounds below are crops of real screenshots, never recreated app screens.
SHOTS=[
 dict(a=0,b=3.7,kind='opening'),
 dict(a=3.7,b=6.7,kind='logo'),
 dict(a=6.7,b=12,file='03-home-en',crop=(400,250,3050,1770),title='A welcoming place to begin.',chapter='01 / CONNECTION'),
 dict(a=12,b=16,file='01-home-fr',crop=(400,250,3050,1770),title='Discover. Practise. Learn together.',chapter='02 / YOUR LANGUAGE',tag='FR · Interface française'),
 dict(a=16,b=20,file='03-home-en',crop=(400,250,3050,1770),title='Discover. Practise. Learn together.',chapter='02 / YOUR LANGUAGE',tag='EN · English interface'),
 dict(a=20,b=24,file='04-catalogue',crop=(450,270,3010,1930),title='Two discoveries. One first step.',chapter='02 / EXPLORE'),
 dict(a=24,b=28,file='04-catalogue',crop=(470,900,3000,1910),title='Choose where to begin.',chapter='02 / EXPLORE'),
 dict(a=28,b=34,file='05-alphabet',crop=(450,280,3010,1980),title='Start with the alphabet and numbers.',chapter='03 / WATCH & LEARN'),
 dict(a=34,b=41,file='06-alphabet-player',crop=(490,250,2960,1810),title='Observe. Pause. Look again.',chapter='03 / WATCH & LEARN',credit='Alphabet resource · MAE Langue des Signes'),
 dict(a=41,b=48,file='07-numbers',crop=(450,280,3010,1980),title='Make a little room for discovery.',chapter='03 / WATCH & LEARN',credit='Numbers resource · Dico Plus LSF'),
 dict(a=48,b=54.4,file='08-camera-ready',crop=(545,290,2210,2000),kind='split',words=['Your turn.','Your pace.'],subtitle='Camera practice · ready state',title='Watch. Try. Reflect.',chapter='04 / TRY IT YOURSELF',notice='Experimental gesture analysis'),
 dict(a=54.4,b=57,file='09-quiz-question',crop=(545,255,2220,1230),title='A question to build understanding.',chapter='04 / TRY IT YOURSELF',notice='Experimental gesture analysis'),
 dict(a=57,b=65,file='10-quiz-explanation',crop=(545,280,2220,1570),title='An answer. And an explanation.',chapter='04 / TRY IT YOURSELF',notice='Experimental gesture analysis'),
 dict(a=65,b=68,file='13-assistant-query',crop=(620,480,2840,1990),title='A little guidance, when you need it.',chapter='05 / THE ASSISTANT'),
 dict(a=68,b=70.6,file='24-lsf-demonstration',crop=(1775,650,2815,1270),kind='split',words=['Hello.','Bonjour.'],subtitle='A real lookup in the sourced LSF collection.',title='A supported word. A sourced result.',chapter='05 / THE ASSISTANT',credit='Lookup result screenshot · player image not captured'),
 dict(a=70.6,b=73.6,kind='source',title='Meet the sourced demonstration.',chapter='05 / THE ASSISTANT',credit='Bonjour · Elix — Signes de sens · CC BY-SA 4.0'),
 dict(a=73.6,b=76.4,file='12-assistant-project',crop=(620,485,2835,2000),title='Know which collection you’re exploring.',chapter='05 / THE ASSISTANT',notice='Project collection · sign language unverified'),
 dict(a=76.4,b=80,file='15-coach-plan',crop=(1800,650,2810,1740),kind='split',words=['A plan.','A next step.'],subtitle='A genuine response from the bilingual coach.',title='Guidance that gives you a starting point.',chapter='05 / THE ASSISTANT'),
 dict(a=80,b=81.8,file='17-coach-question',crop=(1790,650,2810,1540),kind='split',words=['Think.','Try.'],subtitle='A real comprehension question.',title='Make learning a conversation.',chapter='05 / THE ASSISTANT'),
 dict(a=81.8,b=83.5,file='18-coach-feedback',crop=(1790,650,2810,1540),kind='split',words=['Reflect.','Continue.'],subtitle='The actual response to the selected answer.',title='Make learning a conversation.',chapter='05 / THE ASSISTANT'),
 dict(a=83.5,b=89,file='16-coach-voice',crop=(1800,1080,2810,1990),kind='split',words=['Read it.','Hear it.'],subtitle='Voice controls in the real assistant.',title='Another way to connect.',chapter='05 / THE ASSISTANT'),
 dict(a=89,b=91,file='20-demo-report',crop=(815,330,2640,1920),title='Make room for small, regular steps.',chapter='06 / LEARN TOGETHER',tag='Demo account · actual records'),
 dict(a=91,b=93.5,file='21-report-results',crop=(820,380,2640,1800),title='Activity and understanding, together.',chapter='06 / LEARN TOGETHER',tag='Demo account · actual quiz result'),
 dict(a=93.5,b=97,file='22-parent-guide',crop=(480,340,2990,1900),title='The best role? Learning by their side.',chapter='06 / LEARN TOGETHER'),
 dict(a=97,b=100,file='23-lesson-sharing',crop=(480,600,3000,1680),title='One discovery, shared.',chapter='06 / LEARN TOGETHER'),
 dict(a=100,b=106,file='21-report-results',crop=(820,380,2640,1800),title='Activity and understanding, together.',chapter='06 / LEARN TOGETHER',tag='Demo account · actual quiz result'),
 dict(a=106,b=111,file='03-home-en',crop=(400,250,3050,1770),title='Discover French Sign Language, together.',chapter='07 / A NEW BEGINNING'),
 dict(a=111,b=118,kind='closing'),
 dict(a=118,b=120,kind='hold'),
]
assert SHOTS[0]['a']==0 and SHOTS[-1]['b']==120
assert all(a['b']==b['a'] for a,b in zip(SHOTS,SHOTS[1:]))

@lru_cache(None)
def capture(name):return Image.open(ROOT/'footage'/(name+'.png')).convert('RGB')

@lru_cache(None)
def mask(size,radius):
    m=Image.new('L',size,0);ImageDraw.Draw(m).rounded_rectangle((0,0,size[0]-1,size[1]-1),radius,fill=255);return m

@lru_cache(None)
def shadow(size):
    layer=Image.new('RGBA',(size[0]+80,size[1]+80));d=ImageDraw.Draw(layer)
    d.rounded_rectangle((32,35,size[0]+48,size[1]+46),24,fill=(20,34,53,30))
    return layer.filter(ImageFilter.GaussianBlur(16))

def panel(canvas,im,box,zoom=1.0,anchor=(.5,.5)):
    x,y,bw,bh=box
    ratio=min(bw/im.width,bh/im.height)
    size=(int(im.width*ratio),int(im.height*ratio))
    # Small motion stays within the shot's real content, using a centre crop.
    cw=im.width/zoom;ch=im.height/zoom
    left=(im.width-cw)*anchor[0];top=(im.height-ch)*anchor[1]
    visible=im.transform(size,Image.Transform.EXTENT,(left,top,left+cw,top+ch),Image.Resampling.BICUBIC)
    x+=int((bw-size[0])/2);y+=int((bh-size[1])/2)
    canvas.paste(shadow(size),(x-40,y-35),shadow(size))
    canvas.paste(visible,(x,y),mask(size,18))
    ImageDraw.Draw(canvas).rounded_rectangle((x,y,x+size[0]-1,y+size[1]-1),18,outline='#DBDFDE',width=1)

def wordmark(canvas,y,scale=1):
    d=ImageDraw.Draw(canvas);size=int(104*scale);label='EduSign';f=font(size,'bold')
    tw=d.textlength(label,font=f);icon_size=int(90*scale);gap=int(25*scale)
    total=tw+icon_size+gap+int(20*scale);x=int((W-total)/2)
    # Original logo icon, cropped directly from the actual captured header.
    icon=capture('03-home-en').crop((495,140,570,214)).resize((icon_size,icon_size),Image.Resampling.LANCZOS)
    canvas.paste(icon,(x,int(y+20*scale)),mask((icon_size,icon_size),int(26*scale)))
    d.text((x+icon_size+gap,y),label,font=f,fill=NAVY)
    dotx=x+icon_size+gap+tw+8*scale
    d.ellipse((dotx,y+35*scale,dotx+14*scale,y+49*scale),fill=GREEN)

SOURCE=[]
def load_source():
    if SOURCE:return
    path=ROOT.parent/'edusign-next/public/signs/bonjour.mp4'
    raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-vf','fps=30','-f','rawvideo','-pix_fmt','rgb24','-'])
    stride=640*480*3
    for i in range(0,len(raw),stride):SOURCE.append(Image.frombytes('RGB',(640,480),raw[i:i+stride]))

def shot_frame(shot,t):
    canvas=Image.new('RGB',(W,H),CREAM);d=ImageDraw.Draw(canvas)
    kind=shot.get('kind','screen');local=t-shot['a'];u=ease(local/(shot['b']-shot['a']))
    if kind=='opening':
        alpha=ease(local/.9);layer=Image.new('RGB',(W,H),CREAM);ld=ImageDraw.Draw(layer)
        ld.text((130,190),'EDUSIGN  /  A PRODUCT STORY',font=font(22,'bold'),fill=GREEN)
        ld.text((130,330),'Every conversation starts',font=font(86,'medium'),fill=NAVY)
        ld.text((130,445),'with connection.',font=font(98,'serif'),fill=GREEN)
        ld.line((135,640,135+int(250*ease(local/2)),640),fill='#D8BCA1',width=4)
        ld.text((135,710),'French Sign Language · For students and families',font=font(28),fill=MUTED)
        canvas=Image.blend(canvas,layer,alpha)
    elif kind=='logo':
        wordmark(canvas,370,1.3)
        centered(d,590,'A welcoming place to begin.',36,MUTED)
        centered(d,790,'Real product screenshots · Editorial motion',22,MUTED)
    elif kind in ('closing','hold'):
        wordmark(canvas,280 if kind=='closing' else 390,1.25)
        if kind=='closing':
            centered(d,500,'Watch. Try. Connect.',68,NAVY,'medium')
            centered(d,615,'Discover French Sign Language, together.',32,GREEN)
        centered(d,860,'AI-generated narration',22,MUTED)
        centered(d,900,'Animated walkthrough using actual EduSign screenshots',20,MUTED)
    else:
        d.text((72,27),shot['chapter'],font=font(17,'bold'),fill=GREEN)
        d.text((72,56),shot['title'],font=font(35,'medium'),fill=NAVY)
        d.text((1510,32),'EDUSIGN  /  PRODUCT TOUR',font=font(16,'bold'),fill=MUTED)
        if kind=='source':
            load_source();i=min(len(SOURCE)-1,int(local*FPS))
            d.text((125,280),'Bonjour.',font=font(72,'medium'),fill=NAVY)
            d.text((130,382),'Hello, in LSF.',font=font(38,'serif'),fill=GREEN)
            d.text((130,490),'SOURCE VIDEO',font=font(18,'bold'),fill=GREEN)
            for j,line in enumerate(['Elix — Signes de sens','Original LSF resource','Shown as a separate source clip.']):
                d.text((130,532+j*38),line,font=font(25),fill=MUTED)
            panel(canvas,SOURCE[i],(745,155,1040,755))
        else:
            im=capture(shot['file']).crop(shot['crop'])
            if kind=='split':
                for j,line in enumerate(shot['words']):
                    d.text((120,280+j*90),line,font=font(72,'medium' if j==0 else 'serif'),fill=NAVY if j==0 else GREEN)
                for j,line in enumerate(wrap_pixels(shot['subtitle'],font(25),475)):
                    d.text((125,535+j*37),line,font=font(25),fill=MUTED)
                panel(canvas,im,(700,140,1110,785),1.0+.018*u)
            else:
                panel(canvas,im,(70,132,1780,790),1.0+.022*u,anchor=(.5,.4))
        d=ImageDraw.Draw(canvas)
        if shot.get('credit'):
            centered(d,106,shot['credit'],20,MUTED)
        if shot.get('notice'):
            text=shot['notice'];f=font(21,'medium');width=d.textlength(text,font=f)+42
            d.rounded_rectangle((W-width-72,98,W-72,138),11,fill='#F6EBD4')
            d.text((W-width-51,103),text,font=f,fill='#6B4A26')
        if shot.get('tag'):
            text=shot['tag'];f=font(19,'medium');width=d.textlength(text,font=f)+34
            d.rounded_rectangle((72,101,72+width,138),10,fill='#E8F0E9')
            d.text((89,106),text,font=f,fill=GREEN)
    return canvas

def final_frame(t):
    index=next(i for i,s in enumerate(SHOTS) if s['a']<=t<s['b'])
    shot=SHOTS[index];frame=shot_frame(shot,t)
    # Same-shot motion directs attention; short dissolves keep the journey cohesive.
    fade=.27
    if index and t-shot['a']<fade and shot.get('kind')!='hold':
        previous=shot_frame(SHOTS[index-1],SHOTS[index-1]['b']-.001)
        frame=Image.blend(previous,frame,ease((t-shot['a'])/fade))
    d=ImageDraw.Draw(frame)
    active=next((c for c in CAPTIONS if c['start']<=t<c['end']),None)
    if active:
        lines=active['text'].split('\n');f=font(31,'medium')
        width=max(d.textlength(line,font=f) for line in lines)+58
        height=43*len(lines)+20;y=1050-height
        d.rounded_rectangle(((W-width)/2,y,(W+width)/2,1050),15,fill=NAVY)
        for i,line in enumerate(lines):
            tw=d.textlength(line,font=f)
            d.text(((W-tw)/2,y+6+43*i),line,font=f,fill='#FFFFFF')
    if 6.7<=t<111:
        d.line((72,1072,W-72,1072),fill='#E1E5DF',width=2)
        d.line((72,1072,72+(W-144)*t/120,1072),fill=GREEN,width=2)
    return frame

def score():
    rate=48000;length=rate*120
    music=np.zeros((length,2),dtype=np.float32)
    rng=np.random.default_rng(28)
    chords=[[50,57,61,64,69],[45,52,57,59,64],[47,54,57,62,66],[43,50,57,59,62]]
    def note(start,duration,midi,amp,kind,pan):
        start=int(start*rate);n=min(int(duration*rate),length-start)
        if n<=0:return
        t=np.arange(n,dtype=np.float32)/rate;freq=440*2**((midi-69)/12)
        if kind=='pad':
            env=np.minimum(t/1.2,1)*np.minimum((duration-t)/1.8,1)
            signal=(np.sin(2*np.pi*freq*t)+.22*np.sin(2*np.pi*freq*2.002*t)+.12*np.sin(2*np.pi*freq*.998*t))*env
        else:
            env=(1-np.exp(-t*120))*np.exp(-t/1.2)
            signal=(np.sin(2*np.pi*freq*t)+.25*np.sin(2*np.pi*freq*2*t)*np.exp(-t*2)+.10*np.sin(2*np.pi*freq*3*t)*np.exp(-t*4))*env
        gains=[math.cos((pan+1)*math.pi/4),math.sin((pan+1)*math.pi/4)]
        for c in range(2):music[start:start+n,c]+=signal*amp*gains[c]
    # Original restrained ambient composition: 80 BPM, 40 four-beat bars.
    for bar in range(40):
        chord=chords[(bar//2)%4];start=bar*3.0;build=.65+.35*math.sin(math.pi*bar/40)
        for j,midi in enumerate(chord):note(start,5.5,midi,.012*build,'pad',(-.65+j*.32))
        if bar>=2 and bar<37:
            for j,beat in enumerate([0,.75,1.5,2.25]):
                midi=chord[(j+bar)%len(chord)]+12
                note(start+beat,2.7,midi,.025*build*(1 if j==0 else .65),'keys',float(rng.uniform(-.5,.5)))
    for j,midi in enumerate([50,57,61,64,69]):note(115.5+j*.12,4.5-j*.12,midi+12,.035,'keys',-.4+j*.2)
    t=np.arange(length,dtype=np.float32)/rate
    music*=np.minimum(t/3,1)[:,None]*np.clip((120-t)/2.7,0,1)[:,None]
    # Soft stereo reflections; all sound is synthesized locally, no stock samples.
    for delay,gain in [(int(.24*rate),.19),(int(.49*rate),.11)]:music[delay:]+=music[:-delay,::-1].copy()*gain
    with wave.open(str(ROOT/'audio'/'original-score.wav'),'wb') as wav:
        wav.setnchannels(2);wav.setsampwidth(2);wav.setframerate(rate);wav.writeframes((np.clip(music,-.98,.98)*32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg','-v','error','-y','-i',str(ROOT/'audio'/'original-score.wav'),'-i',str(ROOT/'audio'/'EduSign-narration-DRAFT-120s.wav'),'-filter_complex',
      '[0:a]loudnorm=I=-29:TP=-6:LRA=8[m];[1:a]asplit=2[v][side];[m][side]sidechaincompress=threshold=0.025:ratio=5:attack=35:release=550:makeup=1[duck];[v][duck]amix=inputs=2:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=7,atrim=duration=120[out]',
      '-map','[out]','-ar','48000','-c:a','pcm_s16le',str(ROOT/'audio'/'launch-mix.wav')],check=True)

def render(preview):
    load_source()
    if preview:
        times=[2,5,10,14,18,23,26,31,37,44,51,55,60,67,70,72.5,75,80,83,84.5,87,91,95,100,104,109,114,119]
        thumbs=Image.new('RGB',(4*480,7*292),CREAM);d=ImageDraw.Draw(thumbs)
        for i,t in enumerate(times):
            frame=final_frame(t);frame.save(OUT/f'frame-{t:05.1f}.jpg',quality=93)
            thumbs.paste(frame.resize((480,270)),((i%4)*480,(i//4)*292+22))
            d.text(((i%4)*480+8,(i//4)*292+3),f'{t:.1f}s',font=font(14),fill=NAVY)
        thumbs.save(OUT/'film-contact-sheet.jpg',quality=94)
        print('Preview rendered; inspect before final encoding.',flush=True);return
    score()
    video=OUT/'EduSign-launch-120s.mp4'
    log=(OUT/'encode.log').open('w')
    command=['ffmpeg','-hide_banner','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1920x1080','-r','30','-i','-',
             '-i',str(ROOT/'audio'/'launch-mix.wav'),
             '-map','0:v','-map','1:a','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p',
             '-c:a','aac','-b:a','256k','-ar','48000',
             '-metadata','title=EduSign — Watch. Try. Connect.',
             '-metadata','comment=Animated walkthrough of real product screenshots. AI-generated narration. Source clip: Elix — Signes de sens, CC BY-SA 4.0. See accompanying credits.',
             '-t','120','-movflags','+faststart',str(video)]
    proc=subprocess.Popen(command,stdin=subprocess.PIPE,stderr=log)
    try:
        for n in range(3600):
            proc.stdin.write(final_frame(n/FPS).tobytes())
            if n%300==0:print(f'Rendered {n//30}/120 seconds',flush=True)
    finally:proc.stdin.close()
    if proc.wait():raise SystemExit('Encoding failed; see renders/encode.log')
    print(str(video),flush=True)

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--preview',action='store_true')
    render(parser.parse_args().preview)
