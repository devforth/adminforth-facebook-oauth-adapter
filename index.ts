import type { OAuth2Adapter } from "adminforth";

export default class AdminForthAdapterFacebookOauth2 implements OAuth2Adapter {
    private clientID: string;
    private clientSecret: string;

    constructor(options: {
      clientID: string;
      clientSecret: string;
    }) {
      this.clientID = options.clientID;
      this.clientSecret = options.clientSecret;
    }
  
    getAuthUrl(): string {
      const params = new URLSearchParams({
        client_id: this.clientID,
        response_type: 'code',
        scope: 'email,public_profile',
        redirect_uri: 'http://localhost:3000/oauth/callback'
      });
      return `https://www.facebook.com/v22.0/dialog/oauth?${params.toString()}`;
    }
  
    async getTokenFromCode(code: string, redirect_uri: string): Promise<{ email: string; }> {
      // Exchange code for token
      const tokenResponse = await fetch('https://graph.facebook.com/v22.0/oauth/access_token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          client_id: this.clientID,
          client_secret: this.clientSecret,
          redirect_uri,
        }),
      });
  
      const tokenData = await tokenResponse.json();
  
      if (tokenData.error) {
        console.error('Token error:', tokenData);
        throw new Error(tokenData.error.message);
      }
  
      // Get user info using access token
      const userResponse = await fetch(`https://graph.facebook.com/me?fields=id,email&access_token=${tokenData.access_token}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
  
      const userData = await userResponse.json();
  
      if (userData.error) {
        throw new Error(userData.error.message);
      }
  
      return {
        email: userData.email,
      };
    }

getIcon(): string {
  return `<svg viewBox="-190 0 500 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path fill="#1877F2" d="M279.14 288l14.22-92.66h-88.91V132.1c0-25.35 12.42-50.06 52.24-50.06H295V6.26S273.67 0 252.91 0c-73.12 0-121.21 44.38-121.21 124.72V195.3H75.36V288h56.34v224h104.72V288z"/></svg>`;
}

}