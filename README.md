# Skills Hub

A small collaborative library for Claude, Codex, and Hermes skills.

## Export formats

- JSON: full structured backup/import format.
- Markdown: readable library handoff for people or agents.
- TOON: compact token-friendly format for model context.

## Supabase access options

### Open collaboration

Run `supabase-setup.sql` in Supabase. Anyone with the app and anon key can read and edit.

### Email login collaboration

Run `supabase-auth-setup.sql` in Supabase. Users must log in with a Supabase magic link before the shared table can be read or edited.

Then edit `config.js`:

```js
window.SKILLS_HUB_SUPABASE = {
  url: "https://your-project.supabase.co",
  anonKey: "your-public-anon-key",
  requireLogin: true,
};
```

With `config.js` filled in, collaborators do not need to enter the project URL or anon key in the app. They open the deployed page, enter their email, and use the magic link.

## Supabase Auth settings

In Supabase, add your deployed app URL under Authentication settings so magic-link redirects are allowed.
