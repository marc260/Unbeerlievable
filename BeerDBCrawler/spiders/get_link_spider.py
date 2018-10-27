# These spiders get all necessary beer links from Beer Advocate and Untappd 
# With these links the spiders in beers_spider.py can crawl through everything

''' For BA: 
   Since the website has no list with all of them at once I decided to search
   for 5 beer styles that should cover the majority of their beers
   Stout, bock, ale, lager, and porter
   Stout has ~17k results, bock ~5k, ale ~57k, lager ~8k, and porter ~10k
   There might some overlap but that can be managed later
   response.css('a[href*=profile]::attr(href)').extract() extracts the all the
   links visible in the current page (about 25 each page)
'''

# multiple pages:
# search page response.css('a[href*=profile]::attr(href)').extract() 
# in the https://www.beeradvocate.com/search/?q=stout&qt=beer&start=0
# https://www.beeradvocate.com/search/?q=bock&qt=beer&start=0
# https://www.beeradvocate.com/search/?q=ale&qt=beer&start=0
# https://www.beeradvocate.com/search/?q=lager&qt=beer&start=0
# https://www.beeradvocate.com/search/?q=porter&qt=beer&start=0

# look for response.css('div[id*=ba-content] b::text').extract_first()[7:]
# this much and loop

# run with scrapy crawl get-links-BA -o links-BA-stout.json

import scrapy

class GetLinksBASpider(scrapy.Spider):
    name = "get-links-BA"

    start_urls = [
        'https://www.beeradvocate.com/search/?q=stout&qt=beer&start=0'
    ]

    # Beer styles to search with their approximate number of beers
    dictList = {'stout':17000, 'bock':5000, 'ale':57000, 'lager':8000, 'porter':10200}
    for style, limit in dictList.items():
        i = 25 # Advance by 25 each time

        # iterate until limit while changing style in the search and increasing 25 to the search
        while i < limit:
            new_url = 'https://www.beeradvocate.com/search/?q=' + str(style) + '&qt=beer&start=' + str(i)
            start_urls.append(new_url)
            i += 25
    

    def parse(self, response):
        for link in response.css('body'):
            yield {
                'Link': link.css('a[href*=profile]::attr(href)')[::2].extract() # gets the links found in the current page
            }