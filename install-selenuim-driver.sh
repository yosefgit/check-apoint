#!/bin/bash
if [ ! -f ~/drivers/geckodriver ]; then
    echo "downloading driver..."
    wget -P . https://github.com/mozilla/geckodriver/releases/download/v0.29.0/geckodriver-v0.29.0-linux64.tar.gz
    mkdir -p ~/drivers
    tar -zxvf geckodriver-v0.29.0-linux64.tar.gz -C ~/drivers/
    rm geckodriver-v0.29.0-linux64.tar.gz
else 
    echo "found selenuim driver - skiping download"
fi

if [ ! -f ~/.bashrc ]; then
    echo "no bashrc file found, you will need to manauly add the path to the driver to global PATH"
else 
    echo "adding driver to global PATH"
    sed -i -e '$a\' ~/.bashrc
    echo 'export PATH=$PATH:~/drivers/' >> ~/.bashrc
    eval `export PATH=$PATH:~/drivers/`
fi