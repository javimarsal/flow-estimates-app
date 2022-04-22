![](https://i.ibb.co/fGcdQ5V/logo-title.png)

A web application to organize your project and the correct way to estimate *when it will be done*!

You can access using the [Flow Estimates website](https://flow-estimates.herokuapp.com/) (on development).

## About the Application

Project based on the book "When will it be done!" by Daniel Vacanti.

## How to make it run locally!

### Backend

Go to directory *backend* and open the `.env.example` file. You must change the content between "..." and write there the URL from your Mongo database. You must also rename the file to `.env`, in order to be recognised.

After that, open a terminal in the same directory and run the following commands:

- `npm run seed` to have some data in the database.

- `npm run dev` to run the server.

### Frontend

The backend server must be running. If you have it, go to directory *frontend*, open another terminal and run `ng serve` to run the Angular application. Once the compilation process has been completed successfully, open the web browser of your choice and navigate to `http://localhost:4200/`.
