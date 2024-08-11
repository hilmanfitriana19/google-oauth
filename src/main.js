import express from 'express';
import dotenv from 'dotenv';
import {google} from 'googleapis';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:5000/auth/google/callback'
);

const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
]

const authorizationUrl = oauth2Client.generateAuthUrl({
    access_type:'offline',
    scope: scopes,
    include_granted_scopes: true
})

app.use(express.json())


app.get('/auth/google', (req,res) => {
    res.redirect(authorizationUrl)
})

app.get('/auth/google/callback', async (req,res) => {
    const {code} = req.query

    const {tokens} = await oauth2Client.getToken(code);

    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
    })

    const {data} = await oauth2.userinfo.get();

    console.log('data', data);

    return res.json({
        nama : data.name,
        email : data.email
    })
})

app.listen(PORT, () => {
    console.log(`Server running in PORT: ${PORT}`);
})