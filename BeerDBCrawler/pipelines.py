# -*- coding: utf-8 -*-

# Each item pipeline component (sometimes referred as just “Item Pipeline”) 
# is a Python class that implements a simple method. They receive an item and 
# perform an action over it, also deciding if the item should continue through 
# the pipeline or be dropped and no longer processed.

# Don't forget to add pipeline to the ITEM_PIPELINES in settings.py


from scrapy import signals
from scrapy.contrib.exporter import CsvItemExporter

class CSVOutputPipeline(object): # exports Item Object to .csv file
    @classmethod
    def from_crawler(cls, crawler):
        pipeline = cls()
        crawler.signals.connect(pipeline.spider_opened, signals.spider_opened)
        crawler.signals.connect(pipeline.spider_closed, signals.spider_closed)
        return pipeline

    def spider_opened(self, spider):
        self.file = open('output.csv', 'w+b')
        self.exporter = CsvItemExporter(self.file)
        # Force custom order:
        self.exporter.fields_to_export = ['name', 'database', 'id', 'brewery', 'rating', 'number_of_ratings', 'ranking', 'number_of_reviews', 'date', 'ibu', 'pDev', 'state', 'country', 'brewery_website', 'style', 'abv', 'availability', 'description']
        self.exporter.start_exporting()

    def spider_closed(self, spider):
        self.exporter.finish_exporting()
        self.file.close()

    def process_item(self, item, spider):
        self.exporter.export_item(item)
        return item


class BeerdbcrawlerPipeline(object):
    def process_item(self, item, spider):
        return item
