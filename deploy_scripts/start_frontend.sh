#!/bin/bash

if [ -f ~/.nvm/nvm.sh ]; then
  source ~/.nvm/nvm.sh
fi
nvm use node

cd ~/Code/what-to-cook-frontend

serve dist


