# import Dependencies
import pandas as pd
import requests
from bs4 import BeautifulSoup
from splinter import Browser
from splinter.exceptions import ElementDoesNotExist
import re

def scrape():
    # create mars_data dic that we can insert into mongo
    mars_data = {}
    
    # set the chromedriver path
    executable_path = {"executable_path": "/usr/local/bin/chromedriver"}
    browser = Browser("chrome", **executable_path, headless=False)

    # Mar News
    news_url = "https://mars.nasa.gov/news/"
    browser.visit(news_url)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    news_title = soup.find("div", class_="content_title").text
    news_p = soup.find("div", class_="article_teaser_body").text
    
    mars_data["news_title"] = news_title
    mars_data["news_p"] = news_p

    # JPL Mars Space Images - Featured Image
    space_img_url = "https://www.jpl.nasa.gov/spaceimages/?search=&category=Mars"
    browser.visit(space_img_url)
    xpath = '//*[@id="full_image"]'
    img_button = browser.find_by_xpath(xpath)
    img_button.click()
    browser.is_element_not_present_by_css("img.fancybox-image", wait_time=1)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    featured_image_url = soup.find("img", class_="fancybox-image")["src"]
    if "http:" not in featured_image_url:
        featured_image_url = "https://www.jpl.nasa.gov" + featured_image_url

    mars_data["featured_image_url"] = featured_image_url

    # Mars Weather
    twitter_url = "https://twitter.com/marswxreport?lang=en"
    browser.visit(twitter_url)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    mars_weather = soup.find("p", class_="TweetTextSize", text=re.compile("Sol")).text

    mars_data["mars_weather"] = mars_weather

    # Mars Facts
    space_facts_url = "https://space-facts.com/mars/"
    tables = pd.read_html(space_facts_url)
    df = tables[0]
    df.columns = ["description", "value"]
    df.set_index("description", inplace=True)
    html_table = df.to_html()

    mars_data["table"] = html_table

    # Mars Hemispheres
    hemisphere_url = "https://astrogeology.usgs.gov/search/results?q=hemisphere+enhanced&k1=target&v1=Mars"
    xpath1 = '//*[@id="product-section"]/div[2]/div[1]/a/img'
    xpath2 = '//*[@id="product-section"]/div[2]/div[2]/a/img'
    xpath3 = '//*[@id="product-section"]/div[2]/div[3]/a/img'
    xpath4 = '//*[@id="product-section"]/div[2]/div[4]/a/img'
    xpath_list = [xpath1, xpath2, xpath3, xpath4]
    hemisphere_image_urls = []
    browser.visit(hemisphere_url)

    for xpath in xpath_list:
        img_button = browser.find_by_xpath(xpath)
        img_button.click()
        browser.is_element_not_present_by_css("img.jpg", wait_time=1)
        html = browser.html
        soup = BeautifulSoup(html, 'html.parser')
        title = soup.find('h2', class_="title").text
        img_url = soup.find('div', class_="wide-image-wrapper").ul.li.a['href']
        hemisphere_image_urls.append({"title": title, "img_url": img_url})
        browser.visit(hemisphere_url)

    mars_data["hemisphere"] = hemisphere_image_urls

    browser.quit()
    return mars_data