# get heroes images from dotabuff

import requests
from bs4 import BeautifulSoup


r = requests.get('http://www.dota2.com/heroes')
soup = BeautifulSoup(r.text, 'html.parser')
imgs = soup.find_all(class_="heroHoverLarge")

img_sources = []
for i in imgs:
    img_sources.append(i['src'])

json = ''
for src in img_sources:
    name = src.split('/')[-1].split('?')[0]
    name = name[:-12]
    filename = name + '.png'
    json += '<div class="hero_button" name="' + name + '"><img src="res/' + filename + '"></div>\n'

    print(filename)
    #r = requests.get(src)
    #f = open('res/' + filename, 'bw')
    #f.write(r.content)
    #f.close()

json += ''
f = open('res/list.json', 'w')
f.write(json)
f.close()