# Node.js--Google-Sheets

## About
- Run `npm i` to install the dependencies.
- Run `npm start` to start the project.

This server is built in Node.js using Express, enabling editing of a Google Sheets spreadsheet via the Google Sheets API in the Google Cloud API.

You can access the spreadsheet using the following link: [Google Sheets Spreadsheet]
(https://docs.google.com/spreadsheets/d/1rONJMZ9zT8NXa7TaB2Oo0W3hzVgJWTtxiggHXmt8X7Y/edit#gid=1407920845)
To trigger the process to update the students' grades, you can use the following endpoint: `http://localhost:3001/getNotas`

## Used Libraries
- `express`
- `nodemon`
- `googleapis`
