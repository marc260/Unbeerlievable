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

import scrapy


class GetLinksBASpider(scrapy.Spider):
    name = "get-links-BA"

    start_urls = [
        'https://www.beeradvocate.com/search/?q=stout&qt=beer&start=0'
    ]

    # This it the field that says how many items were found in the search
    limit = response.css('a[href*=profile]::attr(href)').extract()

    i = 25 # Advance by 25 each time
    while i < limit:
        urlToAdd = 'https://www.beeradvocate.com/search/?q=stout&qt=beer&start=' + str(i)
        start_urls.append(urlToAdd)
        i += 25

    def parse(self, response):
        for beerlink in response.css('body'):
            yield {
                'name': beerlink.css('ul li a[href*=profile]::attr(href)')[::2].extract()
            }