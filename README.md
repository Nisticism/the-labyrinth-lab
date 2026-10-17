### View the public project at:

`https://www.the-ll.com`

---

## Admin portal

The site now includes a private admin portal for managing gallery images
(reorder via drag-and-drop, delete, and upload). The portal is only
reachable at a secret URL path, gated by a password login.

### One-time setup

1. Copy the env template and edit it:
   ```powershell
   Copy-Item .env.example .env
   ```
   In `.env` set:
   - `JWT_SECRET` — long random string. Generate one with:
     ```powershell
     node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
     ```
   - `ADMIN_PATH` and `REACT_APP_ADMIN_PATH` — pick an unguessable URL slug
     (e.g. `my-very-secret-admin-9f8d3a`). Both must match. Treat like a secret.
2. Set your admin password (writes a bcrypt hash to `.env`):
   ```powershell
   npm run setup:password
   ```
3. Seed the gallery config from the old hardcoded data (only needed once,
   and only if `data/gallery-config.json` does not already exist):
   ```powershell
   npm run migrate:gallery
   ```

### Run the full stack locally

```powershell
npm run build           # build the React app into /build
npm run server          # start Express on PORT (default 4000)
```

Then visit:
- Public site: `http://localhost:4000/`
- Admin login: `http://localhost:4000/<REACT_APP_ADMIN_PATH>`

### Dev mode (hot reload for the React app)

In one terminal: `npm run server` (Express on :4000).
In another:      `npm start`      (CRA dev server on :3000).

For the dev server to talk to the API, add this to your `.env`:
```
REACT_APP_API_BASE=http://localhost:4000
```
After changing any `REACT_APP_*` variable you must restart `npm start`.

### Data and uploads

- Gallery config lives at `data/gallery-config.json` and is versioned in Git so
  ordering changes are included in the normal deploy flow. The admin portal
  reads/writes this file directly via the API.
- Uploaded images go to `public/images/<categoryId>/` and are served
  statically. Deleting an image via the admin portal removes both the file
  and its entry from the config.

### Offline reorder helper (no server required)

If you want to reorder categories and image paths without running the app,
open `scripts/gallery-reorder-tool.html` in a browser and:

1. Load your current `data/gallery-config.json`
2. Drag categories and image rows into the order you want
3. Download the updated `gallery-config.json`

You can then replace `data/gallery-config.json` with the downloaded file.

### Deployment

Because the admin portal needs a live server to persist edits and serve
uploads, the site can no longer be hosted on GitHub Pages. Deploy to any
Node.js host (Railway, Render, Fly.io, a VPS, etc.):

1. Set environment variables on the host (`JWT_SECRET`,
   `ADMIN_PASSWORD_HASH`, `ADMIN_PATH`, `REACT_APP_ADMIN_PATH`, `PORT`).
2. Gallery order and config are now versioned in `data/gallery-config.json`.
   Reorder via the admin portal, then commit the updated JSON to git before
   deploying. The deploy script does not need to run a gallery sync unless you
   deliberately configure an external source directory.
3. Build command: `npm install && npm run build`
4. Start command: `node server/index.js`
5. **Persistent storage**: if you expect uploaded images to be managed outside
   Git, mount a persistent disk and point `public/images/` at it; otherwise,
   commit the gallery JSON with the rest of the app and deploy normally.

---

## Legacy GitHub Pages workflow (deprecated)

Previously the site was a static React app deployed to GitHub Pages via
`npm run deploy`. That workflow no longer supports the admin portal but is
preserved here for reference.

In general, just run `npm run deploy`.

But if you're having problems, try this:

1.)  Make sure to be on the master branch.
2.)  Run `npm run deploy`
3.)  Make sure the gh-pages branch has been updated.
4.)  While in the repository, go to settings, then pages, make sure it's set to the gh-pages branch
5.)  Make sure the url is the-ll.com.
6.)  Make sure there is a CNAME file.
7.)  Check the actions tab.

### In order to run the site locally

Just run `npm start`.  It will start up on port 3000;




### Other stuff that came with the `create-react-app` readme and might be useful, but generally isn't used:


### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
