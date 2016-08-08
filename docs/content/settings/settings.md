# Settings Configuration  
After a successful login, you will see Aggies's front end interface as below.  
![Main Menu](main_menu.png)

##  Fetching
Fetching allows Aggie to receive feeds from all sources at a global level.

### Toggling ON/OFF Fetching
Fetching can be enabled or disabled by toggling ON/OFF the fetching toggle. To toggle ON/OFF fetching, please follow the steps below.
1. From the menu bar, click **Settings** and select **Settings**.
![Fetching ON/OFF](settings.png)
2. Click **ON/OFF** on the fetching toggle to switch fetching ON/OFF.
![Fetching ON/OFF](toggle.png)

##  Social Media Feed Authentication

### Adding Media Feeds to Aggie
1.  From the header menu, click on **Settings**.
![Settings Menu](settings.png)   
2.  From the dropdown list, click on **Settings**.
![Media Authentication](toggle3.png)
3. Click on **Edit** to authenticate the Twitter, Facebook or Elmo feed settings.  
![Media Authentication](social_media_feed_authentication.png)

**Note**: *Now we need to generate the access tokens for all social media sources. After that, we would copy and paste respective authentication tokens generated for each of the social media feeds, save the settings and toggle the Fetching switch ON.*

##  Generating Source Tokens
### Twitter API Access Token
1.	Visit [Twitter's Apps Page](https://apps.twitter.com/) and login with your Twitter Credentials.
2.	Click on the **Create New App** Tab.
![Twitter Apps](twitter_app1.png)
3. Fill in the *Application Details* and agree to the developer agreement at the bottom to create the app.
![Twitter Apps](twitter_app2.png)
4. This will create access tokens as indicated below.
![Twitter Apps](twitter_app3.png)
5. Click on **Create My Access Token**  to create *Access Token* and *Access Token Secret*.
 ![Twitter Apps](twitter_app4.png)
6. With these access tokens, fellow the instructions from [Adding Media Feeds to Aggie](#adding-media-feeds-to-aggie) section and edit the Twitter settings in Aggie.

### Facebook API Access Tokens
1.	Visit [Facebook's Apps page](https://developers.facebook.com/apps/) and login with your credentials.
2.	Click on **Create a new app** at the top right corner.
![Facebook Apps](facebook_app1.png)
3.	Type in the *name* of your app and click on **Create New Facebook App ID**.
![Facebook Apps](facebook_app2.png)
4.	Type in your *email address* and choose the *app category*, eg. *Apps for Pages* and click on **Create App ID**.
![Facebook Apps](facebook_app3.png)
5.	Select the pictures that apply and click **Submit**.
6.	Enter a *site URL* and click on **next**.
7.	Click **Skip to Developer Dashboard** to retrieve your *App ID* and *App Secret*.
![Facebook Apps](facebook_app4.png)
8.	Click on the **Show button** and enter your password to show your *App Secret*.
![Facebook App](facebook_app5.png)
9.	Now with your Facebook *App ID* and *App Secret*, copy **https://graph.facebook.com/oauth/access_token?client_secret=xxx&client_id=xxx&grant_type=client_credentials** into your web browser, replacing the (**xxx**) in **secret = xxx** and **id=xxx** with your *App Secret* and *App ID* respectively.
10.	Hit the return key to show your access token.  
11.	With this access token,fellow the instructions from [Adding Media Feeds to Aggie](#adding-media-feeds-to-aggie) section and edit the Facebook settings on Aggie.

### ELMO Tokens
1.	Log into your *ELMO* instance with an account having *coordinator* or higher privileges on the mission you want to track.
2.	In your ELMO instance, mark one or more forms as *public* (via the Edit Form page). *Note the Form ID in the URL bar (e.g. if URL ends in /m/mymission/forms/123, the ID is 123)*.
3.	Visit your profile page (click the **icon bearing your username** in the top-right corner) and copy your *API key* (click **'Regenerate'** if necessary).
4.	From Aggie, click **Settings -> Settings** and edit the ELMO settings. Remember to toggle the switch on, once you have saved the settings

##  Transport Email
This must be set up to allow newly created users to receive emails from Aggie with their login credentials. Three transport options have been implemented using nodemailer.js:
1.	SMTP, which requires having access to a working SMTP server.
2.	Amazon Simple Email Service (SES).
3.	Sendgrid, an online mail service accessible through a simple API.

*In this example we are going to set up the email with Sendgrid’s service.*

1.	Click the **Settings** tab and select the **Settings** option in the dropdown list.
![Email](email.png)
2.	Click **Edit** on the Email transport row of the email section (the last Edit).
![Sendgrid](sendgrid1.png)
3.	Choose the *Transport method* as *SendGrid*.
![Sendgrid](sendgrid2.png)
4. Aggie then requests an *API key* for use with SendGrid as in the screenshot below.
![Sendgrid](sendgrid3.png)

### Generating SendGrid API Key.
1.	 Visit [SentGrid's Page](https://sendgrid.com/) and set up an account. Sendgrid will take one or two days to verify your account before activating it.
2.	From your account click the **Settings Menu** and select *API keys*
3.	Click the blue **Create API Key** on the top right.
![Sendgrid](sendgrid4.png)
4.	Select *General API key*.
![Sendgrid](sendgrid5.png)
5.	Type a name for the API e.g. *Aggie API key* and set the appropriate *permissions*. The only permission needed for this key is the ‘*Mail Send* ’ one.
![Sendgrid](sendgrid6.png)
6.	Click **Save** to *generate an API key* for use with Aggie.
7.	Copy the API key and paste it into the *api_key* field referred to in [Transport Email](#transport-email) section and click on Submit.
![Sendgrid](sendgrid3.png)
8.	Set the *App Email Address* as the email address you used for your SendGrid application.
![Sendgrid](sendgrid7.png)
