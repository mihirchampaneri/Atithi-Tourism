In powershell use this command for set env_variable:
$env:DEBUG = "development:*"
$env:NODE_ENV = "development"

In cmd use this command for set env_variable:
set DEBUG=development:*
set NODE_ENV=development

To run the project use this command:
npm i
npx nodemon