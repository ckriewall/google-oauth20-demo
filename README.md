# Google OAuth 2.0 Demo

## Description

Use Express and Passport to protect routes with Google Authentication.

## Installation

Run `npm i` to install dependencies.

## Configuration

Set environment variables in `.enc` to connect to Google and Mongo. Note - `.enc` is excluded from the repo. Create it manually in the project root and customize with the values below.

### Google Variables

Obtain Google [OAuth 2.0 Credentials](https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow#creatingcred). Set the following options:

**Authorized Javascript Origins:**
URI: `http://localhost:3000`

**Authorized Redirect URIs**
URI: `http://localhost:3000/auth/google/redirect`

Record your new Client ID and Client Secret.

### Mongo Variables

`MONGO_URI` can be set to the [Mongo Connection String](https://docs.mongodb.com/manual/reference/connection-string/) for a local instance or an Atlas cluster.

### Session Variables

`SESSION-SECRET` can be any string.

### Add `.enc` File

    ```
    GOOGLE_CLIENT_ID=MY_CLIENT_ID
    GOOGLE_CLIENT_SECRET=MY_CLIENT_SECRET
    GOOGLE_CALLBACK_URL=/auth/google/redirect
    MONGO_URI=mongodb://localhost:27017/userDB
    SESSION_SECRET=MY_SESSION_SECRET
    ```

## Usage

1. Run `nodemon app` or `node app` to start Express.
2. Browse to localhost:3000.

The Public page does not require authentication. The Private page is accessible after logging in with Google.

## Screenshot

![Screenshot](https://i.ibb.co/Sx0X4QZ/google-auth20-demo-screenshot.png)
