# Backend Developer - VRV Security

> [!NOTE]  
> The Backend/Server is hoisted on `Render`. So it may take approx 1 - 2 min to load on first api hit.
> So Please wait when the first requset is done.

## Setup Instructions

1. Clone the repository - `https://github.com/ra463/vrv-backend.git`.
2. Install dependencies using `npm install`.
3. Create the `config.env` in the config folder like this - `/config/config.env`.
4. Configure environment variables:
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `FROZEN_TIME` (time for which user account should be freezed after unsccessfull attempts)
   - `MAX_UNSUCCESSFULL_ATTEMPT` (max number of wrong attempt to login)
   - `MONGO_URI`
   - `PORT`
   - `GOOGLE_CLIENT_ID` (google oauth client_id)
   - `GOOGLE_CLIENT_SECRET` (google oauth client_secret)
5. Start the server using `npm run dev`.

### Server Deployed Link - [https://vrv-backend-eys6.onrender.com]

## Components

- **Backend**: Node.js/Express.js API for processing payments and all other functions.
- **Database**: MongoDB for storing details.
- **Google OAuth**: For Login with google.
- **JWT**: For generation JWT Token for login.

## To Test Admin

> [!IMPORTANT]  
> Email - `test@admin.com`
> Password - `Admin@11`
