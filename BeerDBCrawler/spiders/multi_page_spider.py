import scrapy

from BeerDBCrawler.items import Beer
#from selenium import webdriver # for dynamic websites rended by JS, like ratebeer

#TODO 
# user comments?
# Images may or may not be added depending on how much data will be extracted
## add ratebeerCrawler
## Ratebeer website rended by JS so selenium needs to be used with scrapy

# css selectors: https://css-tricks.com/almanac/selectors/a/attribute/
#               https://www.w3schools.com/cssref/css_selectors.asp 
# xpath tutorial: https://doc.scrapy.org/en/xpath-tutorial/topics/xpath-tutorial.html


class SingleBAPageSpider(scrapy.Spider):
    name = "single-page-BA" # Spider identifier
    allowed_domains = [ # domains accessible by the crawler
        "www.beeradvocate.com"
    ]
    start_urls = [ # shortcut for start_requests method and url that will be accessed
        "https://www.beeradvocate.com/beer/profile/23222/78820/"
    ]

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

class SingleUNPageSpider(scrapy.Spider):
    name = "single-page-UN" # Spider identifier
    allowed_domains = [ # domains accessible by the crawler
        "untappd.com"
    ]
    start_urls = [ # shortcut for start_requests method and url that will be accessed
        "https://untappd.com/beer/131332"
    ]
    
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