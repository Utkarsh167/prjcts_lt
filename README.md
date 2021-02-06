FLEET backend code in Node.js using Hapi.js and Typescript.

1. npm install
2. tsc
3. node ./build/index.js //NODE_ENV=development

### Basic Setup Start ###

# Locally in your project. 
npm install -D ts-node
npm install -D typescript
 
# Or globally. 
npm install -g ts-node

### install git on ubuntu ###
* sudo apt-get install git

### install node on ubuntu ###
* curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.6/install.sh | bash
* . ~/.nvm/nvm.sh
* nvm install 6.11.5
 
### install node v10.15.0 ###

### install mongoDB v4.0.10 on ubuntu ###
* echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-3.4.list
* sudo apt-get update
* sudo apt-get install mongodb-org
* sudo service mongod start

### install mongoDB v4.0.10 on ubuntu ###
* echo "deb [ arch=amd64,arm64 ] http://repo.mongodb.org/apt/ubuntu "$(lsb_release -sc)"/mongodb-org/3.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-3.4.list
* sudo apt-get update
* sudo apt-get install mongodb-org=3.4.9 mongodb-org-server=3.4.9 mongodb-org-shell=3.4.9 mongodb-org-mongos=3.4.9 mongodb-org-tools=3.4.9
* sudo service mongod start

### install redis on ubuntu v16.04 ###
* sudo apt-get update
* sudo apt-get install redis-server
* redis-server
* redis-cli
* ping

### install pm2 & bower on ubuntu ###
* npm install -g pm2 bower

### Basic Setup End ###

### connect with ssh on development server ###
* ssh fleetdev_usr@fleetdev.appskeeper.com

### connect with ssh on staging server ###
* ssh fleetstg_usr@fleetstg.appskeeper.com

### run build on server ###
* NODE_ENV=development pm2 start ./build/server.js --name pramod-fleet-node

### localhost swagger URL ###
* http://localhost:3000/documentation

### development swagger URL ###
* https://fleetdev.appskeeper.com/documentation

### Staging swagger URL ###
* https://fleetstg.appskeeper.com/documentation

## QA swagger URL ###
* https://fleetqa.appskeeper.com/documentation
### Database collection dependency 
Users depend to cab and userQuery
Cab depend to user driver
vendor depend to cab