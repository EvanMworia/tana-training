# Environment Variables Setup

## Required Variables

Add these to your `.env` file:

```env
# Required for API operations
TRELLO_API_KEY=your_api_key_here
TRELLO_TOKEN=your_token_here
```

## Optional Variables (for UI Tests)

For the visual browser tests to work with login and workspace navigation, add these:

```env
# Optional: For UI tests with authentication
TRELLO_USERNAME=your_email@example.com
TRELLO_PASSWORD=your_password_here
TRELLO_WORKSPACE_ID=userworkspace48327296
```

## How to Get Your Workspace ID

1. Log into Trello
2. Navigate to your workspace
3. Look at the URL: `https://trello.com/w/userworkspace48327296`
4. The workspace ID is the part after `/w/` (e.g., `userworkspace48327296`)

## Notes

- **API Key & Token**: Required for all API operations (creating boards, lists, cards)
- **Username & Password**: Only needed if you want to run UI tests that require login
- **Workspace ID**: Only needed if you want to verify boards appear in your workspace

The UI tests will work without login credentials, but you'll need to manually log in when the browser opens.
