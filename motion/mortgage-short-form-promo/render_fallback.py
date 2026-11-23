#!/usr/bin/env python3
"""Детерминированный запасной рендер: используется, когда Chromium недоступен."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).parent
OUT = ROOT / "build" / "fallback"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1280, 720
BLUE, INK, MUTED, PALE, LINE, ORANGE = '#1455f5', '#09264c', '#61718c', '#eaf2fb', '#cbd9e6', '#ff681b'
FONT = ROOT / 'brand' / 'fonts' / 'Manrope-Variable.ttf'

def f(size, weight=500): return ImageFont.truetype(str(FONT), size=size)
def box(d, xy, fill='white', outline=None, r=14, width=1): d.rounded_rectangle(xy, r, fill=fill, outline=outline, width=width)
def txt(d, xy, s, size=16, fill=INK, weight=500, anchor=None): d.text(xy, s, font=f(size, weight), fill=fill, anchor=anchor)
def wrap(d, x, y, text, width, size=16, fill=MUTED, leading=7):
    words=text.split(); lines=[]; cur=''
    for word in words:
        test=(cur+' '+word).strip()
        if d.textbbox((0,0), test, font=f(size))[2] <= width: cur=test
        else: lines.append(cur); cur=word
    if cur: lines.append(cur)
    for i,line in enumerate(lines): txt(d,(x,y+i*(size+leading)),line,size,fill)
    return y+len(lines)*(size+leading)
def button(d, label): box(d,(426,637,854,689),BLUE,r=14); txt(d,(640,663),label,16,'white',750,'mm')
def field(d,y,label,value,disabled=False):
    txt(d,(426,y),label,14,INK,750);box(d,(426,y+23,854,y+75),'#edf5fa' if disabled else 'white',LINE,12,2);txt(d,(440,y+40),value,15,MUTED if disabled else INK)
def chip(d,xy,label,selected=False):
    fill='#e8f5ff' if selected else 'white'; color=BLUE if selected else INK; outline=BLUE if selected else '#d4e0e9';box(d,xy,fill,outline,13,2);txt(d,(xy[0]+12,xy[1]+14),label,13,color,700)
def header(d,step=None):
    txt(d,(426,91),'‹',34,INK,500);txt(d,(463,93),'циан',23,BLUE,800);txt(d,(513,93),'.',23,ORANGE,800)
    if step:
        txt(d,(426,139),f'Шаг {step} из 4',13,MUTED,750);box(d,(426,165,854,169),'#dbe7f1',r=5);box(d,(426,165,426+107*step,169),BLUE,r=5)
def base(index,title,side,sub):
    im=Image.new('RGB',(W,H),PALE);d=ImageDraw.Draw(im)
    d.ellipse((-240,-270,310,280),fill='#ccefff');d.ellipse((1030,475,1450,895),fill='#dce9ff')
    txt(d,(50,43),'циан',30,BLUE,800);txt(d,(116,43),'.',30,ORANGE,800)
    txt(d,(55,145),'ИПОТЕКА · ПОСЛЕ РАСЧЁТА',13,BLUE,800);wrap(d,55,177,title,270,38,INK,5);wrap(d,55,285,sub,280,17,MUTED,6)
    for i in range(6): box(d,(1132+i*22,48,1141+i*22+(20 if i==index else 9),57),BLUE if i==index else '#b9d1e3',r=8)
    box(d,(405,40,875,710),'white',None,38);return im,d
def screen0():
    im,d=base(0,'Поможем с ипотекой','', 'Без документов и выбора банка.');header(d)
    txt(d,(426,220),'Ипотека · после расчёта',13,BLUE,800);txt(d,(426,249),'Поможем с ипотекой',30,INK,750)
    wrap(d,426,297,'Ответьте на несколько вопросов — эксперт подберёт варианты. Без документов и выбора банка.',400,15,MUTED)
    box(d,(426,384,854,492),'#edf8ff','#ccecff',17);txt(d,(442,402),'Ваш ориентировочный платёж',13,'#52708a');txt(d,(442,426),'52 300 ₽ в месяц',23,BLUE,750);txt(d,(442,461),'Семейная ипотека · новостройка',13,'#52708a')
    box(d,(426,515,621,545),'#e8fbf4',r=18);d.ellipse((440,526,447,533),fill='#42d0a1');txt(d,(457,522),'Займёт около 2 минут',13,'#087856',750);button(d,'Продолжить');return im
def screen1():
    im,d=base(1,'Контакты уже заполнены','', 'Можно изменить только почту.');header(d,1);txt(d,(426,205),'Давайте познакомимся',30,INK,750);wrap(d,426,249,'Контакты нужны, чтобы эксперт мог связаться с вами.',400,15,MUTED);field(d,315,'ФИО','Дарья Калинина');field(d,410,'Почта','daria@example.com');field(d,505,'Телефон','+7 999 123-45-67',True);button(d,'Продолжить');return im
def screen2():
    im,d=base(2,'Пара вопросов о планах','', 'Эксперт поймёт, что вам нужно.');header(d,2);txt(d,(426,200),'Расскажите о планах',29,INK,750);txt(d,(426,254),'Когда планируете покупку?',14,INK,750)
    chip(d,(426,280,632,337),'В течение месяца');chip(d,(648,280,854,337),'Через 1–3 месяца',True);chip(d,(426,347,632,404),'Через 3–6 месяцев');chip(d,(648,347,854,404),'Просто изучаю');txt(d,(426,432),'Уже выбрали объект?',14,INK,750);chip(d,(426,457,632,514),'Да, есть объект');chip(d,(648,457,854,514),'Пока выбираю',True);box(d,(426,529,854,607),'#eaf8ff','#d0edff',15);txt(d,(441,544),'Помочь с подбором?',16,INK,750);txt(d,(441,568),'Подберём новостройку с семейной ипотекой.',13,MUTED);chip(d,(441,583,638,626),'Да, нужна помощь',True);return im
def screen3():
    im,d=base(3,'Быстрая оценка бюджета','', 'Без банковской анкеты.');header(d,3);txt(d,(426,205),'Оценим возможности',30,INK,750);wrap(d,426,249,'Это поможет точнее подобрать ипотечные программы.',400,15,MUTED);txt(d,(426,326),'Ваш ежемесячный доход',14,INK,750);chip(d,(426,350,548,394),'До 100 тыс.');chip(d,(558,350,704,394),'100–200 тыс.',True);chip(d,(714,350,854,394),'200–300 тыс.');chip(d,(426,405,580,449),'Больше 300 тыс.');txt(d,(426,494),'Есть кредиты?',14,INK,750);chip(d,(426,519,632,568),'Нет',True);chip(d,(648,519,854,568),'Да');button(d,'Продолжить');return im
def screen4():
    im,d=base(4,'Звонок в удобное время','', 'В ближайшие 3 дня.');header(d,4);txt(d,(426,205),'Когда удобно позвонить?',29,INK,750);wrap(d,426,249,'Выберите время в ближайшие 3 дня.',400,15,MUTED)
    chip(d,(426,322,558,374),'Сегодня · 23 ноя');chip(d,(570,322,710,374),'Завтра · 24 ноя',True);chip(d,(722,322,854,374),'Чт · 26 ноя');chip(d,(426,397,632,445),'10:00–12:00');chip(d,(648,397,854,445),'12:00–15:00');chip(d,(426,456,632,504),'15:00–18:00',True);chip(d,(648,456,854,504),'18:00–21:00');button(d,'Отправить заявку');return im
def screen5():
    im,d=base(5,'Готово','', 'Эксперт позвонит в выбранное время.');header(d);box(d,(566,195,714,343),'#e2f9f0',r=74);txt(d,(640,268),'✓',56,'#16a87b',800,'mm');txt(d,(640,382),'Заявка у эксперта',30,INK,750,'mm');wrap(d,452,423,'Он позвонит в выбранное время и поможет с ипотекой.',375,15,MUTED);box(d,(426,500,854,606),'#edf8ff','#d1edff',16);txt(d,(442,518),'Звонок эксперта',13,MUTED);txt(d,(442,545),'Завтра, 15:00–18:00',16,INK,750);txt(d,(442,574),'Документы пока не нужны.',13,MUTED);txt(d,(640,690),'Короткая анкета вместо банковской формы',14,'#7890a7',750,'mm');return im

for i,fn in enumerate([screen0,screen1,screen2,screen3,screen4,screen5]): fn().save(OUT / f'{i}.png')
