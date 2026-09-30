# QuantumLearn AI — Complete Admin Panel Replacement

This bundle is intended to replace the admin code folders in the project. It removes presentation-layer mock datasets from the admin modules and connects operational modules to Supabase through authenticated admin APIs.

## Replace
- `src/app/admin/`
- `src/app/api/admin/`
- `src/components/admin/`
- `src/lib/admin.ts`
- add `src/lib/admin-data.ts`

## Database prerequisite
Apply the previously supplied admin database migration first. The existing application schema for courses, lessons, chapters and resources is preserved.

## Important
No code bundle can honestly guarantee deployment without running the project against the actual Supabase instance. After replacement run `npm ci`, `npm run lint`, and `npm run build`, then test an authenticated admin account. The admin APIs fail closed when the user is not an admin.
