import scrapy

from BeerDBCrawler.items import Beer
#from selenium import webdriver # for dynamic websites rended by JS, like ratebeer

#TODO 
# user comments?
# Images may or may not be added depending on how much data will be extracted
## add ratebeerCrawler
## Ratebeer website rended by JS so selenium needs to be used with scrapy

# forgot to add IPA to style search....

# css selectors: https://css-tricks.com/almanac/selectors/a/attribute/
#               https://www.w3schools.com/cssref/css_selectors.asp 
# xpath tutorial: https://doc.scrapy.org/en/xpath-tutorial/topics/xpath-tutorial.html


class BASpider(scrapy.Spider):
    name = "BA" # Spider identifier

    # Remove duplicates from .json
    # and make duplicate/non-duplicate files easier to read and compare
    # result: ~3k duplicates and ~94k non-duplicates
    '''
    with open('links-BA.json') as listOfLinks:
        data = json.load(listOfLinks)
    #print(data)

    print(data[0]["Link"][0])

    seen = []
    dup = []
    for j in range(0, 3884):
        #print("j = " + str(j))
        for x in data[j]["Link"]:
            if x not in seen:
                seen.append(x)
            else:
                dup.append(x)
    with open('noDuplicates.txt', 'w') as f:
        print(seen, file=f) 
    with open('duplicates.txt', 'w') as f:
        print(dup, file=f)
    
    f = open('duplicates.txt', 'r')
    x = f.read().split(',')
    f.close()
    properList = open("duplicatesv2.txt","w")
        for k in range(len(x)):
        properList.write(''.join(x[k].split('\'')[1:-1]) + "\n")
    properList.close()
    

    properList = []
    f = open('duplicates.txt', 'r')
    x = f.read().split(',')
    for k in range(len(x)):
        properList.append(''.join(x[k].split('\'')[1:-1]))
    f.close()
    #print(properList[0])



    f = open('noDuplicates.txt', 'r')
    y = f.read().split(',')
    f.close()
    properList2 = open("noDuplicatesv2.txt","w")
        for k in range(len(y)):
        properList2.write(''.join(y[k].split('\'')[1:-1]) + "\n")
    properList2.close()
    '''


    allowed_domains = [ # domains accessible by the crawler
        "www.beeradvocate.com"
    ]
    start_urls = [ # shortcut for start_requests method and url that will be accessed
        "https://www.beeradvocate.com/beer/profile/23222/78820/"
    ]


    properList = []
    f = open('noDuplicates.txt', 'r')
    x = f.read().split(',')
    for k in range(len(x)):
        properList.append(''.join(x[k].split('\'')[1:-1]))
    f.close()
    #print(properList[0])

    listToCrawl = []
    for url in properList:
        if len(listToCrawl) != 1000:#only 1000 links to start with
            listToCrawl.append(url)
        else:
            break

    for url in listToCrawl:
        newURL = "https://www.beeradvocate.com" + url
        start_urls.append(newURL)

    def parse(self, response): # parse page content
        # instantiate Beer object and extracts the respective info from the page
        item = Beer()
        item['name'] = response.css('div.titleBar h1::text').extract_first()
        item['database'] = "Beer Advocate"
        item['id'] = int(response.url.split('/')[6]) # at most 6 digits for BA beer IDs
        item['brewery'] = response.css('div.titleBar h1 span::text').extract_first()[3:]
        item['rating'] = response.css('span.ba-ravg::text').extract_first()
        item['number_of_ratings'] = response.css('span.ba-ratings::text').extract_first()
        item['ranking'] = response.css('div[id*=item_stats] dd::text').extract_first()[1:]
        item['number_of_reviews'] = response.css('span.ba-reviews::text').extract_first()
        item['pDev'] = response.css('span.ba-pdev::text').extract_first()[1:]
        item['state'] = response.css('div.break a[href*=place] ::text')[0].extract()
        item['country'] = response.css('div.break a[href*=place] ::text')[1].extract()
        item['brewery_website'] = response.css('div.break a[href*=http] ::text').extract_first()
        item['style'] = response.css('div.break a[href*=styles] b::text').extract_first()
        item['abv'] = response.css('div[id*=info_box]::text')[13].extract()[1:-1] #check if works everytime
        item['availability'] = response.css('div[id*=info_box]::text')[15].extract()[1:-1]#remove space and new line
        item['description'] = response.css('div[id*=info_box]::text')[18].extract()[1:]
        item['img_url'] = response.css('div[id*=main_pic_norm] img::attr(src)').extract_first()
        yield item

class UNSpider(scrapy.Spider):
    name = "UN" # Spider identifier
    allowed_domains = [ # domains accessible by the crawler
        "untappd.com"
    ]
    start_urls = [ # shortcut for start_requests method and url that will be accessed
        "https://untappd.com/beer/131332"
    ]

    limitID = 10000 # start with only 10000 pages since many do not exist
    for i in range(0, limitID):
        start_urls.append("https://untappd.com/beer/" + str(i))
    
    def parse(self, response): # parse page content
        item = Beer()
        item['name'] = response.css('div[class=name] h1::text').extract_first()
        item['database'] = "Untappd"
        item['id'] = int(response.url.split('/')[5]) # at most 6 digits for BA beer IDs
        item['brewery'] = response.css('p[class=brewery] a::text').extract_first()
        item['rating'] = response.css('span[class=num]::text').extract_first()[1:-1] # to remove parenthesis
        item['number_of_ratings'] = response.css('p[class=raters]::text').extract_first()[1:-9] # remove "Ratings" text and spaces
        item['date'] = response.css('p[class=date]::text').extract_first()[7:-1] # to remove "Added" text and spaces
        item['ibu'] = response.css('p[class=ibu]::text').extract_first()[1:-1] # spaces
        item['style'] = response.css('p[class=style]::text').extract_first()
        item['abv'] = response.css('p[class=abv]::text').extract_first()[1:-1]
        item['description'] = response.css('div[class=beer-descrption-read-less]::text').extract_first()[1:-1]
        item['img_url'] = response.css('img[class=lazy]::attr(data-original)').extract_first()
        yield item