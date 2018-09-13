# get heroes images from dotabuff

import requests
from bs4 import BeautifulSoup
import json

f = open('res/heropickerdata.json')
heropickerdata = json.loads(f.read())

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

    heroData = heropickerdata[name]
    actualName = heroData['name']
    rolesStr = ' '.join(heroData['roles'])

    print(filename, actualName, rolesStr)

    json += '<div class="hero_button" name="' + name + '" search="' + actualName
    json += '" roles="' + rolesStr + '"><img src="res/' + filename + '"></div>\n'

    #r = requests.get(src)
    #f = open('res/' + filename, 'bw')
    #f.write(r.content)
    #f.close()

json += ''
f = open('res/list.json', 'w')
f.write(json)
f.close()