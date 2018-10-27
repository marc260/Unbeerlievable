# -*- coding: utf-8 -*-

# Define here the models for your scraped items
#
# See documentation in:
# https://doc.scrapy.org/en/latest/topics/items.html

import scrapy

class Beer(scrapy.Item):
    name = scrapy.Field() # field to specify metadata
    database = scrapy.Field()
    id = scrapy.Field()
    brewery = scrapy.Field()
    rating = scrapy.Field()
    number_of_ratings = scrapy.Field()
    ranking = scrapy.Field()
    number_of_reviews = scrapy.Field()
    date = scrapy.Field()
    ibu = scrapy.Field()
    pDev = scrapy.Field()
    state = scrapy.Field()
    country = scrapy.Field()
    brewery_website = scrapy.Field()
    style = scrapy.Field()
    abv = scrapy.Field()
    availability = scrapy.Field()
    description = scrapy.Field()
    img_url = scrapy.Field()
    pass

class BeerdbcrawlerItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    pass
