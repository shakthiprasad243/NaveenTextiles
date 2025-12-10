# Google OAuth Setup for Clerk

## Step 1: Create Google OAuth Application

1. **Go to Google Cloud Console:**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Sign in with your Google account

2. **Create or Select Project:**
   - Create a new project or select existing one
   - Name it something like "Naveen Textiles Auth"

3. **Enable Google+ API:**
   - Go to **APIs & Services** → **Library**
   - Search for "Google+ API" 
   - Click and **Enable** it

4. **Create OAuth 2.0 Credentials:**
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth 2.0 Client ID**
   - Choose **Web application**

5. **Configure OAuth Settings:**
   - **Name**: Naveen Textiles Auth
   - **Authorized JavaScript origins**:
     - `https://naveentextiles.online`
     - `https://www.naveentextiles.online`
     - `https://clerk.naveentextiles.online` (if using custom domain)
   - **Authorized redirect URIs**:
     - `https://clerk.naveentextiles.online/v1/oauth_callback`
     - `https://accounts.clerk.dev/oauth_callback` (fallback)

6. **Save and Copy Credentials:**
   - Copy the **Client ID** (starts with numbers, ends with `.apps.googleusercontent.com`)
   - Copy the **Client Secret**

## Step 2: Configure in Clerk Dashboard

1. **Go to Clerk Dashboard:**
   - Visit [Clerk Dashboard](https://dashboard.clerk.com/)
   - Select your application

2. **Enable Google OAuth:**
   - Go to **User & Authentication** → **Social Connections**
   - Find **Google** and click **Configure**
   - Toggle **Enable Google** to ON

3. **Add Google Credentials:**
   - **Client ID**: Paste your Google Client ID
   - **Client Secret**: Paste your Google Client Secret
   - Click **Save**

## Step 3: Test Configuration

1. **Check Domain Settings:**
   - In Clerk, go to **Domains**
   - Ensure `naveentextiles.online` is added and verified

2. **Test OAuth Flow:**
   - Try signing in with Google
   - Should redirect properly without errors

## Troubleshooting

### Common Issues:

1. **"redirect_uri_mismatch" error:**
   - Check that redirect URIs in Google Console match Clerk's requirements
   - Use: `https://clerk.naveentextiles.online/v1/oauth_callback`

2. **"invalid_client" error:**
   - Double-check Client ID and Secret are correct
   - Ensure they're from the same Google project

3. **Domain not authorized:**
   - Add your domain to both Google Console and Clerk dashboard
   - Wait a few minutes for changes to propagate

## Current Status

- ✅ Clerk production keys configured
- ⏳ Google OAuth needs setup
- ⏳ Need to re-enable social buttons in UI

Once configured, users can sign in with:
- Email/Password (currently working)
- Google OAuth (after setup)