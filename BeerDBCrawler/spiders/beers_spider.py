import scrapy

from BeerDBCrawler.items import Beer
#from selenium import webdriver # for dynamic websites rended by JS, like ratebeer

#TODO 
## add imgUrls, and comments
## add ratebeerCrawler
## Ratebeer website rended by JS so selenium needs to be used with scrapy


# css slectors: https://css-tricks.com/almanac/selectors/a/attribute/
#               https://www.w3schools.com/cssref/css_selectors.asp 
# xpath tutorial: https://doc.scrapy.org/en/xpath-tutorial/topics/xpath-tutorial.html


class BeerSpiderSingleBAPage(scrapy.Spider):
    name = "beer-single-page-BA" # Spider identifier
    allowed_domains = [ # domains accessible by the crawler
        "www.beeradvocate.com"
    ]
    start_urls = [ # shortcut for start_requests method and url that will be accessed
        "https://www.beeradvocate.com/beer/profile/23222/78820/"
    ]

    def parse(self, response): # parse page content

        beerName = response.css('div.titleBar h1::text').extract_first()
        breweryName = response.css('div.titleBar h1 span::text').extract_first()[3:]
        bAscore = response.css('span.ba-ravg::text').extract_first()
        numberOfRatings = response.css('span.ba-ratings::text').extract_first()
        BA_Ranking = response.css('div[id*=item_stats] dd::text').extract_first()[1:]
        BA_NumberOfReviews = response.css('span.ba-reviews::text').extract_first()
        pDev = response.css('span.ba-pdev::text').extract_first()[1:]
        breweryState = response.css('div.break a[href*=place] ::text')[0].extract()
        breweryCountry = response.css('div.break a[href*=place] ::text')[1].extract()
        breweryWebsite = response.css('div.break a[href*=http] ::text').extract_first()
        style = response.css('div.break a[href*=styles] b::text').extract_first()
        abv = response.css('div[id*=info_box]::text')[13].extract()[1:-1]#check if works everytime
        availability = response.css('div[id*=info_box]::text')[15].extract()[1:-1]#remove space and new line
        description = response.css('div[id*=info_box]::text')[18].extract()[1:]
        beerID = int(response.url.split('/')[6]) # at most 6 digits for BA beer IDs
        #beerImgURL = response.css('div[id*=main_pic_norm] div[style*=position:relative] img src::text').extract()
        
        item = Beer()
        item['name'] = beerName
        item['database'] = "Beer Advocate"
        item['id'] = beerID
        item['brewery'] = breweryName
        item['rating'] = bAscore
        item['number_of_ratings'] = numberOfRatings
        item['ranking'] = BA_Ranking
        item['number_of_reviews'] = BA_NumberOfReviews
        item['pDev'] = pDev
        item['state'] = breweryState
        item['country'] = breweryCountry
        item['brewery_website'] = breweryWebsite
        item['style'] = style
        item['abv'] = abv
        item['availability'] = availability
        item['description'] = description
        yield item

class BeerSpiderSingleUntappdPage(scrapy.Spider):

    name = "beer-single-page-Un" # Spider identifier
    allowed_domains = [ # domains accessible by the crawler
        "untappd.com"
    ]
    start_urls = [ # shortcut for start_requests method and url that will be accessed
        "https://untappd.com/beer/131332"
    ]
    
    def parse(self, response): # parse page content

        beerName = response.css('div[class=name] h1::text').extract_first()
        breweryName = response.css('p[class=brewery] a::text').extract_first()
        score = response.css('span[class=num]::text').extract_first()[1:-1] # to remove parentesis
        numberOfRatings = response.css('p[class=raters]::text').extract_first()[1:-9] # remove "Ratings" text and spaces
        dateAdded = response.css('p[class=date]::text').extract_first()[7:-1] # to remove "Added" text and spaces
        ibu = response.css('p[class=ibu]::text').extract_first()[1:-1] # spaces
        style = response.css('p[class=style]::text').extract_first()
        abv = response.css('p[class=abv]::text').extract_first()[1:-1]
        description = response.css('div[class=beer-descrption-read-less]::text').extract_first()[1:-1]
        beerID = int(response.url.split('/')[5]) # at most 6 digits for BA beer IDs
        #img = response.css('div[class=basic] a[class=label] img').extract_first()[10:-2]
        
        item = Beer()
        item['name'] = beerName
        item['database'] = "Untappd"
        item['id'] = beerID
        item['brewery'] = breweryName
        item['rating'] = score
        item['number_of_ratings'] = numberOfRatings
        item['date'] = dateAdded
        item['ibu'] = ibu
        item['style'] = style
        item['abv'] = abv
        item['description'] = description
        yield item